const {chromium}=require('playwright-core'), assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path');
const url=process.env.SETLOG_TEST_URL||'http://127.0.0.1:18779/';
const browserPath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const results=process.env.SETLOG_RESULTS||path.join(process.cwd(),'test-output');
fs.mkdirSync(results,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:browserPath,args:['--no-first-run','--disable-background-networking']});
try{
 const context=await browser.newContext({viewport:{width:420,height:900},acceptDownloads:true,serviceWorkers:'block'});
 await context.route('**/*',route=>{const u=route.request().url();return u.startsWith(url)?route.continue():route.abort();});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('#exerciseList .exercise-card').first().waitFor({timeout:20000});
 await page.screenshot({path:path.join(results,'training.png')});
 const baseline=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('setlog-pwa-v1'));return {programs:s.programs.length,history:s.history.length}});
 assert(baseline.programs>=1,'programs initialised');
 const second=await context.newPage();await second.goto(url,{waitUntil:'domcontentloaded'});await second.locator('#exerciseList .exercise-card').first().waitFor();
 const key='setlog-pwa-v1';
 const changed=await page.evaluate(key=>{const src=JSON.parse(localStorage.getItem(key));src.history.push({id:'browser-test-session',date:'2026-11-08',savedAt:1,programId:src.programs[0].id,programName:src.programs[0].name,workoutName:src.programs[0].workouts[0].name,workout:src.programs[0].workouts[0].id,entries:[{exerciseId:'test-bench',exerciseCatalogId:'test-bench',exerciseName:'Тестовый жим',muscle:'Грудь',setResults:[{weight:45,reps:9},{weight:50,reps:8}]}]});localStorage.setItem(key,JSON.stringify(src));return src.history.length},key);
 await second.waitForTimeout(300);
 await second.evaluate(()=>document.querySelector('#exerciseList input[data-field]')?.setAttribute('data-browser-test','present'));
 // The second page must never overwrite the first page's new history.
 await second.evaluate(()=>document.querySelector('#exerciseList input[data-field]')?.dispatchEvent(new Event('change',{bubbles:true})));
 await second.waitForTimeout(150);
 const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).history.some(x=>x.id==='browser-test-session'),key);
 assert(after,'second tab erased first tab history');
 console.log('PASS cross-tab stale write protected');
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('#exerciseList .exercise-card').first().waitFor();
 await page.evaluate(()=>document.getElementById('shareExportDialog').showModal());
 await page.locator('#shareDateFrom').fill('2026-11-01');await page.locator('#shareDateTo').fill('2026-11-30');
 await page.locator('#shareDateTo').dispatchEvent('change');
 // Exercise selection rendered by opening exporter through actual UI rather than just dialog display.
 await page.locator('#shareExportDialog').evaluate(el=>el.close());
 await page.evaluate(()=>document.querySelector('[data-action="open-share-export"]')?.click());
 await page.locator('#shareDateFrom').fill('2026-11-01');await page.locator('#shareDateTo').fill('2026-11-30');await page.locator('#shareDateTo').dispatchEvent('change');
 assert.equal(await page.locator('#shareDownloadPngBtn').isDisabled(),false,'PNG disabled despite history');
 const pngPromise=page.waitForEvent('download',{timeout:25000});await page.locator('#shareDownloadPngBtn').click();const png=await pngPromise;const pngPath=path.join(results,'report.png');await png.saveAs(pngPath);
 const pngBytes=fs.readFileSync(pngPath);assert.equal(pngBytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(pngBytes.length>30000);
 console.log('PASS PNG file generated',pngBytes.length);
 const pdfPromise=page.waitForEvent('download',{timeout:30000});await page.locator('#shareDownloadPdfBtn').click();const pdf=await pdfPromise;const pdfPath=path.join(results,'report.pdf');await pdf.saveAs(pdfPath);
 const pdfBytes=fs.readFileSync(pdfPath);assert(pdfBytes.subarray(0,8).toString().startsWith('%PDF-1.4'));const pages=(pdfBytes.toString('latin1').match(/\/Type \/Page\b/g)||[]).length;assert(pages>=3,'period PDF too few pages');console.log('PASS PDF pages',pages,'bytes',pdfBytes.length);
 assert.equal(errors.length,0,'JS errors: '+errors.join(';'));console.log('PASS no browser JS errors');
 await context.close();
}catch(e){console.error(e);process.exitCode=1}finally{await browser.close()}
})();
