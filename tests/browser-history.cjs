const {chromium}=require('playwright-core'), assert=require('node:assert/strict');
const url=process.env.SETLOG_TEST_URL||'http://127.0.0.1:18779/';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async()=>{
const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
try{
 const context=await browser.newContext({viewport:{width:420,height:900},serviceWorkers:'block'});
 await context.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
 const a=await context.newPage();await a.goto(url);await a.locator('#exerciseList .exercise-card').first().waitFor();
 await a.evaluate(()=>{
 const key='setlog-pwa-v1',o=JSON.parse(localStorage.getItem(key));const p=o.programs[0],w=p.workouts[0];
 o.history=[{id:'history-safety-fixture',date:'2026-11-08',savedAt:1234,programId:p.id,programName:p.name,workout:w.id,workoutName:w.name,entries:[{exerciseId:w.exercises[0].catalogId,exerciseCatalogId:w.exercises[0].catalogId,placementExerciseId:w.exercises[0].id,exerciseName:'Fixture exercise',muscle:'Грудь',setResults:[{weight:30,reps:10}]}]}];
 localStorage.setItem(key,JSON.stringify(o));
 });
 await a.reload();await a.locator('#exerciseList .exercise-card').first().waitFor();
 await a.locator('[data-view=history]').first().click();
 await a.locator('[data-action=edit-history-session]').first().click();
 const editKey='setlog-pwa-v1:history-edit-v1';
 await a.waitForFunction(k=>!!localStorage.getItem(k),editKey);
 const b=await context.newPage();await b.goto(url);await b.locator('#exerciseList .exercise-card').first().waitFor();
 // A writes a newer edit draft, while B retains an older in-memory version.
 const sentinel='protected-against-stale-tab';
 await a.evaluate(({k,sentinel})=>{const x=JSON.parse(localStorage.getItem(k));x.testSentinel=sentinel;localStorage.setItem(k,JSON.stringify(x))},{k:editKey,sentinel});
 await b.locator('[data-action=open-exercise]').first().click();
 await b.locator('#exerciseDetailDialog input[data-field]').first().fill('42');
 await b.locator('#exerciseDetailDialog input[data-field]').first().dispatchEvent('change');
 const disk=await a.evaluate(k=>JSON.parse(localStorage.getItem(k)),editKey);
 assert.equal(disk.testSentinel,sentinel,'stale second tab overwrote history-edit draft');
 await b.locator('[data-action=close-exercise-detail]').first().click();
 await b.locator('#finishWorkoutBtn').click();
 const history=await a.evaluate(()=>JSON.parse(localStorage.getItem('setlog-pwa-v1')).history);
 assert.equal(history[0].entries[0].setResults[0].weight,30,'stale history edit changed committed history');
 console.log('PASS draft concurrency: new draft preserved and historical session untouched');
 // Canceled edit from a stale tab must not delete a draft modified elsewhere.
 await b.evaluate(()=>window.confirm=()=>true);
 const action=await b.locator('[data-action=cancel-history-edit]').count();
 if(action){await b.locator('[data-action=cancel-history-edit]').first().click();}
 const after=await a.evaluate(k=>localStorage.getItem(k),editKey);
 assert(after&&after.includes(sentinel),'cancel from stale tab deleted newer edit draft');
 console.log('PASS draft cancel cannot delete newer copy');
 await context.close();
}catch(error){console.error(error);process.exitCode=1}finally{await browser.close()}
})();
