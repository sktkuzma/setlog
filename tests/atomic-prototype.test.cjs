const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url=process.env.ATOMIC_TEST_URL||'http://127.0.0.1:18783/atomic-prototype-test.html';
const random='setlog-atomic-tests-'+Date.now();
const diary=(id)=>JSON.stringify({schemaVersion:8,history:[{id,entries:[]}],programs:[{id:'program-demo',workouts:[]}]});
(async()=>{
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-first-run','--disable-background-networking']});
 try{
  const context=await browser.newContext({serviceWorkers:'block'});
  const a=await context.newPage(),b=await context.newPage();
  await Promise.all([a.goto(url),b.goto(url)]);
  async function run(page,args){return page.evaluate(async a=>{
   const api=window.SetlogAtomicStorage;
   const [method,...params]=a;return api[method](...params);
  },args)}
  const scope='user-A',other='user-B';
  const init=await Promise.all([run(a,['initialize',scope,diary('original'),random]),
    run(b,['initialize',scope,diary('should-not-replace'),random])]);
  assert.equal(init.filter(x=>x.inserted).length,1,'must initialize once');
  const start=await run(a,['read',scope,random]);
  assert.equal(start.revision,1);
  assert.equal(JSON.parse(start.payload).history.length,1);
  const competing=await Promise.all([
    run(a,['commit',scope,1,diary('writer-a'),random]),
    run(b,['commit',scope,1,diary('writer-b'),random])
  ]);
  assert.equal(competing.filter(x=>x.ok).length,1,'only one competing writer may commit');
  assert.equal(competing.filter(x=>x.reason==='conflict').length,1,'loser must receive explicit conflict');
  const after=await run(a,['read',scope,random]);
  assert.equal(after.revision,2,'winning write advances durable revision');
  const actualId=JSON.parse(after.payload).history[0].id;
  assert(['writer-a','writer-b'].includes(actualId));
  // Close/reopen browser tab to prove durable read and no in-memory-only state.
  const c=await context.newPage();await c.goto(url);
  const reopened=await run(c,['read',scope,random]);
  assert.equal(reopened.payload,after.payload);
  // Account scopes are separated.
  assert.equal(await run(b,['read',other,random]),null);
  await run(b,['initialize',other,diary('b-own'),random]);
  assert.equal(JSON.parse((await run(a,['read',other,random])).payload).history[0].id,'b-own');
  assert.equal(JSON.parse((await run(c,['read',scope,random])).payload).history[0].id,actualId);
  // Invalid JSON and missing expected revision cannot overwrite data.
  let invalid=false;
  try{await run(a,['commit',scope,2,'not-json',random])}catch(e){invalid=true}
  assert(invalid,'invalid JSON must be rejected');
  assert.equal((await run(a,['read',scope,random])).revision,2);
  // Committed versions have a reversible snapshot in same transaction.
  const logs=await run(a,['listRollback',scope,random]);
  assert.equal(logs.length,1);
  assert.equal(logs[0].previousRevision,1);
  const restored=await run(a,['restorePrevious',scope,2,logs[0].id,random]);
  assert.equal(restored.ok,true);
  assert.equal(restored.revision,3);
  const now=await run(b,['read',scope,random]);
  assert.equal(now.revision,3);
  assert.equal(now.payload,start.payload);
  const stale=await run(a,['commit',scope,2,diary('stale'),random]);
  assert.equal(stale.reason,'conflict');
  assert.equal((await run(b,['read',scope,random])).payload,start.payload);
  assert.equal((await run(a,['listRollback',scope,random])).length,2);
  console.log('PASS simultaneous writes: one wins, one receives explicit conflict');
  console.log('PASS idempotent migration, per-account isolation and durable reopen');
  console.log('PASS corrupted JSON rejected, rollback transaction and stale revision rejected');
  for(const p of [a,b,c])await p.close();
  await context.close();
 }catch(e){console.error('FAIL atomic prototype',e);process.exitCode=1}
 finally{await browser.close()}
})();
