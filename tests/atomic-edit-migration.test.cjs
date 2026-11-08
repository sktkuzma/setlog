const {chromium}=require('playwright-core'),assert=require('node:assert/strict');
const url=(process.env.SETLOG_STAGE4_URL||'http://127.0.0.1:18787/')+'?atomicLab=1';
const chrome=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const key='setlog-pwa-v1',editKey=key+':history-edit-v1';
const fixture={
 schemaVersion:8,version:8,
 programs:[{id:'p-legacy',name:'Legacy',workouts:[{id:'day-legacy',name:'День',exercises:[]}]}],
 history:[{id:'legacy-history',date:'2026-11-08',programId:'p-legacy',workout:'day-legacy',entries:[]}],
 exerciseCatalog:[],drafts:{},activeProgramId:'p-legacy',activeWorkoutId:'day-legacy'
};
const edit={sessionId:'legacy-history',originalSession:fixture.history[0],exercises:[],draft:{},date:'2026-11-08'};
(async()=>{
 const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-first-run','--disable-background-networking']});
 try{
  const context=await browser.newContext({serviceWorkers:'block'});
  const page=await context.newPage();
  await page.goto(new URL('./missing-legacy-seed',url).href);
  await page.evaluate(async ({key,editKey,fixture,edit})=>{
    const raw=JSON.stringify(fixture);
    localStorage.setItem(key,raw);
    localStorage.setItem(editKey,JSON.stringify(edit));
    const db=await new Promise((resolve,reject)=>{
      const open=indexedDB.open('setlog-atomic-prototype-v1',1);
      open.onupgradeneeded=()=>{
        const db=open.result;
        if(!db.objectStoreNames.contains('diaries'))db.createObjectStore('diaries',{keyPath:'scope'});
        if(!db.objectStoreNames.contains('revisions'))db.createObjectStore('revisions',{keyPath:'id'});
      };
      open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error);
    });
    await new Promise((resolve,reject)=>{
      const tx=db.transaction('diaries','readwrite');
      tx.objectStore('diaries').put({scope:key,revision:4,payload:raw,updatedAt:Date.now()});
      tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    });
    db.close();
  },{key,editKey,fixture,edit});
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:20000});
  const result=await page.evaluate(async({key,editKey})=>({
    oldEdit:localStorage.getItem(editKey),
    oldDiary:localStorage.getItem(key),
    saved:await window.__setlogAtomicLab.inspect(key)
  }),{key,editKey});
  assert.equal(result.saved.revision,5,'legacy migration should advance revision exactly once');
  assert.equal(result.saved.payload,result.oldDiary);
  assert.equal(result.saved.historyEditRaw,result.oldEdit);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:16000});
  const after=await page.evaluate(async(key)=>(await window.__setlogAtomicLab.inspect(key)).revision,key);
  assert(after>=5,'idempotent second load');
  console.log('PASS old stage3 IndexedDB record upgraded without replacing either existing diary or edit draft');
  await context.close();
 }catch(error){console.error('FAIL legacy IDB edit migration',error);process.exitCode=1}
 finally{await browser.close()}
})();
