const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const start=source.indexOf('  async function restoreCloudHistoryVersion(){'),end=source.indexOf('  function ensureSupabaseSdk(){',start);
assert(start>=0&&end>start,'Cannot locate restore implementation');
const block=source.slice(start,end);
const fake={history:[{id:'old-session'}],programs:[{id:'program-main',workouts:[{id:'1'}]}]};
const incoming={history:[{id:'cloud-session'}],programs:[{id:'program-main',workouts:[{id:'1'}]}]};
const key='setlog-pwa-v1:user:A';
const pause=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
function create({snapshotPromise=null,savePromise=null}={}){
 const disk=new Map([[key,JSON.stringify(fake)]]);
 const elems=new Map();
 const $=id=>{if(!elems.has(id))elems.set(id,{value:id==='#cloudHistorySelect'?'selected':'',disabled:false,textContent:'',close:()=>{}});return elems.get(id)};
 const ctx={
   $,
   cloudSession:{user:{id:'A'}},cloudSessionGeneration:1,activeStorageKey:key,
   cloudClient:{from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>snapshotPromise||{data:{id:'selected',created_at:'2026-11-01',payload:incoming},error:null}}),rpc:()=>savePromise||Promise.resolve({data:{revision:2,updated_at:'2026-11-08'},error:null})},
   localStorage:{getItem:k=>disk.has(k)?disk.get(k):null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)},
   lastPersistedRaw:disk.get(key),staleTabBlocked:false,cloudRevision:1,cloudUserId:'A',cloudReady:true,cloudPaused:false,pendingCloudChoice:null,
   navigator:{onLine:true},confirm:()=>true,notify:()=>{},setCloudMessage:()=>{},setStorageStatus:()=>{},
   createCloudRestorePoint:async()=>true,fetchCloudRow:async()=>({revision:1}),saveSafetySnapshot:async()=>true,
   DATA_SCHEMA_VERSION:8,normalizeData:x=>x,data:structuredClone(fake),
   getWorkouts:()=>[{id:'1'}],activeProgramId:'program-main',activeWorkout:'1',
   writeCloudMeta:()=>{},renderAfterStorageScopeChange:()=>{},renderHistory:()=>{},renderProgress:()=>{},updateBackupStatus:async()=>{},
   sessionCurrent:(generation,id)=>generation===ctx.cloudSessionGeneration&&ctx.cloudSession?.user?.id===id,
   console:{error(){},warn(){}},JSON,Number,Date,Error,Array,
 };
 vm.createContext(ctx);vm.runInContext(block,ctx);return {ctx,disk,$};
}
async function run(name,test){try{await test();console.log('PASS',name)}catch(error){console.error('FAIL',name,error);process.exitCode=1}}
(async()=>{
 await run('late account switch cannot overwrite active account',async()=>{
   const gate=pause(),{ctx,disk}=create({snapshotPromise:gate.promise});
   const ongoing=vm.runInContext('restoreCloudHistoryVersion()',ctx);
   ctx.cloudSession=null;ctx.cloudSessionGeneration++;
   gate.resolve({data:{id:'selected',created_at:'2026-11-01',payload:incoming},error:null});
   await ongoing;assert.deepEqual(JSON.parse(disk.get(key)),fake);
 });
 await run('competing tab data is not rolled back after failed cloud RPC',async()=>{
   const gate=pause(),{ctx,disk}=create({savePromise:gate.promise});
   const ongoing=vm.runInContext('restoreCloudHistoryVersion()',ctx);
   for(let i=0;i<25&&!JSON.parse(disk.get(key)).history.some(s=>s.id==='cloud-session');i++)await new Promise(r=>setTimeout(r,0));
   assert.equal(JSON.parse(disk.get(key)).history[0].id,'cloud-session','restore prewrite never happened');
   const newer={history:[{id:'other-tab-session'}],programs:fake.programs};disk.set(key,JSON.stringify(newer));
   gate.resolve({data:null,error:{message:'revision_conflict'}});
   await ongoing;assert.deepEqual(JSON.parse(disk.get(key)),newer);
 });
 await run('successful cloud restore keeps new data and revision',async()=>{
   const {ctx,disk}=create();await vm.runInContext('restoreCloudHistoryVersion()',ctx);
   assert.equal(JSON.parse(disk.get(key)).history[0].id,'cloud-session');assert.equal(ctx.cloudRevision,2);
 });
})();
