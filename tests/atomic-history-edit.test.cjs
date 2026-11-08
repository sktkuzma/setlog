const {chromium}=require('playwright-core'),assert=require('node:assert/strict');
const url=(process.env.SETLOG_STAGE4_URL||'http://127.0.0.1:18787/')+'?atomicLab=1';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const KEY='setlog-pwa-v1',EDIT=KEY+':history-edit-v1';
function fixture(){
 const now=Date.now();
 return {schemaVersion:8,version:8,programs:[{id:'test-program',name:'Тест',workouts:[{id:'day1',name:'День 1',exercises:[{id:'placement1',catalogId:'ex1',target:'8–12',sets:3,alt:''}]}]}],
 exerciseCatalog:[{id:'ex1',name:'Жим штанги лёжа',muscle:'Грудь',defaultSets:3,defaultTarget:'8–12'}],
 history:[{id:'history-edit-test',date:'2026-11-08',savedAt:now,programId:'test-program',programName:'Тест',workout:'day1',workoutName:'День 1',
  entries:[{exerciseId:'ex1',exerciseCatalogId:'ex1',placementExerciseId:'placement1',exerciseName:'Жим штанги лёжа',muscle:'Грудь',
   weight:50,reps:[8],sets:1,setResults:[{weight:50,reps:8}],volume:400}]}],
 drafts:{},activeProgramId:'test-program',activeWorkoutId:'day1',createdAt:now,updatedAt:now};
}
async function createPage(browser){
 const context=await browser.newContext({viewport:{width:390,height:840},serviceWorkers:'block'});
 await context.addInitScript(seed=>{
  if(!localStorage.getItem('setlog-pwa-v1'))localStorage.setItem('setlog-pwa-v1',JSON.stringify(seed));
 },fixture());
 const page=await context.newPage(); const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:15000});
 await page.evaluate(()=>window.__setlogAtomicLab.flush());
 return {page,context,errors};
}
async function beginEdit(page){
 await page.locator('[data-view="history"]').first().click();
 await page.locator('[data-action="edit-history-session"]').first().click();
 await page.waitForFunction(k=>!!localStorage.getItem(k),EDIT,{timeout:10000});
 await page.evaluate(()=>window.__setlogAtomicLab.flush());
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
 try{
  // A: Edit draft save, atomic apply with simultaneous deletion and successful reload.
  {
   const {page,context,errors}=await createPage(browser);
   await beginEdit(page);
   const initial=await page.evaluate(async({key,edit})=>({
    mirror:localStorage.getItem(edit),
    durable:(await window.__setlogAtomicLab.inspect(key)).historyEditRaw
   }),{key:KEY,edit:EDIT});
   assert.equal(initial.mirror,initial.durable,'history edit should be migrated to same IDB record');
   await page.locator('[data-action="open-exercise"]').first().click();
   await page.locator('#exerciseDetailDialog input[data-field="weight"]').first().fill('77.5');
   await page.locator('#exerciseDetailDialog input[data-field="reps"]').first().fill('9');
   await page.locator('[data-action="close-exercise-detail"]').first().click();
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   const typed=await page.evaluate(async({key,edit})=>({
    mirror:localStorage.getItem(edit),record:await window.__setlogAtomicLab.inspect(key)
   }),{key:KEY,edit:EDIT});
   assert.equal(typed.mirror,typed.record.historyEditRaw,'edit input must be transactional');
   const d=JSON.parse(typed.mirror);
   assert.equal(d.draft[d.exercises[0].id].sets[0].weight,'77.5');

   await page.evaluate(()=>{
    const api=window.SetlogAtomicStorage,old=api.commitWithEdit.bind(api);
    api.commitWithEdit=async(...args)=>{
      window.__combineEntered=true;
      await new Promise(resolve=>{window.__releaseCombined=resolve});
      api.commitWithEdit=old;
      return old(...args);
    };
   });
   const before=await page.evaluate(async()=>{
     const row=await window.__setlogAtomicLab.inspect('setlog-pwa-v1');
     return {raw:localStorage.getItem('setlog-pwa-v1'),edit:localStorage.getItem('setlog-pwa-v1:history-edit-v1'),
       durable:row.payload,editDurable:row.historyEditRaw};
   });
   await page.locator('#finishWorkoutBtn').click();
   await page.waitForFunction(()=>window.__combineEntered===true,{timeout:10000});
   const delayed=await page.evaluate(async()=>{
     const row=await window.__setlogAtomicLab.inspect('setlog-pwa-v1');
     return {raw:localStorage.getItem('setlog-pwa-v1'),edit:localStorage.getItem('setlog-pwa-v1:history-edit-v1'),
       durable:row.payload,editDurable:row.historyEditRaw};
   });
   assert.deepEqual(delayed,before,'no main/history edit mirror should change before combined commit');
   await page.evaluate(()=>window.__releaseCombined());
   await page.waitForFunction(()=>localStorage.getItem('setlog-pwa-v1:history-edit-v1')===null,{timeout:10000});
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   const after=await page.evaluate(async()=>{
     const row=await window.__setlogAtomicLab.inspect('setlog-pwa-v1');
     return {raw:localStorage.getItem('setlog-pwa-v1'),edit:localStorage.getItem('setlog-pwa-v1:history-edit-v1'),
       durable:row.payload,editDurable:row.historyEditRaw};
   });
   assert.equal(after.raw,after.durable);
   assert.equal(after.edit,null);
   assert.equal(after.editDurable,null);
   assert.equal(JSON.parse(after.raw).history[0].entries[0].setResults[0].weight,77.5);
   assert.equal(JSON.parse(after.raw).history[0].entries[0].setResults[0].reps,9);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:15000});
   assert(!errors.length,errors.join(';'));
   console.log('PASS edit history draft: transactional typing and combined atomic apply+delete survives reload');
   await context.close();
  }
  // B: Quota failure on combined transaction must leave history + edit untouched.
  {
   const {page,context,errors}=await createPage(browser);
   await beginEdit(page);
   await page.locator('[data-action="open-exercise"]').first().click();
   await page.locator('#exerciseDetailDialog input[data-field="weight"]').first().fill('85');
   await page.locator('[data-action="close-exercise-detail"]').first().click();
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   const before=await page.evaluate(async()=>({
     old:localStorage.getItem('setlog-pwa-v1'),edit:localStorage.getItem('setlog-pwa-v1:history-edit-v1'),
     durable:await window.__setlogAtomicLab.inspect('setlog-pwa-v1')
   }));
   await page.evaluate(()=>{
     window.SetlogAtomicStorage.commitWithEdit=async()=>{throw new DOMException('Injected quota failure','QuotaExceededError')};
   });
   await page.locator('#finishWorkoutBtn').click();
   await page.waitForFunction(()=>window.__setlogAtomicLab.blocked===true,{timeout:10000});
   const after=await page.evaluate(async()=>({
     old:localStorage.getItem('setlog-pwa-v1'),edit:localStorage.getItem('setlog-pwa-v1:history-edit-v1'),
     durable:await window.__setlogAtomicLab.inspect('setlog-pwa-v1')
   }));
   assert.equal(after.old,before.old);
   assert.equal(after.edit,before.edit);
   assert.equal(after.durable.payload,before.durable.payload);
   assert.equal(after.durable.historyEditRaw,before.durable.historyEditRaw);
   assert.equal(JSON.parse(after.old).history[0].entries[0].setResults[0].weight,50);
   assert(await page.locator('#atomicLabBlocked button').count()>=3);
   assert(!errors.length,errors.join(';'));
   console.log('PASS combined history edit failure: both previous copies and edit draft remain intact');
   await context.close();
  }
  // C: Canceling an edit must remove the edit mirror only after IDB confirms the same revision.
  {
   const {page,context,errors}=await createPage(browser);
   await beginEdit(page);
   await page.locator('[data-action="open-exercise"]').first().click();
   await page.locator('#exerciseDetailDialog input[data-field="weight"]').first().fill('62');
   await page.locator('[data-action="close-exercise-detail"]').first().click();
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   await page.evaluate(()=>window.confirm=()=>true);
   await page.locator('[data-action="cancel-history-edit"]').first().click();
   await page.waitForFunction(()=>localStorage.getItem('setlog-pwa-v1:history-edit-v1')===null,{timeout:10000});
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   const result=await page.evaluate(async()=>({
     durable:await window.__setlogAtomicLab.inspect('setlog-pwa-v1'),
     local:localStorage.getItem('setlog-pwa-v1')
   }));
   assert.equal(result.durable.historyEditRaw,null);
   assert.equal(result.durable.payload,result.local);
   assert.equal(JSON.parse(result.local).history[0].entries[0].setResults[0].weight,50);
   assert(!errors.length,errors.join(';'));
   console.log('PASS history edit cancellation atomically clears both copies and retains original workout');
   await context.close();
  }
 }catch(error){console.error('FAIL stage4 history edits',error);process.exitCode=1}
 finally{await browser.close()}
})();
