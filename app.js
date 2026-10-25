(() => {
  'use strict';
  const STORAGE_KEY = 'setlog-pwa-v1';
  const DEFAULT_PROGRAM_ID = 'program-main';
  const PROGRAM = [
    {id:'1', name:'Верх + ноги', desc:'Грудь, спина, ноги и плечи', exercises:[
      {id:'w1-1',name:'Жим в тренажере на грудь',muscle:'Грудь',target:'8–10',sets:3,alt:'Жим гантелей лёжа'},
      {id:'w1-2',name:'Икры в тренажере стоя',muscle:'Икры',target:'7–9',sets:3,alt:'Икры в Смите стоя'},
      {id:'w1-3',name:'Тяга одной рукой пулл эраунд сверху',muscle:'Широчайшие',target:'8–10',sets:3,alt:'Без разворота'},
      {id:'w1-4',name:'Махи одной рукой с манжетой перед собой',muscle:'Плечи',target:'10–12',sets:3},
      {id:'w1-5',name:'Жим ногами, низкая постановка',muscle:'Квадрицепс',target:'8',sets:3},
      {id:'w1-6',name:'Пресс — обратные скручивания',muscle:'Пресс',target:'По самочувствию',sets:2,alt:'',bodyweight:true},
      {id:'w1-7',name:'Шраги в Смите',muscle:'Трапеции',target:'10',sets:3}
    ]},
    {id:'2',name:'Руки + верх спины',desc:'Руки, плечи, грудь и ноги',exercises:[
      {id:'w2-1',name:'Бицепс байезиан',muscle:'Бицепс',target:'10–15',sets:3},
      {id:'w2-2',name:'Трицепс оверхэд',muscle:'Трицепс',target:'8–12',sets:3,alt:'С упором локтя'},
      {id:'w2-3',name:'Тяга в рычажном тренажере на верх спины',muscle:'Верх спины',target:'6–8',sets:3,alt:'Тяга гантелей с упором'},
      {id:'w2-4',name:'Разводки в кроссовере',muscle:'Грудь',target:'10–15',sets:3,alt:'С гантелями'},
      {id:'w2-5',name:'Махи Y с упором грудью',muscle:'Плечи',target:'10–15',sets:3},
      {id:'w2-6',name:'Присед в Смите',muscle:'Квадрицепс / ягодицы',target:'8–10',sets:3,alt:'Болгарский сплит-присед'}
    ]},
    {id:'3',name:'Изоляция + спина',desc:'Грудь, спина, ноги и руки',exercises:[
      {id:'w3-1',name:'Сведение рук в тренажере «бабочка»',muscle:'Грудь',target:'По самочувствию',sets:2},
      {id:'w3-2',name:'Горизонтальная тяга нейтральным хватом',muscle:'Широчайшие',target:'8–12',sets:3},
      {id:'w3-3',name:'Разгибание ног',muscle:'Квадрицепс',target:'10–15',sets:3,alt:'Сисси-присед'},
      {id:'w3-4',name:'Сгибание ног сидя',muscle:'Бицепс бедра',target:'10–15',sets:3,alt:'Лежа одной ногой'},
      {id:'w3-5',name:'Икры сидя',muscle:'Икры',target:'По самочувствию',sets:2},
      {id:'w3-6',name:'Бицепс сидя',muscle:'Бицепс',target:'8–12',sets:3},
      {id:'w3-7',name:'Трицепс стоя одной рукой',muscle:'Трицепс',target:'8–12',sets:3},
      {id:'w3-8',name:'Келсо шраги',muscle:'Верх спины',target:'8–12',sets:3,alt:'С одной гантелью'}
    ]}
  ];
  const GIRLS_PROGRAM_ID = 'program-girls';
  const GIRLS_PROGRAM = {
    id: GIRLS_PROGRAM_ID,
    name: 'Девушки — 2 раза в неделю',
    workouts: [
      {id:'girls-workout-1', name:'Тренировка 1', desc:'Ягодицы, спина, плечи и руки', exercises:[
        {id:'g1-1',name:'Жим одной ногой с акцентом на ягодицы',muscle:'Ягодичные / квадрицепс / приводящие',target:'По программе',sets:2,alt:'Жим ногой в гравитроне; зашагивания с гантелью',imageUrl:'./exercise-g1-1.jpg',videoUrl:'https://t.me/c/2435165254/109'},
        {id:'g1-2',name:'Тяга верхнего блока широким хватом',muscle:'Широчайшие / верх спины / сгибатели локтя',target:'По программе',sets:5,imageUrl:'./exercise-g1-2.jpg',videoUrl:'https://t.me/c/2435165254/148'},
        {id:'g1-3',name:'Махи Y с гантелями сидя',muscle:'Дельты',target:'По программе',sets:2,imageUrl:'./exercise-g1-3.jpg',videoUrl:'https://t.me/c/2435165254/169'},
        {id:'g1-4',name:'Румынская тяга на одной ноге с опорой рукой',muscle:'Ягодичные',target:'По программе',sets:2,imageUrl:'./exercise-g1-4.jpg',videoUrl:'https://t.me/c/2435165254/163'},
        {id:'g1-5',name:'Разгибания рук над головой',muscle:'Трицепс',target:'10–15',sets:3,imageUrl:'./exercise-g1-5.jpg',videoUrl:'https://t.me/c/2435165254/75'},
        {id:'g1-6',name:'Сгибания ног сидя',muscle:'Бицепс бедра / икры',target:'По программе',sets:3,alt:'Сгибания лёжа, при необходимости с опорой под бедро',imageUrl:'./exercise-g1-6.jpg',videoUrl:'https://t.me/c/2435165254/116'}
      ]},
      {id:'girls-workout-2', name:'Тренировка 2', desc:'Ноги, грудь, спина и руки', exercises:[
        {id:'g2-1',name:'Зашагивания в кроссовере перекрёстные',muscle:'Ягодичные / квадрицепс / приводящие',target:'По программе',sets:2,alt:'Жим ногой в гравитроне; зашагивания с гантелью',imageUrl:'./exercise-g2-1.jpg',videoUrl:'https://t.me/c/2435165254/165'},
        {id:'g2-2',name:'Тяга в горизонтальном блоке широкой рукоятью',muscle:'Верх спины',target:'По программе',sets:4,imageUrl:'./exercise-g2-2.jpg',videoUrl:'https://t.me/c/2435165254/88'},
        {id:'g2-3',name:'Жим на верх груди в тренажёре',muscle:'Грудь / дельты / трицепс',target:'По программе',sets:4,alt:'Жим гантелей под углом 30°',imageUrl:'./exercise-g2-3.jpg',videoUrl:'https://t.me/c/2435165254/183'},
        {id:'g2-4',name:'Румынская тяга с гантелями с опорой в Смитте',muscle:'Ягодичные / бицепс бедра / приводящие',target:'По программе · 2 дропсета',sets:2,alt:'Гиперэкстензия на одной ноге',imageUrl:'./exercise-g2-4.jpg',videoUrl:'https://t.me/c/2435165254/105'},
        {id:'g2-5',name:'Сгибания рук с гантелями сидя с упором',muscle:'Бицепс / сгибатели локтя',target:'По программе',sets:2,alt:'Сгибания стоя с упором локтей в стену',imageUrl:'./exercise-g2-5.jpg',videoUrl:'https://t.me/c/2435165254/95'},
        {id:'g2-6',name:'Разгибания рук на верхнем блоке с опорой спиной',muscle:'Трицепс',target:'По программе',sets:2,imageUrl:'./exercise-g2-6.jpg',videoUrl:'https://t.me/c/2435165254/250'}
      ]}
    ]
  };
  const cloneGirlsProgram = () => JSON.parse(JSON.stringify(GIRLS_PROGRAM));
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const num = v => { if (v === '' || v === null || v === undefined) return null; const n=Number(String(v).replace(',','.')); return Number.isFinite(n)&&n>=0?n:null; };
  const fmt = n => Number.isFinite(n) ? (Math.round(n*10)/10).toLocaleString('ru-RU',{maximumFractionDigits:1}) : '—';
  const dateFmt = iso => { if(!iso) return 'Без даты'; const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric'}).replace(' г.',''); };
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const validLink = (value, allowTelegramScheme=false) => {
    const v=String(value||'').trim(); if(!v)return '';
    try { const u=new URL(v); if(['https:','http:'].includes(u.protocol)||(allowTelegramScheme&&u.protocol==='tg:'))return u.href; } catch(e){}
    return '';
  };
  const validImageLink = value => {
    const v=String(value||'').trim(); if(!v)return '';
    const external=validLink(v); if(external)return external;
    if(v.startsWith('./')||v.startsWith('assets/exercises/')){try{return new URL(v,document.baseURI).href;}catch(e){}}
    return '';
  };
  const seedPrograms = () => [{id:DEFAULT_PROGRAM_ID,name:'Full Body',workouts:PROGRAM.map(w=>({...w,exercises:w.exercises.map(e=>({...e}))}))}, cloneGirlsProgram()];
  const DEFAULT_MEDIA = {"w1-1":{"imageUrl":"./exercise-w1-1.svg","videoUrl":"https://t.me/c/2435165254/146"},"w1-2":{"imageUrl":"./exercise-w1-2.svg","videoUrl":"https://t.me/c/2435165254/113"},"w1-3":{"imageUrl":"./exercise-w1-3.svg","videoUrl":"https://t.me/c/2435165254/157"},"w1-4":{"imageUrl":"./exercise-w1-4.svg","videoUrl":"https://t.me/c/2435165254/73"},"w1-5":{"imageUrl":"./exercise-w1-5.svg","videoUrl":"https://t.me/c/2435165254/180"},"w1-6":{"imageUrl":"./exercise-w1-6.svg","videoUrl":"https://t.me/c/2435165254/66"},"w1-7":{"imageUrl":"./exercise-w1-7.svg","videoUrl":"https://t.me/c/2435165254/91"},"w2-1":{"imageUrl":"./exercise-w2-1.svg","videoUrl":"https://t.me/c/2435165254/50"},"w2-2":{"imageUrl":"./exercise-w2-2.svg","videoUrl":"https://t.me/c/2435165254/75"},"w2-3":{"imageUrl":"./exercise-w2-3.svg","videoUrl":"https://t.me/c/2435165254/197"},"w2-4":{"imageUrl":"./exercise-w2-4.svg","videoUrl":"https://t.me/c/2435165254/139"},"w2-5":{"imageUrl":"./exercise-w2-5.svg","videoUrl":"https://t.me/c/2435165254/225"},"w2-6":{"imageUrl":"./exercise-w2-6.svg","videoUrl":"https://t.me/c/2435165254/122"},"w3-1":{"imageUrl":"./exercise-w3-1.svg","videoUrl":"https://t.me/c/2435165254/196"},"w3-2":{"imageUrl":"./exercise-w3-2.svg","videoUrl":"https://t.me/c/2435165254/71"},"w3-3":{"imageUrl":"./exercise-w3-3.svg","videoUrl":"https://t.me/c/2435165254/131"},"w3-4":{"imageUrl":"./exercise-w3-4.svg","videoUrl":"https://t.me/c/2435165254/116"},"w3-5":{"imageUrl":"./exercise-w3-5.svg","videoUrl":"https://t.me/c/2435165254/228"},"w3-6":{"imageUrl":"./exercise-w3-6.svg","videoUrl":"https://t.me/c/2435165254/48"},"w3-7":{"imageUrl":"./exercise-w3-7.svg","videoUrl":"https://t.me/c/2435165254/52"},"w3-8":{"imageUrl":"./exercise-w3-8.svg","videoUrl":"https://t.me/c/2435165254/93"}};
  function applyDefaultMedia(programs){
    const p=programs.find(x=>x.id===DEFAULT_PROGRAM_ID); if(!p)return;
    for(const w of p.workouts||[]) for(const e of w.exercises||[]){
      const defaults=DEFAULT_MEDIA[e.id]; if(!defaults)continue;
      if(!e.videoUrl)e.videoUrl=defaults.videoUrl;
      if(!e.imageData&&!e.imageUrl)e.imageUrl=defaults.imageUrl;
    }
  }
  function normalizeProgram(p){
    return {id:String(p.id||`program-${uid()}`),name:String(p.name||'Моя программа'),workouts:(Array.isArray(p.workouts)?p.workouts:[]).map(w=>({id:String(w.id||`workout-${uid()}`),name:String(w.name||'Тренировка'),desc:String(w.desc||''),exercises:(Array.isArray(w.exercises)?w.exercises:[]).map(e=>({id:String(e.id||`exercise-${uid()}`),name:String(e.name||'Упражнение'),muscle:String(e.muscle||''),target:String(e.target||''),sets:Math.max(1,Math.min(8,Number(e.sets)||3)),alt:String(e.alt||''),bodyweight:!!e.bodyweight,imageUrl:String(e.imageUrl||''),imageData:String(e.imageData||''),videoUrl:String(e.videoUrl||'')}))}))};
  }
  function migrateLegacyCustom(programs, legacyCustom){
    const target=programs.find(p=>p.id===DEFAULT_PROGRAM_ID)||programs[0]; if(!target||!legacyCustom)return;
    for(const [wid,arr] of Object.entries(legacyCustom)){
      const workout=target.workouts.find(w=>w.id===String(wid)); if(!workout||!Array.isArray(arr))continue;
      for(const e of arr) if(!workout.exercises.some(x=>x.id===e.id)) workout.exercises.push({...e,sets:Number(e.sets)||3,imageUrl:e.imageUrl||'',imageData:e.imageData||'',videoUrl:e.videoUrl||''});
    }
  }
  function normalizeData(d){
    let programs=Array.isArray(d.programs)&&d.programs.length?d.programs.map(normalizeProgram):seedPrograms();
    migrateLegacyCustom(programs,d.customExercises||{});
    if(!programs.length)programs=seedPrograms();
    if(!d.girlsProgramMigrated && !programs.some(p=>p.id===GIRLS_PROGRAM_ID)) programs.push(cloneGirlsProgram());
    applyDefaultMedia(programs);
    const history=Array.isArray(d.history)?d.history:[];
    history.forEach(s=>{if(!s.programId)s.programId=DEFAULT_PROGRAM_ID;if(!s.programName)s.programName=programs.find(p=>p.id===s.programId)?.name||'Full Body';});
    const drafts=d.drafts&&typeof d.drafts==='object'?{...d.drafts}:{};
    // Migrate unsaved drafts from the previous version's date::workout keys.
    for(const [key,val] of Object.entries({...drafts})){
      const match=key.match(/^(\d{4}-\d{2}-\d{2})::([^:]+)$/);
      if(match){const newKey=`${match[1]}::${DEFAULT_PROGRAM_ID}::${match[2]}`;if(!drafts[newKey])drafts[newKey]=val;}
    }
    const activeProgramId=programs.some(p=>p.id===d.activeProgramId)?d.activeProgramId:programs[0].id;
    return {version:3,history,drafts,programs,activeProgramId,girlsProgramMigrated:true};
  }
  function loadData(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)return normalizeData(JSON.parse(raw));}catch(e){}return normalizeData({});}
  let data=loadData();
  let activeView='training';
  let activeProgramId=data.activeProgramId||DEFAULT_PROGRAM_ID;
  let activeWorkout=(getWorkouts(activeProgramId)[0]||{}).id||'1';
  let toastTimer;
  let editingExerciseId=null;
  let pendingImageData=null;
  const currentDate=()=>$('#workoutDate').value||todayISO();
  const currentProgram=()=>data.programs.find(p=>p.id===activeProgramId)||data.programs[0];
  function getWorkouts(programId=activeProgramId){return currentProgramFor(programId)?.workouts||[];}
  function currentProgramFor(programId){return data.programs.find(p=>p.id===programId)||null;}
  function getWorkout(workoutId=activeWorkout,programId=activeProgramId){return getWorkouts(programId).find(w=>w.id===workoutId)||getWorkouts(programId)[0]||null;}
  function getExercises(workoutId=activeWorkout){return getWorkout(workoutId)?.exercises||[];}
  const draftKey=(date=currentDate(),workout=activeWorkout,programId=activeProgramId)=>`${date}::${programId}::${workout}`;
  function persist(){try{data.activeProgramId=activeProgramId;localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(e){notify('Не удалось сохранить. Возможно, изображения занимают слишком много места. Уменьши их размер или убери часть картинок.');}}
  function defaultDraft(ex){return {weight:'',rir:'',notes:'',sets:Array.from({length:Math.max(1,Math.min(8,ex.sets||3))},()=>({reps:''}))};}
  function ensureDraft(date=currentDate(),workout=activeWorkout){
    const key=draftKey(date,workout); if(!data.drafts[key])data.drafts[key]={};
    for(const ex of getExercises(workout))if(!data.drafts[key][ex.id])data.drafts[key][ex.id]=defaultDraft(ex);
    for(const ex of getExercises(workout)){const dr=data.drafts[key][ex.id];if(!Array.isArray(dr.sets))dr.sets=defaultDraft(ex).sets;if(!dr.sets.length)dr.sets.push({reps:''});}
    persist();return data.drafts[key];
  }
  function getLastEntry(exId,exName){const all=[];for(const session of data.history)for(const e of session.entries||[])if(e.exerciseId===exId||(!exId&&e.exerciseName===exName))all.push({...e,date:session.date,workout:session.workout,savedAt:session.savedAt});all.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0)));return all[0]||null;}
  function hasDraftData(d){return !!(num(d.weight)!==null||(d.sets||[]).some(s=>String(s.reps??'').trim()!==''));}
  function exerciseCard(ex,index,draft){
    const last=getLastEntry(ex.id,ex.name);const lastText=last?`${fmt(last.weight)} кг · ${(last.reps||[]).filter(Boolean).join(' / ')||'повторы не указаны'}`:'Пока нет записей';
    const img=ex.imageData||validImageLink(ex.imageUrl);const video=validLink(ex.videoUrl,true);
    const media=(img||video)?`<div class="exercise-media">${img?`<img class="exercise-image" src="${safe(img)}" alt="Иллюстрация: ${safe(ex.name)}" loading="lazy">`:''}${video?`<a class="video-link" href="${safe(video)}" target="_blank" rel="noopener noreferrer">▶ Открыть видео техники ↗</a>`:''}</div>`:'';
    return `<article class="exercise-card ${hasDraftData(draft)?'has-data':''}" data-exercise-card="${safe(ex.id)}">
      <div class="exercise-top"><span class="exercise-num">${String(index+1).padStart(2,'0')}</span><div class="exercise-main"><div class="exercise-name">${safe(ex.name)}</div><div class="exercise-meta"><span>${safe(ex.muscle||'Своя группа')}</span><span>${safe(ex.target||'Без диапазона')}</span><span>${(draft.sets||[]).length} подхода</span></div>${ex.alt?`<div class="alt-label">Замена: ${safe(ex.alt)}</div>`:''}</div><button type="button" class="edit-exercise-button" data-action="edit-exercise" data-exercise="${safe(ex.id)}" aria-label="Изменить ${safe(ex.name)}" title="Изменить упражнение">✎</button></div>
      ${media}
      <div class="last-result"><span class="last-label">ПРОШЛЫЙ РАЗ</span><strong>${safe(lastText)}</strong>${last?`<span>· ${safe(dateFmt(last.date))}</span>`:''}</div>
      <div class="exercise-fields"><div class="field-group"><label class="field-label" for="weight-${safe(ex.id)}">ВЕС, КГ</label><input class="field-input" id="weight-${safe(ex.id)}" type="number" inputmode="decimal" min="0" max="1000" step="0.25" placeholder="${ex.bodyweight?'Свой вес / 0':'0'}" data-field="weight" data-exercise="${safe(ex.id)}" value="${safe(draft.weight)}"></div>
      <div class="field-group"><label class="field-label" for="rir-${safe(ex.id)}">ЗАПАС (RIR)</label><select class="field-input" id="rir-${safe(ex.id)}" data-field="rir" data-exercise="${safe(ex.id)}"><option value="">Не указан</option>${[0,1,2,3,4,5].map(v=>`<option value="${v}" ${String(draft.rir)===String(v)?'selected':''}>${v===0?'0 · отказ':v}</option>`).join('')}</select></div></div>
      <div class="sets-heading"><span class="field-label">ПОВТОРЕНИЯ ПО ПОДХОДАМ</span><div class="sets-actions"><button type="button" class="mini-button" data-action="remove-set" data-exercise="${safe(ex.id)}" aria-label="Убрать подход" ${draft.sets.length<=1?'disabled':''}>−</button><button type="button" class="mini-button" data-action="add-set" data-exercise="${safe(ex.id)}" aria-label="Добавить подход" ${draft.sets.length>=8?'disabled':''}>+</button></div></div>
      <div class="sets-list">${draft.sets.map((set,i)=>`<div class="set-row"><span class="set-label">СЕТ ${String(i+1).padStart(2,'0')}</span><input class="field-input" type="number" min="0" max="300" step="1" inputmode="numeric" aria-label="Повторы в подходе ${i+1}" placeholder="повторы" data-field="reps" data-set-index="${i}" data-exercise="${safe(ex.id)}" value="${safe(set.reps)}"><span class="set-label">ПОДХОД ${i+1}</span></div>`).join('')}</div>
      <div class="note-field"><label class="field-label" for="note-${safe(ex.id)}">ЗАМЕТКА</label><input class="field-input" id="note-${safe(ex.id)}" type="text" maxlength="220" placeholder="Техника, самочувствие, замена…" data-field="notes" data-exercise="${safe(ex.id)}" value="${safe(draft.notes)}"></div>
      <button type="button" class="remove-custom" data-action="remove-exercise" data-exercise="${safe(ex.id)}">Убрать из программы ×</button>
    </article>`;
  }
  function renderProgramSelector(){const sel=$('#programSelect');sel.innerHTML=data.programs.map(p=>`<option value="${safe(p.id)}">${safe(p.name)}</option>`).join('');sel.value=activeProgramId;}
  function renderWorkoutTabs(){const workouts=getWorkouts();$('#workoutSwitch').innerHTML=workouts.map((w,i)=>`<button class="workout-tab ${w.id===activeWorkout?'selected':''}" type="button" data-workout="${safe(w.id)}" role="tab" aria-selected="${String(w.id===activeWorkout)}"><span>${String(i+1).padStart(2,'0')}</span><small>${safe(w.name)}</small></button>`).join('');}
  function renderTraining(){
    const wk=getWorkout();if(!wk){notify('В программе нет тренировочных дней. Добавь день в настройках программы.');return;}
    renderProgramSelector();renderWorkoutTabs();const list=getExercises();const draft=ensureDraft();
    $('#workoutKicker').textContent=`ПЛАН / ${String(getWorkouts().indexOf(wk)+1).padStart(2,'0')}`;$('#workoutTitle').textContent=wk.name;$('#exerciseCount').textContent=`${list.length} УПР.`;
    $('#exerciseList').innerHTML=list.map((ex,i)=>exerciseCard(ex,i,draft[ex.id]||defaultDraft(ex))).join('');updateFilledCount();$('#sessionNumber').textContent=String(data.history.length+1).padStart(3,'0');
  }
  function updateFilledCount(){const draft=data.drafts[draftKey()]||{};const count=getExercises().filter(ex=>draft[ex.id]&&hasDraftData(draft[ex.id])).length;$('#filledCount').textContent=`${count} ${plural(count,'упражнение','упражнения','упражнений')}`;}
  function plural(n,a,b,c){const x=n%100,y=n%10;return x>10&&x<20?c:y>1&&y<5?b:y===1?a:c;}
  function notify(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000);}
  function switchView(view){activeView=view;$$('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));$$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));if(view==='history')renderHistory();if(view==='progress')renderProgress();window.scrollTo({top:0,behavior:'smooth'});}
  function entryFromDraft(ex,d){const reps=(d.sets||[]).map(s=>num(s.reps)).filter(v=>v!==null);const weight=num(d.weight);if(reps.length===0&&weight===null)return null;const effectiveWeight=weight===null?0:weight;const totalReps=reps.reduce((s,v)=>s+v,0);const firstReps=reps[0]||0;const e1rm=effectiveWeight>0&&firstReps>0&&firstReps<30?effectiveWeight/(1-0.0333*firstReps):null;return {exerciseId:ex.id,exerciseName:ex.name,muscle:ex.muscle||'',target:ex.target||'',weight,sets:(d.sets||[]).length,reps,rir:d.rir===''?null:Number(d.rir),notes:(d.notes||'').trim(),e1rm:e1rm&&Number.isFinite(e1rm)?Math.round(e1rm*10)/10:null,volume:Math.round(effectiveWeight*totalReps*10)/10};}
  function saveWorkout(){const draft=ensureDraft();const entries=[];for(const ex of getExercises()){const e=entryFromDraft(ex,draft[ex.id]||{});if(e)entries.push(e);}if(!entries.length){notify('Сначала внеси вес или повторы хотя бы в одно упражнение.');return;}const wk=getWorkout();const p=currentProgram();const session={id:uid(),date:currentDate(),programId:activeProgramId,programName:p.name,workout:activeWorkout,workoutName:wk?.name||'Тренировка',savedAt:Date.now(),entries};data.history.push(session);delete data.drafts[draftKey()];persist();renderTraining();notify(`Сохранено: ${entries.length} ${plural(entries.length,'упражнение','упражнения','упражнений')}`);}
  function renderHistory(){const hist=[...data.history].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0)));const exCount=hist.reduce((s,h)=>s+(h.entries||[]).length,0);$('#historyCounter').textContent=`${hist.length} ${plural(hist.length,'СЕССИЯ','СЕССИИ','СЕССИЙ')}`;$('#historyStatSessions').textContent=hist.length;$('#historyStatExercises').textContent=exCount;$('#historyStatLast').textContent=hist[0]?dateFmt(hist[0].date).replace(/\s+\d{4}$/,''):'—';$('#historyEmpty').classList.toggle('hidden',hist.length>0);$('#historyList').innerHTML=hist.map(s=>{const totalVol=(s.entries||[]).reduce((n,e)=>n+(e.volume||0),0);const firstLine=(s.entries||[]).slice(0,8).map(e=>`<div class="history-entry"><div><div class="history-entry-name">${safe(e.exerciseName)}</div><div class="history-entry-sub">${safe(e.sets||e.reps?.length||0)} подх. · ${(e.reps||[]).filter(v=>v!==null&&v!==undefined).join(' / ')||'—'} повт.${e.notes?`<div class="history-note">${safe(e.notes)}</div>`:''}</div></div><div class="history-entry-val">${e.weight===null?'—':fmt(e.weight)+' кг'}<br><span style="color:var(--muted);font-size:9px">объём ${fmt(e.volume||0)}</span></div></div>`).join('');const label=s.programName?`${s.programName} · ${s.workoutName||'Тренировка'}`:(s.workoutName||'Тренировка');return `<article class="history-card"><div class="history-card-top"><div><div class="history-date">${safe(dateFmt(s.date))}</div><div class="history-name">${safe(label)}</div><div class="history-meta">${(s.entries||[]).length} упражнений · объём ${fmt(totalVol)} кг</div></div><span class="history-badge">ДЕНЬ</span></div>${firstLine}${(s.entries||[]).length>8?`<div class="history-entry"><span class="history-entry-sub">И ещё ${(s.entries||[]).length-8} упражнений</span></div>`:''}<div class="history-card-bottom"><span class="history-entry-sub">Записано ${safe(new Date(s.savedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}))}</span><button type="button" class="delete-button" data-action="delete-session" data-session="${safe(s.id)}">Удалить запись ×</button></div></article>`;}).join('');}
  function allExercisesForStats(){const map=new Map();for(const p of data.programs)for(const w of p.workouts)for(const e of w.exercises)map.set(e.id,{id:e.id,name:e.name});for(const s of data.history)for(const e of s.entries||[])if(!map.has(e.exerciseId))map.set(e.exerciseId,{id:e.exerciseId||e.exerciseName,name:e.exerciseName});return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru'));}
  function currentExerciseStats(){return $('#progressExercise').value;}
  function renderProgress(){const sel=$('#progressExercise');const old=sel.value;const exercises=allExercisesForStats();sel.innerHTML=exercises.map(e=>`<option value="${safe(e.id)}">${safe(e.name)}</option>`).join('');if(exercises.some(e=>e.id===old))sel.value=old;updateProgressForSelection();}
  function getEntriesForExercise(id){const arr=[];for(const s of data.history)for(const e of s.entries||[])if(e.exerciseId===id||(!e.exerciseId&&e.exerciseName===id))arr.push({...e,date:s.date,workout:s.workout,savedAt:s.savedAt});return arr.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||((a.savedAt||0)-(b.savedAt||0)));}
  function updateProgressForSelection(){const id=currentExerciseStats();if(!id){$('#metricWeight').textContent='—';$('#metricE1rm').textContent='—';$('#metricVolume').textContent='—';$('#metricBest').textContent='—';$('#metricWeightDelta').textContent='Нет записей';$('#weightChart').innerHTML='<div class="chart-empty">Здесь появится график после первой записи.</div>';$('#repsChart').innerHTML='<div class="chart-empty">Недостаточно данных для графика.</div>';return;}const es=getEntriesForExercise(id);const withWeight=es.filter(e=>num(e.weight)!==null&&num(e.weight)>0);const last=es[es.length-1];const lw=withWeight[withWeight.length-1];const prev=withWeight[withWeight.length-2];$('#metricWeight').textContent=lw?`${fmt(lw.weight)} кг`:'—';$('#metricE1rm').textContent=last?.e1rm?`${fmt(last.e1rm)} кг`:'—';$('#metricVolume').textContent=last?fmt(last.volume||0):'—';$('#metricBest').textContent=withWeight.length?`${fmt(Math.max(...withWeight.map(e=>e.weight)))} кг`:'—';$('#metricWeightDelta').textContent=lw&&prev?`${lw.weight-prev.weight>0?'+':''}${fmt(lw.weight-prev.weight)} кг к прошлому разу`:lw?'Последняя запись':'Нет записей с весом';drawChart($('#weightChart'),withWeight.slice(-10).map(e=>({label:dateFmt(e.date).replace(/\s+\d{4}$/,''),value:Number(e.weight)})),'кг');const repEntries=es.filter(e=>(e.reps||[]).length>0).map(e=>({label:dateFmt(e.date).replace(/\s+\d{4}$/,''),value:Math.max(...e.reps.filter(v=>Number.isFinite(v)))})).filter(e=>Number.isFinite(e.value));drawChart($('#repsChart'),repEntries.slice(-10),'повт.');}
  function drawChart(container,items,unit){if(items.length<2){container.innerHTML=`<div class="chart-empty">${items.length===0?'Здесь появится график после первой записи.':'Добавь ещё одну запись, чтобы увидеть динамику.'}</div>`;return;}const w=320,h=160,p={l:29,r:10,t:13,b:26};const vals=items.map(x=>x.value);let min=Math.min(...vals),max=Math.max(...vals);if(max===min){min=Math.max(0,min-2);max=max+2;}else{const pad=(max-min)*.18;min=Math.max(0,min-pad);max+=pad;}const x=i=>p.l+i*((w-p.l-p.r)/(items.length-1));const y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);const grid=[0,1,2,3].map(i=>{const val=min+(max-min)*i/3;const yy=y(val);return `<line x1="${p.l}" y1="${yy}" x2="${w-p.r}" y2="${yy}" stroke="#34392f" stroke-width="1"/><text x="${p.l-6}" y="${yy+3}" font-family="DM Mono,monospace" font-size="8" text-anchor="end" fill="#818879">${fmt(val)}</text>`;}).join('');const line=items.map((d,i)=>`${x(i)},${y(d.value)}`).join(' ');const marks=items.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d.value)}" r="3.2" fill="#c8f169" stroke="#1d201b" stroke-width="1.5"><title>${safe(d.label)}: ${fmt(d.value)} ${unit}</title></circle>`).join('');const labels=items.map((d,i)=>i===0||i===items.length-1||i===Math.floor(items.length/2)?`<text x="${x(i)}" y="${h-7}" font-family="DM Mono,monospace" font-size="8" text-anchor="${i===0?'start':i===items.length-1?'end':'middle'}" fill="#818879">${safe(d.label)}</text>`:'').join('');container.innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="График изменения ${unit}">${grid}<polyline points="${line}" fill="none" stroke="#c8f169" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${marks}${labels}</svg>`;}
  function exportData(){const payload={app:'setlog-pwa',version:2,exportedAt:new Date().toISOString(),history:data.history,drafts:data.drafts,programs:data.programs,activeProgramId};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`setlog-backup-${todayISO()}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);notify('Резервная копия подготовлена.');}
  function importData(file){const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!d||!Array.isArray(d.history))throw new Error('bad');if(!confirm(`Импорт заменит текущие данные. В файле ${d.history.length} тренировок. Продолжить?`))return;data=normalizeData(d);activeProgramId=data.activeProgramId;activeWorkout=(getWorkouts()[0]||{}).id||'';persist();renderTraining();renderHistory();renderProgress();notify('Данные импортированы.');}catch(e){notify('Не удалось прочитать файл резервной копии СЕТ.');}};reader.readAsText(file);}
  function addCustomExercise(){const name=$('#customExerciseName').value.trim();if(!name)return;const wk=getWorkout();if(!wk)return;const ex={id:`exercise-${uid()}`,name,muscle:$('#customExerciseMuscle').value.trim()||'Своя группа',target:$('#customExerciseTarget').value.trim()||'По плану',sets:3,custom:true,alt:'',imageUrl:'',imageData:'',videoUrl:''};wk.exercises.push(ex);data.drafts[draftKey()] ||= {};data.drafts[draftKey()][ex.id]=defaultDraft(ex);persist();$('#addExerciseDialog').close();$('#addExerciseForm').reset();renderTraining();openExerciseEditor(ex.id);notify('Добавлено. Можно сразу прикрепить картинку и видео.');}
  function deleteSession(id){if(!confirm('Удалить эту тренировку из истории?'))return;data.history=data.history.filter(s=>s.id!==id);persist();renderHistory();renderProgress();renderTraining();notify('Запись удалена.');}
  function deleteExercise(id){if(!confirm('Убрать упражнение из этой программы? Записи в истории сохранятся.'))return;const wk=getWorkout();if(!wk)return;wk.exercises=wk.exercises.filter(e=>e.id!==id);for(const [key,d] of Object.entries(data.drafts)){const parts=key.split('::');if(parts[1]===activeProgramId&&parts[2]===activeWorkout&&d)delete d[id];}persist();renderTraining();renderProgress();notify('Упражнение убрано из программы.');}
  function updateDraftFromInput(input){const id=input.dataset.exercise;const field=input.dataset.field;const dr=ensureDraft()[id];if(!dr)return;if(field==='reps'){const idx=Number(input.dataset.setIndex);if(!dr.sets[idx])dr.sets[idx]={reps:''};dr.sets[idx].reps=input.value;}else dr[field]=input.value;const card=$(`[data-exercise-card="${CSS.escape(id)}"]`);if(card)card.classList.toggle('has-data',hasDraftData(dr));persist();updateFilledCount();}
  function switchWorkout(id){if(!getWorkouts().some(w=>w.id===id))return;activeWorkout=id;renderTraining();}
  function switchProgram(id){if(!data.programs.some(p=>p.id===id))return;activeProgramId=id;activeWorkout=(getWorkouts(id)[0]||{}).id||'';persist();renderTraining();}
  function openProgramDialog(){const p=currentProgram();$('#renameProgramName').value=p?.name||'';$('#newProgramName').value='';$('#newProgramTemplate').value='copy';$('#renameWorkoutName').value=getWorkout()?.name||'';$('#deleteProgramBtn').disabled=data.programs.length<=1;$('#programDialog').showModal();}
  function createProgram(){const name=$('#newProgramName').value.trim();if(!name){notify('Введи название новой программы.');return;}const id=`program-${uid()}`;let workouts=[];if($('#newProgramTemplate').value==='copy'){workouts=getWorkouts().map(w=>({id:`workout-${uid()}`,name:w.name,desc:w.desc||'',exercises:w.exercises.map(e=>({...e,id:`exercise-${uid()}`}))}));}else workouts=[{id:`workout-${uid()}`,name:'Тренировка 1',desc:'',exercises:[]}];const p={id,name,workouts};data.programs.push(p);activeProgramId=id;activeWorkout=workouts[0]?.id||'';persist();$('#programDialog').close();renderTraining();renderProgress();notify('Новая программа создана.');}
  function renameProgram(){const name=$('#renameProgramName').value.trim();if(!name)return notify('Название не должно быть пустым.');currentProgram().name=name;persist();renderTraining();if(activeView==='history')renderHistory();$('#programDialog').close();notify('Название программы изменено.');}
  function deleteProgram(){if(data.programs.length<=1)return notify('Нельзя удалить единственную программу.');const p=currentProgram();if(!confirm(`Удалить программу «${p.name}»? История тренировок останется, но сама программа будет удалена.`))return;data.programs=data.programs.filter(x=>x.id!==activeProgramId);activeProgramId=data.programs[0].id;activeWorkout=(getWorkouts()[0]||{}).id||'';persist();$('#programDialog').close();renderTraining();renderProgress();notify('Программа удалена.');}
  function addWorkoutDay(){const p=currentProgram();const name=`Тренировка ${p.workouts.length+1}`;const w={id:`workout-${uid()}`,name,desc:'',exercises:[]};p.workouts.push(w);activeWorkout=w.id;persist();$('#programDialog').close();renderTraining();notify('Добавлен новый день. Теперь добавь в него упражнения.');}
  function renameWorkout(){const name=$('#renameWorkoutName').value.trim();if(!name)return notify('Название дня не должно быть пустым.');const w=getWorkout();if(!w)return;w.name=name;persist();renderTraining();$('#programDialog').close();notify('Название дня изменено.');}
  function openExerciseEditor(id){const ex=getExercises().find(e=>e.id===id);if(!ex)return;editingExerciseId=id;pendingImageData=null;$('#editExerciseName').value=ex.name||'';$('#editExerciseMuscle').value=ex.muscle||'';$('#editExerciseTarget').value=ex.target||'';$('#editExerciseSets').value=String(ex.sets||3);$('#editExerciseAlt').value=ex.alt||'';$('#editExerciseImageUrl').value=ex.imageUrl||'';$('#editExerciseVideoUrl').value=ex.videoUrl||'';$('#editExerciseImageFile').value='';$('#removeExerciseImage').checked=false;const src=ex.imageData||validImageLink(ex.imageUrl);$('#exerciseImagePreview').src=src||'';$('#exerciseImagePreview').classList.toggle('hidden',!src);$('#exerciseImagePlaceholder').classList.toggle('hidden',!!src);$('#exerciseDialog').showModal();}
  function compressImageFile(file){return new Promise((resolve,reject)=>{if(!file||!file.type.startsWith('image/'))return reject(new Error('Выбери файл изображения.'));const reader=new FileReader();reader.onerror=()=>reject(new Error('Не удалось прочитать картинку.'));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('Файл не удалось открыть как изображение.'));image.onload=()=>{const max=640,scale=Math.min(1,max/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',0.72));};image.src=reader.result;};reader.readAsDataURL(file);});}
  async function saveExerciseEdit(){const ex=getExercises().find(e=>e.id===editingExerciseId);if(!ex)return;const name=$('#editExerciseName').value.trim();if(!name)return notify('Введи название упражнения.');const imageUrl=$('#editExerciseImageUrl').value.trim();const videoUrl=$('#editExerciseVideoUrl').value.trim();if(imageUrl&&!validImageLink(imageUrl))return notify('Укажи ссылку https:// или выбери изображение из библиотеки приложения.');if(videoUrl&&!validLink(videoUrl,true))return notify('Для видео укажи корректную https:// или tg:// ссылку.');let imageData=ex.imageData||'';try{const file=$('#editExerciseImageFile').files?.[0];if(file)imageData=pendingImageData||await compressImageFile(file);}catch(e){return notify(e.message||'Не удалось обработать картинку.');}if($('#removeExerciseImage').checked){imageData='';}if(imageUrl)imageData='';ex.name=name;ex.muscle=$('#editExerciseMuscle').value.trim();ex.target=$('#editExerciseTarget').value.trim()||'По плану';ex.sets=Math.max(1,Math.min(8,Number($('#editExerciseSets').value)||3));ex.alt=$('#editExerciseAlt').value.trim();ex.imageUrl=imageUrl;ex.imageData=imageData;ex.videoUrl=videoUrl;persist();$('#exerciseDialog').close();renderTraining();renderProgress();notify('Упражнение обновлено.');}
  function handleClick(e){const nav=e.target.closest('[data-view]');if(nav){switchView(nav.dataset.view);return;}const go=e.target.closest('[data-go]');if(go){switchView(go.dataset.go);return;}const tab=e.target.closest('[data-workout]');if(tab){switchWorkout(tab.dataset.workout);return;}const action=e.target.closest('[data-action]');if(!action)return;const id=action.dataset.exercise;if(action.dataset.action==='add-set'||action.dataset.action==='remove-set'){const dr=ensureDraft()[id];if(action.dataset.action==='add-set'&&dr.sets.length<8)dr.sets.push({reps:''});if(action.dataset.action==='remove-set'&&dr.sets.length>1)dr.sets.pop();persist();renderTraining();return;}if(action.dataset.action==='delete-session'){deleteSession(action.dataset.session);return;}if(action.dataset.action==='remove-exercise'){deleteExercise(id);return;}if(action.dataset.action==='edit-exercise'){openExerciseEditor(id);return;}}
  $('#workoutDate').value=todayISO();$('#todayLabel').textContent=dateFmt(todayISO()).toUpperCase();$('#workoutDate').addEventListener('change',()=>{ensureDraft();renderTraining();});
  document.addEventListener('click',handleClick);
  $('#programSelect').addEventListener('change',e=>switchProgram(e.target.value));$('#manageProgramsBtn').addEventListener('click',openProgramDialog);
  $('#exerciseList').addEventListener('input',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});$('#exerciseList').addEventListener('change',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});
  $('#saveWorkoutBtn').addEventListener('click',saveWorkout);$('#addExerciseBtn').addEventListener('click',()=>$('#addExerciseDialog').showModal());$('#addExerciseForm').addEventListener('submit',e=>{e.preventDefault();addCustomExercise();});
  $('#createProgramBtn').addEventListener('click',createProgram);$('#renameProgramBtn').addEventListener('click',renameProgram);$('#deleteProgramBtn').addEventListener('click',deleteProgram);$('#addWorkoutDayBtn').addEventListener('click',addWorkoutDay);$('#renameWorkoutBtn').addEventListener('click',renameWorkout);
  $('#editExerciseForm').addEventListener('submit',e=>{e.preventDefault();saveExerciseEdit();});$('#editExerciseImageFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{pendingImageData=await compressImageFile(file);const img=$('#exerciseImagePreview');img.src=pendingImageData;img.classList.remove('hidden');$('#exerciseImagePlaceholder').classList.add('hidden');$('#editExerciseImageUrl').value='';$('#removeExerciseImage').checked=false;}catch(err){notify(err.message||'Не удалось загрузить картинку.');}});$('#editExerciseImageUrl').addEventListener('input',()=>{if($('#editExerciseImageUrl').value.trim()){$('#exerciseImagePreview').classList.add('hidden');$('#exerciseImagePlaceholder').classList.remove('hidden');}});
  $('#exportBtn').addEventListener('click',exportData);$('#importBtn').addEventListener('click',()=>$('#importFile').click());$('#importFile').addEventListener('change',e=>{if(e.target.files?.[0])importData(e.target.files[0]);e.target.value='';});$('#progressExercise').addEventListener('change',updateProgressForSelection);
  let installPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});$('#installBtn').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();try{await installPrompt.userChoice;}catch(e){}installPrompt=null;}else $('#installDialog').showModal();});
  renderTraining();
})();
