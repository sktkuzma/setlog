const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync('app.js','utf8');
const block=s.slice(s.indexOf('  function verifiedLegacySnapshotMatchesCurrentHistory('),s.indexOf('  async function updateBackupStatus(){'));
assert(block.includes('async function claimVerifiedLegacySnapshots'));
const old=(id,historyId)=>({id,createdAt:12345,label:'old',payload:JSON.stringify({history:[{id:historyId}],programs:[]})});
async function create(records,{user='A',historyId='unique-a'}={}){
 const data=[...records];let seq=0;
 const db={close(){},transaction(){const tx={oncomplete:null,objectStore(){return {getAll(){const req={};queueMicrotask(()=>{req.result=data.slice();req.onsuccess();queueMicrotask(()=>tx.oncomplete())});return req},put(x){data.push(x)}}}};return tx}};
 const c={data:{history:historyId?[{id:historyId}]:[]},cloudSession:user?{user:{id:user}}:null,cloudSessionGeneration:1,
 activeStorageKey:user?'setlog-pwa-v1:user:'+user:'setlog-pwa-v1',
 currentSnapshotOwner(){return c.activeStorageKey},accountStorageKey:id=>'setlog-pwa-v1:user:'+id,
 sessionCurrent:(g,id)=>g===c.cloudSessionGeneration&&c.cloudSession?.user?.id===id,
 openSafetyDB:async()=>db,updateBackupStatus:async()=>{},uid:()=>String(++seq),console,JSON,Set,Number,Error,Date};
 vm.createContext(c);vm.runInContext(block,c);return {c,data};
}
(async()=>{
 let n=0;
 {const {c,data}=await create([old('a','unique-a'),old('b','unique-b')]);
 assert.equal(await vm.runInContext('claimVerifiedLegacySnapshots()',c),1);
 assert.equal(data.length,3);assert.equal(data[0].ownerScope,undefined);assert.equal(data[2].ownerScope,'setlog-pwa-v1:user:A');assert.equal(data[2].legacySourceId,'a');
 assert.equal(await vm.runInContext('claimVerifiedLegacySnapshots()',c),0);console.log('PASS matching owner, preservation and idempotency');n++}
 {const {c,data}=await create([old('a','unique-a')],{user:'B',historyId:'unique-b'});
 assert.equal(await vm.runInContext('claimVerifiedLegacySnapshots()',c),0);assert.equal(data.length,1);console.log('PASS cross-account isolation');n++}
 {const {c,data}=await create([old('a','unique-a')],{user:null});
 assert.equal(await vm.runInContext('claimVerifiedLegacySnapshots()',c),0);assert.equal(data.length,1);console.log('PASS guest exclusion');n++}
 {const {c,data}=await create([old('a','unique-a')],{historyId:null});
 assert.equal(await vm.runInContext('claimVerifiedLegacySnapshots()',c),0);assert.equal(data.length,1);console.log('PASS unmatched data remains untouched');n++}
 {const owned=Array.from({length:10},(_,i)=>({...old('own'+i,'unique-a'),ownerScope:'setlog-pwa-v1:user:A'}));
 const {c,data}=await create([old('a','unique-a'),...owned]);
 assert.equal(await vm.runInContext('claimVerifiedLegacySnapshots()',c),0);assert.equal(data.length,11);console.log('PASS existing backup capacity protected');n++}
 console.log('Legacy safety tests:',n,'passed');
})().catch(err=>{console.error(err);process.exitCode=1});
