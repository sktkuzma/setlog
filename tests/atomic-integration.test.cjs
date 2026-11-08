/* Browser regression for the real SET UI with experimental atomic journal enabled.
   Never connects to a live user account or uploads training data. */
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base=process.env.SETLOG_ATOMIC_URL||'http://127.0.0.1:18784/';
const url=base+'?atomicLab=1';
function fixture(){
 const day=new Date(),date=[day.getFullYear(),String(day.getMonth()+1).padStart(2,'0'),String(day.getDate()).padStart(2,'0')].join('-');
 return {schemaVersion:8,version:8,history:[{id:'original-session',date,savedAt:day.getTime(),programId:'p-test',programName:'Тестовая программа',workout:'w-1',workoutName:'Тест',entries:[{exerciseId:'exercise-bench',exerciseCatalogId:'exercise-bench',exerciseName:'Жим штанги лёжа',setResults:[{weight:70,reps:8}],weight:70,reps:[8],volume:560}]}],
   programs:[{id:'p-test',name:'Тестовая программа',workouts:[{id:'w-1',name:'Первый день',desc:'',exercises:[{id:'place-bench',catalogId:'exercise-bench',sets:3,target:'8–12',alt:''}]},{id:'w-2',name:'Второй день',desc:'',exercises:[{id:'place-bench-2',catalogId:'exercise-bench',sets:3,target:'8–12',alt:''}]}]}],
   exerciseCatalog:[{id:'exercise-bench',name:'Жим штанги лёжа',muscle:'Грудь',defaultSets:3,defaultTarget:'8–12'}],
   drafts:{},activeProgramId:'p-test',activeWorkoutId:'w-1',createdAt:day.getTime(),updatedAt:day.getTime()};
}
const pExec=(page,src)=>page.evaluate(src);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:840},serviceWorkers:'block'});
  await context.addInitScript(seed=>{
    if(!localStorage.getItem('setlog-pwa-v1'))localStorage.setItem('setlog-pwa-v1',JSON.stringify(seed));
  },fixture());
  // In laboratory mode no browser request to the actual Supabase API is allowed.
  const remote=[];await context.route('**/*',route=>{
    if(/supabase\.co/.test(route.request().url())){remote.push(route.request().url());return route.abort()}
    return route.continue();
  });
  const a=await context.newPage(),errors=[];a.on('pageerror',e=>errors.push(e.message));
  await a.goto(url,{waitUntil:'domcontentloaded'});
  await a.locator('#exerciseList .exercise-card').first().waitFor({timeout:18000});
  await a.waitForFunction(()=>window.__setlogAtomicLab?.ready===true);
  const startup=await pExec(a,async()=>{
    const bridge=window.__setlogAtomicLab;
    await bridge.flush();
    return {writer:bridge.writer,payload:(await bridge.inspect('setlog-pwa-v1'))?.payload,local:localStorage.getItem('setlog-pwa-v1')};
  });
  assert(startup.writer,'first tab must own the writer lock');
  assert.equal(startup.payload,startup.local,'initial migration must keep exact local payload');
  const other=await context.newPage(),otherErrors=[];other.on('pageerror',e=>otherErrors.push(e.message));
  await other.goto(url,{waitUntil:'domcontentloaded'});
  await other.locator('#atomicLabBlocked').waitFor({timeout:10000});
  assert((await other.locator('#atomicLabBlocked').innerText()).includes('другой'));
  // Trigger a real application save without direct test-only API.
  const tabs=a.locator('#workoutSwitch [data-workout]');
  assert((await tabs.count())>=2,'two workouts in test program');
  await tabs.nth(1).click();
  await a.waitForFunction(()=>window.__setlogAtomicLab?.flush()!==undefined);
  const after=await pExec(a,async()=>{
    await window.__setlogAtomicLab.flush();
    const item=await window.__setlogAtomicLab.inspect('setlog-pwa-v1');
    return {id:JSON.parse(item.payload).activeWorkoutId,revision:item.revision,local:localStorage.getItem('setlog-pwa-v1'),payload:item.payload};
  });
  assert.equal(after.id,'w-2');
  assert(after.revision>=2,'journal revision should increase on genuine UI save');
  assert.equal(after.payload,after.local,'journal must match localStorage after saving workout selection');
  await a.locator('#saveWorkoutBtn').click();
  await a.evaluate(()=>window.__setlogAtomicLab.flush());
  const afterDraft=await pExec(a,async()=>({
    copy:await window.__setlogAtomicLab.inspect('setlog-pwa-v1'),
    local:localStorage.getItem('setlog-pwa-v1')
  }));
  assert.equal(afterDraft.copy.payload,afterDraft.local,'draft save must be journaled');
  assert(afterDraft.copy.revision>after.revision,'draft save must create a new revision');
  assert(JSON.parse(afterDraft.copy.payload).history.some(s=>s.id==='original-session'),'history preserved');

  // Fill a real set inside the exercise detail dialog and save the complete session.
  await a.locator('#exerciseList [data-action="open-exercise"]').first().click();
  const dialog=a.locator('#exerciseDetailDialog');
  await dialog.locator('input[data-field="weight"]').first().fill('82.5');
  await dialog.locator('input[data-field="reps"]').first().fill('8');
  await dialog.locator('[data-action="close-exercise-detail"]').first().click();
  await a.evaluate(()=>window.__setlogAtomicLab.flush());
  const afterInput=await pExec(a,async()=>({
    diary:JSON.parse(localStorage.getItem('setlog-pwa-v1')),
    copy:await window.__setlogAtomicLab.inspect('setlog-pwa-v1')
  }));
  assert.equal(afterInput.diary.drafts[Object.keys(afterInput.diary.drafts).find(x=>x.includes('w-2'))]['place-bench-2'].sets[0].weight,'82.5');
  assert.equal(afterInput.copy.payload,JSON.stringify(afterInput.diary),'entered working set must be journaled');
  a.on('dialog',async dlg=>dlg.accept());
  await a.evaluate(()=>{const btn=document.getElementById('finishWorkoutBtn');btn.click();btn.click();});
  await a.waitForFunction(()=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).history.length===2);
  await a.evaluate(()=>window.__setlogAtomicLab.flush());
  const finished=await pExec(a,async()=>({
    copy:await window.__setlogAtomicLab.inspect('setlog-pwa-v1'),
    local:localStorage.getItem('setlog-pwa-v1')
  }));
  assert.equal(finished.copy.payload,finished.local,'finished session must be journaled');
  const finishedHistory=JSON.parse(finished.local).history;
  assert.equal(finishedHistory.length,2,'old session plus newly saved session');
  assert.equal(finishedHistory[0].id,'original-session','previous session must survive');
  assert(finishedHistory[1].entries.some(e=>e.setResults.some(x=>x.weight===82.5&&x.reps===8)),'recorded working set must survive');

  assert(!remote.length,'live Supabase API request was attempted: '+remote.join(','));
  assert(!errors.length,'first tab errors: '+errors.join(';'));
  assert(!otherErrors.length,'other tab errors: '+otherErrors.join(';'));
  // Once writer closes, a separate tab can open the real app and continue.
  await a.close();
  await other.reload({waitUntil:'domcontentloaded'});
  await other.locator('#exerciseList .exercise-card').first().waitFor({timeout:12000});
  await other.waitForFunction(()=>window.__setlogAtomicLab?.ready===true);
  assert.equal(await pExec(other,()=>window.__setlogAtomicLab.writer),true);
  const reopened=await pExec(other,async()=>({payload:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload,local:localStorage.getItem('setlog-pwa-v1')}));
  assert.equal(reopened.payload,reopened.local,'reopened writer reads the same diary');
  assert(await other.locator('#atomicLabBanner').count()===1,'lab mode must be clearly marked');
  for(let i=0;i<9;i++)await other.locator('#saveWorkoutBtn').click();
  const bounded=await pExec(other,async()=>{
    await window.__setlogAtomicLab.flush();
    return window.SetlogAtomicStorage.listRollback('setlog-pwa-v1');
  });
  assert(bounded.length<=4,'atomic revision journal must retain no more than 4 rollback copies');
  // Simulate incomplete migration / stale local data. Do not overwrite either copy.
  await other.evaluate(()=>{
    const key='setlog-pwa-v1',diary=JSON.parse(localStorage.getItem(key));
    diary.history=diary.history.filter(x=>x.id==='original-session');
    localStorage.setItem(key,JSON.stringify(diary));
  });
  await other.reload({waitUntil:'domcontentloaded'});
  await other.locator('#atomicLabBlocked').waitFor({timeout:10000});
  assert((await other.locator('#atomicLabBlocked').innerText()).includes('различаются'),'divergence must stop startup');
  assert.equal(await other.locator('#atomicLabBlocked button').count(),2,'blocked state offers both independent backups');
  const latest=await other.evaluate(async()=>window.SetlogAtomicStorage.read('setlog-pwa-v1'));
  assert.equal(JSON.parse(latest.payload).history.length,2,'transactional history is preserved after divergence');
  assert.equal(JSON.parse(await other.evaluate(()=>localStorage.getItem('setlog-pwa-v1'))).history.length,1,'local history not overwritten automatically');
  console.log('PASS journal quota bounded, diverged copies detected and both backups available');

  console.log('PASS full SET UI: real saves journaled, multiple tabs serialized and history preserved');
  console.log('PASS account isolation gate: other tab blocked then takes lock after close');
  console.log('PASS zero Supabase API calls in lab mode; no JavaScript errors');
  await context.close();
 }catch(e){console.error('FAIL integrated atomic lab',e);process.exitCode=1}
 finally{await browser.close()}
})();
