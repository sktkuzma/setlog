const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url=(process.env.SETLOG_STAGE3_URL||'http://127.0.0.1:18786/')+'?atomicLab=1';
function fixture(){
 const now=Date.now(),date=new Date(now).toISOString().slice(0,10);
 return {schemaVersion:8,version:8,
  programs:[{id:'program-seed',name:'Тестовая программа',workouts:[
    {id:'workout-seed',name:'День 1',desc:'',exercises:[{id:'place-bench',catalogId:'catalog-bench',sets:3,target:'8–12',alt:''}]},
    {id:'workout-second',name:'День 2',desc:'',exercises:[]}]}],
  exerciseCatalog:[{id:'catalog-bench',name:'Жим лёжа',muscle:'Грудь',defaultSets:3,defaultTarget:'8–12'}],
  history:[{id:'saved-session',date,savedAt:now-1000,programId:'program-seed',programName:'Тестовая программа',
     workout:'workout-seed',workoutName:'День 1',entries:[
       {exerciseId:'catalog-bench',exerciseCatalogId:'catalog-bench',placementExerciseId:'place-bench',exerciseName:'Жим лёжа',muscle:'Грудь',setResults:[{weight:65,reps:8}],weight:65,reps:[8],sets:1,volume:520}]}],
  drafts:{},activeProgramId:'program-seed',activeWorkoutId:'workout-seed',createdAt:now,updatedAt:now
 };
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:860},serviceWorkers:'block'});
  await context.addInitScript(d=>{if(!localStorage.getItem('setlog-pwa-v1'))localStorage.setItem('setlog-pwa-v1',JSON.stringify(d))},fixture());
  const page=await context.newPage(),errors=[],supabaseRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>{
    if(r.request().url().includes('supabase.co')){supabaseRequests.push(r.request().url());return r.abort()}
    return r.continue();
  });
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#exerciseList .exercise-card').first().waitFor();
  await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:10000});
  await page.evaluate(()=>window.__setlogAtomicLab.flush());
  const baseCount=await page.evaluate(()=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).programs.length);
  await page.locator('#manageProgramsBtn').click();
  await page.locator('#newProgramName').fill('Тест новой программы');
  await page.locator('#newProgramTemplate').selectOption('blank');

  // Delayed IDB commit must not close the dialog or emit successful creation.
  await page.evaluate(()=>{
    const api=window.SetlogAtomicStorage,original=api.commit.bind(api);
    api.commit=async(...args)=>{
      window.__stage3Entered=true;
      await new Promise(resolve=>{window.__stage3Release=resolve});
      api.commit=original;
      return original(...args);
    };
  });
  await page.locator('#createProgramBtn').click();
  await page.waitForFunction(()=>window.__stage3Entered===true,{timeout:10000});
  const before=await page.evaluate(()=>({
    dialog:document.querySelector('#programDialog').open,
    raw:JSON.parse(localStorage.getItem('setlog-pwa-v1')),
    toast:document.querySelector('#toast').textContent
  }));
  assert.equal(before.dialog,true,'program dialog closed before durable ack');
  assert.equal(before.raw.programs.length,baseCount,'compatibility mirror changed before IDB commit');
  assert(!/Новая программа создана/.test(before.toast),'early success message');
  await page.locator('#createProgramBtn').click(); // protected from repeated click
  await page.evaluate(()=>window.__stage3Release());
  await page.waitForFunction(n=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).programs.length===n,baseCount+1,{timeout:10000});
  await page.waitForFunction(()=>!document.querySelector('#programDialog').open,{timeout:5000});
  const created=await page.evaluate(async()=>({
    raw:localStorage.getItem('setlog-pwa-v1'),
    saved:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload
  }));
  assert.equal(created.raw,created.saved);
  assert.equal(JSON.parse(created.raw).programs.filter(p=>p.name==='Тест новой программы').length,1,'double click duplicated program');
  console.log('PASS creating program waits for transaction, second click ignored, exactly one program stored');

  // Edit program name in real interface, then test a transaction failure on deletion.
  await page.locator('#manageProgramsBtn').click();
  await page.locator('#renameProgramName').fill('Силовой блок');
  await page.locator('#renameProgramBtn').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).programs.some(p=>p.name==='Силовой блок'),{timeout:10000});
  await page.waitForFunction(()=>!document.querySelector('#programDialog').open,{timeout:5000});
  const renamed=await page.evaluate(async()=>({
    local:localStorage.getItem('setlog-pwa-v1'),
    saved:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload
  }));
  assert.equal(renamed.local,renamed.saved);
  console.log('PASS rename program acknowledged by IndexedDB and compatibility copy');

  await page.locator('#manageProgramsBtn').click();
  page.once('dialog',async dlg=>dlg.accept());
  await page.evaluate(()=>{
    const api=window.SetlogAtomicStorage;
    api.commit=async()=>{throw new DOMException('Injected quota','QuotaExceededError')};
  });
  await page.locator('#deleteProgramBtn').click();
  await page.waitForFunction(()=>window.__setlogAtomicLab?.blocked===true,{timeout:9000});
  const afterFailure=await page.evaluate(async()=>({
    raw:localStorage.getItem('setlog-pwa-v1'),
    saved:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload
  }));
  assert.equal(afterFailure.raw,renamed.local,'failed deletion must not delete program from local copy');
  assert.equal(afterFailure.saved,renamed.saved,'failed deletion must not delete program from durable copy');
  assert.equal(JSON.parse(afterFailure.raw).programs.length,baseCount+1);
  assert(await page.locator('#atomicLabBlocked button').count()===2,'error must offer both backups');
  assert.equal(errors.length,0,errors.join('\n'));
  assert.equal(supabaseRequests.length,0,'must remain entirely offline from Supabase');
  console.log('PASS quota on deleting program: rollback retained both programs, both backup copies offered');
  await context.close();
 }catch(error){console.error('FAIL stage3 UI',error);process.exitCode=1}
 finally{await browser.close()}
})();
