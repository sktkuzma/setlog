const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const url=process.env.SETLOG_TEST_URL||'http://127.0.0.1:18781/';
const executablePath=process.env.CHROME_BIN||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const expectedVersion='1.3.11';
const marker='progress-v2-fixture';
function testData(){
 const today=new Date();today.setHours(12,0,0,0);
 const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const workouts=[{id:'v2-workout',name:'Тестовый день',exercises:[
  {id:'place-bench',catalogId:'v2-bench',sets:3,target:'6–10',alt:''},
  {id:'place-pull',catalogId:'v2-pull',sets:3,target:'6–12',alt:''}
 ]}];
 const program={id:'v2-program',name:'Тестовая программа',workouts};
 const catalog=[{id:'v2-bench',name:'Жим штанги лёжа',muscle:'Грудь',defaultSets:3},
  {id:'v2-pull',name:'Подтягивания',muscle:'Спина',bodyweight:true,defaultSets:3}];
 const history=Array.from({length:16},(_,i)=>{
  const d=new Date(today);d.setDate(d.getDate()-(15-i)*4);
  const w=60+Math.floor(i/3)*2.5;
  const sets=[{weight:w,reps:8},{weight:w,reps:7},{weight:w,reps:6}];
  return {id:marker+'-'+i,date:iso(d),savedAt:d.getTime()+i*1000,programId:program.id,programName:program.name,
    workout:'v2-workout',workoutName:'Тестовый день',entries:[
     {exerciseId:'v2-bench',exerciseCatalogId:'v2-bench',exerciseName:'Жим штанги лёжа',muscle:'Грудь',
      setResults:sets,weight:w,reps:sets.map(x=>x.reps),volume:sets.reduce((a,x)=>a+x.weight*x.reps,0),sets:3},
     {exerciseId:'v2-pull',exerciseCatalogId:'v2-pull',exerciseName:'Подтягивания',muscle:'Спина',
      setResults:[{weight:0,reps:7},{weight:0,reps:6}],weight:0,reps:[7,6],volume:0,sets:2}
    ]};
 });
 return {schemaVersion:8,version:8,history,programs:[program],exerciseCatalog:catalog,drafts:{},
  activeProgramId:program.id,activeWorkoutId:'v2-workout',updatedAt:Date.now(),createdAt:Date.now()};
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath,args:['--no-first-run','--disable-background-networking']});
 try{
  for(const width of [360,390,720]){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',acceptDownloads:true});
   const seed=testData();
   await context.addInitScript(obj=>{
     if(location.hostname==='127.0.0.1' && !localStorage.getItem('setlog-pwa-v1'))
       localStorage.setItem('setlog-pwa-v1',JSON.stringify(obj));
   },seed);
   const external=[];
   await context.route('**/*',r=>r.request().url().startsWith(url)?r.continue():(external.push(r.request().url()),r.abort()));
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('#exerciseList .exercise-card').first().waitFor({timeout:20000});
   const old=await page.evaluate(()=>localStorage.getItem('setlog-pwa-v1'));
   await page.locator('[data-view="progress"]').first().click();
   await page.locator('#progressComparison .preview-stat').first().waitFor({timeout:8000});
   assert.equal(await page.locator('#progressPeriod option').count(),5,'five period options');
   assert.equal(await page.locator('#progressPeriod option[value="7"]').count(),1,'7-day period');
   assert.equal(await page.locator('#progressMetric option').count(),4,'four metrics');
   assert(await page.locator('#weightChart svg').count()===1,'weight graph');
   assert(await page.locator('#progressRecords .preview-stat').count()>=6,'records');
   await page.locator('#progressMetric').selectOption('e1rm');
   assert((await page.locator('#progressTrendTitle').textContent()).includes('e1RM'));
   assert((await page.locator('#metricE1rm').textContent()).includes('кг'));
   await page.locator('#progressMetric').selectOption('volume');
   assert(await page.locator('#weightChart svg').count()===1,'volume graph');
   await page.locator('#progressMetric').selectOption('reps');
   assert(await page.locator('#weightChart svg').count()===1,'reps graph');
   await page.locator('#progressMetric').selectOption('weight');
   await page.locator('#progressPeriod').selectOption('7');
   assert(await page.locator('#weightChart svg').count()===1,'7-day period trend from last two entries');
   await page.locator('#progressPeriod').selectOption('30');
   assert(await page.locator('#weightChart svg').count()===1,'30 day trend');
   await page.locator('#progressPeriod').selectOption('all');
   await page.locator('#progressExercise').selectOption('v2-pull');
   await page.locator('#progressMetric').selectOption('e1rm');
   assert.equal((await page.locator('#metricE1rm').textContent()).trim(),'—','bodyweight e1rm excluded');
   const after=await page.evaluate(()=>localStorage.getItem('setlog-pwa-v1'));
   assert.equal(after,old,'analytics changed localStorage payload');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert(!overflow,'horizontal overflow '+width);
   assert(!errors.length,'JS errors '+errors.join(', '));
   assert(!external.some(x=>x.includes('supabase.co')),'unexpected Supabase traffic');
   console.log('PASS progress 2.0 browser '+width+'px, data unchanged, metrics/periods/records and no JS errors');
   await context.close();
  }
  const script=fs.readFileSync(path.join(process.cwd(),'progress-v2.js'),'utf8');
  assert(!script.includes('localStorage.'),'analytics module must not mutate storage');
  assert(!script.includes('fetch('),'analytics module must not fetch');
  const sw=fs.readFileSync('sw.js','utf8');
  assert(sw.includes("'./progress-v2.js'")&&sw.includes("'./progress-v2.css'"),'offline cache missing assets');
  assert(fs.readFileSync('VERSION.txt','utf8').trim()===expectedVersion);
  console.log('PASS preview module read-only; new offline assets precached');
 }catch(e){console.error('FAIL Progress 2.0',e);process.exitCode=1}
 finally{await browser.close()}
})();
