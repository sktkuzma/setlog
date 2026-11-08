const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const url=process.env.SETLOG_OFFLINE_URL||'http://localhost:18781/';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#exerciseList .exercise-card').first().waitFor({timeout:20000});
  const state=await page.evaluate(async ()=>{
    const ready=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Service worker install timeout')),25000))]);
    return {scope:ready.scope,active:ready.active?.state};
  });
  await page.waitForFunction(async()=>{const r=await navigator.serviceWorker.ready;return r.active?.state==='activated';},{timeout:20000});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#exerciseList .exercise-card').first().waitFor({timeout:20000});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:15000});
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('#exerciseList .exercise-card').first().waitFor({timeout:20000});
  await page.locator('[data-view=progress]').first().click();
  assert(await page.locator('#progressMetric option').count()===4,'offline analytics script unavailable');
  assert(await page.locator('#progressPeriod option[value="7"]').count()===1,'offline 7-day filter absent');
  assert.equal(errors.length,0,'offline JS errors: '+errors.join(';'));
  console.log('PASS full offline reload with Progress 2.0 JS/CSS cache, 7-day period and no JS errors');
  await context.close();
 }catch(e){console.error('FAIL offline PWA',e);process.exitCode=1}
 finally{await browser.close()}
})();
