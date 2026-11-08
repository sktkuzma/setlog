const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8'), sw=fs.readFileSync('sw.js','utf8');
function chunk(a,b){const i=app.indexOf(a),j=app.indexOf(b,i+1);assert(i>=0&&j>i);return app.slice(i,j)}
let pass=0;
async function test(name,fn){try{await fn();console.log('PASS',name);pass++}catch(e){console.error('FAIL',name,e);process.exitCode=1}}
(async()=>{
 await test('two tabs: stale save cannot overwrite other tab',()=>{
  const storage=new Map([['diary','{"history":[]}']]);
  let code=chunk('  function persist(options={}){','  const MAX_LOGGED_SETS');
  const create=()=>{let ctx={
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    data:{history:[],drafts:{}},activeProgramId:'x',activeWorkout:'w',DATA_SCHEMA_VERSION:8,activeStorageKey:'diary',lastPersistedRaw:storage.get('diary'),
    staleTabBlocked:false,storageWriteBlocked:false,cloudSession:null,cloudReady:false,cloudApplying:false,
    setStorageStatus:()=>{},setCloudMessage:()=>{},notify:()=>{},scheduleSafetySnapshot:()=>{},saveSafetySnapshot:()=>{},scheduleCloudSync:()=>{},
    clearTimeout:()=>{},cloudSyncTimer:null,cloudRetryTimer:null,console,Date
  };vm.createContext(ctx);vm.runInContext(code,ctx);return ctx};
  const a=create(),b=create();
  a.data.history.push({id:'session-a'});assert.equal(vm.runInContext('persist()',a),true);
  b.data.history.push({id:'session-b'});assert.equal(vm.runInContext('persist()',b),false);
  assert.equal(JSON.parse(storage.get('diary')).history[0].id,'session-a');
 });
 await test('snapshot ownership: filter and retention scoped',()=>{
  assert(app.includes('ownerScope:currentSnapshotOwner()'));
  assert(app.includes('filter(item=>item.ownerScope===snapshot.ownerScope)'));
  assert(app.includes('records.filter(item=>item.ownerScope===currentSnapshotOwner())'));
  assert(app.includes('item.ownerScope===currentSnapshotOwner()'));
 });
 await test('cloud response after signout is ignored',async()=>{
  const code=chunk('  async function syncCloudState(){','  async function chooseCloudData(){');
  let respond;
  const pending=new Promise(resolve=>{respond=resolve});
  let ctx={cloudClient:{rpc:()=>pending},cloudSession:{user:{id:'user-A'}},cloudReady:true,cloudPaused:false,cloudSyncInFlight:false,cloudSyncAttemptId:0,cloudSyncRequested:false,
    cloudSessionGeneration:0,cloudRevision:1,cloudUserId:'user-A',navigator:{onLine:true},data:{history:[],updatedAt:1},
    DATA_SCHEMA_VERSION:8,cloudRetryTimer:null,cloudRetryDelay:5000,cloudSyncTimer:null,
    clearTimeout:()=>{},setStorageStatus:()=>{},setCloudMessage:()=>{},writeCloudMeta:()=>{},removeLegacyGuestCopyAfterCloudReady:()=>{},localStorage:{setItem:()=>{}},
    scheduleCloudSync:()=>{},scheduleCloudRetry:()=>{},console,Date,JSON,Number,
    sessionCurrent:(gen,id)=>gen===ctx.cloudSessionGeneration&&ctx.cloudSession?.user?.id===id
  };vm.createContext(ctx);vm.runInContext(code,ctx);
  const run=vm.runInContext('syncCloudState()',ctx);
  ctx.cloudSession=null;ctx.cloudSessionGeneration++;
  respond({data:[{revision:2}],error:null});
  await run;
  assert.equal(ctx.cloudUserId,'user-A');
  assert.equal(ctx.cloudRevision,1);
  assert.equal(ctx.cloudReady,true); // state intentionally not reset by isolated mock; old reply didn't alter it
 });
 await test('service worker returns fresh response even on failed cache.put',async()=>{
  let fetchHandler;
  let self={location:{origin:'https://example.test'},addEventListener:(name,fn)=>{if(name==='fetch')fetchHandler=fn}};
  let caches={open:async()=>({put:async()=>{throw Error('quota')}}),match:async()=>({body:'old'})};
  let ctx={self,caches,fetch:async()=>({ok:true,type:'basic',body:'fresh',clone(){return this}}),console,URL,Response:{error:()=>({body:'error'})}};
  vm.runInNewContext(sw,ctx);
  let pending;fetchHandler({request:{method:'GET',url:'https://example.test/app.js'},respondWith:x=>pending=x});
  assert.equal((await pending).body,'fresh');
 });
 await test('report rendering source unchanged from v1.3.5',()=>{
  const {execFileSync}=require('node:child_process');
  const old=execFileSync('git',['show','889801f9ffe9c0ef81dbf16d887501a86f15bffd:app.js'],{encoding:'utf8'});
  const part=s=>s.slice(s.indexOf('  function wrapShareText('),s.indexOf('  function downloadJSON(')); // elsewhere no changes expected in rendering
  assert.equal(part(app).replace(/\r\n/g,'\n'),part(old).replace(/\r\n/g,'\n'));
  const oldCss=execFileSync('git',['show','889801f9ffe9c0ef81dbf16d887501a86f15bffd:style.css'],{encoding:'utf8'});
  assert.equal(fs.readFileSync('style.css','utf8').replace(/\r\n/g,'\n'),oldCss.replace(/\r\n/g,'\n'));
 });
 console.log('Tests passed:',pass);
})();
