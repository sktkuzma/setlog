const {chromium}=require('playwright-core'),assert=require('node:assert/strict');
const host=process.env.SETLOG_STAGE4_URL||'http://127.0.0.1:18787/';
const url=host+'?atomicLab=1';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const key='setlog-pwa-v1';
function fixture(name){
 const now=Date.now();
 return {app:'setlog-pwa',schemaVersion:8,version:8,
  programs:[{id:'p-'+name,name:'Программа '+name,workouts:[{id:'d-'+name,name:'День',exercises:[]}]}],
  exerciseCatalog:[],history:[{id:'session-'+name,date:'2026-11-08',savedAt:now,programId:'p-'+name,
   programName:'Программа '+name,workout:'d-'+name,workoutName:'День',entries:[]}],
  drafts:{},activeProgramId:'p-'+name,activeWorkoutId:'d-'+name,createdAt:now,updatedAt:now};
}
async function newPage(browser){
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.addInitScript(seed=>{
  if(!localStorage.getItem('setlog-pwa-v1'))localStorage.setItem('setlog-pwa-v1',JSON.stringify(seed));
 },fixture('A'));
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',async d=>d.accept());
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:15000});
 await page.waitForFunction(()=>!!document.querySelector('#todayLabel')?.textContent?.trim(),{timeout:15000});
 await page.evaluate(()=>window.__setlogAtomicLab.flush());
 return {context,page,errors};
}
async function importFile(page,value){
 const raw=typeof value==='string'?value:JSON.stringify(value);
 await page.locator('#importFile').setInputFiles({name:'fixture.setlog',mimeType:'application/json',buffer:Buffer.from(raw)});
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
 try{
  // A: invalid backup rejected; valid import not reflected until committed; snapshot restore reverts it.
  {
   const {context,page,errors}=await newPage(browser);
   const initial=await page.evaluate(async()=>({local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload}));
   await importFile(page,'{"schemaVersion":8,"history":[{"broken":true}]}');
   await page.waitForTimeout(250);
   assert.equal(await page.evaluate(()=>localStorage.getItem('setlog-pwa-v1')),initial.local);
   await page.locator('[data-view=settings]').first().click();
   await page.locator('#createSnapshotBtn').click();
   await page.waitForTimeout(300);
   await page.evaluate(()=>{
     const api=window.SetlogAtomicStorage,original=api.commit.bind(api);
     api.commit=async(...args)=>{
       window.__importCommitEntered=true;
       await new Promise(resolve=>{window.__releaseImportCommit=resolve});
       api.commit=original;
       return original(...args);
     };
   });
   await importFile(page,fixture('B'));
   await page.waitForFunction(()=>window.__importCommitEntered===true,{timeout:10000});
   const delayed=await page.evaluate(async()=>({local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload,
     toast:document.querySelector('#toast')?.textContent}));
   assert.equal(delayed.local,initial.local,'local before commit');
   assert.equal(delayed.durable,initial.durable,'IDB before commit');
   assert(!/Данные импортированы и сохранены/.test(delayed.toast),'premature import confirmation');
   await page.evaluate(()=>window.__releaseImportCommit());
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).history.some(x=>x.id==='session-B'),{timeout:10000});
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   const imported=await page.evaluate(async()=>({local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload}));
   assert(imported.local===imported.durable,'imported local/IDB differ after flush');
   assert(JSON.parse(imported.local).history.some(x=>x.id==='session-B'));
   assert(!JSON.parse(imported.local).history.some(x=>x.id==='session-A'));
   await page.locator('#manageSnapshotsBtn').click();
   await page.locator('#snapshotDialog').waitFor({state:'visible',timeout:10000});
   const list=page.locator('#snapshotSelect option');
   assert(await list.count()>=1,'snapshot missing');
   const options=await list.evaluateAll(xs=>xs.map(x=>({value:x.value,label:x.textContent})));
   const manual=options.find(x=>x.label.includes('Ручная копия дневника'));
   assert(manual,'previous manual snapshot not found');
   await page.locator('#snapshotSelect').selectOption(manual.value);
   await page.locator('#restoreSelectedSnapshotBtn').click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).history.some(x=>x.id==='session-A'),{timeout:10000});
   await page.evaluate(()=>window.__setlogAtomicLab.flush());
   const restored=await page.evaluate(async()=>({local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload}));
   assert(restored.local===restored.durable,'snapshot restore should persist transactionally');
   assert(JSON.parse(restored.local).history.some(x=>x.id==='session-A'));
   assert(!errors.length,'JS errors '+errors.join(';'));
   console.log('PASS corrupt JSON rejected; valid file import awaited durable commit; prior snapshot restored');
   await context.close();
  }
  // B: quota failure on import preserves both prior copies, never confirms success.
  {
   const {context,page,errors}=await newPage(browser);
   const previous=await page.evaluate(async()=>({local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload}));
   await page.evaluate(()=>{
     window.SetlogAtomicStorage.commit=async()=>{throw new DOMException('Injected quota','QuotaExceededError')};
   });
   await importFile(page,fixture('B'));
   await page.waitForFunction(()=>window.__setlogAtomicLab?.blocked===true,{timeout:10000});
   const current=await page.evaluate(async()=>({local:localStorage.getItem('setlog-pwa-v1'),
     durable:(await window.__setlogAtomicLab.inspect('setlog-pwa-v1')).payload,
     toast:document.querySelector('#toast')?.textContent}));
   assert.equal(current.local,previous.local);
   assert.equal(current.durable,previous.durable);
   assert(!/Данные импортированы и сохранены/.test(current.toast));
   assert.equal(await page.locator('#atomicLabBlocked button').count(),2);
   assert(!errors.length,'JS errors '+errors.join(';'));
   console.log('PASS failed import: original diary preserved in both stores with recovery available');
   await context.close();
  }
 }catch(error){console.error('FAIL stage4 import and restoration',error);process.exitCode=1}
 finally{await browser.close()}
})();
