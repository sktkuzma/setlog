const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const host=process.env.SETLOG_STAGE3_OFFLINE_URL||'http://localhost:18786/';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(host+'?atomicLab=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:20000});
  await page.evaluate(()=>window.__setlogAtomicLab.flush());
  await page.waitForFunction(async()=>{
    if(!('serviceWorker' in navigator))return false;
    const registered=await navigator.serviceWorker.ready;
    return registered.active?.state==='activated';
  },{timeout:20000});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:15000});
  await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:12000});
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForFunction(()=>window.__setlogAtomicLab?.ready===true,{timeout:20000});
  await page.locator('#saveWorkoutBtn').click();
  await page.evaluate(()=>window.__setlogAtomicLab.flush());
  const result=await page.evaluate(async()=>{
    const scope='setlog-pwa-v1';
    return {
      raw:localStorage.getItem(scope),
      record:(await window.__setlogAtomicLab.inspect(scope))?.payload,
      network:navigator.onLine,
      css:!!document.querySelector('link[href="./style.css"]'),
      module:typeof window.SetlogAtomicStorage?.commit
    };
  });
  assert.equal(result.raw,result.record,'offline local mirror must match durable journal');
  assert.equal(result.module,'function','atomic module should be available offline');
  assert.equal(result.css,true);
  assert(!errors.length,'offline JS errors: '+errors.join(';'));
  console.log('PASS service-worker cached IDB-first JS and CSS; app reloads and saves drafts offline');
  await context.close();
 }catch(error){console.error('FAIL IDB-first offline PWA',error);process.exitCode=1}
 finally{await browser.close()}
})();
