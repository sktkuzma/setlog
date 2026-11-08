const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const host=process.env.SETLOG_ATOMIC_URL||'http://127.0.0.1:18785/';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const seed=()=>{
 const now=Date.now(),date=new Date(now).toISOString().slice(0,10);
 return {schemaVersion:8,version:8,history:[{id:'already-saved',date,savedAt:now,programId:'test-p',programName:'Тест',workout:'day1',workoutName:'Тест',entries:[]}],
 programs:[{id:'test-p',name:'Тест',workouts:[{id:'day1',name:'День 1',exercises:[{id:'place1',catalogId:'ex1',sets:3,target:'8',alt:''}]}]}],
 exerciseCatalog:[{id:'ex1',name:'Жим лёжа',muscle:'Грудь',defaultSets:3}],drafts:{},activeProgramId:'test-p',activeWorkoutId:'day1',updatedAt:now,createdAt:now};
};
async function setup(browser){
 const ctx=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:850}});
 await ctx.addInitScript(data=>{
  if(!localStorage.getItem('setlog-pwa-v1'))localStorage.setItem('setlog-pwa-v1',JSON.stringify(data));
 },seed());
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(host+'?atomicLab=1',{waitUntil:'domcontentloaded'});
 await page.locator('#exerciseList .exercise-card').first().waitFor({timeout:18000});
 await page.evaluate(()=>window.__setlogAtomicLab.flush());
 return {page,ctx,errors};
}
(async()=>{
 const browser=await chromium.launch({executablePath,headless:true,args:['--no-first-run','--disable-background-networking']});
 try{
  // 1. No compatibility write and no success notification before transaction completion.
  {
   const {page,ctx,errors}=await setup(browser);
   const before=await page.evaluate(()=>localStorage.getItem('setlog-pwa-v1'));
   await page.evaluate(()=>{
     const a=window.SetlogAtomicStorage,original=a.commit.bind(a);
     a.commit=async(...args)=>{
       window.__commitEntered=true;
       await new Promise(resolve=>{window.__releaseCommit=resolve});
       return original(...args);
     };
   });
   await page.locator('#saveWorkoutBtn').click();
   await page.waitForFunction(()=>window.__commitEntered===true,{timeout:7000});
   const pending=await page.evaluate(()=>({
     raw:localStorage.getItem('setlog-pwa-v1'),
     label:document.querySelector('#storageStatusText')?.textContent,
     toast:document.querySelector('#toast')?.textContent
   }));
   assert.equal(pending.raw,before,'localStorage mirror must not write before tx complete');
   assert(/транзакцион|сохраняем/i.test(pending.label),'status must be pending until commit');
   assert(!/черновик сохранён/i.test(pending.toast),'success must not appear until acknowledged');
   // A cloud uploader must not be able to send an old payload while an IDB write is pending.
   await page.evaluate(stale=>{
     window.__cloudGateState='waiting';
     window.__setlogAtomicLab.verifiedCloudPayload('setlog-pwa-v1',stale)
       .then(()=>{window.__cloudGateState='accepted'},()=>{window.__cloudGateState='rejected'});
   },before);
   const gateBefore=await page.evaluate(()=>window.__cloudGateState);
   assert.equal(gateBefore,'waiting','cloud upload must wait for the in-flight transaction');

   await page.evaluate(()=>window.__releaseCommit());
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   await page.waitForFunction(()=>/Черновик сохранён/.test(document.querySelector('#toast')?.textContent||''),{timeout:8000});
   const after=await page.evaluate(async()=>({
     local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload
   }));
   assert.equal(after.local,after.durable,'durable and mirror converge after commit');
   await page.waitForFunction(()=>window.__cloudGateState==='rejected',{timeout:8000});
   const envelope=await page.evaluate(async()=>{
     const scope='setlog-pwa-v1';
     return window.__setlogAtomicLab.verifiedCloudPayload(scope,localStorage.getItem(scope));
   });
   assert.deepEqual(envelope.payload,JSON.parse(after.local),'cloud gate returns only committed payload');
   assert(envelope.revision>=2);

   assert(!errors.length,'JS errors: '+errors.join(' / '));
   console.log('PASS pending transaction: mirror unchanged and success withheld until IDB.oncomplete');
   await ctx.close();
  }
  // 2. Quota / rejected transaction may not overwrite an earlier successful diary.
  {
   const {page,ctx,errors}=await setup(browser);
   const before=await page.evaluate(async()=>({
     local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload
   }));
   await page.evaluate(()=>{
     window.SetlogAtomicStorage.commit=async()=>{throw new DOMException('Injected quota error','QuotaExceededError')};
   });
   await page.locator('#saveWorkoutBtn').click();
   await page.waitForFunction(()=>window.__setlogAtomicLab?.blocked===true,{timeout:7000});
   const after=await page.evaluate(async()=>({
     local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload,
     status:document.querySelector('#storageStatusText')?.textContent,
     toast:document.querySelector('#toast')?.textContent
   }));
   assert.equal(after.local,before.local,'quota failure must not overwrite local previous copy');
   assert.equal(after.durable,before.durable,'quota failure must not overwrite durable previous copy');
   assert(/останов|не подтвержден|заблокирован/i.test(after.status));
   assert(!/черновик сохранён/i.test(after.toast),'false success toast after quota error');
   const gateRefused=await page.evaluate(async()=>{
     try{await window.__setlogAtomicLab.verifiedCloudPayload('setlog-pwa-v1',localStorage.getItem('setlog-pwa-v1'));return false}
     catch(error){return true}
   });
   assert(gateRefused,'failed transaction must permanently block cloud upload until recovery');

   assert(!errors.length,'JS errors after fault: '+errors.join('/'));
   console.log('PASS quota/injected commit failure: no writes, writer blocked, no false success');
   await ctx.close();
  }
  // 3. Failure after durable commit but before writing compatibility mirror:
  //    both copies must survive and the next boot must stop instead of guessing.
  {
   const {page,ctx,errors}=await setup(browser);
   const before=await page.evaluate(()=>localStorage.getItem('setlog-pwa-v1'));
   await page.evaluate(()=>{
     const old=Storage.prototype.setItem;
     Storage.prototype.setItem=function(k,v){
       if(k==='setlog-pwa-v1')throw new DOMException('Injected mirror failure','QuotaExceededError');
       return old.call(this,k,v);
     };
   });
   await page.locator('#saveWorkoutBtn').click();
   await page.waitForFunction(()=>window.__setlogAtomicLab?.blocked===true,{timeout:7000});
   const partial=await page.evaluate(async()=>({
     old:localStorage.getItem('setlog-pwa-v1'),
     durable:await window.__setlogAtomicLab.inspect('setlog-pwa-v1')
   }));
   assert.equal(partial.old,before,'legacy mirror stays unchanged');
   assert.notEqual(partial.durable.payload,partial.old,'newer durable data preserved');
   assert(partial.durable.revision>=2);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#atomicLabBlocked').waitFor({timeout:9000});
   assert.equal(await page.locator('#atomicLabBlocked button').count(),2,'both backups offered');
   assert((await page.locator('#atomicLabBlocked').innerText()).includes('различаются'));
   assert(!errors.length,'JS errors mirror fault: '+errors.join(' / '));
   console.log('PASS post-transaction crash/mirror failure: IDB intact, safe startup blocker and recovery downloads');
   await ctx.close();
  }
 }catch(e){console.error('FAIL atomic IDB-first',e);process.exitCode=1}
 finally{await browser.close()}
})();
