const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const url=process.env.SETLOG_STAGE3_URL||'http://127.0.0.1:18786/';
const chrome=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const store='setlog-pwa-v1',owner='setlog-pwa-local-owner-v1';
function diary(label){
 const now=Date.now();
 return {schemaVersion:8,version:8,programs:[{id:'prog-'+label,name:'Программа '+label,workouts:[{
  id:'day-'+label,name:'День '+label,exercises:[]}]}],exerciseCatalog:[],drafts:{},
  history:[{id:'session-'+label,date:'2026-11-08',programId:'prog-'+label,
  programName:'Программа '+label,workout:'day-'+label,workoutName:'День '+label,
  entries:[],savedAt:now}],activeProgramId:'prog-'+label,activeWorkoutId:'day-'+label,
  createdAt:now,updatedAt:now};
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-first-run','--disable-background-networking']});
 try{
  const ctx=await browser.newContext({serviceWorkers:'block'});
  const fixtures={A:diary('A'),B:diary('B'),guest:diary('guest')};
  const a=await ctx.newPage();
  await a.goto(url+'missing-seed-only');
  await a.evaluate(({owner,store,fixtures})=>{
    localStorage.setItem(store,JSON.stringify(fixtures.guest));
    localStorage.setItem(store+':user:test-A',JSON.stringify(fixtures.A));
    localStorage.setItem(store+':user:test-B',JSON.stringify(fixtures.B));
    localStorage.setItem(owner,'test-A');
  },{owner,store,fixtures});
  await a.goto(url+'?atomicLab=1',{waitUntil:'domcontentloaded'});
  await a.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:10000});
  await a.evaluate(()=>window.__setlogAtomicLab.flush());
  const resultA=await a.evaluate(async()=>{
    const scope='setlog-pwa-v1:user:test-A';
    return {scope:window.__setlogAtomicLab.scope,saved:await window.__setlogAtomicLab.inspect(scope),
      raw:localStorage.getItem(scope)};
  });
  assert.equal(resultA.scope,store+':user:test-A');
  assert.equal(resultA.saved.payload,resultA.raw);
  assert(JSON.parse(resultA.saved.payload).history.some(x=>x.id==='session-A'));
  await a.close();
  const b=await ctx.newPage();
  await b.goto(url+'missing-seed-only');
  await b.evaluate(key=>localStorage.setItem(key,'test-B'),owner);
  await b.goto(url+'?atomicLab=1',{waitUntil:'domcontentloaded'});
  await b.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:10000});
  await b.evaluate(()=>window.__setlogAtomicLab.flush());
  const resultB=await b.evaluate(async()=>{
    const scope='setlog-pwa-v1:user:test-B';
    return {scope:window.__setlogAtomicLab.scope,saved:await window.__setlogAtomicLab.inspect(scope),
      a:await window.__setlogAtomicLab.inspect('setlog-pwa-v1:user:test-A'),
      guest:localStorage.getItem('setlog-pwa-v1')};
  });
  assert.equal(resultB.scope,store+':user:test-B');
  assert(JSON.parse(resultB.saved.payload).history.some(x=>x.id==='session-B'));
  assert(JSON.parse(resultB.a.payload).history.some(x=>x.id==='session-A'));
  assert(JSON.parse(resultB.guest).history.some(x=>x.id==='session-guest'));
  console.log('PASS scoped migration: two independent users, original guest diary preserved');
  await b.close();
  const c=await ctx.newPage();
  await c.goto(url+'missing-seed-only');
  await c.evaluate(({key,scope})=>{
    localStorage.setItem(key,'test-A');
    localStorage.setItem(scope,'{broken-json');
  },{key:owner,scope:store+':user:test-A'});
  await c.goto(url+'?atomicLab=1',{waitUntil:'domcontentloaded'});
  await c.locator('#atomicLabBlocked').waitFor({timeout:10000});
  const status=await c.evaluate(async()=>{
    const scope='setlog-pwa-v1:user:test-A';
    return {old:localStorage.getItem(scope),db:await window.SetlogAtomicStorage.read(scope),
      choices:[...document.querySelectorAll('#atomicLabBlocked button')].map(b=>b.textContent)};
  });
  assert.equal(status.old,'{broken-json');
  assert(JSON.parse(status.db.payload).history.some(x=>x.id==='session-A'));
  assert.equal(status.choices.length,2);
  console.log('PASS corrupt old account diary: source preserved, verified IDB backup preserved, no silent migration');
  await c.close();
  await ctx.close();
 }catch(error){console.error('FAIL scoped migration lab',error);process.exitCode=1}
 finally{await browser.close()}
})();
