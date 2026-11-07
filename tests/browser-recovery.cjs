const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const origin=process.env.SETLOG_TEST_URL||'http://127.0.0.1:18779/';
(async()=>{
const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
try{
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:420,height:900}});
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 const page=await context.newPage();
 page.on('pageerror',e=>{console.error('PAGE ERROR',e.message);process.exitCode=1});
 await page.goto(origin);await page.locator('#exerciseList .exercise-card').first().waitFor();
 const key='setlog-pwa-v1';
 const fixture=await page.evaluate(k=>{
   const current=JSON.parse(localStorage.getItem(k));
   current.history.push({id:'recovery-fixture-123',date:'2026-10-31',savedAt:100,entries:[],programId:current.programs[0].id});
   return current;
 },key);
 await page.evaluate(async ({key,fixture})=>{
   const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('setlog-safety-v1',1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
   await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put({id:'fixture-good',label:'Known good',ownerScope:key,createdAt:Date.now()-1000,schemaVersion:8,payload:JSON.stringify(fixture)});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
   db.close();localStorage.setItem(key,'{damaged-record');
 },{key,fixture});
 await page.reload();await page.locator('#exerciseList .exercise-card').first().waitFor();
 await page.waitForFunction(k=>{try{return JSON.parse(localStorage.getItem(k)).history.some(x=>x.id==='recovery-fixture-123')}catch(e){return false}},key);
 const recovered=await page.evaluate(async k=>{
   const data=JSON.parse(localStorage.getItem(k));
   const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('setlog-safety-v1',1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
   const snapshots=await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly'),q=tx.objectStore('snapshots').getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});db.close();
   return {history:data.history.map(x=>x.id),quarantined:snapshots.some(x=>x.ownerScope===k&&x.payload==='{damaged-record')};
 },key);
 assert(recovered.history.includes('recovery-fixture-123'));
 assert(recovered.quarantined,'corrupt original not quarantined');
 console.log('PASS corrupt original preserved, previous diary auto-recovered');
 // Important: after recovery the next normal save must not be blocked as stale.
 await page.locator('[data-action=open-exercise]').first().click();
 await page.locator('#exerciseDetailDialog input[data-field]').first().fill('61');
 await page.locator('#exerciseDetailDialog input[data-field]').first().dispatchEvent('change');
 const status=await page.evaluate(k=>({raw:localStorage.getItem(k),indicator:document.getElementById('storageStatus')?.dataset.state}),key);
 assert(status.raw.includes('"61"')||status.raw.includes('"61'), 'normal save after recovery was blocked');
 assert.notEqual(status.indicator,'error','storage status remained error after recovery');
 console.log('PASS subsequent save after recovery works');
 const before=await page.evaluate(k=>localStorage.getItem(k),key);
 await page.setInputFiles('#importFile',{name:'invalid.setlog',mimeType:'application/json',buffer:Buffer.from('{"history":[{"id":"malformed"}]}','utf8')});
 await page.waitForTimeout(250);
 const after=await page.evaluate(k=>localStorage.getItem(k),key);
 assert.equal(after,before,'invalid backup changed diary');
 console.log('PASS invalid import rejected without data change');
 await context.close();
}catch(error){console.error(error);process.exitCode=1}
finally{await browser.close()}
})();
