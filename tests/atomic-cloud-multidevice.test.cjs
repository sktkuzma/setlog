const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const host=process.env.SETLOG_STAGE5_URL||'http://127.0.0.1:18788/';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const key='setlog-pwa-v1',sleep=ms=>new Promise(r=>setTimeout(r,ms));
function fixture(){
 const now=Date.now();
 return {schemaVersion:8,version:8,
  programs:[{id:'base-p',name:'База',workouts:[{id:'base-day',name:'День',exercises:[]}]}],
  exerciseCatalog:[],history:[{id:'base-session',date:'2026-11-08',savedAt:now,programId:'base-p',
    programName:'База',workout:'base-day',workoutName:'День',entries:[]}],
  drafts:{},activeProgramId:'base-p',activeWorkoutId:'base-day',createdAt:now,updatedAt:now};
}
class FakeCloud{
 constructor(){this.rows=new Map();this.snapshots=new Map();this.lostAck=new Set();this.events=[];this.gate=null;this.scopeError=null}
 async run(user,request){
  this.events.push({user,kind:request.kind,method:request.method||request.table});
  if(request.kind==='read'){
   if(request.table!=='setlog_user_data')return {data:null,error:{message:'unsupported table'}};
   if(request.key!=='user_id'||request.value!==user)return {data:null,error:null};
   return {data:structuredClone(this.rows.get(user)||null),error:null};
  }
  if(request.kind!=='rpc')return {data:null,error:{message:'unsupported request'}};
  if(request.method==='create_setlog_restore_point'){
   const current=this.rows.get(user);
   if(!current||current.revision!==request.args.p_expected_revision)return {data:null,error:{message:'revision_conflict'}};
   const arr=this.snapshots.get(user)||[];arr.push(structuredClone(current));this.snapshots.set(user,arr);
   return {data:{ok:true},error:null};
  }
  if(request.method!=='save_setlog_state')return {data:null,error:{message:'unsupported rpc'}};
  const payload=structuredClone(request.args?.p_payload);
  const expected=request.args?.p_expected_revision;
  if(!payload||!Array.isArray(payload.history)||!Array.isArray(payload.programs))
    return {data:null,error:{message:'invalid_payload'}};
  if(JSON.stringify(payload).length>5242880)return {data:null,error:{message:'payload_too_large'}};
  if(this.gate){
   const gate=this.gate;this.gate=null;
   gate.started();
   await gate.promise;
  }
  const previous=this.rows.get(user);
  const actual=previous?.revision||0;
  if(actual!==expected)return {data:null,error:{message:'revision_conflict'}};
  const next={user_id:user,payload,revision:actual+1,updated_at:new Date().toISOString()};
  if(previous){
   const arr=this.snapshots.get(user)||[];
   arr.push(structuredClone(previous));this.snapshots.set(user,arr);
  }
  this.rows.set(user,next);
  if(this.lostAck.delete(user))return {data:null,error:{message:'Failed to fetch (simulated response lost after commit)'}};
  return {data:{revision:next.revision,updated_at:next.updated_at},error:null};
 }
 delayNextSave(){
  let release,started;
  const promise=new Promise(r=>release=r),hasStarted=new Promise(r=>started=r);
  this.gate={promise,started};
  return {release,hasStarted};
 }
 row(user){return structuredClone(this.rows.get(user)||null)}
}
async function device(browser,cloud,user,seed){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:850}});
 await context.addInitScript(raw=>{
  if(!localStorage.getItem('setlog-pwa-v1'))localStorage.setItem('setlog-pwa-v1',raw);
 },seed);
 const page=await context.newPage(),errors=[],realRequests=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.exposeFunction('__setlogCloudLabTransport',request=>cloud.run(user,request));
 await context.route('**/*',route=>{
  if(/supabase\.co|cdn\.jsdelivr\.net/.test(route.request().url())){
   realRequests.push(route.request().url());return route.abort();
  }
  return route.continue();
 });
 await page.goto(host+'?atomicLab=1&atomicCloudLab=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true&&!!document.querySelector('#todayLabel')?.textContent?.trim(),{timeout:16000});
 await page.evaluate(()=>window.__setlogAtomicLab.flush());
 assert.equal(await page.evaluate(()=>typeof window.__setlogCloudLab),'object','mock cloud test hook missing');
 return {page,context,errors,realRequests,user};
}
const connect=async(d,rev=0)=>d.page.evaluate(({user,rev})=>window.__setlogCloudLab.connect(user,rev),{user:d.user,rev});
const sync=async(d)=>d.page.evaluate(()=>window.__setlogCloudLab.sync());
const state=async(d)=>d.page.evaluate(()=>window.__setlogCloudLab.state());
const diary=async(d)=>d.page.evaluate(()=>JSON.parse(localStorage.getItem('setlog-pwa-v1')));
async function createProgram(d,name){
 await d.page.locator('#manageProgramsBtn').click();
 await d.page.locator('#newProgramName').fill(name);
 await d.page.locator('#newProgramTemplate').selectOption('blank');
 await d.page.locator('#createProgramBtn').click();
 await d.page.waitForFunction(n=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).programs.some(p=>p.name===n),name,{timeout:16000});
 await d.page.evaluate(()=>window.__setlogAtomicLab.flush());
}
async function until(fn,label,ms=14000){
 const start=Date.now();
 while(Date.now()-start<ms){if(await fn())return;sleep(90);await sleep(90)}
 throw new Error('Timed out: '+label);
}
(async()=>{
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-first-run','--disable-background-networking']});
 try{
  // A: Real application UI on two isolated browser profiles, same fake Supabase account.
  {
   const server=new FakeCloud(),seed=JSON.stringify(fixture());
   const a=await device(browser,server,'cloud-user-A',seed),b=await device(browser,server,'cloud-user-A',seed);
   await connect(a,0);
   await sync(a);
   assert.equal(server.row('cloud-user-A').revision,1);
   await connect(b,1);
   await createProgram(a,'Из устройства A');
   await until(()=>server.row('cloud-user-A').revision===2,'device A cloud commit');
   await createProgram(b,'Из устройства B');
   await until(async()=>(await state(b)).paused,'device B revision conflict');
   assert.equal(server.row('cloud-user-A').revision,2);
   assert((await diary(b)).programs.some(p=>p.name==='Из устройства B'),'losing device local data lost');
   assert(!(await diary(b)).programs.some(p=>p.name==='Из устройства A'));
   assert.equal((await state(b)).pendingChoice,'revision-conflict');
   // Explicit user choice: restore remote version locally, after saving old local snapshot.
   await b.page.evaluate(()=>window.__setlogCloudLab.useCloud());
   await until(async()=>!(await state(b)).paused,'device B accepted cloud');
   const remote=server.row('cloud-user-A').payload,accepted=await diary(b);
   assert(accepted.programs.some(p=>p.name==='Из устройства A'));
   assert(!accepted.programs.some(p=>p.name==='Из устройства B'));
   const durable=await b.page.evaluate(async()=>window.__setlogAtomicLab.inspect('setlog-pwa-v1'));
   assert.deepEqual(JSON.parse(durable.payload),accepted,'cloud restore must commit to IDB');
   assert.equal(server.row('cloud-user-A').revision,2,'download cloud must not silently overwrite server');
   assert(!a.errors.length&&!b.errors.length,[...a.errors,...b.errors].join(';'));
   assert(![...a.realRequests,...b.realRequests].some(x=>x.includes('supabase.co')),'real Supabase network requested');
   console.log('PASS real UI two-device revision conflict: local preserved until explicit cloud choice and durable restore');
   await Promise.all([a.context.close(),b.context.close()]);
  }
  // B: Explicit "use local instead" must preserve the overwritten remote snapshot.
  {
   const cloud=new FakeCloud(),seed=JSON.stringify(fixture());
   const a=await device(browser,cloud,'cloud-user-B',seed),b=await device(browser,cloud,'cloud-user-B',seed);
   await connect(a,0);await sync(a);await connect(b,1);
   await createProgram(a,'Облачный вариант');
   await until(()=>cloud.row('cloud-user-B')?.revision===2,'remote commit');
   await createProgram(b,'Локальный вариант');
   await until(async()=>(await state(b)).paused,'second-device conflict');
   await b.page.evaluate(()=>window.confirm=()=>true);
   await b.page.evaluate(()=>window.__setlogCloudLab.useLocal());
   await until(()=>cloud.row('cloud-user-B')?.revision===3,'manual overwrite');
   assert(cloud.row('cloud-user-B').payload.programs.some(p=>p.name==='Локальный вариант'));
   assert(!cloud.row('cloud-user-B').payload.programs.some(p=>p.name==='Облачный вариант'));
   assert(cloud.snapshots.get('cloud-user-B')?.some(s=>s.payload.programs.some(p=>p.name==='Облачный вариант')),
     'overwritten server payload must be preserved as a restore point');
   assert.equal((await state(b)).paused,false);
   console.log('PASS explicit local overwrite preserves prior cloud snapshot and updates revision');
   await Promise.all([a.context.close(),b.context.close()]);
  }
  // C: Network lost after server commits; retry recognizes identical data and treats it as acknowledged.
  {
   const server=new FakeCloud(),d=await device(browser,server,'cloud-user-C',JSON.stringify(fixture()));
   await connect(d,0);await sync(d);
   server.lostAck.add('cloud-user-C');
   await createProgram(d,'Получена без ответа');
   await until(()=>server.row('cloud-user-C')?.revision===2,'server commit but response dropped');
   await sync(d);
   await until(async()=>(await state(d)).revision===2,'lost response reconciliation');
   assert.equal((await state(d)).paused,false,'identical payload must not cause spurious conflict');
   assert.equal((await state(d)).pendingChoice,null);
   assert(!d.errors.length,d.errors.join(';'));
   console.log('PASS lost ACK after commit: retry detects identical server payload without destructive conflict');
   await d.context.close();
  }
  // D: Offline queue: after reconnection auto-sync only the durable final local state.
  {
   const server=new FakeCloud(),d=await device(browser,server,'cloud-user-D',JSON.stringify(fixture()));
   await connect(d,0);await sync(d);
   await d.context.setOffline(true);
   await createProgram(d,'Офлайн-программа');
   assert.equal(server.row('cloud-user-D').revision,1,'offline should not upload');
   await d.context.setOffline(false);
   await d.page.evaluate(()=>window.dispatchEvent(new Event('online')));
   await until(()=>server.row('cloud-user-D')?.revision===2,'reconnect auto-sync',16000);
   assert(server.row('cloud-user-D').payload.programs.some(p=>p.name==='Офлайн-программа'));
   assert(!d.errors.length,d.errors.join(';'));
   console.log('PASS offline edit survives and syncs after online event without overwrite');
   await d.context.close();
  }
  // E: Account signout during in-flight request must not resurrect a session.
  {
   const server=new FakeCloud(),d=await device(browser,server,'cloud-user-E',JSON.stringify(fixture()));
   await connect(d,0);await sync(d);
   const delayed=server.delayNextSave();
   await createProgram(d,'Изменение перед выходом');
   await delayed.hasStarted;
   await d.page.evaluate(()=>window.__setlogCloudLab.disconnect());
   delayed.release();
   await until(()=>server.row('cloud-user-E')?.revision===2,'old RPC completed');
   await sleep(250);
   const s=await state(d);
   assert.equal(s.user,null);assert.equal(s.ready,false);assert.equal(s.revision,0);
   assert((await diary(d)).programs.some(p=>p.name==='Изменение перед выходом'));
   assert(!d.errors.length,d.errors.join(';'));
   console.log('PASS signout during delayed cloud response: old response cannot reactivate session');
   await d.context.close();
  }
  // G: A previous session's hanging RPC must not block or revert a newly started sync session.
  {
   const cloud=new FakeCloud(),d=await device(browser,cloud,'cloud-user-G',JSON.stringify(fixture()));
   await connect(d,0);await sync(d);
   const gate=cloud.delayNextSave();
   await createProgram(d,'Перед переподключением');
   await gate.hasStarted;
   await d.page.evaluate(()=>window.__setlogCloudLab.disconnect());
   await connect(d,1);
   await sync(d);
   await until(()=>cloud.row('cloud-user-G')?.revision===2,'new connection uploads while old RPC hangs');
   assert.equal((await state(d)).revision,2);
   gate.release();
   await sleep(250);
   const s=await state(d);
   assert.equal(s.revision,2);
   assert.equal(s.ready,true);
   assert.equal(s.paused,false,'old response must not poison the new sync');
   assert.equal(s.syncInFlight,false);
   assert(!d.errors.length,d.errors.join(';'));
   console.log('PASS hanging RPC from previous login cannot block or override a fresh sync session');
   await d.context.close();
  }
  // H: Two edits in one browser during the first pending cloud RPC must both reach the server.
  {
   const cloud=new FakeCloud(),d=await device(browser,cloud,'cloud-user-H',JSON.stringify(fixture()));
   await connect(d,0);await sync(d);
   const gate=cloud.delayNextSave();
   await createProgram(d,'Первая правка');
   await gate.hasStarted;
   await createProgram(d,'Вторая правка');
   assert.equal(cloud.row('cloud-user-H')?.revision,1,'server should still contain previous revision');
   gate.release();
   await until(()=>cloud.row('cloud-user-H')?.revision===3,'both local edits uploaded sequentially',16000);
   const remote=cloud.row('cloud-user-H').payload;
   assert(remote.programs.some(p=>p.name==='Первая правка'));
   assert(remote.programs.some(p=>p.name==='Вторая правка'));
   await until(async()=>!(await state(d)).syncInFlight&&(await state(d)).revision===3,'two edits acknowledged');
   assert((await state(d)).storageStatus.includes('облаке'),'final sync status should reflect the second revision');
   assert(!d.errors.length,d.errors.join(';'));
   console.log('PASS two consecutive local edits during pending remote RPC: server has both, only final revision marked synced');
   await d.context.close();
  }
  // F: Fake server enforces per-user access boundaries, no cross-account snapshots.
  {
   const server=new FakeCloud(),seed=JSON.stringify(fixture());
   const a=await device(browser,server,'isolation-user-A',seed),b=await device(browser,server,'isolation-user-B',seed);
   await connect(a,0);await connect(b,0);
   await createProgram(a,'Секрет A');await createProgram(b,'Секрет B');
   await until(()=>server.row('isolation-user-A')&&server.row('isolation-user-B'),'two isolated uploads');
   assert(!server.row('isolation-user-A').payload.programs.some(p=>p.name==='Секрет B'));
   assert(!server.row('isolation-user-B').payload.programs.some(p=>p.name==='Секрет A'));
   const forbidden=await a.page.evaluate(()=>window.__setlogCloudLabTransport(
     {kind:'read',table:'setlog_user_data',key:'user_id',value:'isolation-user-B'}));
   assert.equal(forbidden.data,null,'cross-user read should return no row');
   console.log('PASS simulated server ownership boundary: no access to other test account data');
   await Promise.all([a.context.close(),b.context.close()]);
  }
 }catch(error){console.error('FAIL cloud stage5 multi-device mock integration:',error);process.exitCode=1}
 finally{await browser.close()}
})();
