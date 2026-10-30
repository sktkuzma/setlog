(() => {
  'use strict';
  const STORAGE_KEY = 'setlog-pwa-v1';
  const LOCAL_OWNER_KEY = 'setlog-pwa-local-owner-v1';
  function initialStorageScope(){
    try{const owner=localStorage.getItem(LOCAL_OWNER_KEY);if(owner){const scoped=`${STORAGE_KEY}:user:${owner}`;if(localStorage.getItem(scoped))return scoped;}}catch(e){}
    return STORAGE_KEY;
  }
  let activeStorageKey = initialStorageScope();
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
  const isYoutubeLink = value => {const v=validLink(value);if(!v)return false;try{const host=new URL(v).hostname.toLowerCase();return host==='youtu.be'||host.endsWith('.youtu.be')||host==='youtube.com'||host.endsWith('.youtube.com');}catch(e){return false;}};
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
  const DATA_SCHEMA_VERSION = 8;
  const LEGACY_MIGRATION_BACKUP_KEY = 'setlog-pwa-v1-pre-schema-v6-backup';
  const LEGACY_MIGRATION_BACKUP_KEYS = [LEGACY_MIGRATION_BACKUP_KEY, 'setlog-pwa-v1-pre-schema-v5-backup', 'setlog-pwa-v1-pre-schema-v4-backup'];
  let importedExerciseLibrary = [];
  let importedExerciseLibraryGroups = [];
  let importedExerciseLibraryError = '';
  let importedExerciseLibraryName = 'Библиотека упражнений';
  let initialStorageRaw = null;
  let startupNeedsMigration = false;
  let storageReadFailure = null;
  let storageWriteBlocked = false;
  let lastAutoSnapshotAt = 0;
  let snapshotTimer = null;

  function normalizeProgram(p){
    return {
      id:String(p.id||`program-${uid()}`),
      name:String(p.name||'Моя программа'),
      workouts:(Array.isArray(p.workouts)?p.workouts:[]).map(w=>({
        id:String(w.id||`workout-${uid()}`),
        name:String(w.name||'Тренировка'),
        desc:String(w.desc||''),
        exercises:(Array.isArray(w.exercises)?w.exercises:[]).map(e=>({...e}))
      }))
    };
  }
  function migrateLegacyCustom(programs, legacyCustom){
    const target=programs.find(p=>p.id===DEFAULT_PROGRAM_ID)||programs[0]; if(!target||!legacyCustom)return;
    for(const [wid,arr] of Object.entries(legacyCustom)){
      const workout=target.workouts.find(w=>w.id===String(wid)); if(!workout||!Array.isArray(arr))continue;
      for(const e of arr) if(!workout.exercises.some(x=>x.id===e.id)) workout.exercises.push({...e,sets:Number(e.sets)||3,imageUrl:e.imageUrl||'',imageData:e.imageData||'',videoUrl:e.videoUrl||''});
    }
  }
  const clampSets = value => Math.max(1,Math.min(8,Number(value)||3));
  const catalogSignature = e => { const media=String(e.videoUrl||e.imageUrl||e.imageData||'').trim(); return media?`${String(e.name||'').trim().toLocaleLowerCase('ru')}|${String(e.muscle||'').trim().toLocaleLowerCase('ru')}|${media}`:''; };
  const catalogIdFromLegacy = value => {
    const raw=String(value||`custom-${uid()}`);
    return raw.startsWith('catalog-')?raw:`catalog-${raw.replace(/[^a-zA-Z0-9_-]/g,'-')}`;
  };
  function normalizeCatalogItem(raw){
    const e=raw&&typeof raw==='object'?raw:{};
    const stringArray=value=>Array.isArray(value)?[...new Set(value.map(item=>String(item||'').trim()).filter(Boolean))]:[];
    const sourceInfo=e.sourceInfo&&typeof e.sourceInfo==='object'?{...e.sourceInfo}:(e.source&&typeof e.source==='object'?{...e.source}:null);
    return {
      id:String(e.id||catalogIdFromLegacy(e.name||uid())),
      name:String(e.name||'Упражнение'),
      muscle:String(e.muscle||'Своя группа'),
      bodyweight:!!e.bodyweight,
      imageUrl:String(e.imageUrl||e.image||''),
      imageData:String(e.imageData||''),
      videoUrl:String(e.videoUrl||e.video||sourceInfo?.url||''),
      youtubeUrl:String(e.youtubeUrl||e.youtube||''),
      custom:!!e.custom,
      defaultTarget:String(e.defaultTarget??e.target??e.reps??'По плану'),
      defaultSets:clampSets(e.defaultSets??e.sets),
      catalogSource:String(e.catalogSource||e.librarySource||''),
      sourceRecordId:String(e.sourceRecordId||''),
      sourceOriginalName:String(e.sourceOriginalName||sourceInfo?.originalName||''),
      sourceOriginalCatalogName:String(e.sourceOriginalCatalogName||sourceInfo?.originalCatalogName||''),
      muscleGroups:stringArray(e.muscleGroups),
      sourceMuscleGroups:stringArray(e.sourceMuscleGroups),
      aliases:stringArray(e.aliases),
      videoDuration:String(e.videoDuration||''),
      classificationSource:String(e.classificationSource||''),
      sourceNotes:stringArray(e.sourceNotes||e.notes),
      sourceInfo,
      createdAt:Number(e.createdAt)||Date.now(),
      updatedAt:Number(e.updatedAt)||Number(e.createdAt)||Date.now()
    };
  }
  function normalizeLibraryText(value){
    return String(value||'').normalize('NFKC').toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[–—-]/g,' ').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  }
  function groupsForLibraryItem(item){
    const explicit=Array.isArray(item?.muscleGroups)?item.muscleGroups:[];
    const fromMuscle=String(item?.muscle||'').split(/[\/,;·]/).map(value=>value.trim()).filter(Boolean);
    return [...new Set([...explicit,...fromMuscle].map(value=>String(value||'').trim()).filter(Boolean))];
  }
  function normalizeImportedLibraryItem(raw){
    const e=raw&&typeof raw==='object'?raw:{};
    return normalizeCatalogItem({
      id:String(e.id||''),name:String(e.name||'Упражнение'),muscle:String(e.muscle||(e.muscleGroups||[])[0]||'Своя группа'),
      bodyweight:!!e.bodyweight,imageUrl:e.image||'',imageData:'',videoUrl:e.video||e.source?.url||'',custom:false,
      defaultTarget:e.reps||'8–12',defaultSets:e.sets||3,catalogSource:'coach',sourceRecordId:String(e.id||''),
      sourceOriginalName:e.source?.originalName||e.name||'',sourceOriginalCatalogName:e.source?.originalCatalogName||e.name||'',
      muscleGroups:e.muscleGroups||[],sourceMuscleGroups:e.sourceMuscleGroups||[],aliases:e.aliases||[],videoDuration:e.videoDuration||'',
      classificationSource:e.classificationSource||'',sourceNotes:e.notes||[],sourceInfo:e.source||null
    });
  }
  async function loadImportedExerciseLibrary(){
    importedExerciseLibrary=[];importedExerciseLibraryGroups=[];importedExerciseLibraryError='';
    try{
      const response=await fetch('./exercise-library-coach.json',{cache:'no-cache'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const payload=await response.json();
      if(!payload||!Array.isArray(payload.exercises))throw new Error('Не удалось открыть библиотеку упражнений.');
      const seen=new Set();
      const items=[];
      for(const raw of payload.exercises){
        if(!raw||!raw.id||!raw.name||seen.has(String(raw.id)))continue;
        seen.add(String(raw.id));
        const item=normalizeImportedLibraryItem(raw);
        if(!validLink(item.videoUrl))continue;
        items.push(item);
      }
      if(!items.length)throw new Error('В каталоге нет корректных записей с видео');
      importedExerciseLibrary=items;
      importedExerciseLibraryGroups=Array.isArray(payload.muscleGroups)?payload.muscleGroups.map(String):[];
      importedExerciseLibraryName=String(payload.catalog?.name||'Библиотека упражнений');
    }catch(error){
      importedExerciseLibraryError=String(error?.message||error||'неизвестная ошибка');
      console.warn('SetLog exercise library could not be loaded:',error);
    }
  }
  function getAvailableExerciseLibrary(){
    const map=new Map();
    for(const raw of data.exerciseCatalog||[]){
      const item=normalizeCatalogItem(raw);
      map.set(item.id,{...item,muscleGroups:groupsForLibraryItem(item),aliases:[...(item.aliases||[])]});
    }
    const localByVideo=new Map();
    for(const item of map.values())if(item.videoUrl){const ids=localByVideo.get(item.videoUrl)||[];ids.push(item.id);localByVideo.set(item.videoUrl,ids);}
    for(const item of importedExerciseLibrary){
      const existingById=map.get(item.id);
      if(existingById){
        map.set(item.id,{...existingById,muscleGroups:[...new Set([...groupsForLibraryItem(existingById),...groupsForLibraryItem(item)])],aliases:[...new Set([...(existingById.aliases||[]),...(item.aliases||[]),item.name,item.sourceOriginalName].filter(Boolean))],sourceRecordId:existingById.sourceRecordId||item.sourceRecordId,sourceOriginalName:existingById.sourceOriginalName||item.sourceOriginalName,sourceMuscleGroups:[...new Set([...(existingById.sourceMuscleGroups||[]),...(item.sourceMuscleGroups||[])])],videoDuration:existingById.videoDuration||item.videoDuration,sourceInfo:existingById.sourceInfo||item.sourceInfo});
        continue;
      }
      const matchingIds=item.videoUrl?(localByVideo.get(item.videoUrl)||[]):[];
      if(matchingIds.length){
        for(const id of matchingIds){const existing=map.get(id);if(!existing)continue;map.set(id,{...existing,muscleGroups:[...new Set([...groupsForLibraryItem(existing),...groupsForLibraryItem(item)])],aliases:[...new Set([...(existing.aliases||[]),...(item.aliases||[]),item.name,item.sourceOriginalName].filter(Boolean))],sourceRecordId:existing.sourceRecordId||item.sourceRecordId,sourceOriginalName:existing.sourceOriginalName||item.sourceOriginalName,sourceMuscleGroups:[...new Set([...(existing.sourceMuscleGroups||[]),...(item.sourceMuscleGroups||[])])],videoDuration:existing.videoDuration||item.videoDuration,sourceInfo:existing.sourceInfo||item.sourceInfo});}
        continue;
      }
      map.set(item.id,item);
    }
    return [...map.values()];
  }
  // Compatibility for older local/cloud backups created before the library was renamed.
  // Build the legacy token in pieces so shipped sources no longer expose the old library label.
  const LEGACY_CATALOG_TOKEN = ['tulu','pavel'].join('');
  const LEGACY_CATALOG_PATTERN = new RegExp(LEGACY_CATALOG_TOKEN,'gi');
  function rewriteLegacyCatalogTokens(value){
    if(typeof value==='string')return value.replace(LEGACY_CATALOG_PATTERN,'coach');
    if(Array.isArray(value))return value.map(rewriteLegacyCatalogTokens);
    if(value&&typeof value==='object'){
      const out={};for(const [key,item] of Object.entries(value))out[key]=rewriteLegacyCatalogTokens(item);return out;
    }
    return value;
  }
  function normalizeData(input){
    const d=rewriteLegacyCatalogTokens(input&&typeof input==='object'?input:{});
    let sourcePrograms=Array.isArray(d.programs)&&d.programs.length?d.programs.map(normalizeProgram):seedPrograms().map(normalizeProgram);
    migrateLegacyCustom(sourcePrograms,d.customExercises||{});
    if(!sourcePrograms.length)sourcePrograms=seedPrograms().map(normalizeProgram);
    if(!d.girlsProgramMigrated && !sourcePrograms.some(p=>p.id===GIRLS_PROGRAM_ID)) sourcePrograms.push(normalizeProgram(cloneGirlsProgram()));

    // For legacy formats, attach the known media before extracting canonical catalog records.
    const hasCanonicalCatalog=Array.isArray(d.exerciseCatalog)&&d.exerciseCatalog.length>0;
    if(!hasCanonicalCatalog) applyDefaultMedia(sourcePrograms);

    const catalogMap=new Map();
    const signatureMap=new Map();
    for(const raw of (Array.isArray(d.exerciseCatalog)?d.exerciseCatalog:[])){
      const item=normalizeCatalogItem(raw);
      if(!catalogMap.has(item.id))catalogMap.set(item.id,item);
      {const signature=catalogSignature(item);if(signature)signatureMap.set(signature,item.id);}
    }
    const legacyToCatalog=new Map();
    function ensureCatalogForLegacyExercise(source){
      const e=source&&typeof source==='object'?source:{};
      let catalogId=e.catalogId&&catalogMap.has(String(e.catalogId))?String(e.catalogId):null;
      if(!catalogId&&e.catalogId){
        catalogId=String(e.catalogId);
        catalogMap.set(catalogId,normalizeCatalogItem({id:catalogId,name:e.name||'Упражнение',muscle:e.muscle||'',target:e.target,sets:e.sets,alt:e.alt,bodyweight:e.bodyweight,imageUrl:e.imageUrl,imageData:e.imageData,videoUrl:e.videoUrl,youtubeUrl:e.youtubeUrl,custom:e.custom}));
        {const knownSignature=catalogSignature(catalogMap.get(catalogId));if(knownSignature)signatureMap.set(knownSignature,catalogId);}
      }
      const signature=catalogSignature(e);
      if(!catalogId&&signature&&signatureMap.has(signature))catalogId=signatureMap.get(signature);
      if(!catalogId&&e.id&&catalogMap.has(catalogIdFromLegacy(e.id)))catalogId=catalogIdFromLegacy(e.id);
      if(!catalogId){
        catalogId=catalogIdFromLegacy(e.id||`custom-${uid()}`);
        if(catalogMap.has(catalogId))catalogId=`${catalogId}-${uid().slice(-4)}`;
        catalogMap.set(catalogId,normalizeCatalogItem({
          id:catalogId,name:e.name||'Упражнение',muscle:e.muscle||'',bodyweight:e.bodyweight,
          imageUrl:e.imageUrl,imageData:e.imageData,videoUrl:e.videoUrl,youtubeUrl:e.youtubeUrl,custom:e.custom,
          defaultTarget:e.target||'По плану',defaultSets:e.sets||3,createdAt:e.createdAt,updatedAt:e.updatedAt
        }));
        if(signature)signatureMap.set(signature,catalogId);
      }
      if(e.id)legacyToCatalog.set(String(e.id),catalogId);
      if(e.catalogId)legacyToCatalog.set(String(e.catalogId),catalogId);
      return catalogId;
    }

    const programs=sourcePrograms.map(p=>({
      id:String(p.id),name:String(p.name||'Моя программа'),
      workouts:(p.workouts||[]).map(w=>({
        id:String(w.id),name:String(w.name||'Тренировка'),desc:String(w.desc||''),
        exercises:(w.exercises||[]).map(rawExercise=>{
          const e=rawExercise&&typeof rawExercise==='object'?rawExercise:{};
          const catalogId=ensureCatalogForLegacyExercise(e);
          const cat=catalogMap.get(catalogId)||normalizeCatalogItem({id:catalogId,name:e.name||'Упражнение'});
          if(!catalogMap.has(catalogId))catalogMap.set(catalogId,cat);
          return {
            id:String(e.id||`placement-${uid()}`),
            catalogId,
            target:String(e.target!==undefined?e.target:(cat.defaultTarget||'По плану')),
            sets:clampSets(e.sets!==undefined?e.sets:cat.defaultSets),
            alt:String(e.alt||''),
            altVideoUrl:String(e.altVideoUrl||''),
            replacesCatalogId:String(e.replacesCatalogId||'')
          };
        })
      }))
    }));

    const history=Array.isArray(d.history)?d.history.map(session=>({...session,entries:(Array.isArray(session.entries)?session.entries:[]).map(entry=>({...entry}))})):[];
    // Translate old per-program exercise IDs to stable catalog IDs without altering the recorded result.
    for(const session of history){
      if(!session.programId)session.programId=DEFAULT_PROGRAM_ID;
      if(!session.programName)session.programName=programs.find(p=>p.id===session.programId)?.name||'Full Body';
      for(const entry of session.entries||[]){
        const oldId=String(entry.exerciseId||'');
        if(oldId&&legacyToCatalog.has(oldId)&&legacyToCatalog.get(oldId)!==oldId){
          entry.legacyExerciseId=entry.legacyExerciseId||oldId;
          entry.exerciseId=legacyToCatalog.get(oldId);
        } else if(!oldId&&entry.exerciseName){
          const match=[...catalogMap.values()].find(c=>c.name===entry.exerciseName&&(!entry.muscle||c.muscle===entry.muscle));
          if(match)entry.exerciseId=match.id;
        }
        // Keep deleted-from-program historical exercises available in stats/library archive.
        if(entry.exerciseId&&!catalogMap.has(String(entry.exerciseId))){
          const id=catalogIdFromLegacy(entry.exerciseId);
          const orphan=normalizeCatalogItem({id,name:entry.exerciseName||'Упражнение',muscle:entry.muscle||'',defaultTarget:entry.target||'По плану',custom:true});
          catalogMap.set(id,orphan);
          if(entry.exerciseId!==id){entry.legacyExerciseId=entry.legacyExerciseId||entry.exerciseId;entry.exerciseId=id;}
        }
        if(entry.exerciseId&&!entry.exerciseCatalogId)entry.exerciseCatalogId=entry.exerciseId;
      }
    }

    const drafts=d.drafts&&typeof d.drafts==='object'?JSON.parse(JSON.stringify(d.drafts)):{ };
    const needsPerSetMigration=Number(d.schemaVersion||d.version||0)<7;
    for(const [key,val] of Object.entries({...drafts})){
      const match=key.match(/^(\d{4}-\d{2}-\d{2})::([^:]+)$/);
      if(match){const newKey=`${match[1]}::${DEFAULT_PROGRAM_ID}::${match[2]}`;if(!drafts[newKey])drafts[newKey]=val;}
    }
    for(const exerciseDrafts of Object.values(drafts)){
      if(!exerciseDrafts||typeof exerciseDrafts!=='object')continue;
      for(const dr of Object.values(exerciseDrafts)){
        if(!dr||typeof dr!=='object')continue;
        if(!Array.isArray(dr.sets))dr.sets=[];
        if(needsPerSetMigration){
          const legacyWeight=String(dr.weight??'');
          for(const set of dr.sets){if(!set||typeof set!=='object')continue;if(set.weight===undefined||set.weight==='')set.weight=legacyWeight;}
          delete dr.weight;
        }
        for(const set of dr.sets){if(!set||typeof set!=='object')continue;if(set.weight===undefined)set.weight='';if(set.reps===undefined)set.reps='';if(set.done!==undefined)delete set.done;}
      }
    }
    const activeProgramId=programs.some(p=>p.id===d.activeProgramId)?d.activeProgramId:programs[0].id;
    const validWorkouts=programs.find(p=>p.id===activeProgramId)?.workouts||[];
    const activeWorkoutId=validWorkouts.some(w=>w.id===d.activeWorkoutId)?d.activeWorkoutId:(validWorkouts[0]?.id||'');
    return {
      schemaVersion:DATA_SCHEMA_VERSION,
      version:DATA_SCHEMA_VERSION,
      migrationsApplied:[...new Set([...(Array.isArray(d.migrationsApplied)?d.migrationsApplied:[]),'v4-exercise-catalog-stable-ids','v5-exercise-library-picker','v6-replacement-archive','v7-per-set-loads','v8-replacement-video-links'])],
      history,drafts,programs,exerciseCatalog:[...catalogMap.values()],archivedPlacements:Array.isArray(d.archivedPlacements)?d.archivedPlacements.map(item=>({...item,originalPlacement:item.originalPlacement&&typeof item.originalPlacement==='object'?{...item.originalPlacement}:null,originalExerciseSnapshot:item.originalExerciseSnapshot&&typeof item.originalExerciseSnapshot==='object'?{...item.originalExerciseSnapshot}:null})):[],activeProgramId,activeWorkoutId,
      girlsProgramMigrated:true,
      createdAt:d.createdAt||Date.now(),updatedAt:Number(d.updatedAt)||Date.now()
    };
  }
  function loadData(){
    let raw=null;
    try{raw=localStorage.getItem(activeStorageKey);}catch(error){storageReadFailure=error;return normalizeData({});}
    initialStorageRaw=raw;
    if(!raw)return normalizeData({});
    try{
      const parsed=JSON.parse(raw);
      startupNeedsMigration=Number(parsed.schemaVersion||parsed.version||0)<DATA_SCHEMA_VERSION||!Array.isArray(parsed.exerciseCatalog);
      return normalizeData(parsed);
    }catch(error){storageReadFailure=error;return normalizeData({});}
  }
  let data=loadData();
  let historyEditContext=null;
  function historyEditStorageKey(){return `${activeStorageKey}:history-edit-v1`;}
  function readHistoryEditContext(){
    try{
      const raw=localStorage.getItem(historyEditStorageKey());if(!raw)return null;
      const ctx=JSON.parse(raw);
      if(!ctx||!ctx.sessionId||!ctx.originalSession||!Array.isArray(ctx.exercises)||!ctx.draft||typeof ctx.draft!=='object')return null;
      return ctx;
    }catch(error){console.warn('Не удалось прочитать черновик доработки истории:',error);return null;}
  }
  function persistHistoryEditContext(showError=true){
    if(!historyEditContext)return false;
    try{localStorage.setItem(historyEditStorageKey(),JSON.stringify(historyEditContext));return true;}
    catch(error){console.error('Could not save history-edit draft:',error);if(showError)notify('Не удалось сохранить черновик доработки истории. Историческая запись не изменена. Освободи место и попробуй снова.');return false;}
  }
  function clearHistoryEditContext(){try{localStorage.removeItem(historyEditStorageKey());}catch(error){console.warn('Не удалось удалить временный черновик истории:',error);}historyEditContext=null;}
  historyEditContext=readHistoryEditContext();
  let activeView='training';
  let activeProgramId=data.activeProgramId||DEFAULT_PROGRAM_ID;
  let activeWorkout=(getWorkouts(activeProgramId).find(w=>w.id===data.activeWorkoutId)||getWorkouts(activeProgramId)[0]||{}).id||'1';
  let toastTimer;
  let editingExerciseId=null;
  let pendingImageData=null;
  const currentDate=()=>$('#workoutDate').value||todayISO();
  const currentProgram=()=>data.programs.find(p=>p.id===activeProgramId)||data.programs[0];
  function getWorkouts(programId=activeProgramId){return currentProgramFor(programId)?.workouts||[];}
  function currentProgramFor(programId){return data.programs.find(p=>p.id===programId)||null;}
  function getWorkout(workoutId=activeWorkout,programId=activeProgramId){return getWorkouts(programId).find(w=>w.id===workoutId)||getWorkouts(programId)[0]||null;}
  function getExercises(workoutId=activeWorkout){
    if(historyEditContext)return historyEditContext.exercises.map(item=>({...item}));
    const workout=getWorkout(workoutId);if(!workout)return [];
    return (workout.exercises||[]).map(instance=>{
      const catalog=data.exerciseCatalog.find(item=>item.id===instance.catalogId)||normalizeCatalogItem({id:instance.catalogId||instance.id,name:'Упражнение'});
      const replacedCatalog=instance.replacesCatalogId?data.exerciseCatalog.find(item=>item.id===instance.replacesCatalogId):null;
      return {...catalog,...instance,id:instance.id,catalogId:catalog.id,target:instance.target!==undefined?instance.target:(catalog.defaultTarget||'По плану'),sets:clampSets(instance.sets!==undefined?instance.sets:catalog.defaultSets),alt:instance.alt!==undefined?instance.alt:'',replacesFromName:replacedCatalog?.name||''};
    });
  }
  const draftKey=(date=currentDate(),workout=activeWorkout,programId=activeProgramId)=>`${date}::${programId}::${workout}`;
  function setStorageStatus(message,state='saved'){
    const root=$('#storageStatus');const text=$('#storageStatusText');if(text)text.textContent=message;if(root){root.dataset.state=state;root.setAttribute('aria-label',message);}
  }
  function openSafetyDB(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window))return reject(new Error('Сохранённые копии недоступны в этом браузере.'));
      const request=indexedDB.open('setlog-safety-v1',1);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'id'});};
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('Не удалось открыть хранилище копий.'));
    });
  }
  async function saveSafetySnapshot(label='Автоматическая копия',payloadOverride=null){
    try{
      const payload=payloadOverride!==null?(typeof payloadOverride==='string'?payloadOverride:JSON.stringify(payloadOverride)):JSON.stringify(data);
      const parsed=(()=>{try{return JSON.parse(payload);}catch(e){return {};}})();
      const snapshot={id:`snap-${Date.now()}-${uid()}`,label:String(label),createdAt:Date.now(),schemaVersion:Number(parsed.schemaVersion||parsed.version||0),payload};
      const db=await openSafetyDB();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('snapshots','readwrite');const store=tx.objectStore('snapshots');store.put(snapshot);
        const all=store.getAll();all.onsuccess=()=>{const list=(all.result||[]).sort((a,b)=>b.createdAt-a.createdAt);for(const item of list.slice(10))store.delete(item.id);};
        tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Не удалось сохранить копию.'));tx.onabort=()=>reject(tx.error||new Error('Создание копии отменено.'));
      });
      db.close();lastAutoSnapshotAt=Date.now();await updateBackupStatus();return true;
    }catch(error){console.warn('SetLog safety snapshot failed:',error);await updateBackupStatus();return false;}
  }
  async function listSafetySnapshots(){
    try{const db=await openSafetyDB();const records=await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly');const req=tx.objectStore('snapshots').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});db.close();return records.sort((a,b)=>b.createdAt-a.createdAt);}catch(error){return [];}
  }
  async function updateBackupStatus(){
    const el=$('#autoBackupStatus');if(!el)return;const snapshots=await listSafetySnapshots();
    const last=snapshots[0];el.textContent=last?`Сохранённых копий на этом устройстве: ${snapshots.length}. Последняя — ${new Date(last.createdAt).toLocaleString('ru-RU',{day:'2-digit',month:'long',hour:'2-digit',minute:'2-digit'})}.`:'Автоматические копии будут создаваться по мере изменений дневника.';
  }
  function scheduleSafetySnapshot(label='Автоматическая копия'){
    clearTimeout(snapshotTimer);
    snapshotTimer=setTimeout(async()=>{
      if(Date.now()-lastAutoSnapshotAt<60000)return;
      await saveSafetySnapshot(label);
    },6000);
  }
  function persist(options={}){
    if(storageWriteBlocked){setStorageStatus('Сохранение приостановлено. Восстанови дневник из сохранённой копии.','error');return false;}
    try{
      data.activeProgramId=activeProgramId;data.activeWorkoutId=activeWorkout;data.schemaVersion=DATA_SCHEMA_VERSION;data.version=DATA_SCHEMA_VERSION;data.updatedAt=Date.now();
      localStorage.setItem(activeStorageKey,JSON.stringify(data));
      if(cloudSession&&!navigator.onLine){setStorageStatus('Сохранено на устройстве · ждёт отправки','pending');setCloudMessage('Нет интернета. Изменения сохранены на устройстве и отправятся автоматически после восстановления связи.','pending');}else if(!cloudSession||!cloudReady) setStorageStatus('Сохранено на этом устройстве.','saved');
      if(options.snapshot) saveSafetySnapshot(options.label||'Сохранённая копия'); else scheduleSafetySnapshot();
      if(!cloudApplying) scheduleCloudSync();
      return true;
    }catch(error){
      setStorageStatus('Не удалось сохранить изменения на устройстве.','error');
      notify('Не удалось сохранить изменения на этом устройстве. Предыдущая копия не затронута. Освободи место и попробуй снова.');
      console.error('SetLog storage write failed:',error);return false;
    }
  }
  const MAX_LOGGED_SETS = 20;
  function defaultDraft(ex){return {rir:'',notes:'',sets:Array.from({length:Math.max(1,Math.min(8,ex.sets||3))},()=>({weight:'',reps:''}))};}
  function ensureDraft(date=currentDate(),workout=activeWorkout){
    if(historyEditContext){
      const ctx=historyEditContext;if(!ctx.draft||typeof ctx.draft!=='object')ctx.draft={};
      for(const ex of getExercises())if(!ctx.draft[ex.id])ctx.draft[ex.id]=defaultDraft(ex);
      return ctx.draft;
    }
    const key=draftKey(date,workout);let changed=false;
    if(!data.drafts[key]){data.drafts[key]={};changed=true;}
    for(const ex of getExercises(workout))if(!data.drafts[key][ex.id]){data.drafts[key][ex.id]=defaultDraft(ex);changed=true;}
    for(const ex of getExercises(workout)){const dr=data.drafts[key][ex.id];if(!Array.isArray(dr.sets)){dr.sets=defaultDraft(ex).sets;changed=true;}if(!dr.sets.length){dr.sets.push({weight:'',reps:''});changed=true;}for(const set of dr.sets){if(set.weight===undefined){set.weight='';changed=true;}if(set.reps===undefined){set.reps='';changed=true;}if(set.done!==undefined){delete set.done;changed=true;}}if(dr.weight!==undefined){delete dr.weight;changed=true;}}
    if(changed)persist();return data.drafts[key];
  }
  function getLastEntry(ex){const all=[];const catalogId=typeof ex==='object'?(ex.catalogId||ex.id):String(ex||'');const instanceId=typeof ex==='object'?ex.id:'';const exName=typeof ex==='object'?ex.name:'';for(const session of data.history){if(historyEditContext&&session.id===historyEditContext.sessionId)continue;for(const e of session.entries||[])if(e.exerciseCatalogId===catalogId||e.exerciseId===catalogId||e.exerciseId===instanceId||(!e.exerciseId&&e.exerciseName===exName))all.push({...e,date:session.date,workout:session.workout,savedAt:session.savedAt});}all.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0)));return all[0]||null;}
  function hasDraftData(d){return !!((d.sets||[]).some(s=>num(s.weight)!==null||String(s.reps??'').trim()!==''));}
  function setResultLabel(entry){
    if(Array.isArray(entry?.setResults)&&entry.setResults.length){
      return entry.setResults.map((set,i)=>{
        const weight=num(set.weight),reps=num(set.reps);
        const load=weight===null?'—':`${fmt(weight)} кг`;
        const repText=reps===null?'—':String(reps);
        return `${i+1}) ${load} × ${repText}`;
      }).join(' · ');
    }
    const weight=num(entry?.weight),reps=Array.isArray(entry?.reps)?entry.reps:[];
    return `${weight===null?'—':`${fmt(weight)} кг`} · ${reps.filter(v=>v!==null&&v!==undefined).join(' / ')||'повторы не указаны'} повт.`;
  }
  function exerciseCard(ex,index,draft,total){
    const last=getLastEntry(ex);const img=ex.imageData||validImageLink(ex.imageUrl);
    const hasWork=(draft.sets||[]).some(set=>num(set.weight)!==null||String(set.reps??'').trim()!=='');
    const recent=hasWork?`${(draft.sets||[]).filter(set=>num(set.weight)!==null||String(set.reps??'').trim()!=='').length} подхода заполнено`:last?`Прошлый раз: ${setResultLabel(last)}`:'Пока нет записей';
    const target=String(ex.target||'По плану');
    return `<article class="exercise-card ${hasDraftData(draft)?'has-data':''}" data-exercise-card="${safe(ex.id)}">
      <button type="button" class="exercise-open" data-action="open-exercise" data-exercise="${safe(ex.id)}" aria-label="Открыть упражнение ${safe(ex.name)}">
        <span class="exercise-thumb">${img?`<img src="${safe(img)}" alt="" loading="lazy">`:'<span class="thumb-placeholder">↗</span>'}</span>
        <span class="exercise-main">
          <span class="exercise-name">${safe(ex.name)}</span>
          <span class="exercise-meta"><span>${safe(ex.muscle||'Своя группа')}</span></span>
          <span class="exercise-plan">${safe(ex.sets)} × ${safe(target)} ${/повт/i.test(target)?'':'повторений'}</span>
          <span class="exercise-card-subline ${hasWork?'is-filled':''}">${safe(recent)}</span>
          ${ex.replacesFromName?`<span class="alt-label">Вместо: ${safe(ex.replacesFromName)}</span>`:''}
        </span>
        <span class="exercise-open-arrow" aria-hidden="true">›</span>
      </button>
      ${historyEditContext?'':`<div class="exercise-card-actions">
        <div class="exercise-order-controls"><button type="button" class="order-button" data-action="move-exercise-up" data-exercise="${safe(ex.id)}" aria-label="Переместить выше" title="Выше" ${index===0?'disabled':''}>↑</button><button type="button" class="order-button" data-action="move-exercise-down" data-exercise="${safe(ex.id)}" aria-label="Переместить ниже" title="Ниже" ${index>=total-1?'disabled':''}>↓</button></div>
        <button type="button" class="edit-exercise-button" data-action="edit-exercise" data-exercise="${safe(ex.id)}" aria-label="Настроить ${safe(ex.name)}" title="Настроить упражнение">✎</button>
      </div>`}
    </article>`;
  }
  function resolveAlternativeVideoParts(ex){
    const label=String(ex?.alt||'').trim();if(!label)return [];
    const direct=validLink(ex.altVideoUrl,true);if(direct)return [{label,url:direct}];
    const library=[...(data.exerciseCatalog||[]),...importedExerciseLibrary];
    const parts=label.split(/\s*[,;]\s*/).map(value=>value.trim()).filter(Boolean);
    return parts.map(part=>{
      const normalized=normalizeLibraryText(part);
      const match=library.find(item=>[item.name,item.sourceOriginalName,...(item.aliases||[])].filter(Boolean).some(name=>normalizeLibraryText(name)===normalized));
      const url=match?(validLink(match.videoUrl,true)||validLink(match.youtubeUrl)) : '';
      return {label:part,url};
    });
  }
  let currentDetailExerciseId=null;
  function renderExerciseDetail(exerciseId=currentDetailExerciseId){
    const ex=getExercises().find(item=>item.id===exerciseId);if(!ex)return;
    currentDetailExerciseId=exerciseId;
    const draft=ensureDraft()[ex.id]||defaultDraft(ex);const last=getLastEntry(ex);
    const img=ex.imageData||validImageLink(ex.imageUrl);const telegram=validLink(ex.videoUrl,true);const youtube=isYoutubeLink(ex.youtubeUrl)?validLink(ex.youtubeUrl):'';
    const target=String(ex.target||'По плану');
    const alternativeVideoParts=resolveAlternativeVideoParts(ex);
    const detail=$('#exerciseDetailContent');
    detail.innerHTML=`
      <div class="detail-topbar"><button type="button" class="detail-back" data-action="close-exercise-detail" aria-label="Назад">‹</button><div class="detail-kicker">УПРАЖНЕНИЕ ${String(getExercises().findIndex(item=>item.id===ex.id)+1).padStart(2,'0')} / ${String(getExercises().length).padStart(2,'0')}</div>${historyEditContext?'<span></span>':`<button type="button" class="detail-edit" data-action="edit-exercise" data-exercise="${safe(ex.id)}" aria-label="Редактировать упражнение">✎</button>`}</div>
      <h2 id="exerciseDetailTitle" class="detail-title">${safe(ex.name)}</h2>
      <div class="detail-hero">${img?`<img src="${safe(img)}" alt="Иллюстрация упражнения: ${safe(ex.name)}">`:'<div class="detail-no-image">Иллюстрация пока не добавлена</div>'}<span class="detail-expand-mark" aria-hidden="true">↗</span></div>
      <div class="detail-video-actions">
        ${telegram?`<a class="video-link video-link-telegram" href="${safe(telegram)}" target="_blank" rel="noopener noreferrer"><span class="video-brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M23.5 3.5 19.95 20.2c-.27 1.17-.97 1.46-1.97.91l-5.44-4.01-2.62 2.52c-.29.29-.54.54-1.1.54l.39-5.55L19.32 5.4c.42-.39-.09-.61-.65-.22L6.06 13.3.67 11.61c-1.17-.37-1.2-1.17.25-1.74L22.02 1.7c.97-.35 1.82.23 1.48 1.8Z"/></svg></span><span>Видео с техникой (Telegram)</span><span class="video-external">↗</span></a>`:`<button type="button" class="video-link video-link-telegram" disabled><span class="video-brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M23.5 3.5 19.95 20.2c-.27 1.17-.97 1.46-1.97.91l-5.44-4.01-2.62 2.52c-.29.29-.54.54-1.1.54l.39-5.55L19.32 5.4c.42-.39-.09-.61-.65-.22L6.06 13.3.67 11.61c-1.17-.37-1.2-1.17.25-1.74L22.02 1.7c.97-.35 1.82.23 1.48 1.8Z"/></svg></span><span>Видео с техникой (Telegram)</span><span class="video-external">Пока нет ссылки</span></button>`}
        ${youtube?`<a class="video-link video-link-youtube" href="${safe(youtube)}" target="_blank" rel="noopener noreferrer"><span class="video-brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="4" fill="currentColor"/><path d="M10 8.2v7.6l6.2-3.8Z" fill="#d92d32"/></svg></span><span>Видео с техникой (YouTube)</span><span class="video-external">↗</span></a>`:`<button type="button" class="video-link video-link-youtube" disabled><span class="video-brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="4" fill="currentColor"/><path d="M10 8.2v7.6l6.2-3.8Z" fill="#d92d32"/></svg></span><span>Видео с техникой (YouTube)</span><span class="video-external">Добавим позже</span></button>`}
      </div>
      <div class="detail-info-panel">
        <div class="detail-info-row"><span class="detail-info-icon">♧</span><span>Мышечная группа</span><strong>${safe(ex.muscle||'Своя группа')}</strong></div>
        <div class="detail-info-row"><span class="detail-info-icon">▤</span><span>Плановые подходы</span><strong>${safe(ex.sets)}</strong></div>
        <div class="detail-info-row"><span class="detail-info-icon">◷</span><span>Диапазон повторений</span><strong>${safe(target)}</strong></div>
        ${ex.alt?`<div class="detail-info-row"><span class="detail-info-icon">⤨</span><span>Вариант / замена</span><strong class="detail-alt-value">${alternativeVideoParts.map(part=>part.url?`<a class="detail-alt-link" href="${safe(part.url)}" target="_blank" rel="noopener noreferrer">${safe(part.label)} <span aria-hidden="true">↗</span></a>`:safe(part.label)).join(', ')}</strong></div>`:''}
        ${ex.replacesFromName?`<div class="detail-info-row"><span class="detail-info-icon">↪</span><span>Заменяет</span><strong>${safe(ex.replacesFromName)}</strong></div>`:''}
      </div>
      <section class="detail-sets-section">
        <div class="detail-section-heading"><div><span class="detail-section-kicker">ТЕКУЩАЯ ТРЕНИРОВКА</span><h3>Рабочие подходы</h3></div><span class="detail-set-count">${draft.sets.length} подхода</span></div>
        <div class="set-table-head"><span>№</span><span>Вес, кг</span><span>Повторы</span><span></span></div>
        <div class="detail-set-list">${draft.sets.map((set,i)=>`<div class="detail-set-row ${num(set.weight)!==null||String(set.reps??'').trim()!==''?'has-input':''}" data-detail-set="${i}"><span class="detail-set-number">${String(i+1).padStart(2,'0')}</span><input class="field-input detail-set-input" type="number" min="0" max="1000" step="0.25" inputmode="decimal" aria-label="Вес в подходе ${i+1}, килограммы" placeholder="—" data-field="weight" data-set-index="${i}" data-exercise="${safe(ex.id)}" value="${safe(set.weight??'')}"><input class="field-input detail-set-input" type="number" min="0" max="300" step="1" inputmode="numeric" aria-label="Повторы в подходе ${i+1}" placeholder="—" data-field="reps" data-set-index="${i}" data-exercise="${safe(ex.id)}" value="${safe(set.reps??'')}"></div>`).join('')}</div>
        <div class="detail-set-controls"><button type="button" class="set-count-button" data-action="remove-set" data-exercise="${safe(ex.id)}" ${draft.sets.length<=1?'disabled':''}><span>−</span> Убрать подход</button><button type="button" class="set-count-button set-count-add" data-action="add-set" data-exercise="${safe(ex.id)}" ${draft.sets.length>=MAX_LOGGED_SETS?'disabled':''}><span>＋</span> Добавить подход</button></div>
      </section>
      <section class="detail-note-panel"><label class="detail-note-title" for="detail-note-${safe(ex.id)}">Заметка</label><textarea id="detail-note-${safe(ex.id)}" class="field-input detail-note-input" rows="2" maxlength="220" placeholder="Техника, самочувствие, детали упражнения…" data-field="notes" data-exercise="${safe(ex.id)}">${safe(draft.notes||'')}</textarea><div class="detail-rir-row"><label for="detail-rir-${safe(ex.id)}">Запас повторений</label><select id="detail-rir-${safe(ex.id)}" class="field-input" data-field="rir" data-exercise="${safe(ex.id)}"><option value="">Не указан</option>${[0,1,2,3,4,5].map(v=>`<option value="${v}" ${String(draft.rir)===String(v)?'selected':''}>${v===0?'0 · до отказа':v}</option>`).join('')}</select></div></section>
      <div class="detail-last-result">${last?`<span>ПРОШЛЫЙ РАЗ · ${safe(dateFmt(last.date))}</span><strong>${safe(setResultLabel(last))}</strong>`:'<span>ПРОШЛЫЙ РАЗ</span><strong>Пока нет сохранённых результатов</strong>'}</div>
      <button type="button" class="primary-button detail-save-button" data-action="close-exercise-detail">Готово <span>✓</span></button>
      ${historyEditContext?'':`<div class="detail-management-actions"><button type="button" class="detail-order-action" data-action="move-exercise-up" data-exercise="${safe(ex.id)}" ${getExercises().findIndex(item=>item.id===ex.id)<=0?'disabled':''}>↑ Выше</button><button type="button" class="detail-order-action" data-action="move-exercise-down" data-exercise="${safe(ex.id)}" ${getExercises().findIndex(item=>item.id===ex.id)>=getExercises().length-1?'disabled':''}>↓ Ниже</button><button type="button" class="detail-remove-action" data-action="remove-exercise" data-exercise="${safe(ex.id)}">Убрать из программы</button></div>`}`;
  }
  function renderProgramSelector(){const sel=$('#programSelect');sel.innerHTML=data.programs.map(p=>`<option value="${safe(p.id)}">${safe(p.name)}</option>`).join('');sel.value=activeProgramId;}
  function renderWorkoutTabs(){const workouts=getWorkouts();$('#workoutSwitch').innerHTML=workouts.map((w,i)=>`<button class="workout-tab ${w.id===activeWorkout?'selected':''}" type="button" data-workout="${safe(w.id)}" role="tab" aria-selected="${String(w.id===activeWorkout)}"><span>${String(i+1).padStart(2,'0')}</span><small>${safe(w.name)}</small></button>`).join('');}
  function renderTraining(){
    const editing=!!historyEditContext;
    const wk=editing?{name:historyEditContext.workoutName||'Тренировка'}:getWorkout();if(!wk){notify('В программе нет тренировочных дней. Добавь день в настройках программы.');return;}
    renderProgramSelector();renderWorkoutTabs();
    const programPicker=$('.program-picker');if(programPicker)programPicker.classList.toggle('hidden',editing);
    $('#workoutSwitch').classList.toggle('hidden',editing);
    const dateInput=$('#workoutDate');dateInput.disabled=editing;
    if(editing){dateInput.value=historyEditContext.date||todayISO();$('#todayLabel').textContent=`ИСТОРИЯ · ${dateFmt(historyEditContext.date||todayISO()).toUpperCase()}`;}
    else if(!dateInput.value){dateInput.value=todayISO();$('#todayLabel').textContent=dateFmt(dateInput.value).toUpperCase();}
    const banner=$('#historyEditBanner');banner.classList.toggle('hidden',!editing);
    if(editing){const exists=data.history.some(session=>session.id===historyEditContext.sessionId);$('#historyEditBannerText').textContent=exists?`ДОРАБОТКА ИСТОРИИ · ${dateFmt(historyEditContext.date||todayISO())}. Текущий черновик сохранён отдельно.`:'Исходная запись не найдена в этой копии. Данные правки сохранены локально; не закрывай режим до восстановления нужной записи.';}
    $('#workoutKicker').textContent=editing?'ИСТОРИЯ / ДОРАБОТКА':`ПЛАН / ${String(getWorkouts().indexOf(wk)+1).padStart(2,'0')}`;
    $('#workoutTitle').textContent=wk.name;
    const list=getExercises();const draft=ensureDraft();
    $('#exerciseCount').textContent=`${list.length} ${plural(list.length,'УПРАЖНЕНИЕ','УПРАЖНЕНИЯ','УПРАЖНЕНИЙ')}`;
    $('#exerciseList').innerHTML=list.map((ex,i)=>exerciseCard(ex,i,draft[ex.id]||defaultDraft(ex),list.length)).join('');
    $('#addExerciseBtn').classList.toggle('hidden',editing);
    $('#saveWorkoutBtn').innerHTML='Сохранить черновик <span>↗</span>';
    $('#finishWorkoutBtn').innerHTML=editing?'Сохранить изменения <span>✓</span>':'Закончить тренировку <span>✓</span>';
    updateFilledCount();
    const sessionIndex=editing?data.history.findIndex(session=>session.id===historyEditContext.sessionId):data.history.length;
    $('#sessionNumber').textContent=String(Math.max(0,sessionIndex)+1).padStart(3,'0');
    renderSettings();
    const dialog=$('#exerciseDetailDialog');
    if(dialog?.open&&currentDetailExerciseId){if(list.some(item=>item.id===currentDetailExerciseId))renderExerciseDetail(currentDetailExerciseId);else{dialog.close();currentDetailExerciseId=null;}}
  }
  function updateFilledCount(){const draft=historyEditContext?ensureDraft():(data.drafts[draftKey()]||{});const count=getExercises().filter(ex=>draft[ex.id]&&hasDraftData(draft[ex.id])).length;$('#filledCount').textContent=`${count} ${plural(count,'упражнение','упражнения','упражнений')}`;}
  function plural(n,a,b,c){const x=n%100,y=n%10;return x>10&&x<20?c:y>1&&y<5?b:y===1?a:c;}
  function notify(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000);}
  function switchView(view){if(historyEditContext&&view!=='training'){notify('Сначала сохрани изменения истории или отмени доработку. Текущий черновик защищён.');return;}activeView=view;$$('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));$$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));if(view==='history')renderHistory();if(view==='progress')renderProgress();if(view==='settings')renderSettings();window.scrollTo({top:0,behavior:'smooth'});}
  function entryFromDraft(ex,d){
    const setResults=(d.sets||[]).map(set=>({weight:num(set.weight),reps:num(set.reps)})).filter(set=>set.weight!==null||set.reps!==null);
    if(!setResults.length)return null;
    const weights=setResults.filter(set=>set.weight!==null).map(set=>set.weight);
    const weight=weights.length?Math.max(...weights):null;
    const reps=setResults.map(set=>set.reps).filter(value=>value!==null);
    const volume=setResults.reduce((total,set)=>total+(set.weight!==null&&set.reps!==null?set.weight*set.reps:0),0);
    const e1rmCandidates=setResults.filter(set=>set.weight!==null&&set.weight>0&&set.reps!==null&&set.reps>0&&set.reps<30).map(set=>set.weight/(1-0.0333*set.reps)).filter(Number.isFinite);
    const e1rm=e1rmCandidates.length?Math.max(...e1rmCandidates):null;
    return {exerciseId:ex.catalogId||ex.id,exerciseCatalogId:ex.catalogId||ex.id,placementExerciseId:ex.id,exerciseName:ex.name,muscle:ex.muscle||'',target:ex.target||'',weight,sets:setResults.length,reps,setResults,rir:d.rir===''||d.rir===undefined?null:Number(d.rir),notes:(d.notes||'').trim(),e1rm:e1rm?Math.round(e1rm*10)/10:null,volume:Math.round(volume*10)/10};
  }
  function saveWorkoutDraft(){
    if(historyEditContext){if(persistHistoryEditContext())notify('Черновик доработки сохранён локально. Историческая запись пока не изменена.');return;}
    ensureDraft();if(!persist({snapshot:false}))return;
    notify('Черновик сохранён. Тренировка остаётся открытой и не добавляется в историю.');
  }
  function finishWorkout(){
    if(historyEditContext){applyHistoryEdit();return;}
    const draft=ensureDraft();const entries=[];
    for(const ex of getExercises()){const entry=entryFromDraft(ex,draft[ex.id]||{});if(entry)entries.push(entry);}
    if(!entries.length){notify('Сначала внеси вес или повторы хотя бы в одно упражнение.');return;}
    if(!confirm(`Закончить тренировку и сохранить в историю ${entries.length} ${plural(entries.length,'упражнение','упражнения','упражнений')}? После завершения начнётся пустой черновик.`))return;
    const wk=getWorkout();const p=currentProgram();const key=draftKey();const oldDraft=JSON.parse(JSON.stringify(data.drafts[key]||{}));
    const session={id:uid(),date:currentDate(),programId:activeProgramId,programName:p.name,workout:activeWorkout,workoutName:wk?.name||'Тренировка',savedAt:Date.now(),entries};
    data.history.push(session);delete data.drafts[key];
    if(!persist({snapshot:true,label:'Завершена тренировка'})){data.history=data.history.filter(item=>item.id!==session.id);data.drafts[key]=oldDraft;return;}
    const detailDialog=$('#exerciseDetailDialog');if(detailDialog?.open)detailDialog.close();currentDetailExerciseId=null;
    renderTraining();renderHistory();renderProgress();notify(`Тренировка завершена. В историю добавлено ${entries.length} ${plural(entries.length,'упражнение','упражнения','упражнений')}.`);
  }
  function renderSettings(){
    const container=$('#settingsProgramsList');if(!container)return;
    $('#settingsProgramCount').textContent=`${data.programs.length} ${plural(data.programs.length,'программа','программы','программ')}`;
    container.innerHTML=data.programs.map(program=>{
      const active=program.id===activeProgramId;
      const workouts=program.workouts||[];const exerciseCount=workouts.reduce((total,workout)=>total+(workout.exercises||[]).length,0);
      return `<article class="settings-program-row ${active?'is-active':''}"><button type="button" class="settings-program-select" data-action="settings-select-program" data-program="${safe(program.id)}"><span class="program-radio">${active?'<span></span>':''}</span><span class="settings-row-copy"><strong>${safe(program.name)}</strong><small>${workouts.length} ${plural(workouts.length,'тренировка','тренировки','тренировок')} · ${exerciseCount} упражнений</small></span></button><button type="button" class="settings-program-menu" data-action="settings-manage-program" data-program="${safe(program.id)}" aria-label="Настроить программу ${safe(program.name)}" title="Настроить программу">⋮</button></article>`;
    }).join('');
  }
  function openAddExerciseDialog(){renderExerciseLibraryGroupOptions();renderExerciseLibraryOptions();$('#addExerciseDialog').showModal();}
  function showInstallDialog(){if(installPrompt){installPrompt.prompt();installPrompt.userChoice.catch(()=>{});installPrompt=null;}else $('#installDialog').showModal();}
  function renderHistory(){
    const hist=[...data.history].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0)));
    const exCount=hist.reduce((sum,session)=>sum+(session.entries||[]).length,0);
    $('#historyCounter').textContent=`${hist.length} ${plural(hist.length,'СЕССИЯ','СЕССИИ','СЕССИЙ')}`;
    $('#historyStatSessions').textContent=hist.length;$('#historyStatExercises').textContent=exCount;
    $('#historyStatLast').textContent=hist[0]?dateFmt(hist[0].date).replace(/\s+\d{4}$/,''):'—';$('#historyEmpty').classList.toggle('hidden',hist.length>0);
    $('#historyList').innerHTML=hist.map(session=>{
      const entries=session.entries||[];const totalVol=entries.reduce((sum,entry)=>sum+(entry.volume||0),0);
      const rows=entries.slice(0,8).map(entry=>{
        const setText=Array.isArray(entry.setResults)&&entry.setResults.length
          ?entry.setResults.map(set=>`${set.weight===null||set.weight===undefined?'—':`${fmt(set.weight)} кг`} × ${set.reps===null||set.reps===undefined?'—':set.reps}`).join(' / ')
          :(entry.reps||[]).filter(value=>value!==null&&value!==undefined).join(' / ')||'—';
        const weightValues=Array.isArray(entry.setResults)?entry.setResults.map(set=>num(set.weight)).filter(value=>value!==null):[];
        const weightText=weightValues.length?`${fmt(Math.max(...weightValues))} кг max`:(entry.weight===null||entry.weight===undefined?'—':`${fmt(entry.weight)} кг`);
        return `<div class="history-entry"><div><div class="history-entry-name">${safe(entry.exerciseName)}</div><div class="history-entry-sub">${safe(entry.sets||entry.reps?.length||0)} подх. · ${safe(setText)}</div>${entry.notes?`<div class="history-note">${safe(entry.notes)}</div>`:''}</div><div class="history-entry-val">${safe(weightText)}<br><span style="color:var(--muted);font-size:9px">объём ${fmt(entry.volume||0)}</span></div></div>`;
      }).join('');
      const label=session.programName?`${session.programName} · ${session.workoutName||'Тренировка'}`:(session.workoutName||'Тренировка');
      return `<article class="history-card"><div class="history-card-top"><div><div class="history-date">${safe(dateFmt(session.date))}</div><div class="history-name">${safe(label)}</div><div class="history-meta">${entries.length} упражнений · объём ${fmt(totalVol)} кг</div></div><span class="history-badge">ДЕНЬ</span></div>${rows}${entries.length>8?`<div class="history-entry"><span class="history-entry-sub">И ещё ${entries.length-8} упражнений</span></div>`:''}<div class="history-card-bottom"><span class="history-entry-sub">Записано ${safe(new Date(session.savedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}))}</span><div class="history-card-actions"><button type="button" class="secondary-button history-edit-button" data-action="edit-history-session" data-session="${safe(session.id)}">Доработать тренировку</button><button type="button" class="delete-button" data-action="delete-session" data-session="${safe(session.id)}">Удалить запись ×</button></div></div></article>`;
    }).join('');
  }
  function allExercisesForStats(){
    const map=new Map();
    for(const session of data.history)for(const entry of session.entries||[]){
      const id=String(entry.exerciseCatalogId||entry.exerciseId||entry.exerciseName||'');if(!id)continue;
      const catalog=(data.exerciseCatalog||[]).find(item=>item.id===id);
      map.set(id,{id,name:String(entry.exerciseName||catalog?.name||'Упражнение')});
    }
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  }
  function currentExerciseStats(){return $('#progressExercise').value;}
  function renderProgress(){const sel=$('#progressExercise');const old=sel.value;const exercises=allExercisesForStats();sel.innerHTML=exercises.length?exercises.map(e=>`<option value="${safe(e.id)}">${safe(e.name)}</option>`).join(''):'<option value="">Нет упражнений с записями в истории</option>';if(exercises.some(e=>e.id===old))sel.value=old;updateProgressForSelection();}
  function getEntriesForExercise(id){const arr=[];for(const s of data.history)for(const e of s.entries||[])if(String(e.exerciseCatalogId||e.exerciseId||e.exerciseName||'')===String(id)||e.exerciseId===id||e.exerciseCatalogId===id||(!e.exerciseId&&e.exerciseName===id))arr.push({...e,date:s.date,workout:s.workout,savedAt:s.savedAt});return arr.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||((a.savedAt||0)-(b.savedAt||0)));}
  function updateProgressForSelection(){const id=currentExerciseStats();if(!id){$('#metricWeight').textContent='—';$('#metricE1rm').textContent='—';$('#metricVolume').textContent='—';$('#metricBest').textContent='—';$('#metricWeightDelta').textContent='Нет записей';$('#weightChart').innerHTML='<div class="chart-empty">Здесь появится график после первой записи.</div>';$('#repsChart').innerHTML='<div class="chart-empty">Недостаточно данных для графика.</div>';return;}const es=getEntriesForExercise(id);const withWeight=es.filter(e=>num(e.weight)!==null&&num(e.weight)>0);const last=es[es.length-1];const lw=withWeight[withWeight.length-1];const prev=withWeight[withWeight.length-2];$('#metricWeight').textContent=lw?`${fmt(lw.weight)} кг`:'—';$('#metricE1rm').textContent=last?.e1rm?`${fmt(last.e1rm)} кг`:'—';$('#metricVolume').textContent=last?fmt(last.volume||0):'—';$('#metricBest').textContent=withWeight.length?`${fmt(Math.max(...withWeight.map(e=>e.weight)))} кг`:'—';$('#metricWeightDelta').textContent=lw&&prev?`${lw.weight-prev.weight>0?'+':''}${fmt(lw.weight-prev.weight)} кг к прошлому разу`:lw?'Последняя запись':'Нет записей с весом';drawChart($('#weightChart'),withWeight.slice(-10).map(e=>({label:dateFmt(e.date).replace(/\s+\d{4}$/,''),value:Number(e.weight)})),'кг');const repEntries=es.filter(e=>(e.reps||[]).length>0).map(e=>({label:dateFmt(e.date).replace(/\s+\d{4}$/,''),value:Math.max(...e.reps.filter(v=>Number.isFinite(v)))})).filter(e=>Number.isFinite(e.value));drawChart($('#repsChart'),repEntries.slice(-10),'повт.');}
  function drawChart(container,items,unit){if(items.length<2){container.innerHTML=`<div class="chart-empty">${items.length===0?'Здесь появится график после первой записи.':'Добавь ещё одну запись, чтобы увидеть динамику.'}</div>`;return;}const w=320,h=160,p={l:29,r:10,t:13,b:26};const vals=items.map(x=>x.value);let min=Math.min(...vals),max=Math.max(...vals);if(max===min){min=Math.max(0,min-2);max=max+2;}else{const pad=(max-min)*.18;min=Math.max(0,min-pad);max+=pad;}const x=i=>p.l+i*((w-p.l-p.r)/(items.length-1));const y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);const grid=[0,1,2,3].map(i=>{const val=min+(max-min)*i/3;const yy=y(val);return `<line x1="${p.l}" y1="${yy}" x2="${w-p.r}" y2="${yy}" stroke="#34392f" stroke-width="1"/><text x="${p.l-6}" y="${yy+3}" font-family="DM Mono,monospace" font-size="8" text-anchor="end" fill="#818879">${fmt(val)}</text>`;}).join('');const line=items.map((d,i)=>`${x(i)},${y(d.value)}`).join(' ');const marks=items.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d.value)}" r="3.2" fill="#c8f169" stroke="#1d201b" stroke-width="1.5"><title>${safe(d.label)}: ${fmt(d.value)} ${unit}</title></circle>`).join('');const labels=items.map((d,i)=>i===0||i===items.length-1||i===Math.floor(items.length/2)?`<text x="${x(i)}" y="${h-7}" font-family="DM Mono,monospace" font-size="8" text-anchor="${i===0?'start':i===items.length-1?'end':'middle'}" fill="#818879">${safe(d.label)}</text>`:'').join('');container.innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="График изменения ${unit}">${grid}<polyline points="${line}" fill="none" stroke="#c8f169" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${marks}${labels}</svg>`;}
  // Shareable history exports. The export is rendered locally; no workout data is uploaded.
  function shareExerciseKey(entry){return String(entry.exerciseCatalogId||entry.exerciseId||entry.exerciseName||'');}
  function shareLocalDateISO(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
  function shareDateInputDefaults(){
    const today=todayISO();const from=new Date();from.setDate(from.getDate()-29);
    $('#shareDateFrom').value=shareLocalDateISO(from);$('#shareDateTo').value=today;
  }
  function renderShareSessionOptions(){
    const select=$('#shareSessionSelect');const old=select.value;
    const sessions=[...data.history].filter(s=>(s.entries||[]).length).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0)));
    select.innerHTML=sessions.map(session=>{
      const label=`${dateFmt(session.date)} · ${session.programName?session.programName+' — ':''}${session.workoutName||'Тренировка'} · ${(session.entries||[]).length} упр.`;
      return `<option value="${safe(session.id)}">${safe(label)}</option>`;
    }).join('');
    if(sessions.some(s=>s.id===old))select.value=old;
    return sessions;
  }
  function renderShareExerciseOptions(){
    const list=$('#shareExerciseList');const old=new Set([...list.querySelectorAll('input[name="shareExercise"]:checked')].map(el=>el.value));
    const exercises=allExercisesForStats();
    list.innerHTML=exercises.length?exercises.map(ex=>`<label class="share-exercise-option"><input type="checkbox" name="shareExercise" value="${safe(ex.id)}" ${old.size===0||old.has(ex.id)?'checked':''}><span><strong>${safe(ex.name)}</strong><small>Есть записи в истории</small></span></label>`).join(''):'<p class="dialog-copy muted">Пока нет упражнений с результатами в истории.</p>';
  }
  function shareScopeMode(){return document.querySelector('input[name="shareScope"]:checked')?.value||'period';}
  function updateShareScopeUI(){
    const mode=shareScopeMode();$('#shareRangeControls').classList.toggle('hidden',mode==='session');$('#shareSessionControls').classList.toggle('hidden',mode!=='session');$('#shareExerciseControls').classList.toggle('hidden',mode!=='exercises');
    updateShareExportPreview();
  }
  function dateInShareRange(session,from,to){const date=String(session.date||'');return (!from||date>=from)&&(!to||date<=to);}
  function buildShareSelection(throwOnEmpty=true){
    const mode=shareScopeMode();let sessions=[];
    if(mode==='session'){
      const target=$('#shareSessionSelect').value;sessions=data.history.filter(session=>session.id===target&&Array.isArray(session.entries)&&session.entries.length);
    }else{
      const from=$('#shareDateFrom').value;const to=$('#shareDateTo').value;
      if(from&&to&&from>to){if(throwOnEmpty)throw new Error('Начальная дата не может быть позже конечной.');return {sessions:[],message:'Проверь порядок дат.'};}
      sessions=data.history.filter(session=>dateInShareRange(session,from,to)&&(session.entries||[]).length).map(session=>({...session,entries:[...(session.entries||[])]}));
      if(mode==='exercises'){
        const ids=new Set([...document.querySelectorAll('input[name="shareExercise"]:checked')].map(el=>el.value));
        if(!ids.size){if(throwOnEmpty)throw new Error('Выбери хотя бы одно упражнение.');return {sessions:[],message:'Отметь упражнения, которые нужно включить.'};}
        sessions=sessions.map(session=>({...session,entries:session.entries.filter(entry=>ids.has(shareExerciseKey(entry)))})).filter(session=>session.entries.length);
      }
    }
    sessions.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||((a.savedAt||0)-(b.savedAt||0)));
    if(!sessions.length&&throwOnEmpty)throw new Error(mode==='session'?'Выбери тренировку из истории.':'За выбранный период нет записанных результатов.');
    return {sessions,mode,from:$('#shareDateFrom').value,to:$('#shareDateTo').value};
  }
  function updateShareExportPreview(){
    const result=buildShareSelection(false);const sessions=result.sessions||[];const entries=sessions.reduce((sum,session)=>sum+session.entries.length,0);
    const exerciseCount=new Set(sessions.flatMap(session=>session.entries.map(shareExerciseKey))).size;
    const metrics=shareSelectionMetrics(result);
    $('#shareExportPreview').innerHTML=sessions.length?`<div class="share-preview-metrics"><div><strong>${sessions.length}</strong><small>${plural(sessions.length,'тренировка','тренировки','тренировок')}</small></div><div><strong>${exerciseCount}</strong><small>${plural(exerciseCount,'упражнение','упражнения','упражнений')}</small></div><div><strong>${fmt(metrics.sets)}</strong><small>подходов</small></div></div><p>В отчёте будет ${entries} ${plural(entries,'запись об упражнении','записи об упражнениях','записей об упражнениях')}${metrics.reps?` и ${fmt(metrics.reps)} повторений`:''}${metrics.weightedSets?`. Учтённый объём: ${fmt(metrics.volume)} кг × повторы`:''}.</p>`:`<p>${safe(result.message||'Нет данных для экспорта. Выбери другой период или тренировку.')}</p>`;
    const disabled=!sessions.length;$('#shareDownloadPngBtn').disabled=disabled;$('#shareDownloadPdfBtn').disabled=disabled;
  }
  function openShareExportDialog(){
    if(historyEditContext){notify('Сначала закончи или отмени доработку истории, затем открой экспорт.');return;}
    shareDateInputDefaults();renderShareSessionOptions();renderShareExerciseOptions();
    const radios=[...document.querySelectorAll('input[name="shareScope"]')];radios.forEach(r=>r.checked=r.value==='period');
    $('#shareExportStatus').textContent='Файл сформируется на этом устройстве. Данные на сервер не отправляются.';updateShareScopeUI();$('#shareExportDialog').showModal();
  }
  function shareEntryVolume(entry){
    if(Number.isFinite(Number(entry.volume))&&entry.volume!==null&&entry.volume!=='')return Number(entry.volume);
    const sets=shareEntrySets(entry);return sets.reduce((sum,set)=>sum+(set.weight!==null&&set.reps!==null?set.weight*set.reps:0),0);
  }
  function shareEntrySets(entry){
    if(Array.isArray(entry.setResults)&&entry.setResults.length)return entry.setResults.map(set=>({weight:num(set.weight),reps:num(set.reps)}));
    if(Array.isArray(entry.reps)&&entry.reps.length)return entry.reps.map(reps=>({weight:num(entry.weight),reps:num(reps)}));
    if(entry.weight!==undefined||entry.reps!==undefined)return [{weight:num(entry.weight),reps:num(entry.reps)}];
    return [];
  }
  function wrapShareText(ctx,text,maxWidth,maxLines=8){
    const words=String(text??'').trim().split(/\s+/).filter(Boolean);const lines=[];let line='';
    const splitLongWord=word=>{const parts=[];let part='';for(const char of word){if(part&&ctx.measureText(part+char).width>maxWidth){parts.push(part);part=char;}else part+=char;}if(part)parts.push(part);return parts;};
    for(const originalWord of words){const chunks=ctx.measureText(originalWord).width>maxWidth?splitLongWord(originalWord):[originalWord];for(const word of chunks){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word;if(lines.length>=maxLines)break;}else line=next;}if(lines.length>=maxLines)break;}
    if(line&&lines.length<maxLines)lines.push(line);
    const rendered=lines.join(' ');const original=String(text??'').trim();if(lines.length===maxLines&&rendered.length<original.length){let last=lines.length-1;while(lines[last]&&ctx.measureText(lines[last]+'…').width>maxWidth)lines[last]=lines[last].slice(0,-1);if(lines[last])lines[last]+='…';}
    return lines;
  }
  function roundedShareRect(ctx,x,y,w,h,r,fill,stroke=null){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  const SHARE_THEME={bg:'#031015',panel:'#0b2024',panelAlt:'#0a2024',line:'#234348',lime:'#c8f169',limeSoft:'#9ac34b',text:'#eff6ef',muted:'#a3b9bd',soft:'#d0dcdd',blue:'#80bcc5',orange:'#edbe76'};
  const SHARE_W=1200, SHARE_H=1697, SHARE_MARGIN=60;
  function shareCanvas(width,height){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;return canvas;}
  function shareFillBackground(ctx,w,h){ctx.save();ctx.globalAlpha=1;const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#06151a');g.addColorStop(.52,'#031015');g.addColorStop(1,'#04191a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();}
  function shareBrand(ctx,x,y,scale=1){ctx.save();ctx.font=`800 ${48*scale}px Arial,sans-serif`;ctx.fillStyle=SHARE_THEME.text;ctx.fillText('С',x,y);ctx.fillStyle=SHARE_THEME.lime;ctx.fillText('Е',x+36*scale,y);ctx.fillStyle=SHARE_THEME.text;ctx.fillText('Т',x+72*scale,y);ctx.font=`700 ${12*scale}px Arial,sans-serif`;ctx.fillStyle=SHARE_THEME.muted;ctx.fillText('Д Н Е В Н И К   Т Р Е Н И Р О В О К',x+128*scale,y-7*scale);ctx.restore();}
  function shareText(ctx,text,x,y,font,color,maxWidth=1000,align='left'){ctx.save();ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(String(text??''),x,y,maxWidth);ctx.restore();}
  function shareWrapped(ctx,text,x,y,maxWidth,lineHeight,font,color,maxLines=3){ctx.save();ctx.font=font;ctx.fillStyle=color;const lines=wrapShareText(ctx,text,maxWidth,maxLines);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight,maxWidth));ctx.restore();return lines.length;}
  function sharePill(ctx,x,y,w,label){roundedShareRect(ctx,x,y,w,38,19,'#1a2a20','#3b5638');shareText(ctx,label,x+w/2,y+25,'700 13px Arial,sans-serif',SHARE_THEME.lime,w-20,'center');}
  function shareDateSpan(selection){const dates=selection.sessions.map(s=>s.date).filter(Boolean).sort();if(!dates.length)return 'Без даты';if(dates[0]===dates[dates.length-1])return dateFmt(dates[0]);return `${dateFmt(dates[0])} — ${dateFmt(dates[dates.length-1])}`;}
  function shareEntryReps(entry){return shareEntrySets(entry).reduce((sum,set)=>sum+(set.reps!==null&&set.reps!==undefined?Number(set.reps)||0:0),0);}
  function shareEntrySetCount(entry){const sets=shareEntrySets(entry);return sets.length||Math.max(0,Number(entry.sets)||0);}
  function shareVolumeDetail(entry){const sets=shareEntrySets(entry);const valid=sets.filter(set=>set.weight!==null&&set.weight!==undefined&&set.reps!==null&&set.reps!==undefined);if(valid.length)return {volume:valid.reduce((sum,set)=>sum+Number(set.weight)*Number(set.reps),0),count:valid.length};if(Number.isFinite(Number(entry.volume))&&Number(entry.volume)>0)return {volume:Number(entry.volume),count:0};return {volume:0,count:0};}
  function shareSessionMetrics(session){const entries=session.entries||[];let sets=0,reps=0,volume=0,weightedSets=0;for(const entry of entries){sets+=shareEntrySetCount(entry);reps+=shareEntryReps(entry);const d=shareVolumeDetail(entry);volume+=d.volume;weightedSets+=d.count;}return {exercises:entries.length,sets,reps,volume,weightedSets};}
  function shareSelectionMetrics(selection){const sessions=selection.sessions||[];let entries=0,sets=0,reps=0,volume=0,weightedSets=0;const exercises=new Set();for(const session of sessions){const m=shareSessionMetrics(session);entries+=m.exercises;sets+=m.sets;reps+=m.reps;volume+=m.volume;weightedSets+=m.weightedSets;for(const entry of session.entries||[])exercises.add(shareExerciseKey(entry));}return {sessions:sessions.length,entries,exercises:exercises.size,sets,reps,volume,weightedSets};}
  function shareTimeline(selection){const map=new Map();for(const session of selection.sessions||[]){for(const entry of session.entries||[]){const key=shareExerciseKey(entry);if(!key)continue;if(!map.has(key))map.set(key,{key,name:String(entry.exerciseName||'Упражнение'),muscle:String(entry.muscle||''),points:[],reps:0,records:0});const item=map.get(key);const sets=shareEntrySets(entry);const weighted=sets.filter(s=>s.weight!==null&&s.weight!==undefined&&Number(s.weight)>0);const load=weighted.length?Math.max(...weighted.map(s=>Number(s.weight))):null;const loadSet=load===null?null:weighted.find(s=>Number(s.weight)===load);const repTotal=sets.reduce((sum,s)=>sum+(s.reps!==null&&s.reps!==undefined?Number(s.reps)||0:0),0);item.reps+=repTotal;item.records++;if(load!==null)item.points.push({date:session.date||'',savedAt:Number(session.savedAt)||0,sessionId:session.id,load,reps:loadSet&&loadSet.reps!==null?Number(loadSet.reps):null,sessionName:session.workoutName||session.programName||'Тренировка'});}}
    for(const item of map.values()){item.points.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||(a.savedAt-b.savedAt));const seen=new Map();for(const p of item.points){const k=p.sessionId||`${p.date}:${p.savedAt}`;if(!seen.has(k))seen.set(k,p);else if(p.load>seen.get(k).load)seen.set(k,p);}item.points=[...seen.values()].sort((a,b)=>(a.date||'').localeCompare(b.date||'')||(a.savedAt-b.savedAt));}
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  }
  function shareAnalysis(selection){const timelines=shareTimeline(selection);const changes=timelines.map(item=>{const points=item.points.filter(p=>p.load!==null&&p.load>0);if(points.length<2)return null;const first=points[0],last=points[points.length-1];const delta=last.load-first.load;const pct=first.load?delta/first.load*100:null;return {...item,first,last,delta,pct,pointCount:points.length};}).filter(Boolean);const gains=changes.filter(item=>item.delta>0).sort((a,b)=>(b.pct??0)-(a.pct??0)||b.delta-a.delta).slice(0,8);const reps=timelines.filter(item=>item.reps>0).sort((a,b)=>b.reps-a.reps).slice(0,8);return {timelines,changes,gains,reps};}
  function shareTitle(selection){if(selection.mode==='session'){const s=selection.sessions[0];return `Тренировка: ${s?.workoutName||'Тренировка'}`;}if(selection.mode==='exercises')return 'Результаты выбранных упражнений';return 'Твои результаты';}
  function shareSubtitle(selection){if(selection.mode==='session'){const s=selection.sessions[0];return `${dateFmt(s?.date)}${s?.programName?' · '+s.programName:''}`;}return shareDateSpan(selection);}
  function shareMetricsForPng(selection,metrics){const hasVolume=metrics.weightedSets>0;return selection.mode==='session'?[{v:metrics.entries,l:'УПРАЖНЕНИЙ'},{v:metrics.sets,l:'ПОДХОДОВ'},{v:metrics.reps,l:'ПОВТОРЕНИЙ'}]:[{v:metrics.sessions,l:'ТРЕНИРОВОК'},{v:metrics.exercises,l:'РАЗНЫХ УПРАЖНЕНИЙ'},{v:metrics.sets,l:'ПОДХОДОВ'},{v:metrics.reps,l:'ПОВТОРЕНИЙ'}];}
  const SHARE_ANATOMY_IMAGE=new Image();SHARE_ANATOMY_IMAGE.src='anatomy-pair.webp';
  const SHARE_ANATOMY_READY=new Promise(resolve=>{if(SHARE_ANATOMY_IMAGE.complete&&SHARE_ANATOMY_IMAGE.naturalWidth)resolve();else{SHARE_ANATOMY_IMAGE.onload=()=>resolve();SHARE_ANATOMY_IMAGE.onerror=()=>resolve();}});
  const ANATOMY_SECONDARY_FACTOR=.45;
  const ANATOMY_GROUPS=[
    {id:'chest',label:'Грудь',aliases:['грудь','грудные','грудные мышцы']},{id:'lats',label:'Широчайшие',aliases:['широчайшие','широчайшая']},{id:'traps',label:'Трапеции',aliases:['трапеции','трапеция']},{id:'upperBack',label:'Верх спины',aliases:['верх спины','ромбовидные']},{id:'biceps',label:'Бицепс',aliases:['бицепс','сгибатели локтя']},{id:'triceps',label:'Трицепс',aliases:['трицепс']},{id:'shoulders',label:'Плечи',aliases:['плечи','дельты','дельтовидные']},{id:'forearms',label:'Предплечья',aliases:['предплечья','предплечье']},{id:'abs',label:'Пресс',aliases:['пресс','мышцы живота']},{id:'neck',label:'Шея',aliases:['шея']},{id:'glutes',label:'Ягодицы',aliases:['ягодицы','ягодичные']},{id:'hamstrings',label:'Бицепс бедра',aliases:['бицепс бедра','задняя поверхность бедра']},{id:'quads',label:'Квадрицепс',aliases:['квадрицепс','квадрицепсы']},{id:'adductors',label:'Приводящие',aliases:['приводящие','аддукторы']},{id:'calves',label:'Икры',aliases:['икры','икроножные','камбаловидная']},{id:'spinalErectors',label:'Разгибатели спины',aliases:['разгибатели спины','разгибатели позвоночника','поясница']}
  ];
  const ANATOMY_ALIAS=new Map(ANATOMY_GROUPS.flatMap(group=>[group.label,...group.aliases].map(name=>[normalizeLibraryText(name),group.id])));
  function anatomyGroupId(value){const key=normalizeLibraryText(value);if(ANATOMY_ALIAS.has(key))return ANATOMY_ALIAS.get(key);for(const [alias,id] of ANATOMY_ALIAS){if(key.includes(alias)&&alias.length>3)return id;}return '';}
  function anatomyCatalogForEntry(entry){
    const ids=[entry.exerciseCatalogId,entry.catalogId,entry.exerciseId].filter(Boolean).map(String);let catalog=(data.exerciseCatalog||[]).find(item=>ids.includes(String(item.id)));if(catalog)return catalog;
    const placementIds=[entry.placementExerciseId,entry.exerciseId].filter(Boolean).map(String);
    for(const program of data.programs||[])for(const workout of program.workouts||[])for(const exercise of workout.exercises||[])if(placementIds.includes(String(exercise.id))){catalog=(data.exerciseCatalog||[]).find(item=>String(item.id)===String(exercise.catalogId));if(catalog)return catalog;}
    const name=normalizeLibraryText(entry.exerciseName||'');return (data.exerciseCatalog||[]).find(item=>normalizeLibraryText(item.name)===name)||null;
  }
  function anatomyTargetsForEntry(entry){
    const catalog=anatomyCatalogForEntry(entry),primaryText=String(catalog?.muscle||entry.muscle||'').split(/[\/,;·]/)[0].trim(),primary=anatomyGroupId(primaryText);
    const rawGroups=Array.isArray(catalog?.muscleGroups)&&catalog.muscleGroups.length?catalog.muscleGroups:(Array.isArray(entry.muscleGroups)&&entry.muscleGroups.length?entry.muscleGroups:String(catalog?.muscle||entry.muscle||'').split(/[\/,;·]/));
    const mapped=[...new Set(rawGroups.map(anatomyGroupId).filter(Boolean))];if(primary&&!mapped.includes(primary))mapped.unshift(primary);if(!mapped.length&&primary)return [{id:primary,weight:1}];if(!mapped.length)return [];
    return mapped.map((id,index)=>({id,weight:id===primary||(!primary&&index===0)?1:ANATOMY_SECONDARY_FACTOR}));
  }
  function shareAnatomyLoad(selection){
    const loads=new Map();for(const session of selection.sessions||[])for(const entry of session.entries||[]){const sets=shareEntrySetCount(entry);if(!sets)continue;for(const target of anatomyTargetsForEntry(entry))loads.set(target.id,(loads.get(target.id)||0)+sets*target.weight);}
    const total=[...loads.values()].reduce((sum,value)=>sum+value,0),max=Math.max(0,...loads.values());
    return ANATOMY_GROUPS.filter(group=>loads.has(group.id)).map(group=>({...group,load:loads.get(group.id),share:total?loads.get(group.id)/total*100:0,intensity:max?loads.get(group.id)/max:0})).sort((a,b)=>b.load-a.load);
  }
  function shareAnatomy(ctx,x,y,w,h,selection){
    if(!SHARE_ANATOMY_IMAGE.complete||!SHARE_ANATOMY_IMAGE.naturalWidth)return;
    const iw=SHARE_ANATOMY_IMAGE.naturalWidth,ih=SHARE_ANATOMY_IMAGE.naturalHeight,scale=Math.min(w/iw,h/ih),dw=iw*scale,dh=ih*scale;
    ctx.drawImage(SHARE_ANATOMY_IMAGE,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  }
  const SHARE_EXERCISE_IMAGES=new Map();
  function shareLoadExerciseImages(selection){
    const imageById=new Map();
    for(const exercise of PROGRAM.flatMap(workout=>workout.exercises||[])){const media=DEFAULT_MEDIA[exercise.id];if(media&&media.imageUrl)imageById.set(String(exercise.id),validImageLink(media.imageUrl));}
    for(const exercise of data.exerciseCatalog||[]){const id=String(exercise.id||'');const src=exercise.imageData||validImageLink(exercise.imageUrl)||'';if(id&&src){imageById.set(id,src);imageById.set(id.startsWith('catalog-')?id.slice(8):id,src);}}
    for(const program of data.programs||[])for(const workout of program.workouts||[])for(const exercise of workout.exercises||[]){const src=exercise.imageData||validImageLink(exercise.imageUrl)||'';const id=String(exercise.catalogId||exercise.id);if(src){imageById.set(id,src);imageById.set(id.startsWith('catalog-')?id.slice(8):id,src);}}
    for(const session of selection.sessions||[])for(const entry of session.entries||[])if(entry.exerciseId){const id=String(entry.exerciseId);const normalized=id.startsWith('catalog-')?id.slice(8):id;const src=entry.imageData||validImageLink(entry.imageUrl)||imageById.get(id)||imageById.get(normalized)||'';if(src)imageById.set(id,src);}
    const ids=[...new Set((selection.sessions||[]).flatMap(s=>s.entries||[]).map(e=>String(e.exerciseId||'')).filter(Boolean))];
    return Promise.all(ids.map(id=>new Promise(resolve=>{const src=imageById.get(id);if(!src){resolve();return;}const img=new Image();SHARE_EXERCISE_IMAGES.set(id,img);img.onload=()=>resolve();img.onerror=()=>resolve();img.src=src;if(img.complete&&img.naturalWidth)resolve();})));
  }
  function shareSparkline(ctx,x,y,w,h,points,color){
    const vals=(points||[]).map(p=>Number(p.load??p.value)||0);ctx.save();ctx.strokeStyle='#1c3a3e';ctx.lineWidth=1;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x,y+i*h/2);ctx.lineTo(x+w,y+i*h/2);ctx.stroke();}
    if(vals.length){const max=Math.max(1,...vals),min=Math.min(...vals);ctx.beginPath();vals.forEach((v,i)=>{const px=x+(vals.length===1?w/2:i*w/(vals.length-1)),py=y+h-4-(max===min?h/2:(v-min)/(max-min))*(h-8);i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.strokeStyle=color||SHARE_THEME.lime;ctx.lineWidth=3;ctx.stroke();vals.forEach((v,i)=>{const px=x+(vals.length===1?w/2:i*w/(vals.length-1)),py=y+h-4-(max===min?h/2:(v-min)/(max-min))*(h-8);ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fillStyle=color||SHARE_THEME.lime;ctx.fill();});}
    ctx.restore();
  }
  function sharePngCard(selection,metrics,analysis){
    const W=1200,H=selection.mode==='session'?Math.max(1700,Math.min(2200,1280+(selection.sessions[0]?.entries?.length||0)*120)):2200,M=58,INNER=W-M*2,canvas=shareCanvas(W,H),ctx=canvas.getContext('2d');shareFillBackground(ctx,W,H);
    const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#06151a');bg.addColorStop(.5,'#031015');bg.addColorStop(1,'#04191a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.strokeStyle='#40575a';ctx.lineWidth=2;ctx.strokeRect(2,2,W-4,H-4);shareBrand(ctx,M,104,.95);
    if(selection.mode==='session'){const s=selection.sessions[0];shareText(ctx,dateFmt(s.date),M,171,'400 24px Arial,sans-serif',SHARE_THEME.soft,500);shareWrapped(ctx,shareTitle(selection),M,224,INNER,47,'800 43px Arial,sans-serif',SHARE_THEME.text,2);}
    else{shareText(ctx,'Период',W-M,83,'400 16px Arial,sans-serif',SHARE_THEME.soft,180,'right');shareText(ctx,shareDateSpan(selection),W-M,108,'600 17px Arial,sans-serif',SHARE_THEME.text,280,'right');shareWrapped(ctx,'Отчёт о тренировках',M,190,INNER,46,'800 43px Arial,sans-serif',SHARE_THEME.text,1);}
    const cardY=selection.mode==='session'?270:245,gap=8,cw=(INNER-gap*3)/4;
    const items=selection.mode==='session'?[{v:metrics.entries,l:'упражнений',i:'✣'},{v:metrics.sets,l:'подходов',i:'▥'},{v:metrics.reps,l:'повторений',i:'⟳'},{v:metrics.weightedSets?fmt(metrics.volume):'—',l:'кг × повторы',i:'▣'}]:[{v:metrics.sessions,l:'тренировок',i:'▦'},{v:metrics.exercises,l:'упражнений',i:'✣'},{v:metrics.sets,l:'подходов',i:'▥'},{v:metrics.reps,l:'повторений',i:'⟳'}];
    items.forEach((it,i)=>{const x=M+i*(cw+gap);roundedShareRect(ctx,x,cardY,cw,120,17,'#0b2024','#234348');shareText(ctx,it.i,x+16,cardY+44,'700 27px Arial,sans-serif',SHARE_THEME.lime,38);shareText(ctx,String(it.v),x+58,cardY+42,'800 28px Arial,sans-serif',SHARE_THEME.text,cw-65);shareWrapped(ctx,it.l,x+58,cardY+76,cw-65,17,'500 15px Arial,sans-serif',SHARE_THEME.muted,2);});
    ctx.strokeStyle='#29464a';ctx.beginPath();ctx.moveTo(M,cardY+143);ctx.lineTo(W-M,cardY+143);ctx.stroke();
    const muscles=shareAnatomyLoad(selection).slice(0,7),musMax=Math.max(1,...shareAnatomyLoad(selection).slice(0,7).map(item=>item.load));let y=cardY+188;
    shareText(ctx,selection.mode==='session'?'Проработанные мышечные группы':'Распределение нагрузки по мышечным группам',M,y,'800 27px Arial,sans-serif',SHARE_THEME.text,INNER);y+=34;shareAnatomy(ctx,M+8,y+4,260,330,selection);
    muscles.forEach((item,i)=>{const yy=y+48+i*45;shareText(ctx,item.label,M+305,yy,'600 19px Arial,sans-serif',SHARE_THEME.soft,145);roundedShareRect(ctx,M+455,yy-18,210,18,9,'#102b2e');roundedShareRect(ctx,M+455,yy-18,210*item.load/musMax,18,9,i===0?SHARE_THEME.lime:'#8fca45');shareText(ctx,Math.round(item.share)+'%',M+690,yy,'700 17px Arial,sans-serif',SHARE_THEME.text,85,'left');});
    y+=365;ctx.strokeStyle='#29464a';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=35;
    if(selection.mode==='session'){
      shareText(ctx,'Основные упражнения',M,y,'800 25px Arial,sans-serif',SHARE_THEME.text,INNER);y+=28;const entries=selection.sessions[0].entries||[];
      entries.slice(0,7).forEach((e,i)=>{const yy=y+i*126;roundedShareRect(ctx,M,yy,INNER,114,14,i%2?'#07191d':'#0a2024','#18363b');const img=SHARE_EXERCISE_IMAGES.get(String(e.exerciseId||''));if(img&&img.complete&&img.naturalWidth){ctx.save();ctx.beginPath();ctx.roundRect(M+12,yy+12,68,90,9);ctx.clip();const iw=img.naturalWidth||1,ih=img.naturalHeight||1,sc=Math.max(68/iw,90/ih),dw=iw*sc,dh=ih*sc;ctx.drawImage(img,M+12+(68-dw)/2,yy+12+(90-dh)/2,dw,dh);ctx.restore();}else shareText(ctx,String(i+1).padStart(2,'0'),M+16,yy+28,'800 15px Arial,sans-serif',SHARE_THEME.lime,35);shareWrapped(ctx,e.exerciseName||'Упражнение',M+94,yy+30,300,22,'700 19px Arial,sans-serif',SHARE_THEME.text,2);const sets=shareEntrySets(e),pts=sets.filter(s=>s.weight!==null&&s.weight>0).map(s=>({load:s.weight}));shareText(ctx,shareEntrySetCount(e)+' подхода · '+shareEntryReps(e)+' повт.',M+94,yy+74,'500 15px Arial,sans-serif',SHARE_THEME.muted,280);shareSparkline(ctx,M+455,yy+24,225,58,pts,SHARE_THEME.lime);shareText(ctx,pts.length?fmt(Math.max(...pts.map(p=>p.load)))+' кг':'—',M+440,yy+88,'700 14px Arial,sans-serif',SHARE_THEME.lime,245,'right');shareText(ctx,sets.map(s=>s.weight===null?'—':fmt(s.weight)).join('   '),M+720,yy+48,'600 14px Arial,sans-serif',SHARE_THEME.soft,INNER-730);});
      y+=Math.min(entries.length,7)*126+28;roundedShareRect(ctx,M,y,INNER,112,14,'#0a2024','#234348');shareText(ctx,'“',M+20,y+57,'800 55px Georgia,serif',SHARE_THEME.lime,50);shareWrapped(ctx,'Хорошая тренировка. Объём складывается из записанных подходов и повторений.',M+70,y+43,INNER-100,23,'400 18px Arial,sans-serif',SHARE_THEME.soft,2);
    }else{
      shareText(ctx,'Топ по приросту рабочего веса',M,y,'800 25px Arial,sans-serif',SHARE_THEME.text,INNER);y+=28;const top=analysis.gains.slice(0,3),bw=(INNER-28)/3;
      for(let i=0;i<3;i++){const item=top[i],x=M+i*(bw+14);roundedShareRect(ctx,x,y,bw,245,15,'#0a2024','#234348');shareText(ctx,item?(item.delta>0?'+':'')+fmt(item.delta)+' кг':'—',x+18,y+43,'800 29px Arial,sans-serif',SHARE_THEME.lime,bw-36);shareWrapped(ctx,item?item.name:'Нужно больше записей',x+18,y+76,bw-36,20,'600 15px Arial,sans-serif',SHARE_THEME.text,2);shareSparkline(ctx,x+20,y+118,bw-40,80,item?item.points.filter(p=>p.load>0):[],SHARE_THEME.lime);if(item)shareText(ctx,fmt(item.first.load)+' → '+fmt(item.last.load)+' кг',x+18,y+220,'600 14px Arial,sans-serif',SHARE_THEME.soft,bw-36);}
      y+=276;ctx.strokeStyle='#29464a';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=32;shareText(ctx,'Личные рекорды',M,y,'800 24px Arial,sans-serif',SHARE_THEME.text,INNER/2);shareText(ctx,'Топ по количеству повторений',M+INNER/2,y,'800 24px Arial,sans-serif',SHARE_THEME.text,INNER/2);y+=26;
      analysis.reps.slice(0,5).forEach((item,i)=>{const yy=y+i*49;shareText(ctx,'◉',M+3,yy+15,'700 17px Arial,sans-serif',SHARE_THEME.lime,25);shareWrapped(ctx,item.name,M+32,yy+15,INNER/2-120,17,'600 14px Arial,sans-serif',SHARE_THEME.soft,1);shareText(ctx,fmt(item.reps),M+INNER/2-70,yy+15,'700 15px Arial,sans-serif',SHARE_THEME.text,60,'right');});
      analysis.reps.slice(0,5).forEach((item,i)=>{const yy=y+i*49;shareText(ctx,'⟳',M+INNER/2+5,yy+15,'700 17px Arial,sans-serif',SHARE_THEME.lime,25);shareWrapped(ctx,item.name,M+INNER/2+34,yy+15,INNER/2-125,17,'600 14px Arial,sans-serif',SHARE_THEME.soft,1);shareText(ctx,fmt(item.reps)+' повт.',W-M,yy+15,'700 14px Arial,sans-serif',SHARE_THEME.text,105,'right');});
      y+=245;ctx.strokeStyle='#29464a';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=30;shareText(ctx,'Список тренировок',M,y,'800 24px Arial,sans-serif',SHARE_THEME.text,INNER);y+=28;
      [...selection.sessions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3).forEach((session,i)=>{const yy=y+i*64,m=shareSessionMetrics(session);roundedShareRect(ctx,M,yy,INNER,54,10,i%2?'#07191d':'#0a2024','#18363b');shareText(ctx,dateFmt(session.date).replace(/\s+\d{4}$/,''),M+15,yy+23,'700 14px Arial,sans-serif',SHARE_THEME.lime,115);shareText(ctx,session.workoutName||session.programName||'Тренировка',M+150,yy+23,'600 15px Arial,sans-serif',SHARE_THEME.text,430);shareText(ctx,m.exercises+' упр. · '+m.sets+' подх.',M+610,yy+23,'500 13px Arial,sans-serif',SHARE_THEME.muted,220);shareText(ctx,m.weightedSets?fmt(m.volume)+' кг':'—',W-M-12,yy+23,'700 14px Arial,sans-serif',SHARE_THEME.lime,160,'right');});
      y+=Math.min(3,selection.sessions.length)*64+18;roundedShareRect(ctx,M,y,INNER,88,13,'#0a2024','#234348');shareText(ctx,'ИТОГ ПЕРИОДА',M+18,y+28,'800 12px Arial,sans-serif',SHARE_THEME.lime,INNER-36);shareWrapped(ctx,metrics.sessions+' тренировок · '+metrics.exercises+' упражнений · '+fmt(metrics.reps)+' повторений. Все показатели рассчитаны из сохранённой истории.',M+18,y+55,INNER-36,19,'400 14px Arial,sans-serif',SHARE_THEME.soft,2);
    }
    shareText(ctx,'СЕТ · ДНЕВНИК ТРЕНИРОВОК',M,H-42,'600 13px Arial,sans-serif',SHARE_THEME.muted,INNER/2);shareText(ctx,'sktkuzma.github.io/setlog',W-M,H-42,'700 13px Arial,sans-serif',SHARE_THEME.text,INNER/2,'right');return canvas;
  }
  function pdfPageCanvas(kicker,title,subtitle,pageNo,totalPages){const canvas=shareCanvas(SHARE_W,SHARE_H),ctx=canvas.getContext('2d');shareFillBackground(ctx,SHARE_W,SHARE_H);ctx.fillStyle=SHARE_THEME.lime;ctx.fillRect(0,0,7,SHARE_H);shareBrand(ctx,SHARE_MARGIN,76,.82);sharePill(ctx,SHARE_W-SHARE_MARGIN-180,38,180,kicker);shareText(ctx,title,SHARE_MARGIN,169,'800 43px Arial,sans-serif',SHARE_THEME.text,SHARE_W-SHARE_MARGIN*2);shareWrapped(ctx,subtitle,SHARE_MARGIN,208,SHARE_W-SHARE_MARGIN*2,26,'400 19px Arial,sans-serif',SHARE_THEME.muted,2);ctx.strokeStyle=SHARE_THEME.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(SHARE_MARGIN,250);ctx.lineTo(SHARE_W-SHARE_MARGIN,250);ctx.stroke();ctx.strokeStyle='#344b38';ctx.beginPath();ctx.moveTo(SHARE_MARGIN,SHARE_H-72);ctx.lineTo(SHARE_W-SHARE_MARGIN,SHARE_H-72);ctx.stroke();shareText(ctx,'СЕТ · ДНЕВНИК ТРЕНИРОВОК',SHARE_MARGIN,SHARE_H-40,'700 13px Arial,sans-serif',SHARE_THEME.muted,600);shareText(ctx,`${String(pageNo).padStart(2,'0')} / ${String(totalPages).padStart(2,'0')}`,SHARE_W-SHARE_MARGIN,SHARE_H-40,'700 13px Arial,sans-serif',SHARE_THEME.lime,150,'right');return {canvas,ctx};}
  function pdfMetric(ctx,x,y,w,value,label){roundedShareRect(ctx,x,y,w,112,15,'#0b2024','#234348');shareText(ctx,String(value),x+20,y+47,'800 34px Arial,sans-serif',SHARE_THEME.lime,w-40);shareWrapped(ctx,label,x+20,y+79,w-40,18,'700 12px Arial,sans-serif',SHARE_THEME.muted,2);}
  function pdfSectionTitle(ctx,title,x,y,width){shareText(ctx,title,x,y,'800 20px Arial,sans-serif',SHARE_THEME.text,width);}
  function pdfSummaryPage(selection,metrics,analysis,pageNo,totalPages){
    const {canvas,ctx}=pdfPageCanvas('01 / СВОДКА',selection.mode==='session'?'Тренировка: '+(selection.sessions[0]?.workoutName||'Результаты'):'Сводка периода',shareSubtitle(selection),pageNo,totalPages);
    const M=SHARE_MARGIN,W=SHARE_W,INNER=W-M*2,gap=12,cw=(INNER-gap*3)/4;
    const items=[{v:metrics.sessions,l:'ТРЕНИРОВОК'},{v:metrics.exercises,l:'УПРАЖНЕНИЙ'},{v:metrics.sets,l:'ПОДХОДОВ'},{v:metrics.reps,l:'ПОВТОРЕНИЙ'}];
    items.forEach((it,i)=>pdfMetric(ctx,M+i*(cw+gap),285,cw,it.v,it.l));
    let y=420;
    if(metrics.weightedSets>0){roundedShareRect(ctx,M,y,INNER,84,14,'#102529','#234348');shareText(ctx,'ОБЪЁМ ПО ЗАПИСАННЫМ ПОДХОДАМ',M+18,y+29,'700 12px Arial,sans-serif',SHARE_THEME.muted,INNER-36);shareText(ctx,fmt(metrics.volume)+' кг × повторы',M+18,y+62,'800 28px Arial,sans-serif',SHARE_THEME.text,INNER-36);y+=111;}
    pdfSectionTitle(ctx,'Распределение нагрузки по мышечным группам',M,y,INNER);y+=34;
    shareAnatomy(ctx,M+2,y+1,285,390,selection);
    const sorted=shareAnatomyLoad(selection).slice(0,7),max=Math.max(1,...shareAnatomyLoad(selection).slice(0,7).map(item=>item.load));
    sorted.forEach((item,i)=>{const yy=y+42+i*43;shareText(ctx,item.label,M+290,yy,'600 15px Arial,sans-serif',SHARE_THEME.soft,160);roundedShareRect(ctx,M+455,yy-16,220,15,7,'#102b2e');roundedShareRect(ctx,M+455,yy-16,220*item.load/max,15,7,i<2?SHARE_THEME.lime:'#8fca45');shareText(ctx,Math.round(item.share)+'%',M+760,yy,'700 13px Arial,sans-serif',SHARE_THEME.text,65,'right');});
    y+=386;ctx.strokeStyle='#29464a';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=30;
    pdfSectionTitle(ctx,metrics.weightedSets?'Основные упражнения по объёму':'Основные упражнения по повторениям',M,y,INNER);y+=34;
    const ranked=new Map();for(const session of selection.sessions)for(const entry of session.entries||[]){const key=shareExerciseKey(entry);if(!ranked.has(key))ranked.set(key,{name:String(entry.exerciseName||'Упражнение'),volume:0,reps:0});const item=ranked.get(key);item.volume+=shareVolumeDetail(entry).volume;item.reps+=shareEntryReps(entry);}
    const list=[...ranked.values()].sort((a,b)=>metrics.weightedSets?b.volume-a.volume:b.reps-a.reps).slice(0,4),maxV=Math.max(1,...list.map(a=>metrics.weightedSets?a.volume:a.reps));
    list.forEach((item,i)=>{const yy=y+i*51;shareText(ctx,String(i+1).padStart(2,'0'),M,yy+17,'800 12px Arial,sans-serif',SHARE_THEME.lime,32);shareWrapped(ctx,item.name,M+38,yy+17,340,16,'600 13px Arial,sans-serif',SHARE_THEME.text,1);const value=metrics.weightedSets?item.volume:item.reps;const bx=M+405,bw=INNER-530;roundedShareRect(ctx,bx,yy+1,bw,12,6,'#102b2e');roundedShareRect(ctx,bx,yy+1,bw*value/maxV,12,6,SHARE_THEME.lime);shareText(ctx,metrics.weightedSets?fmt(value):fmt(value)+' повт.',W-M,yy+16,'700 12px Arial,sans-serif',SHARE_THEME.lime,110,'right');});
    return canvas;
  }
  function pdfDrawLineChart(ctx,x,y,w,h,item){roundedShareRect(ctx,x,y,w,h,15,'#0b2024','#234348');const p=item.points.filter(pt=>pt.load>0).slice(-10);const first=p[0],last=p[p.length-1];shareWrapped(ctx,item.name,x+18,y+31,w-250,22,'800 18px Arial,sans-serif',SHARE_THEME.text,2);if(first&&last){const delta=last.load-first.load;shareText(ctx,`${delta>0?'+':''}${fmt(delta)} кг`,x+w-18,y+31,'800 17px Arial,sans-serif',delta>=0?SHARE_THEME.lime:SHARE_THEME.orange,185,'right');shareText(ctx,`${fmt(first.load)} → ${fmt(last.load)} кг`,x+w-18,y+55,'500 12px Arial,sans-serif',SHARE_THEME.muted,185,'right');}
    if(p.length<2){shareText(ctx,'Недостаточно записей с весом для графика.',x+18,y+100,'400 15px Arial,sans-serif',SHARE_THEME.muted,w-36);return;}
    const gx=x+66,gy=y+77,gw=w-100,gh=h-126,vals=p.map(pt=>pt.load);let min=Math.min(...vals),max=Math.max(...vals);if(max===min){min=Math.max(0,min-2);max+=2;}else{const pad=(max-min)*.15;min=Math.max(0,min-pad);max+=pad;}ctx.font='10px Arial,sans-serif';for(let i=0;i<4;i++){const value=min+(max-min)*i/3,yy=gy+gh-i*(gh/3);ctx.strokeStyle='#29382f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,yy);ctx.lineTo(gx+gw,yy);ctx.stroke();shareText(ctx,fmt(value),gx-10,yy+4,'400 10px Arial,sans-serif',SHARE_THEME.muted,45,'right');}const pointX=i=>gx+i*(gw/Math.max(1,p.length-1)),pointY=v=>gy+gh-(v-min)*gh/(max-min);ctx.beginPath();p.forEach((pt,i)=>i?ctx.lineTo(pointX(i),pointY(pt.load)):ctx.moveTo(pointX(i),pointY(pt.load)));ctx.strokeStyle=SHARE_THEME.lime;ctx.lineWidth=3.5;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();p.forEach((pt,i)=>{ctx.beginPath();ctx.arc(pointX(i),pointY(pt.load),4,0,Math.PI*2);ctx.fillStyle=SHARE_THEME.lime;ctx.fill();});[0,Math.floor((p.length-1)/2),p.length-1].filter((idx,i,a)=>a.indexOf(idx)===i).forEach(idx=>{const label=dateFmt(p[idx].date).replace(/\s+\d{4}$/,'');shareText(ctx,label,pointX(idx),gy+gh+20,'400 10px Arial,sans-serif',SHARE_THEME.muted,70,idx===0?'left':idx===p.length-1?'right':'center');});}
  function pdfProgressOverviewPage(items,analysis,metrics,pageNo,totalPages){
    const {canvas,ctx}=pdfPageCanvas('02 / ПРОГРЕСС','Прогресс и достижения','Сводка по сохранённым тренировкам за выбранный период',pageNo,totalPages);
    const M=SHARE_MARGIN,INNER=SHARE_W-M*2,gap=18,cw=(INNER-gap)/2;
    const item=items[0]||null;
    if(item){
      pdfDrawLineChart(ctx,M,285,700,320,item);
      const x=M+718,w=INNER-718;
      roundedShareRect(ctx,x,285,w,320,15,'#0b2024','#234348');
      shareText(ctx,'ИЗМЕНЕНИЕ',x+22,325,'800 13px Arial,sans-serif',SHARE_THEME.muted,w-44);
      const pts=item.points.filter(p=>p.load>0),first=pts[0],last=pts[pts.length-1],delta=last.load-first.load;
      shareText(ctx,(delta>0?'+':'')+fmt(delta)+' кг',x+22,390,'800 34px Arial,sans-serif',delta>=0?SHARE_THEME.lime:SHARE_THEME.orange,w-44);
      shareText(ctx,'БЫЛО',x+22,445,'700 11px Arial,sans-serif',SHARE_THEME.muted,w-44);
      shareText(ctx,fmt(first.load)+' кг',x+22,477,'700 22px Arial,sans-serif',SHARE_THEME.text,w-44);
      shareText(ctx,'СТАЛО',x+22,525,'700 11px Arial,sans-serif',SHARE_THEME.muted,w-44);
      shareText(ctx,fmt(last.load)+' кг',x+22,557,'700 22px Arial,sans-serif',SHARE_THEME.text,w-44);
      shareText(ctx,plural(pts.length,'запись с весом','записи с весом','записей с весом'),x+22,584,'500 12px Arial,sans-serif',SHARE_THEME.soft,w-44);
    }else{
      roundedShareRect(ctx,M,285,700,320,15,'#0b2024','#234348');
      shareText(ctx,'Пока нет сравнимого прогресса',M+24,340,'800 22px Arial,sans-serif',SHARE_THEME.text,650);
      shareWrapped(ctx,'Для графика нужны минимум две сохранённые тренировки с рабочим весом одного упражнения.',M+24,385,640,23,'400 16px Arial,sans-serif',SHARE_THEME.muted,4);
      const x=M+718,w=INNER-718;roundedShareRect(ctx,x,285,w,320,15,'#0b2024','#234348');
      shareText(ctx,'ЧТО МОЖНО ОЦЕНИТЬ',x+22,325,'800 13px Arial,sans-serif',SHARE_THEME.muted,w-44);
      shareWrapped(ctx,'Лучшие записанные веса и суммарные повторения показаны ниже. Новые точки появятся после сохранения следующих тренировок.',x+22,370,w-44,23,'400 15px Arial,sans-serif',SHARE_THEME.soft,7);
    }
    const y=650,leftX=M,rightX=M+cw+gap,panelH=390;
    roundedShareRect(ctx,leftX,y,cw,panelH,15,'#0b2024','#234348');
    roundedShareRect(ctx,rightX,y,cw,panelH,15,'#0b2024','#234348');
    pdfSectionTitle(ctx,'Личные рекорды',leftX+20,y+34,cw-40);
    pdfSectionTitle(ctx,'Топ по количеству повторений',rightX+20,y+34,cw-40);
    const records=analysis.timelines.map(t=>{const pts=t.points.filter(p=>p.load>0);if(!pts.length)return null;const best=pts.reduce((a,b)=>b.load>a.load?b:a);return {...t,best};}).filter(Boolean).sort((a,b)=>b.best.load-a.best.load).slice(0,5);
    const reps=analysis.reps.slice(0,5),rowY=y+68,rowH=58;
    if(!records.length)shareWrapped(ctx,'Пока нет записей с указанным весом.',leftX+22,rowY+25,cw-44,20,'400 14px Arial,sans-serif',SHARE_THEME.muted,2);
    records.forEach((r,i)=>{const yy=rowY+i*rowH;if(i%2===0)roundedShareRect(ctx,leftX+14,yy,cw-28,49,9,'#10272a');ctx.beginPath();ctx.arc(leftX+35,yy+24,13,0,Math.PI*2);ctx.fillStyle=i<3?SHARE_THEME.lime:'#43585a';ctx.fill();shareText(ctx,String(i+1),leftX+35,yy+29,'800 12px Arial,sans-serif','#102016',26,'center');shareWrapped(ctx,r.name,leftX+58,yy+20,cw-170,16,'600 13px Arial,sans-serif',SHARE_THEME.text,2);shareText(ctx,fmt(r.best.load)+' кг',leftX+cw-22,yy+29,'800 14px Arial,sans-serif',SHARE_THEME.lime,100,'right');});
    if(!reps.length)shareWrapped(ctx,'Пока нет сохранённых повторений.',rightX+22,rowY+25,cw-44,20,'400 14px Arial,sans-serif',SHARE_THEME.muted,2);
    reps.forEach((r,i)=>{const yy=rowY+i*rowH;if(i%2===0)roundedShareRect(ctx,rightX+14,yy,cw-28,49,9,'#10272a');ctx.beginPath();ctx.arc(rightX+35,yy+24,13,0,Math.PI*2);ctx.fillStyle=i<3?SHARE_THEME.lime:'#43585a';ctx.fill();shareText(ctx,String(i+1),rightX+35,yy+29,'800 12px Arial,sans-serif','#102016',26,'center');shareWrapped(ctx,r.name,rightX+58,yy+20,cw-170,16,'600 13px Arial,sans-serif',SHARE_THEME.text,2);shareText(ctx,fmt(r.reps),rightX+cw-22,yy+29,'800 14px Arial,sans-serif',SHARE_THEME.lime,100,'right');});
    pdfSectionTitle(ctx,'Что видно по данным',M,1090,INNER);
    const metricGap=12,metricW=(INNER-metricGap*3)/4,metricY=1120;
    [{v:metrics.sessions,l:'ТРЕНИРОВОК'},{v:metrics.exercises,l:'УПРАЖНЕНИЙ'},{v:metrics.sets,l:'ПОДХОДОВ'},{v:fmt(metrics.reps),l:'ПОВТОРЕНИЙ'}].forEach((m,i)=>pdfMetric(ctx,M+i*(metricW+metricGap),metricY,metricW,m.v,m.l));
    roundedShareRect(ctx,M,1260,INNER,250,15,'#0b2024','#234348');
    shareText(ctx,'КОРОТКИЙ ИТОГ',M+22,1300,'800 13px Arial,sans-serif',SHARE_THEME.lime,INNER-44);
    const notes=[];
    if(analysis.changes.length)notes.push('Сравнимый прогресс зафиксирован по '+analysis.changes.length+' '+(analysis.changes.length===1?'упражнению':'упражнениям')+'.');
    if(analysis.gains.length){const g=analysis.gains[0];notes.push('Наибольший прирост: '+g.name+' — +'+fmt(g.delta)+' кг ('+fmt(g.pct)+'%).');}
    if(reps.length)notes.push('Больше всего повторений записано в упражнении «'+reps[0].name+'» — '+fmt(reps[0].reps)+'.');
    if(!notes.length)notes.push('Пока недостаточно повторных записей, чтобы оценить динамику. Сводка отражает только сохранённые результаты.');
    notes.slice(0,3).forEach((line,i)=>shareWrapped(ctx,'• '+line,M+22,1345+i*48,INNER-44,20,'400 15px Arial,sans-serif',SHARE_THEME.soft,2));
    return canvas;
  }

  function pdfProgressPage(items,pageIndex,pageCount,pageNo,totalPages){
    const title=pageIndex===0?'Прогресс по упражнениям':'Прогресс по упражнениям · продолжение';
    const {canvas,ctx}=pdfPageCanvas('02 / ПРОГРЕСС',title,'Динамика рабочего веса по сохранённым тренировкам',pageNo,totalPages);
    const M=SHARE_MARGIN,INNER=SHARE_W-M*2,rows=items.slice(pageIndex*3,pageIndex*3+3);
    if(!rows.length){shareAnatomy(ctx,M+28,325,250,350,selection);roundedShareRect(ctx,M+320,340,INNER-320,230,16,'#0b2024','#234348');shareText(ctx,'Графики появятся здесь',M+345,390,'800 23px Arial,sans-serif',SHARE_THEME.text,INNER-365);shareWrapped(ctx,'Для сравнения нужны минимум две тренировки с записанным рабочим весом одного и того же упражнения. Сейчас показываем только то, что действительно есть в истории.',M+345,435,INNER-365,26,'400 17px Arial,sans-serif',SHARE_THEME.muted,5);}
    else rows.forEach((item,i)=>{const yy=285+i*(rows.length===1?0:425),cardH=rows.length===1?900:390;roundedShareRect(ctx,M,yy,INNER,cardH,16,'#0b2024','#234348');shareWrapped(ctx,item.name,M+24,yy+40,INNER-270,25,'800 21px Arial,sans-serif',SHARE_THEME.text,2);const pts=item.points.filter(p=>p.load>0).slice(-10);if(pts.length>=2){const vals=pts.map(p=>p.load),min=Math.min(...vals),max=Math.max(...vals);const gx=M+65,gy=yy+105,gw=INNER-115,gh=rows.length===1?650:190;for(let j=0;j<4;j++){const gy2=gy+j*gh/3;ctx.strokeStyle='#1c3a3e';ctx.beginPath();ctx.moveTo(gx,gy2);ctx.lineTo(gx+gw,gy2);ctx.stroke();}ctx.beginPath();pts.forEach((p,j)=>{const px=gx+j*gw/(pts.length-1),py=gy+gh-8-(max===min?gh/2:(p.load-min)/(max-min))*(gh-16);j?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.strokeStyle=SHARE_THEME.lime;ctx.lineWidth=4;ctx.stroke();pts.forEach((p,j)=>{const px=gx+j*gw/(pts.length-1),py=gy+gh-8-(max===min?gh/2:(p.load-min)/(max-min))*(gh-16);ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fillStyle=SHARE_THEME.lime;ctx.fill();});shareText(ctx,fmt(pts[0].load)+' кг',gx,gy+gh+28,'600 13px Arial,sans-serif',SHARE_THEME.muted,100);shareText(ctx,fmt(pts[pts.length-1].load)+' кг',gx+gw,gy+gh+28,'700 14px Arial,sans-serif',SHARE_THEME.lime,100,'right');shareText(ctx,(pts[pts.length-1].load>pts[0].load?'+':'')+fmt(pts[pts.length-1].load-pts[0].load)+' кг',M+INNER-18,yy+41,'800 18px Arial,sans-serif',SHARE_THEME.lime,150,'right');}else shareText(ctx,'Недостаточно точек для графика',M+24,yy+120,'400 16px Arial,sans-serif',SHARE_THEME.muted,INNER-48);});
    return canvas;
  }
  function pdfRankRow(ctx,x,y,w,h,rank,title,detail,value,color=SHARE_THEME.lime){roundedShareRect(ctx,x,y,w,h,13,'#0b2024','#234348');ctx.beginPath();ctx.arc(x+25,y+26,15,0,Math.PI*2);ctx.fillStyle=rank<=3?SHARE_THEME.lime:'#304137';ctx.fill();shareText(ctx,String(rank),x+25,y+31,'800 13px Arial,sans-serif','#102016',28,'center');shareWrapped(ctx,title,x+52,y+25,w-180,18,'700 14px Arial,sans-serif',SHARE_THEME.text,2);shareText(ctx,detail,x+52,y+h-17,'400 12px Arial,sans-serif',SHARE_THEME.muted,w-100);shareText(ctx,value,x+w-15,y+25,'800 15px Arial,sans-serif',color,110,'right');}
  function pdfAchievementsPage(analysis,pageNo,totalPages){
    const {canvas,ctx}=pdfPageCanvas('03 / ДОСТИЖЕНИЯ','Достижения периода','Только подтверждённые записи из истории тренировок',pageNo,totalPages);
    const M=SHARE_MARGIN,INNER=SHARE_W-M*2,gap=18,cw=(INNER-gap)/2,leftX=M,rightX=M+cw+gap;
    const topY=315,rowH=116,rowGap=12;
    pdfSectionTitle(ctx,'Топ по приросту рабочего веса',leftX,285,cw);
    pdfSectionTitle(ctx,'Топ по количеству повторений',rightX,285,cw);
    const gains=analysis.gains.slice(0,6),reps=analysis.reps.slice(0,6);
    if(!gains.length){roundedShareRect(ctx,leftX,topY,cw,rowH,13,'#0b2024','#234348');shareWrapped(ctx,'Для прироста нужны повторные записи веса одного упражнения.',leftX+18,topY+42,cw-36,19,'400 14px Arial,sans-serif',SHARE_THEME.muted,3);}
    gains.forEach((g,i)=>{const y=topY+i*(rowH+rowGap);roundedShareRect(ctx,leftX,y,cw,rowH,13,'#0b2024','#234348');shareText(ctx,(g.delta>0?'+':'')+fmt(g.delta)+' кг',leftX+18,y+32,'800 24px Arial,sans-serif',SHARE_THEME.lime,cw-36);shareWrapped(ctx,g.name,leftX+18,y+62,cw-36,18,'600 15px Arial,sans-serif',SHARE_THEME.text,2);shareSparkline(ctx,leftX+18,y+94,cw-36,14,g.points.filter(p=>p.load>0),SHARE_THEME.lime);});
    if(!reps.length){roundedShareRect(ctx,rightX,topY,cw,rowH,13,'#0b2024','#234348');shareWrapped(ctx,'Нет сохранённых повторений для рейтинга.',rightX+18,topY+42,cw-36,19,'400 14px Arial,sans-serif',SHARE_THEME.muted,3);}
    reps.forEach((item,i)=>{const y=topY+i*(rowH+rowGap);roundedShareRect(ctx,rightX,y,cw,rowH,13,'#0b2024','#234348');shareText(ctx,fmt(item.reps)+' повт.',rightX+18,y+32,'800 24px Arial,sans-serif',SHARE_THEME.lime,cw-36);shareWrapped(ctx,item.name,rightX+18,y+62,cw-36,18,'600 15px Arial,sans-serif',SHARE_THEME.text,2);shareText(ctx,item.records+' записей',rightX+18,y+101,'400 12px Arial,sans-serif',SHARE_THEME.muted,cw-36);});
    const usedRows=Math.max(gains.length,reps.length,1),noteY=Math.min(1110,topY+usedRows*(rowH+rowGap)+18);
    roundedShareRect(ctx,M,noteY,INNER,104,14,'#0b2024','#234348');
    shareText(ctx,'КАК ЧИТАТЬ ПОКАЗАТЕЛИ',M+20,noteY+31,'800 13px Arial,sans-serif',SHARE_THEME.lime,INNER-40);
    shareWrapped(ctx,'Прирост считается между первой и последней записью одного упражнения. Повторения суммируются только по сохранённым подходам. Если данных недостаточно, приложение не подменяет их предположениями.',M+20,noteY+61,INNER-40,20,'400 14px Arial,sans-serif',SHARE_THEME.soft,3);
    return canvas;
  }
  function pdfSessionLogPage(selection,sessions,pageIndex,pageCount,pageNo,totalPages){
    const {canvas,ctx}=pdfPageCanvas('04 / ЖУРНАЛ','Список тренировок',shareDateSpan(selection)+' · страница '+(pageIndex+1)+' из '+pageCount,pageNo,totalPages);
    const M=SHARE_MARGIN,W=SHARE_W,INNER=W-M*2,cols=[M,M+118,M+555,M+650,M+745,M+845];
    const headers=[['ДАТА',cols[0]],['ТИП ТРЕНИРОВКИ',cols[1]],['УПР.',cols[2]],['ПОДХ.',cols[3]],['ПОВТ.',cols[4]],['ОБЪЁМ (КГ)',cols[5]]];
    headers.forEach(([label,x])=>shareText(ctx,label,x,295,'700 11px Arial,sans-serif',SHARE_THEME.muted,120));
    ctx.strokeStyle='#29464a';ctx.beginPath();ctx.moveTo(M,315);ctx.lineTo(W-M,315);ctx.stroke();
    const rows=sessions.slice(pageIndex*11,pageIndex*11+11);
    rows.forEach((session,i)=>{const y=345+i*90,m=shareSessionMetrics(session);if(i%2===0)roundedShareRect(ctx,M,y-24,INNER,76,10,'#0a2024');shareText(ctx,dateFmt(session.date).replace(/\\s+\\d{4}$/,''),cols[0],y+7,'700 13px Arial,sans-serif',SHARE_THEME.text,120);shareWrapped(ctx,session.workoutName||session.programName||'Тренировка',cols[1],y+2,400,17,'700 14px Arial,sans-serif',SHARE_THEME.soft,2);shareText(ctx,String(m.exercises),cols[2],y+7,'700 14px Arial,sans-serif',SHARE_THEME.text,70);shareText(ctx,String(m.sets),cols[3],y+7,'700 14px Arial,sans-serif',SHARE_THEME.text,70);shareText(ctx,String(m.reps),cols[4],y+7,'700 14px Arial,sans-serif',SHARE_THEME.text,80);shareText(ctx,m.weightedSets?fmt(m.volume):'—',cols[5],y+7,'700 14px Arial,sans-serif',SHARE_THEME.lime,115);shareText(ctx,session.programName||'',cols[1],y+29,'400 11px Arial,sans-serif',SHARE_THEME.muted,390);});
    shareText(ctx,'Объём учитывает только подходы с указанными весом и повторениями.',M,SHARE_H-108,'400 13px Arial,sans-serif',SHARE_THEME.muted,INNER);return canvas;
  }
  function pdfSessionDetailsPage(selection,items,pageIndex,pageCount,pageNo,totalPages){const {canvas,ctx}=pdfPageCanvas('04 / РЕЗУЛЬТАТЫ','Упражнения и подходы',shareSubtitle(selection),pageNo,totalPages);const M=SHARE_MARGIN;const rows=items.slice(pageIndex*10,pageIndex*10+10);rows.forEach((entry,i)=>{const y=285+i*126;const h=112;roundedShareRect(ctx,M,y,SHARE_W-M*2,h,13,'#0b2024','#234348');shareWrapped(ctx,entry.exerciseName||'Упражнение',M+18,y+29,SHARE_W-M*2-36,21,'800 17px Arial,sans-serif',SHARE_THEME.text,2);shareText(ctx,`${entry.muscle||'Мышечная группа не указана'} · ${shareEntrySetCount(entry)} подхода`,M+18,y+53,'400 12px Arial,sans-serif',SHARE_THEME.muted,SHARE_W-M*2-36);const sets=shareEntrySets(entry);const setLine=sets.map((s,j)=>`${j+1}. ${s.weight===null?'—':fmt(s.weight)+' кг'} × ${s.reps===null?'—':fmt(s.reps)}`).join('    ·    ')||'Нет отдельных данных по подходам';shareWrapped(ctx,setLine,M+18,y+81,SHARE_W-M*2-36,18,'600 13px Arial,sans-serif',SHARE_THEME.lime,2);});return canvas;}
  async function prepareShareReport(selection){
    await Promise.all([SHARE_ANATOMY_READY,shareLoadExerciseImages(selection)]);const metrics=shareSelectionMetrics(selection),analysis=shareAnalysis(selection),pngCanvas=sharePngCard(selection,metrics,analysis),builders=[];
    builders.push((n,t)=>pdfSummaryPage(selection,metrics,analysis,n,t));
    if(selection.mode==='session'){
      const entries=selection.sessions[0]?.entries||[],chunks=Math.max(1,Math.ceil(entries.length/10));
      for(let i=0;i<chunks;i++)builders.push((n,t)=>pdfSessionDetailsPage(selection,entries,i,chunks,n,t));
    }else{
      const charts=analysis.timelines.filter(item=>item.points.filter(p=>p.load>0).length>=2).sort((a,b)=>{const ap=a.points.filter(p=>p.load>0),bp=b.points.filter(p=>p.load>0);return ((bp.at(-1).load-bp[0].load)/bp[0].load)-((ap.at(-1).load-ap[0].load)/ap[0].load);});
      if(charts.length<=1){builders.push((n,t)=>pdfProgressOverviewPage(charts,analysis,metrics,n,t));}
      else{const chartChunks=Math.max(1,Math.ceil(charts.length/3));for(let i=0;i<chartChunks;i++)builders.push((n,t)=>pdfProgressPage(charts,i,chartChunks,n,t));}
      builders.push((n,t)=>pdfAchievementsPage(analysis,n,t));
      const sessions=[...selection.sessions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0))),chunks=Math.max(1,Math.ceil(sessions.length/11));
      for(let i=0;i<chunks;i++)builders.push((n,t)=>pdfSessionLogPage(selection,sessions,i,chunks,n,t));
    }
    const pdfPages=builders.map((build,index)=>build(index+1,builders.length));
    return {pngCanvas,pdfPages,summary:{...metrics,changes:analysis.gains.length,repLeaders:analysis.reps.length}};
  }
  function downloadGeneratedBlob(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
  async function canvasToBlob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Браузер не смог сформировать изображение.')),type,quality));}
  function asciiBytes(text){return new TextEncoder().encode(text);}
  function concatenateBytes(parts){const length=parts.reduce((sum,part)=>sum+part.length,0);const out=new Uint8Array(length);let offset=0;for(const part of parts){out.set(part,offset);offset+=part.length;}return out;}
  function bytesFromJpegDataUrl(url){const binary=atob(url.slice(url.indexOf(',')+1));const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}
  function jpegPagesToPdf(jpegPages){
    const objects=[];objects[1]=asciiBytes('<< /Type /Catalog /Pages 2 0 R >>');
    const kids=[];jpegPages.forEach((jpeg,i)=>{const pageId=3+i*3,imageId=pageId+1,contentId=pageId+2;kids.push(`${pageId} 0 R`);
      objects[pageId]=asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      objects[imageId]={image:jpeg};
      const pageW=595.28,pageH=841.89,scale=Math.min(pageW/1200,pageH/1697),drawW=1200*scale,drawH=1697*scale,offsetX=(pageW-drawW)/2,offsetY=(pageH-drawH)/2;const content=asciiBytes('q\n0.0824 0.0902 0.0745 rg\n0 0 595.28 841.89 re f\nQ\nq\n'+drawW+' 0 0 '+drawH+' '+offsetX+' '+offsetY+' cm\n/Im0 Do\nQ');objects[contentId]=asciiBytes(`<< /Length ${content.length} >>\nstream\n${new TextDecoder().decode(content)}\nendstream`);
    });
    objects[2]=asciiBytes(`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${jpegPages.length} >>`);
    const chunks=[asciiBytes('%PDF-1.4\n%SETLOG\n')];const offsets=new Array(objects.length).fill(0);let total=chunks[0].length;
    for(let id=1;id<objects.length;id++){
      offsets[id]=total;const header=asciiBytes(`${id} 0 obj\n`);chunks.push(header);total+=header.length;
      let body;
      if(objects[id]&&objects[id].image){const jpeg=objects[id].image;const prefix=asciiBytes(`<< /Type /XObject /Subtype /Image /Width 1200 /Height 1697 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);const suffix=asciiBytes('\nendstream');body=concatenateBytes([prefix,jpeg,suffix]);}
      else body=objects[id];
      chunks.push(body);total+=body.length;const tail=asciiBytes('\nendobj\n');chunks.push(tail);total+=tail.length;
    }
    const xrefOffset=total;let xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for(let id=1;id<objects.length;id++)xref+=`${String(offsets[id]).padStart(10,'0')} 00000 n \n`;
    xref+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(asciiBytes(xref));return new Blob([concatenateBytes(chunks)],{type:'application/pdf'});
  }
  async function buildSharePdf(report){
    const jpegPages=report.pdfPages.map(page=>bytesFromJpegDataUrl(page.toDataURL('image/jpeg',.92)));
    return jpegPagesToPdf(jpegPages);
  }
  async function exportShareResults(format){
    const button=format==='png'?$('#shareDownloadPngBtn'):$('#shareDownloadPdfBtn');if(button.disabled)return;
    const original=button.textContent;button.disabled=true;button.textContent=format==='png'?'Готовим PNG…':'Готовим PDF…';$('#shareExportStatus').textContent='Формируем файл на устройстве…';
    try{
      const selection=buildShareSelection(true);const report=await prepareShareReport(selection);const filename=`setlog-results-${todayISO()}`;
      if(format==='png'){
        const blob=await canvasToBlob(report.pngCanvas,'image/png');downloadGeneratedBlob(blob,`${filename}.png`);
      }else{
        const pdf=await buildSharePdf(report);downloadGeneratedBlob(pdf,`${filename}.pdf`);
      }
      $('#shareExportStatus').textContent=format==='png'?`Карточка готова: ${report.summary.sessions} ${plural(report.summary.sessions,'тренировка','тренировки','тренировок')}, ${report.summary.entries} ${plural(report.summary.entries,'запись об упражнении','записи об упражнениях','записей об упражнениях')}.`:`PDF готов: ${report.pdfPages.length} ${plural(report.pdfPages.length,'страница','страницы','страниц')}, ${report.summary.sessions} ${plural(report.summary.sessions,'тренировка','тренировки','тренировок')}, ${report.summary.entries} ${plural(report.summary.entries,'запись об упражнении','записи об упражнениях','записей об упражнениях')}.`;notify(format==='png'?'Карточка PNG готова.':'Отчёт PDF готов.');
    }catch(error){console.error('SetLog share export failed:',error);$('#shareExportStatus').textContent=error.message||'Не удалось подготовить файл. Попробуй выбрать меньше данных.';notify(error.message||'Не удалось сформировать файл.');}
    finally{button.disabled=false;button.textContent=original;updateShareExportPreview();}
  }

  function downloadJSON(payload,filename){const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/vnd.setlog.backup+json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function exportData(){
    if(storageReadFailure){notify('Не удалось прочитать текущие данные. Они не перезаписаны. Попробуй восстановить дневник из сохранённой копии.');return;}
    const payload={app:'setlog-pwa',exportFormatVersion:3,schemaVersion:DATA_SCHEMA_VERSION,exportedAt:new Date().toISOString(),...data};
    downloadJSON(payload,`setlog-backup-${todayISO()}.setlog`);notify('Резервная копия готова. Сохрани файл в надёжном месте.');
    if(storageWriteBlocked){storageWriteBlocked=false;persist({snapshot:true,label:'После сохранения резервной копии'});}
  }
  function importData(file){
    const reader=new FileReader();reader.onload=async()=>{
      try{
        const imported=JSON.parse(reader.result);if(!imported||!Array.isArray(imported.history))throw new Error('bad');
        if(!confirm(`Восстановление заменит текущий дневник данными из выбранного файла. В копии ${imported.history.length} тренировок. Текущий дневник сначала будет сохранён отдельно. Продолжить?`))return;
        const oldData=data,oldProgram=activeProgramId,oldWorkout=activeWorkout,oldBlocked=storageWriteBlocked;
        const currentCopySaved=await saveSafetySnapshot('Перед восстановлением из файла');if(!currentCopySaved){notify('Не удалось сохранить текущую копию. Восстановление отменено; скачай резервную копию и попробуй снова.');return;}
        data=normalizeData(imported);activeProgramId=data.activeProgramId;activeWorkout=(getWorkouts(activeProgramId).find(w=>w.id===data.activeWorkoutId)||getWorkouts(activeProgramId)[0]||{}).id||'';storageWriteBlocked=false;storageReadFailure=null;
        if(!persist({snapshot:true,label:'После восстановления из файла'})){data=oldData;activeProgramId=oldProgram;activeWorkout=oldWorkout;storageWriteBlocked=oldBlocked;return;}
        renderTraining();renderHistory();renderProgress();notify('Данные импортированы и сохранены.');
      }catch(e){notify('Не удалось открыть эту резервную копию. Текущие данные оставлены без изменений.');}
    };reader.onerror=()=>notify('Не удалось прочитать выбранный файл.');reader.readAsText(file);
  }
  function addCustomExercise(){
    const name=$('#customExerciseName').value.trim();if(!name)return;const wk=getWorkout();if(!wk)return;
    const catalogId=`catalog-custom-${uid()}`;const key=draftKey();const oldDrafts=data.drafts[key]?JSON.parse(JSON.stringify(data.drafts[key])):null;
    const catalog=normalizeCatalogItem({id:catalogId,name,muscle:$('#customExerciseMuscle').value.trim()||'Своя группа',defaultTarget:$('#customExerciseTarget').value.trim()||'По плану',defaultSets:3,custom:true,imageUrl:'',imageData:'',videoUrl:''});
    data.exerciseCatalog.push(catalog);
    const ex={id:`placement-${uid()}`,catalogId,target:catalog.defaultTarget,sets:3,alt:''};wk.exercises.push(ex);
    data.drafts[key] ||= {};data.drafts[key][ex.id]=defaultDraft({...catalog,...ex});
    if(!persist({snapshot:true,label:'Добавлено своё упражнение'})){wk.exercises.pop();data.exerciseCatalog=data.exerciseCatalog.filter(item=>item.id!==catalogId);if(oldDrafts)data.drafts[key]=oldDrafts;else delete data.drafts[key];return;}
    $('#addExerciseDialog').close();$('#addExerciseForm').reset();renderTraining();openExerciseEditor(ex.id);notify('Упражнение добавлено в библиотеку и программу.');
  }
  function renderExerciseLibraryGroupOptions(){
    const select=$('#exerciseLibraryGroupFilter');if(!select)return;
    const current=select.value;const catalog=getAvailableExerciseLibrary();const counts=new Map();
    for(const item of catalog)for(const group of groupsForLibraryItem(item))counts.set(group,(counts.get(group)||0)+1);
    const preferred=importedExerciseLibraryGroups.filter(group=>counts.has(group));
    const additional=[...counts.keys()].filter(group=>!preferred.includes(group)).sort((a,b)=>a.localeCompare(b,'ru'));
    const groups=[...preferred,...additional];
    select.innerHTML=`<option value="">Все группы · ${catalog.length}</option>`+groups.map(group=>`<option value="${safe(group)}">${safe(group)} · ${counts.get(group)}</option>`).join('');
    select.value=groups.includes(current)?current:'';
  }
  function addLibraryExercise(){
    const catalogId=$('#exerciseLibrarySelect').value;const available=getAvailableExerciseLibrary().find(item=>item.id===catalogId);const wk=getWorkout();
    if(!available||!wk)return notify('Сначала выбери упражнение из библиотеки.');
    let catalog=data.exerciseCatalog.find(item=>item.id===catalogId);let catalogWasAdded=false;let oldCatalog=null;
    if(!catalog){catalog=normalizeCatalogItem(available);data.exerciseCatalog.push(catalog);catalogWasAdded=true;}
    else if(available.catalogSource==='coach'||available.sourceRecordId){
      oldCatalog=JSON.parse(JSON.stringify(catalog));
      // Keep the user's current name, muscle label and media. Add only source provenance and searchable aliases/categories that are missing.
      catalog.catalogSource=catalog.catalogSource||available.catalogSource||'coach';
      catalog.sourceRecordId=catalog.sourceRecordId||available.sourceRecordId||'';
      catalog.sourceOriginalName=catalog.sourceOriginalName||available.sourceOriginalName||'';
      catalog.sourceOriginalCatalogName=catalog.sourceOriginalCatalogName||available.sourceOriginalCatalogName||'';
      catalog.muscleGroups=[...new Set([...(catalog.muscleGroups||[]),...(available.muscleGroups||[])])];
      catalog.sourceMuscleGroups=[...new Set([...(catalog.sourceMuscleGroups||[]),...(available.sourceMuscleGroups||[])])];
      catalog.aliases=[...new Set([...(catalog.aliases||[]),...(available.aliases||[])])];
      catalog.videoDuration=catalog.videoDuration||available.videoDuration||'';
      catalog.classificationSource=catalog.classificationSource||available.classificationSource||'';
      catalog.sourceNotes=[...new Set([...(catalog.sourceNotes||[]),...(available.sourceNotes||[])])];
      catalog.sourceInfo=catalog.sourceInfo||available.sourceInfo||null;
    }
    const key=draftKey();const oldDrafts=data.drafts[key]?JSON.parse(JSON.stringify(data.drafts[key])):null;
    const placement={id:`placement-${uid()}`,catalogId:catalog.id,target:catalog.defaultTarget||'По плану',sets:clampSets(catalog.defaultSets),alt:''};
    wk.exercises.push(placement);data.drafts[key] ||= {};data.drafts[key][placement.id]=defaultDraft({...catalog,...placement});
    if(!persist({snapshot:true,label:`Добавлено в программу: ${catalog.name}`})){wk.exercises.pop();if(catalogWasAdded)data.exerciseCatalog=data.exerciseCatalog.filter(item=>item.id!==catalogId);else if(oldCatalog){const index=data.exerciseCatalog.findIndex(item=>item.id===catalogId);if(index>=0)data.exerciseCatalog[index]=oldCatalog;}if(oldDrafts)data.drafts[key]=oldDrafts;else delete data.drafts[key];return;}
    $('#addExerciseDialog').close();renderTraining();renderProgress();notify(`«${catalog.name}» добавлено в программу.`);
  }
  function renderExerciseLibraryOptions(filter){
    const select=$('#exerciseLibrarySelect');if(!select)return;const previous=select.value;
    const rawQuery=filter!==undefined?filter:($('#exerciseLibrarySearch')?.value||'');const query=normalizeLibraryText(rawQuery);const group=normalizeLibraryText($('#exerciseLibraryGroupFilter')?.value||'');
    const catalog=getAvailableExerciseLibrary();const used=new Set(getExercises().map(e=>e.catalogId));
    const items=catalog.filter(e=>{
      const groups=groupsForLibraryItem(e);const groupMatch=!group||groups.some(value=>normalizeLibraryText(value)===group);
      if(!groupMatch)return false;
      const fields=[e.name,e.muscle,e.id,e.sourceRecordId,e.sourceOriginalName,e.sourceOriginalCatalogName,e.videoDuration,...(e.aliases||[]),...(e.sourceMuscleGroups||[]),...groups];
      return !query||normalizeLibraryText(fields.join(' ')).includes(query);
    }).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    select.innerHTML=items.map(e=>`<option value="${safe(e.id)}">${safe(e.name)}${e.muscle?` — ${safe(e.muscle)}`:''}${e.videoDuration?` · ${safe(e.videoDuration)}`:''}${used.has(e.id)?' · уже в дне':''}</option>`).join('');
    if(items.some(e=>e.id===previous))select.value=previous;else if(items.length)select.selectedIndex=0;
    $('#exerciseLibraryEmpty')?.classList.toggle('hidden',items.length>0);
    $('#addLibraryExerciseBtn').disabled=items.length===0;
    const count=$('#exerciseLibraryCount');
    if(count){
      const sourceText=importedExerciseLibrary.length?`${importedExerciseLibrary.length} упражнений из библиотеки Coach`:(importedExerciseLibraryError?`Не удалось загрузить внешний каталог (${importedExerciseLibraryError})`:'Загружаем каталог…');
      count.textContent=`Показано ${items.length} из ${catalog.length}. ${sourceText}. Для добавленных из каталога стартовые значения: 8–12 повторений, 3 подхода.`;
    }
  }
  function buildHistoryEditContext(session){
    const originalSession=JSON.parse(JSON.stringify(session));
    const exercises=[];const draft={};
    for(let index=0;index<(session.entries||[]).length;index++){
      const entry=session.entries[index]||{};
      const catalogId=String(entry.exerciseCatalogId||entry.exerciseId||'');
      const catalog=(data.exerciseCatalog||[]).find(item=>item.id===catalogId)||null;
      const results=Array.isArray(entry.setResults)&&entry.setResults.length?entry.setResults:null;
      const savedReps=Array.isArray(entry.reps)?entry.reps:[];
      const count=Math.max(1,Math.min(MAX_LOGGED_SETS,results?results.length:(Number(entry.sets)||savedReps.length||1)));
      const sets=Array.from({length:count},(_,i)=>{
        const result=results?.[i];
        const weight=result?result.weight:entry.weight;
        const reps=result?result.reps:savedReps[i];
        return {weight:weight===null||weight===undefined?'':String(weight),reps:reps===null||reps===undefined?'':String(reps)};
      });
      const id=`history-edit-${index}-${String(entry.placementExerciseId||catalogId||index).replace(/[^a-zA-Z0-9_-]/g,'-').slice(-28)}`;
      const exercise={
        ...(catalog||{}),id,catalogId:catalogId||id,
        name:String(entry.exerciseName||catalog?.name||'Упражнение'),
        muscle:String(entry.muscle||catalog?.muscle||'Своя группа'),
        target:String(entry.target||catalog?.defaultTarget||'По плану'),
        sets:count,alt:'',altVideoUrl:'',replacesFromName:'',
        historyEntryIndex:index
      };
      exercises.push(exercise);
      draft[id]={rir:entry.rir===null||entry.rir===undefined?'':String(entry.rir),notes:String(entry.notes||''),sets};
    }
    return {
      sessionId:session.id,originalSession, date:String(session.date||todayISO()),
      programId:session.programId||DEFAULT_PROGRAM_ID,programName:session.programName||'Тренировка',
      workoutId:session.workout||'',workoutName:session.workoutName||'Тренировка',
      returnState:{date:$('#workoutDate').value||todayISO(),programId:activeProgramId,workoutId:activeWorkout},
      exercises,draft,startedAt:Date.now()
    };
  }
  function beginHistoryEdit(sessionId){
    if(historyEditContext)return notify('Сначала закончи или отмени текущую доработку истории.');
    const session=data.history.find(item=>item.id===sessionId);if(!session)return notify('Не удалось найти эту запись истории. Обнови список и попробуй ещё раз.');
    if(!Array.isArray(session.entries)||!session.entries.length)return notify('В этой записи нет упражнений для доработки.');
    ensureDraft();if(!persist({snapshot:false}))return;
    const context=buildHistoryEditContext(session);
    historyEditContext=context;
    if(!persistHistoryEditContext()){historyEditContext=null;return;}
    const detail=$('#exerciseDetailDialog');if(detail?.open)detail.close();currentDetailExerciseId=null;
    $('#workoutDate').value=context.date;switchView('training');renderTraining();
    notify('Открыта доработка истории. Текущий черновик тренировки сохранён отдельно.');
  }
  function cancelHistoryEdit(){
    if(!historyEditContext)return;
    if(!confirm('Отменить доработку? Историческая запись останется без изменений, а текущий черновик вернётся на экран.'))return;
    const returnState=historyEditContext.returnState||{};clearHistoryEditContext();
    if(data.programs.some(item=>item.id===returnState.programId))activeProgramId=returnState.programId;
    if(getWorkouts(activeProgramId).some(item=>item.id===returnState.workoutId))activeWorkout=returnState.workoutId;
    $('#workoutDate').value=returnState.date||todayISO();$('#todayLabel').textContent=dateFmt($('#workoutDate').value).toUpperCase();
    const detail=$('#exerciseDetailDialog');if(detail?.open)detail.close();currentDetailExerciseId=null;
    renderTraining();switchView('training');notify('Доработка отменена. Текущий черновик восстановлен.');
  }
  function applyHistoryEdit(){
    const ctx=historyEditContext;if(!ctx)return;
    const index=data.history.findIndex(item=>item.id===ctx.sessionId);
    if(index<0){notify('Исходная запись не найдена в текущей истории. Черновик доработки сохранён на этом устройстве; ничего не перезаписано.');return;}
    const current=data.history[index];
    if(JSON.stringify(current)!==JSON.stringify(ctx.originalSession)){
      notify('Эта запись истории изменилась после открытия. Ничего не перезаписано. Отмени доработку и открой актуальную запись заново.');return;
    }
    const entries=[];
    for(const ex of ctx.exercises){
      const updated=entryFromDraft(ex,ctx.draft[ex.id]||{});if(!updated)continue;
      const original=ctx.originalSession.entries?.[ex.historyEntryIndex]||{};
      entries.push({...original,...updated,
        exerciseId:original.exerciseId||updated.exerciseId,
        exerciseCatalogId:original.exerciseCatalogId||updated.exerciseCatalogId,
        placementExerciseId:original.placementExerciseId||original.exerciseId||updated.placementExerciseId,
        exerciseName:ex.name,muscle:ex.muscle||original.muscle||''
      });
    }
    if(!entries.length){notify('Нельзя сохранить пустую тренировку. Заполни хотя бы один подход.');return;}
    const updatedSession={...current,entries,editedAt:Date.now()};
    data.history[index]=updatedSession;
    if(!persist({snapshot:true,label:'Изменена историческая тренировка'})){data.history[index]=current;return;}
    const returnState=ctx.returnState||{};clearHistoryEditContext();
    if(data.programs.some(item=>item.id===returnState.programId))activeProgramId=returnState.programId;
    if(getWorkouts(activeProgramId).some(item=>item.id===returnState.workoutId))activeWorkout=returnState.workoutId;
    $('#workoutDate').value=returnState.date||todayISO();$('#todayLabel').textContent=dateFmt($('#workoutDate').value).toUpperCase();
    const detail=$('#exerciseDetailDialog');if(detail?.open)detail.close();currentDetailExerciseId=null;
    renderTraining();renderHistory();renderProgress();switchView('training');
    notify('История обновлена. Текущий незавершённый черновик восстановлен.');
  }
  function deleteSession(id){if(!confirm('Удалить эту тренировку из истории?'))return;const old=data.history;data.history=data.history.filter(s=>s.id!==id);if(!persist({snapshot:true,label:'Удалена запись истории'})){data.history=old;return;}renderHistory();renderProgress();renderTraining();notify('Запись удалена.');}
  function deleteExercise(id){if(!confirm('Убрать упражнение из этой программы? История и запись в общей библиотеке сохранятся.'))return;const wk=getWorkout();if(!wk)return;const oldExercises=wk.exercises.slice();const oldDrafts=JSON.parse(JSON.stringify(data.drafts));wk.exercises=wk.exercises.filter(e=>e.id!==id);for(const [key,d] of Object.entries(data.drafts)){const parts=key.split('::');if(parts[1]===activeProgramId&&parts[2]===activeWorkout&&d)delete d[id];}if(!persist({snapshot:true,label:'Упражнение убрано из программы'})){wk.exercises=oldExercises;data.drafts=oldDrafts;return;}renderTraining();renderProgress();notify('Упражнение убрано из программы; история сохранена.');}
  function moveExercise(id,delta){const wk=getWorkout();if(!wk)return;const idx=wk.exercises.findIndex(e=>e.id===id);const next=idx+delta;if(idx<0||next<0||next>=wk.exercises.length)return;[wk.exercises[idx],wk.exercises[next]]=[wk.exercises[next],wk.exercises[idx]];if(!persist({snapshot:true,label:'Изменён порядок упражнений'})){[wk.exercises[idx],wk.exercises[next]]=[wk.exercises[next],wk.exercises[idx]];return;}renderTraining();}
  function moveWorkout(delta){const p=currentProgram();const idx=p.workouts.findIndex(w=>w.id===activeWorkout);const next=idx+delta;if(idx<0||next<0||next>=p.workouts.length)return;[p.workouts[idx],p.workouts[next]]=[p.workouts[next],p.workouts[idx]];if(!persist({snapshot:true,label:'Изменён порядок тренировочных дней'})){[p.workouts[idx],p.workouts[next]]=[p.workouts[next],p.workouts[idx]];return;}renderTraining();refreshProgramDialogControls();}
  function moveProgram(delta){const idx=data.programs.findIndex(p=>p.id===activeProgramId);const next=idx+delta;if(idx<0||next<0||next>=data.programs.length)return;[data.programs[idx],data.programs[next]]=[data.programs[next],data.programs[idx]];if(!persist({snapshot:true,label:'Изменён порядок программ'})){[data.programs[idx],data.programs[next]]=[data.programs[next],data.programs[idx]];return;}renderProgramSelector();refreshProgramDialogControls();}
  function updateDraftFromInput(input){const id=input.dataset.exercise;const field=input.dataset.field;const dr=ensureDraft()[id];if(!dr)return;if((field==='weight'||field==='reps')&&input.dataset.setIndex!==undefined){const idx=Number(input.dataset.setIndex);if(!dr.sets[idx])dr.sets[idx]={weight:'',reps:''};dr.sets[idx][field]=input.value;}else dr[field]=input.value;const card=$(`[data-exercise-card="${CSS.escape(id)}"]`);if(card)card.classList.toggle('has-data',hasDraftData(dr));const row=input.closest('.detail-set-row');if(row){const set=dr.sets[Number(input.dataset.setIndex)]||{};row.classList.toggle('has-input',num(set.weight)!==null||String(set.reps||'').trim()!=='');}if(historyEditContext)persistHistoryEditContext();else persist();updateFilledCount();}
  function switchWorkout(id){if(!getWorkouts().some(w=>w.id===id))return;const old=activeWorkout;activeWorkout=id;if(!persist()){activeWorkout=old;return;}renderTraining();}
  function switchProgram(id){if(!data.programs.some(p=>p.id===id))return;const oldProgram=activeProgramId,oldWorkout=activeWorkout;activeProgramId=id;activeWorkout=(getWorkouts(id)[0]||{}).id||'';if(!persist()){activeProgramId=oldProgram;activeWorkout=oldWorkout;return;}renderTraining();}
  function refreshProgramDialogControls(){
    const p=currentProgram(),idx=data.programs.findIndex(x=>x.id===activeProgramId),widx=(p?.workouts||[]).findIndex(w=>w.id===activeWorkout);
    const up=$('#moveWorkoutEarlierBtn'),down=$('#moveWorkoutLaterBtn'),pup=$('#moveProgramEarlierBtn'),pdown=$('#moveProgramLaterBtn');
    if(up)up.disabled=widx<=0;if(down)down.disabled=widx<0||widx>=p.workouts.length-1;
    if(pup)pup.disabled=idx<=0;if(pdown)pdown.disabled=idx<0||idx>=data.programs.length-1;
  }
  function openProgramDialog(){const p=currentProgram();$('#renameProgramName').value=p?.name||'';$('#newProgramName').value='';$('#newProgramTemplate').value='copy';$('#renameWorkoutName').value=getWorkout()?.name||'';$('#deleteProgramBtn').disabled=data.programs.length<=1;refreshProgramDialogControls();$('#programDialog').showModal();}
  function createProgram(){const name=$('#newProgramName').value.trim();if(!name){notify('Введи название новой программы.');return;}const oldProgram=activeProgramId,oldWorkout=activeWorkout;const id=`program-${uid()}`;let workouts=[];if($('#newProgramTemplate').value==='copy'){workouts=getWorkouts().map(w=>({id:`workout-${uid()}`,name:w.name,desc:w.desc||'',exercises:w.exercises.map(e=>({...e,id:`placement-${uid()}`}))}));}else workouts=[{id:`workout-${uid()}`,name:'Тренировка 1',desc:'',exercises:[]}];const p={id,name,workouts};data.programs.push(p);activeProgramId=id;activeWorkout=workouts[0]?.id||'';if(!persist({snapshot:true,label:`Создана программа: ${name}`})){data.programs=data.programs.filter(item=>item.id!==id);activeProgramId=oldProgram;activeWorkout=oldWorkout;return;}$('#programDialog').close();renderTraining();renderProgress();notify('Новая программа создана.');}
  function renameProgram(){const name=$('#renameProgramName').value.trim();if(!name)return notify('Название не должно быть пустым.');const oldName=currentProgram().name;currentProgram().name=name;if(!persist({snapshot:true,label:'Переименована программа'})){currentProgram().name=oldName;return;}renderTraining();if(activeView==='history')renderHistory();$('#programDialog').close();notify('Название программы изменено.');}
  function deleteProgram(){if(data.programs.length<=1)return notify('Нельзя удалить единственную программу.');const p=currentProgram();if(!confirm(`Удалить программу «${p.name}»? История тренировок и общая библиотека упражнений останутся.`))return;const oldPrograms=data.programs,oldProgramId=activeProgramId,oldWorkoutId=activeWorkout;data.programs=data.programs.filter(x=>x.id!==activeProgramId);activeProgramId=data.programs[0].id;activeWorkout=(getWorkouts()[0]||{}).id||'';if(!persist({snapshot:true,label:`Удалена программа: ${p.name}`})){data.programs=oldPrograms;activeProgramId=oldProgramId;activeWorkout=oldWorkoutId;return;}$('#programDialog').close();renderTraining();renderProgress();notify('Программа удалена; история и библиотека сохранены.');}
  function addWorkoutDay(){const p=currentProgram();const oldWorkout=activeWorkout;const name=`Тренировка ${p.workouts.length+1}`;const w={id:`workout-${uid()}`,name,desc:'',exercises:[]};p.workouts.push(w);activeWorkout=w.id;if(!persist({snapshot:true,label:'Добавлен тренировочный день'})){p.workouts.pop();activeWorkout=oldWorkout;return;}$('#programDialog').close();renderTraining();notify('Добавлен новый день. Теперь добавь в него упражнения.');}
  function renameWorkout(){const name=$('#renameWorkoutName').value.trim();if(!name)return notify('Название дня не должно быть пустым.');const w=getWorkout();if(!w)return;const oldName=w.name;w.name=name;if(!persist({snapshot:true,label:'Переименован тренировочный день'})){w.name=oldName;return;}renderTraining();$('#programDialog').close();notify('Название дня изменено.');}
  function openExerciseEditor(id){const ex=getExercises().find(e=>e.id===id);if(!ex)return;editingExerciseId=id;pendingImageData=null;$('#editExerciseName').value=ex.name||'';$('#editExerciseMuscle').value=ex.muscle||'';$('#editExerciseTarget').value=ex.target||'';$('#editExerciseSets').value=String(ex.sets||3);$('#editExerciseAlt').value=ex.alt||'';$('#editExerciseAltVideoUrl').value=ex.altVideoUrl||'';$('#editExerciseImageUrl').value=ex.imageUrl||'';$('#editExerciseVideoUrl').value=ex.videoUrl||'';$('#editExerciseYoutubeUrl').value=ex.youtubeUrl||'';$('#editExerciseImageFile').value='';$('#removeExerciseImage').checked=false;$('#editExerciseReplacementSearch').value='';renderReplacementGroupOptions();renderReplacementOptions();const src=ex.imageData||validImageLink(ex.imageUrl);$('#exerciseImagePreview').src=src||'';$('#exerciseImagePreview').classList.toggle('hidden',!src);$('#exerciseImagePlaceholder').classList.toggle('hidden',!!src);$('#exerciseDialog').showModal();}
  function compressImageFile(file){return new Promise((resolve,reject)=>{if(!file||!file.type.startsWith('image/'))return reject(new Error('Выбери файл изображения.'));const reader=new FileReader();reader.onerror=()=>reject(new Error('Не удалось прочитать картинку.'));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('Файл не удалось открыть как изображение.'));image.onload=()=>{const max=640,scale=Math.min(1,max/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',0.72));};image.src=reader.result;};reader.readAsDataURL(file);});}
  async function saveExerciseEdit(){
    const instance=getWorkout()?.exercises.find(e=>e.id===editingExerciseId);const ex=getExercises().find(e=>e.id===editingExerciseId);if(!ex||!instance)return;
    const name=$('#editExerciseName').value.trim();if(!name)return notify('Введи название упражнения.');
    const imageUrl=$('#editExerciseImageUrl').value.trim();const videoUrl=$('#editExerciseVideoUrl').value.trim();const youtubeUrl=$('#editExerciseYoutubeUrl').value.trim();const altVideoUrl=$('#editExerciseAltVideoUrl').value.trim();
    if(youtubeUrl&&!isYoutubeLink(youtubeUrl))return notify('Для YouTube укажи ссылку вида https://youtube.com/… или https://youtu.be/…');
    if(imageUrl&&!validImageLink(imageUrl))return notify('Укажи ссылку https:// или выбери изображение из библиотеки приложения.');
    if(videoUrl&&!validLink(videoUrl,true))return notify('Для видео укажи корректную https:// или tg:// ссылку.');
    if(altVideoUrl&&!validLink(altVideoUrl,true))return notify('Для видео замены укажи корректную https:// или tg:// ссылку.');
    let imageData=ex.imageData||'';
    try{const file=$('#editExerciseImageFile').files?.[0];if(file)imageData=pendingImageData||await compressImageFile(file);}catch(e){return notify(e.message||'Не удалось обработать картинку.');}
    let finalImageUrl=imageUrl;if($('#removeExerciseImage').checked){imageData='';finalImageUrl='';}if(imageUrl)imageData='';
    const catalog=data.exerciseCatalog.find(item=>item.id===ex.catalogId);if(!catalog)return notify('Карточка упражнения не найдена в библиотеке. Обнови резервную копию и попробуй ещё раз.');
    // Names, muscle group and media are canonical library fields; prescription stays per program placement.
    const oldCatalog={...catalog},oldInstance={...instance};
    catalog.name=name;catalog.muscle=$('#editExerciseMuscle').value.trim()||'Своя группа';catalog.imageUrl=finalImageUrl;catalog.imageData=imageData;catalog.videoUrl=videoUrl;catalog.youtubeUrl=youtubeUrl;catalog.updatedAt=Date.now();
    instance.target=$('#editExerciseTarget').value.trim()||'По плану';instance.sets=clampSets($('#editExerciseSets').value);instance.alt=$('#editExerciseAlt').value.trim();instance.altVideoUrl=altVideoUrl;
    if(!persist({snapshot:true,label:`Изменено упражнение: ${name}`})){Object.assign(catalog,oldCatalog);Object.assign(instance,oldInstance);return;}
    $('#exerciseDialog').close();renderTraining();renderProgress();renderExerciseLibraryOptions($('#exerciseLibrarySearch')?.value||'');notify('Карточка упражнения обновлена в общей библиотеке; подходы и повторы текущей программы сохранены.');
  }
  function renderReplacementGroupOptions(){
    const select=$('#editExerciseReplacementGroup');if(!select)return;
    const previous=select.value;const groups=new Set();
    for(const item of getAvailableExerciseLibrary())for(const group of groupsForLibraryItem(item))groups.add(group);
    const ordered=[...importedExerciseLibraryGroups.filter(group=>groups.has(group)),...([...groups].filter(group=>!importedExerciseLibraryGroups.includes(group)).sort((a,b)=>a.localeCompare(b,'ru')))];
    select.innerHTML='<option value="">Все группы</option>'+ordered.map(group=>`<option value="${safe(group)}">${safe(group)}</option>`).join('');
    select.value=ordered.includes(previous)?previous:'';
  }
  function renderReplacementOptions(){
    const select=$('#editExerciseReplacementSelect');if(!select)return;
    const previous=select.value;const query=normalizeLibraryText($('#editExerciseReplacementSearch')?.value||'');const group=normalizeLibraryText($('#editExerciseReplacementGroup')?.value||'');
    const currentInstance=getWorkout()?.exercises.find(item=>item.id===editingExerciseId);
    const currentCatalogId=currentInstance?.catalogId||'';
    const items=getAvailableExerciseLibrary().filter(item=>{
      if(item.id===currentCatalogId)return false;
      const groups=groupsForLibraryItem(item);if(group&&!groups.some(value=>normalizeLibraryText(value)===group))return false;
      const searchable=[item.name,item.muscle,item.id,item.sourceOriginalName,...(item.aliases||[]),...(item.sourceMuscleGroups||[]),...groups].join(' ');
      return !query||normalizeLibraryText(searchable).includes(query);
    }).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    select.innerHTML='<option value="">— Не заменять —</option>'+items.map(item=>`<option value="${safe(item.id)}">${safe(item.name)}${item.muscle?` — ${safe(item.muscle)}`:''}</option>`).join('');
    select.value=items.some(item=>item.id===previous)?previous:'';
    $('#applyExerciseReplacementBtn').disabled=!select.value;
    if(!items.length)select.innerHTML='<option value="">Нет подходящих упражнений</option>';
  }
  function replaceExerciseWithLibrary(){
    const selectedId=$('#editExerciseReplacementSelect').value;
    const candidate=getAvailableExerciseLibrary().find(item=>item.id===selectedId);
    const workout=getWorkout();const index=workout?.exercises.findIndex(item=>item.id===editingExerciseId)??-1;
    if(!candidate||!workout||index<0)return notify('Выбери упражнение из библиотеки для замены.');
    const oldPlacement=workout.exercises[index];
    if(oldPlacement.catalogId===candidate.id)return notify('Это уже выбранное упражнение.');
    const oldCatalog=data.exerciseCatalog.find(item=>item.id===oldPlacement.catalogId);
    if(!oldCatalog)return notify('Не удалось найти исходное упражнение. Данные не изменены.');
    const oldExercises=workout.exercises.slice();const oldArchiveLength=(data.archivedPlacements||[]).length;
    const oldCatalogIndex=data.exerciseCatalog.findIndex(item=>item.id===candidate.id);
    const oldCatalogCopy=oldCatalogIndex>=0?JSON.parse(JSON.stringify(data.exerciseCatalog[oldCatalogIndex])):null;
    const draftKeyNow=draftKey();const beforeDraft=data.drafts[draftKeyNow]?JSON.parse(JSON.stringify(data.drafts[draftKeyNow])):null;
    const newPlacement={id:`placement-${uid()}`,catalogId:candidate.id,target:candidate.defaultTarget||oldPlacement.target||'По плану',sets:clampSets(candidate.defaultSets||oldPlacement.sets),alt:'',replacesCatalogId:oldPlacement.catalogId};
    if(oldCatalogIndex<0)data.exerciseCatalog.push(normalizeCatalogItem(candidate));
    else if(candidate.catalogSource==='coach'&&!data.exerciseCatalog[oldCatalogIndex].sourceRecordId){
      data.exerciseCatalog[oldCatalogIndex].sourceRecordId=candidate.sourceRecordId||'';
      data.exerciseCatalog[oldCatalogIndex].catalogSource=candidate.catalogSource||'coach';
    }
    data.archivedPlacements ||= [];
    data.archivedPlacements.push({id:`replaced-${uid()}`,programId:activeProgramId,workoutId:activeWorkout,archivedAt:Date.now(),originalPlacement:JSON.parse(JSON.stringify(oldPlacement)),originalExerciseSnapshot:{catalogId:oldCatalog.id,name:oldCatalog.name,muscle:oldCatalog.muscle,imageUrl:oldCatalog.imageUrl||'',imageData:oldCatalog.imageData||'',videoUrl:oldCatalog.videoUrl||''},replacedByPlacementId:newPlacement.id,replacedByCatalogId:candidate.id,replacedByName:candidate.name});
    workout.exercises.splice(index,1,newPlacement);
    data.drafts[draftKeyNow] ||= {};data.drafts[draftKeyNow][newPlacement.id]=defaultDraft({...candidate,...newPlacement});
    if(!persist({snapshot:true,label:`Упражнение заменено на: ${candidate.name}`})){
      workout.exercises=oldExercises;data.archivedPlacements.length=oldArchiveLength;
      if(oldCatalogIndex<0)data.exerciseCatalog=data.exerciseCatalog.filter(item=>item.id!==candidate.id);else if(oldCatalogCopy)data.exerciseCatalog[oldCatalogIndex]=oldCatalogCopy;
      if(beforeDraft)data.drafts[draftKeyNow]=beforeDraft;else delete data.drafts[draftKeyNow];
      return;
    }
    $('#exerciseDialog').close();renderTraining();renderProgress();notify(`Заменено на «${candidate.name}». Прогресс исходного упражнения остался в истории.`);
  }

  async function fillSnapshotDialog(){const snapshots=await listSafetySnapshots();const select=$('#snapshotSelect');select.innerHTML=snapshots.map(item=>`<option value="${safe(item.id)}">${safe(new Date(item.createdAt).toLocaleString('ru-RU'))} — ${safe(item.label)}</option>`).join('');$('#snapshotEmpty')?.classList.toggle('hidden',snapshots.length>0);$('#restoreSelectedSnapshotBtn').disabled=snapshots.length===0;await updateBackupStatus();}
  async function restoreSelectedSnapshot(){const selected=$('#snapshotSelect').value;if(!selected)return;const list=await listSafetySnapshots();const snap=list.find(item=>item.id===selected);if(!snap)return notify('Сохранённая копия не найдена.');if(!confirm(`Вернуть дневник к состоянию от ${new Date(snap.createdAt).toLocaleString('ru-RU')} («${snap.label}»)? Текущая копия тоже будет сохранена.`))return;
    const oldData=data,oldProgram=activeProgramId,oldWorkout=activeWorkout;const currentCopySaved=await saveSafetySnapshot('Перед восстановлением копии');if(!currentCopySaved){notify('Не удалось сохранить текущую копию. Восстановление отменено; освободи место и попробуй снова.');return;}
    try{const parsed=JSON.parse(snap.payload);const restored=normalizeData(parsed);data=restored;activeProgramId=restored.activeProgramId;activeWorkout=restored.activeWorkoutId||getWorkouts(activeProgramId)[0]?.id||'';storageWriteBlocked=false;storageReadFailure=null;
      const ok=persist({snapshot:true,label:'После восстановления копии'});if(!ok)throw new Error('Не удалось сохранить восстановленные данные.');
      $('#snapshotDialog').close();renderTraining();renderHistory();renderProgress();notify('Копия восстановлена.');
    }catch(error){data=oldData;activeProgramId=oldProgram;activeWorkout=oldWorkout;notify('Не удалось восстановить сохранённую копию. Текущие данные оставлены без изменений.');}
  }
  // Supabase cloud storage: one revisioned JSON document per authenticated account.
  const CLOUD_META_PREFIX = 'setlog-cloud-meta-v1:';
  let cloudClient = null;
  let cloudSdkLoadPromise = null;
  let cloudInitializationPromise = null;
  let cloudSession = null;
  let cloudUserId = '';
  let cloudReady = false;
  let cloudPaused = false;
  let cloudRevision = 0;
  let cloudApplying = false;
  let cloudRecoveryMode = false;
  let cloudSyncTimer = null;
  let cloudRetryTimer = null;
  let cloudRetryDelay = 5000;
  let cloudSyncInFlight = false;
  let cloudSyncRequested = false;
  let cloudHandlingPromise = null;
  let cloudHandlingUserId = '';
  let pendingCloudChoice = null;

  function cloudConfigIsUsable(){
    const cfg=window.SETLOG_SUPABASE_CONFIG||{};
    return !!(window.supabase&&typeof window.supabase.createClient==='function'&&/^https:\/\//.test(String(cfg.url||''))&&String(cfg.anonKey||'').trim().length>20&&!/YOUR[_ -]|PLACEHOLDER|PASTE/i.test(String(cfg.anonKey||'')));
  }
  function cloudMetaKey(userId){return CLOUD_META_PREFIX+String(userId||'');}
  function readCloudMeta(userId){try{return JSON.parse(localStorage.getItem(cloudMetaKey(userId))||'null');}catch(e){return null;}}
  function writeCloudMeta(userId,revision,localUpdatedAt,cloudUpdatedAt){
    try{localStorage.setItem(cloudMetaKey(userId),JSON.stringify({userId:String(userId),revision:Number(revision)||0,localUpdatedAt:Number(localUpdatedAt)||0,cloudUpdatedAt:cloudUpdatedAt||null}));}catch(e){console.warn('Could not persist cloud sync metadata',e);}
  }
  function setCloudMessage(message,state='info'){
    const el=$('#cloudAccountStatus');if(el){el.textContent=message;el.dataset.state=state;}
    if(cloudSession&&state==='error')setStorageStatus(message,'error');
  }
  function updateCloudUI(message=null,state='info'){
    const cfg=window.SETLOG_SUPABASE_CONFIG||{};
    const settingsPresent=/^https:\/\//.test(String(cfg.url||''))&&String(cfg.anonKey||'').trim().length>20&&!/YOUR[_ -]|PLACEHOLDER|PASTE/i.test(String(cfg.anonKey||''));
    const configured=cloudConfigIsUsable();
    const setup=$('#cloudSetupInstructions');const authPanel=$('#authFormPanel');const accountPanel=$('#cloudAccountPanel');
    if(setup){setup.classList.toggle('hidden',configured);const text=setup.querySelector('.dialog-copy');if(text)text.textContent=settingsPresent?'Не удалось подключиться к облачному хранилищу. Проверь интернет и перезагрузи приложение. Данные на устройстве сохранены.':'Облачное сохранение пока не подключено. Дневник останется на этом устройстве; сообщи владельцу приложения, что облако недоступно.';}
    if(authPanel)authPanel.classList.toggle('hidden',!configured||(!!cloudSession&&!cloudRecoveryMode));
    if(accountPanel)accountPanel.classList.toggle('hidden',!cloudSession||cloudRecoveryMode);
    $('#authEmailLabel')?.classList.toggle('hidden',cloudRecoveryMode);
    if($('#authEmail'))$('#authEmail').required=!cloudRecoveryMode;
    if($('#authNewPassword'))$('#authNewPassword').required=cloudRecoveryMode;
    if($('#authConfirmPassword'))$('#authConfirmPassword').required=cloudRecoveryMode;
    $('#authEmail')?.classList.toggle('hidden',cloudRecoveryMode);
    $('#authPasswordLabel')?.classList.toggle('hidden',cloudRecoveryMode);
    $('#authPassword')?.classList.toggle('hidden',cloudRecoveryMode);
    $('#authActionButtons')?.classList.toggle('hidden',cloudRecoveryMode);
    $('#authRecoveryNote')?.classList.toggle('hidden',!cloudRecoveryMode);
    $('#newPasswordLabel')?.classList.toggle('hidden',!cloudRecoveryMode);
    $('#authNewPassword')?.classList.toggle('hidden',!cloudRecoveryMode);
    $('#authConfirmPasswordLabel')?.classList.toggle('hidden',!cloudRecoveryMode);
    $('#authConfirmPassword')?.classList.toggle('hidden',!cloudRecoveryMode);
    $('#authSaveNewPasswordBtn')?.classList.toggle('hidden',!cloudRecoveryMode);
    $('#authBackToSignInBtn')?.classList.toggle('hidden',!cloudRecoveryMode);
    if(cloudSession){
      $('#cloudUserEmail').textContent=cloudSession.user?.email||'Аккаунт подключён';
      $('#accountButtonText').textContent='Облако';
    }else $('#accountButtonText').textContent='Войти';
    const status=$('#storageStatusText');
    if(message)setCloudMessage(message,state);
    else if(!configured)setCloudMessage(settingsPresent?'Не удалось подключиться к облаку. Проверь интернет и попробуй ещё раз.':'Данные пока сохраняются на этом устройстве. Войди в аккаунт, чтобы использовать облако.', 'local');
    else if(!cloudSession)setCloudMessage('Войди по email и паролю, чтобы подключить облако.', 'local');
    else if(cloudPaused)setCloudMessage('Нужно выбрать, какие данные оставить: на этом устройстве или в облаке.', 'warning');
    else if(cloudReady)setCloudMessage('Дневник сохранён в облаке.','saved');
    else setCloudMessage('Подключаем облачный дневник…','pending');
    if(status&&!cloudSession&&!storageWriteBlocked)status.textContent='Сохранено на этом устройстве.';
  }
  function hasMeaningfulLocalData(source=data){
    if(!source||!Array.isArray(source.programs))return false;
    if((source.history||[]).length>0)return true;
    if((source.archivedPlacements||[]).length>0)return true;
    if(source.activeProgramId&&source.activeProgramId!==DEFAULT_PROGRAM_ID)return true;
    const drafts=source.drafts||{};
    for(const draftMap of Object.values(drafts))for(const draft of Object.values(draftMap||{}))if(hasDraftData(draft))return true;
    const baseline=new Map([[DEFAULT_PROGRAM_ID,{name:'Full Body',workouts:PROGRAM}],[GIRLS_PROGRAM_ID,GIRLS_PROGRAM]]);
    if(source.programs.length!==2)return true;
    const defaultCatalogDetails=new Map();
    for(const workout of PROGRAM)for(const exercise of workout.exercises){
      const media=DEFAULT_MEDIA[exercise.id]||{};
      defaultCatalogDetails.set(catalogIdFromLegacy(exercise.id),{name:exercise.name,muscle:exercise.muscle||'Своя группа',imageUrl:media.imageUrl||'',videoUrl:media.videoUrl||'',target:exercise.target||'По плану',sets:clampSets(exercise.sets)});
    }
    for(const workout of GIRLS_PROGRAM.workouts)for(const exercise of workout.exercises){
      defaultCatalogDetails.set(catalogIdFromLegacy(exercise.id),{name:exercise.name,muscle:exercise.muscle||'Своя группа',imageUrl:exercise.imageUrl||'',videoUrl:exercise.videoUrl||'',target:exercise.target||'По плану',sets:clampSets(exercise.sets)});
    }
    for(const program of source.programs){
      const base=baseline.get(program.id);if(!base||program.name!==base.name)return true;
      const baseWorkouts=program.id===DEFAULT_PROGRAM_ID?PROGRAM:GIRLS_PROGRAM.workouts;
      if((program.workouts||[]).length!==baseWorkouts.length)return true;
      for(let wi=0;wi<baseWorkouts.length;wi++){
        const a=program.workouts[wi],b=baseWorkouts[wi];
        if(!a||a.id!==b.id||a.name!==b.name||(a.exercises||[]).length!==b.exercises.length)return true;
        for(let ei=0;ei<b.exercises.length;ei++){
          const instance=a.exercises[ei],original=b.exercises[ei];
          const catalog=(source.exerciseCatalog||[]).find(item=>item.id===instance.catalogId);
          if(!instance||instance.id!==original.id||!catalog||catalog.name!==original.name||String(instance.target)!==String(original.target||'По плану')||clampSets(instance.sets)!==clampSets(original.sets)||String(instance.alt||'')!==String(original.alt||''))return true;
          if(instance.replacesCatalogId)return true;
        }
      }
    }
    for(const item of source.exerciseCatalog||[]){
      const expected=defaultCatalogDetails.get(item.id);
      if(item.custom||!expected)return true;
      if(String(item.name||'')!==expected.name||String(item.muscle||'')!==expected.muscle||String(item.imageUrl||'')!==expected.imageUrl||String(item.videoUrl||'')!==expected.videoUrl||String(item.defaultTarget||'')!==expected.target||clampSets(item.defaultSets)!==expected.sets||!!item.imageData)return true;
    }
    return false;
  }
  async function fetchCloudRow(userId){
    if(!cloudClient)throw new Error('Облачное хранилище недоступно.');
    const {data:row,error}=await cloudClient.from('setlog_user_data').select('user_id,payload,revision,updated_at').eq('user_id',userId).maybeSingle();
    if(error)throw error;
    return row||null;
  }
  async function createCloudRestorePoint(row){
    if(!row||!cloudClient||!cloudSession)return false;
    const {error}=await cloudClient.rpc('create_setlog_restore_point',{p_expected_revision:Number(row.revision)||0});
    if(error){console.error('Could not preserve current cloud version:',error);return false;}
    return true;
  }
  function showCloudChoice(row,reason){
    pendingCloudChoice={row:row||null,reason:String(reason||'first-login'),userId:cloudSession?.user?.id||''};
    cloudReady=false;cloudPaused=true;
    const panel=$('#cloudChoicePanel');panel?.classList.remove('hidden');
    const description=$('#cloudChoiceDescription');
    const useCloud=$('#useCloudDataBtn');const useLocal=$('#useLocalDataBtn');
    if(row){
      useCloud.textContent='Использовать облачную копию';useCloud.disabled=false;
      useLocal.textContent='Сохранить копию с устройства';useLocal.disabled=false;
      description.textContent=reason==='revision-conflict'
        ? 'На другом устройстве дневник тоже изменился. Твои данные на этом устройстве сохранены. Выбери, какую копию оставить; перед заменой текущая копия останется доступна для восстановления.'
        : 'В облаке уже есть дневник, а на этом устройстве есть свои изменения. Чтобы ничего не потерять, выбери, какую копию оставить. Текущие данные сначала будут сохранены отдельно.';
    }else{
      useCloud.textContent='В облаке пока нет дневника';useCloud.disabled=true;
      useLocal.textContent='Сохранить копию с устройства';useLocal.disabled=false;
      description.textContent='В облаке пока нет дневника. На этом устройстве уже есть программы или записи. Можно сохранить эту копию в облаке; прежняя копия сначала будет сохранена отдельно.';
    }
    updateCloudUI(reason==='revision-conflict'?'Изменения на этом устройстве сохранены. Нужно выбрать, какую копию оставить.':'Перед сохранением выбери, какие данные использовать.','warning');
    const dialog=$('#accountDialog');if(dialog&&!dialog.open)dialog.showModal();
  }
  async function applyCloudPayload(payload,row,label='Загружено из облака'){
    if(!payload||typeof payload!=='object'||!Array.isArray(payload.programs)||!Array.isArray(payload.history))throw new Error('Не удалось открыть облачную копию. Данные на устройстве не изменены.');
    if(hasMeaningfulLocalData(data)){
      const backedUp=await saveSafetySnapshot('Перед заменой дневника данными из облака',JSON.stringify(data));
      if(!backedUp)throw new Error('Не удалось сохранить текущую копию. Облачные данные пока не применены. Сначала скачай резервную копию и попробуй ещё раз.');
    }
    const oldData=data,oldProgram=activeProgramId,oldWorkout=activeWorkout;
    try{
      cloudApplying=true;
      data=normalizeData(payload);activeProgramId=data.activeProgramId;activeWorkout=data.activeWorkoutId||getWorkouts(activeProgramId)[0]?.id||'';
      if(!persist({snapshot:false,label})){throw new Error('Не удалось записать данные из облака на устройство.');}
      cloudRevision=Number(row?.revision)||0;cloudUserId=cloudSession.user.id;cloudReady=true;cloudPaused=false;pendingCloudChoice=null;
      writeCloudMeta(cloudUserId,cloudRevision,data.updatedAt,row?.updated_at||null);
      try{localStorage.setItem(LOCAL_OWNER_KEY,String(cloudUserId));}catch(e){}
      removeLegacyGuestCopyAfterCloudReady(cloudUserId);
    }catch(error){data=oldData;activeProgramId=oldProgram;activeWorkout=oldWorkout;throw error;}
    finally{cloudApplying=false;}
    $('#cloudChoicePanel')?.classList.add('hidden');
    $('#workoutDate').value=todayISO();$('#todayLabel').textContent=dateFmt(todayISO()).toUpperCase();
    renderTraining();renderHistory();renderProgress();
    setCloudMessage(`${label}. Дневник сохранён в облаке.`,'saved');
    setStorageStatus('Все изменения сохранены в облаке.','saved');
  }
  function accountStorageKey(userId){return `${STORAGE_KEY}:user:${String(userId||'')}`;}
  function renderAfterStorageScopeChange(){
    activeProgramId=data.activeProgramId||DEFAULT_PROGRAM_ID;
    activeWorkout=data.activeWorkoutId||getWorkouts(activeProgramId)[0]?.id||'';
    $('#workoutDate').value=todayISO();$('#todayLabel').textContent=dateFmt(todayISO()).toUpperCase();
    renderProgramSelector();renderTraining();renderHistory();renderProgress();
  }
  async function activateAccountStorage(userId){
    const uid=String(userId||'');const nextKey=accountStorageKey(uid);
    if(!uid)throw new Error('Не удалось определить ID пользователя облачного аккаунта.');
    if(activeStorageKey===nextKey){try{localStorage.setItem(LOCAL_OWNER_KEY,uid);}catch(e){}return false;}
    let previousOwner='';let nextRaw=null;
    try{previousOwner=localStorage.getItem(LOCAL_OWNER_KEY)||'';nextRaw=localStorage.getItem(nextKey);}catch(error){throw new Error(`Не удалось прочитать локальное хранилище аккаунта: ${error.message||error}`);}
    const accountCacheWasNew=!nextRaw;
    // The first authenticated user may explicitly import the existing guest diary.
    // A different account never inherits the previous account's local cache.
    if(!nextRaw&&(!previousOwner||previousOwner===uid)){
      if(hasMeaningfulLocalData(data)){
        const backedUp=await saveSafetySnapshot('Перед переносом дневника в аккаунт',JSON.stringify(data));
        if(!backedUp)throw new Error('Не удалось сохранить копию перед подключением аккаунта. Сначала скачай резервную копию и попробуй снова.');
      }
      try{localStorage.setItem(nextKey,JSON.stringify(data));nextRaw=localStorage.getItem(nextKey);}catch(error){console.error('Could not create account cache:',error);throw new Error('Не удалось подготовить дневник на этом устройстве. Освободи место и попробуй снова.');}
    }
    activeStorageKey=nextKey;
    if(nextRaw){
      try{const parsed=JSON.parse(nextRaw);if(!parsed||!Array.isArray(parsed.programs)||!Array.isArray(parsed.history))throw new Error('неверная структура');data=normalizeData(parsed);}
      catch(error){activeStorageKey=STORAGE_KEY;throw new Error('Копия этого аккаунта на устройстве повреждена. Она не перезаписана; попробуй восстановить дневник из сохранённой копии.');}
    }else{
      data=normalizeData({});
      try{localStorage.setItem(nextKey,JSON.stringify(data));}catch(error){activeStorageKey=STORAGE_KEY;console.error('Could not prepare account cache:',error);throw new Error('Не удалось подготовить дневник на этом устройстве. Освободи место и попробуй снова.');}
    }
    try{localStorage.setItem(LOCAL_OWNER_KEY,uid);}catch(e){console.warn('Не удалось записать метку локального аккаунта',e);}
    historyEditContext=readHistoryEditContext();
    renderAfterStorageScopeChange();
    return accountCacheWasNew;
  }
  function activateGuestStorage(){
    const leavingAccount=activeStorageKey!==STORAGE_KEY;
    activeStorageKey=STORAGE_KEY;
    try{
      // The account-specific cache remains intact. Never surface its legacy duplicate in guest mode.
      if(leavingAccount&&localStorage.getItem(LOCAL_OWNER_KEY)){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LOCAL_OWNER_KEY);}
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){const parsed=JSON.parse(raw);if(parsed&&Array.isArray(parsed.programs)&&Array.isArray(parsed.history))data=normalizeData(parsed);else data=normalizeData({});}
      else{data=normalizeData({});localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
    }catch(error){console.warn('Не удалось переключиться на локальное хранилище после выхода:',error);data=normalizeData({});}
    historyEditContext=readHistoryEditContext();
    renderAfterStorageScopeChange();
  }
  function removeLegacyGuestCopyAfterCloudReady(userId){
    if(activeStorageKey===STORAGE_KEY||!cloudReady||String(userId||'')!==String(cloudSession?.user?.id||''))return;
    try{localStorage.removeItem(STORAGE_KEY);}catch(error){console.warn('Не удалось убрать старую гостевую копию:',error);}
  }
  async function handleCloudSession(session){
    if(!cloudClient||!session?.user?.id)return;
    const userId=session.user.id;
    if(cloudHandlingPromise&&cloudHandlingUserId===userId)return cloudHandlingPromise;
    if(cloudReady&&cloudUserId===userId)return;
    cloudHandlingUserId=userId;
    cloudHandlingPromise=(async()=>{
      cloudSession=session;cloudReady=false;cloudPaused=false;pendingCloudChoice=null;updateCloudUI('Проверяем облачный дневник…','pending');
      try{
        const accountCacheWasNew=await activateAccountStorage(userId);
        const row=await fetchCloudRow(userId);const meta=readCloudMeta(userId);const localImportant=hasMeaningfulLocalData(data);
        if(accountCacheWasNew){
          if(row){if(localImportant){showCloudChoice(row,'first-login-with-local-data');return;}await applyCloudPayload(row.payload,row,'Данные из облака загружены');return;}
          if(localImportant){showCloudChoice(null,'first-login-empty-cloud');return;}
          cloudRevision=0;cloudUserId=userId;cloudReady=true;cloudPaused=false;setCloudMessage('Сохраняем дневник в облаке впервые…','pending');await syncCloudState();return;
        }
        if(row){
          if(meta&&meta.userId===userId){
            const localDirty=Number(data.updatedAt||0)>Number(meta.localUpdatedAt||0);
            if(localDirty&&Number(row.revision)===Number(meta.revision||0)){
              cloudRevision=Number(row.revision)||0;cloudUserId=userId;cloudReady=true;cloudPaused=false;
              setCloudMessage('Есть локальные изменения, ожидающие отправки. Синхронизируем…','pending');scheduleCloudSync(80);
              return;
            }
            if(!localDirty&&Number(row.revision)===Number(meta.revision||0)){
              cloudRevision=Number(row.revision)||0;cloudUserId=userId;cloudReady=true;cloudPaused=false;
              writeCloudMeta(userId,cloudRevision,data.updatedAt,row.updated_at||null);
              setCloudMessage('Дневник синхронизирован. Все изменения сохранены в облаке.','saved');setStorageStatus('Все изменения сохранены в облаке.','saved');return;
            }
            if(localDirty&&Number(row.revision)>Number(meta.revision||0)){
              showCloudChoice(row,'revision-conflict');return;
            }
            await applyCloudPayload(row.payload,row,'Данные из облака загружены');return;
          }
          if(localImportant){showCloudChoice(row,'first-login-with-local-data');return;}
          await applyCloudPayload(row.payload,row,'Данные из облака загружены');return;
        }
        if(localImportant){showCloudChoice(null,'first-login-empty-cloud');return;}
        cloudRevision=0;cloudUserId=userId;cloudReady=true;cloudPaused=false;
        setCloudMessage('Сохраняем дневник в облаке впервые…','pending');await syncCloudState();
      }catch(error){
        cloudReady=false;cloudPaused=false;
        console.error('SetLog cloud session failed:',error);setCloudMessage('Не удалось подключить облачный дневник. Данные на устройстве сохранены; проверь интернет и попробуй снова.','error');
      }
    })();
    try{return await cloudHandlingPromise;}finally{cloudHandlingPromise=null;cloudHandlingUserId='';}
  }
  function scheduleCloudRetry(){
    if(!cloudClient||!cloudSession||!cloudReady||cloudPaused||!navigator.onLine)return;
    clearTimeout(cloudRetryTimer);
    cloudRetryTimer=setTimeout(()=>{cloudRetryTimer=null;if(navigator.onLine&&!cloudPaused)syncCloudState();},cloudRetryDelay);
    cloudRetryDelay=Math.min(cloudRetryDelay*2,60000);
  }
  function scheduleCloudSync(delay=900){
    if(!cloudClient||!cloudSession||!cloudReady||cloudPaused||cloudApplying)return;
    clearTimeout(cloudSyncTimer);
    if(!navigator.onLine){setStorageStatus('Сохранено на устройстве · ждёт отправки','pending');setCloudMessage('Нет интернета. Изменения сохранены на устройстве и автоматически отправятся, когда связь восстановится.','pending');return;}
    setStorageStatus('Сохраняем изменения в облаке…','pending');
    cloudSyncTimer=setTimeout(()=>syncCloudState(),delay);
  }
  async function syncCloudState(){
    if(!cloudClient||!cloudSession||!cloudReady||cloudPaused)return;
    if(cloudSyncInFlight){cloudSyncRequested=true;return;}
    if(!navigator.onLine){setStorageStatus('Сохранено на устройстве · ждёт отправки','pending');setCloudMessage('Нет интернета. Изменения отправятся автоматически после восстановления связи.','pending');return;}
    cloudSyncInFlight=true;cloudSyncRequested=false;
    const userId=cloudSession.user.id;const expectedRevision=cloudRevision;
    const payload=JSON.parse(JSON.stringify(data));payload.schemaVersion=DATA_SCHEMA_VERSION;payload.version=DATA_SCHEMA_VERSION;
    try{
      const {data:result,error}=await cloudClient.rpc('save_setlog_state',{p_payload:payload,p_expected_revision:expectedRevision});
      if(error){
        const message=String(error.message||error.details||error);
        if(/revision_conflict|revision conflict|not_authenticated/i.test(message)){
          const row=await fetchCloudRow(userId).catch(()=>null);
          if(row)showCloudChoice(row,'revision-conflict');
          else{cloudReady=false;cloudPaused=true;setCloudMessage('Дневник изменился на другом устройстве. Текущие данные сохранены; открой список сохранений и выбери нужную копию.','warning');}
          setStorageStatus('Изменения сохранены на устройстве. Выбери копию для синхронизации.','error');
        }else{
          setStorageStatus('Изменения сохранены на устройстве, но ещё не в облаке.','error');
          setCloudMessage('Не удалось сохранить изменения в облаке. Данные на устройстве не потеряны; попробуем ещё раз автоматически.','error');console.error('SetLog cloud sync error:', error);
          if(/fetch|network|timeout|temporar|502|503|504|server unavailable/i.test(message))scheduleCloudRetry();
        }
        return;
      }
      clearTimeout(cloudRetryTimer);cloudRetryTimer=null;cloudRetryDelay=5000;
      const row=Array.isArray(result)?result[0]:result;
      cloudRevision=Number(row?.revision)||expectedRevision+1;cloudUserId=userId;cloudReady=true;cloudPaused=false;
      writeCloudMeta(userId,cloudRevision,payload.updatedAt,row?.updated_at||new Date().toISOString());
      try{localStorage.setItem(LOCAL_OWNER_KEY,String(userId));}catch(e){}
      removeLegacyGuestCopyAfterCloudReady(userId);
      setStorageStatus('Все изменения сохранены в облаке.','saved');
      setCloudMessage('Дневник синхронизирован. Все изменения сохранены в облаке.','saved');
    }catch(error){
      setStorageStatus('Изменения сохранены на устройстве, ждём связи с облаком.','error');
      setCloudMessage('Не удалось связаться с облаком. Данные на устройстве сохранены; попробуем снова автоматически.','error');console.error('SetLog cloud sync failed:', error);
      scheduleCloudRetry();
    }finally{
      cloudSyncInFlight=false;
      if(cloudSyncRequested&&!cloudPaused) scheduleCloudSync(150);
    }
  }
  async function chooseCloudData(){
    const choice=pendingCloudChoice;if(!choice?.row||!cloudSession)return;
    try{await applyCloudPayload(choice.row.payload,choice.row,'Данные из облака загружены');notify('Теперь используется версия из облака.');}
    catch(error){notify(error.message||'Не удалось загрузить данные из облака.');}
  }
  async function chooseLocalDataForCloud(){
    if(!cloudSession||!pendingCloudChoice)return;
    const row=pendingCloudChoice.row;
    if(row&&!confirm('Сохранить копию с этого устройства вместо текущей облачной? Текущая облачная версия останется в списке предыдущих сохранений.'))return;
    const localBackup=await saveSafetySnapshot('Перед переносом дневника в облако');
    if(!localBackup){notify('Не удалось сохранить текущую копию. Скачай резервную копию и попробуй снова.');return;}
    if(row){const cloudBackup=await saveSafetySnapshot('Копия из облака перед заменой',JSON.stringify(row.payload));if(!cloudBackup){notify('Не удалось сохранить копию текущих облачных данных. Перезапись отменена.');return;}const kept=await createCloudRestorePoint(row);if(!kept){notify('Не удалось сохранить прежнее состояние в облаке. Ничего не заменено; попробуй ещё раз.');return;}}
    cloudRevision=Number(row?.revision)||0;cloudUserId=cloudSession.user.id;cloudReady=true;cloudPaused=false;pendingCloudChoice=null;
    $('#cloudChoicePanel')?.classList.add('hidden');
    setCloudMessage('Сохраняем дневник в облаке…','pending');
    await syncCloudState();
  }
  async function uploadLocalDataToCloud(force=false){
    if(!cloudClient||!cloudSession)return;
    let row;
    try{row=await fetchCloudRow(cloudSession.user.id);}catch(error){console.error('Could not check cloud diary:',error);return notify('Не удалось проверить облачный дневник. Проверь интернет и попробуй снова.');}
    if(row&&!force&&!confirm('Заменить текущий дневник в облаке копией с этого устройства? Перед заменой текущая версия будет сохранена отдельно.'))return;
    if(row){const ok=await saveSafetySnapshot('Копия из облака перед заменой',JSON.stringify(row.payload));if(!ok)return notify('Не удалось сохранить текущую копию. Изменения в облаке не заменены.');const kept=await createCloudRestorePoint(row);if(!kept)return notify('Не удалось сохранить прежнее состояние в облаке. Ничего не заменено; попробуй ещё раз.');}
    const localBackup=await saveSafetySnapshot('Перед переносом дневника в облако');
    if(!localBackup)return notify('Не удалось сохранить текущую копию. Сначала скачай резервную копию и попробуй снова.');
    cloudRevision=Number(row?.revision)||0;cloudUserId=cloudSession.user.id;cloudReady=true;cloudPaused=false;pendingCloudChoice=null;
    $('#cloudChoicePanel')?.classList.add('hidden');await syncCloudState();
  }
  async function reloadCloudData(){
    if(!cloudClient||!cloudSession)return;
    try{const row=await fetchCloudRow(cloudSession.user.id);if(!row)return notify('В облаке пока нет сохранённого дневника.');
      if(hasMeaningfulLocalData(data)&&!confirm('Загрузить дневник из облака на это устройство? Текущая копия на устройстве будет сохранена отдельно.'))return;
      await applyCloudPayload(row.payload,row,'Данные из облака загружены');pendingCloudChoice=null;notify('Облачные данные загружены.');
    }catch(error){console.error('Could not load cloud diary:',error);notify('Не удалось загрузить дневник из облака. Текущая копия не заменена.');}
  }
  async function fillCloudHistoryDialog(){
    const dialog=$('#cloudHistoryDialog');const select=$('#cloudHistorySelect');const status=$('#cloudHistoryStatus');const empty=$('#cloudHistoryEmpty');const restore=$('#restoreCloudHistoryBtn');
    select.innerHTML='';restore.disabled=true;empty.classList.add('hidden');
    if(dialog&&!dialog.open)dialog.showModal();
    if(!cloudClient||!cloudSession){status.textContent='Войди в аккаунт, чтобы увидеть сохранённые облачные копии.';empty.classList.remove('hidden');return;}
    if(!navigator.onLine){status.textContent='Для просмотра облачных копий подключись к интернету.';empty.classList.remove('hidden');return;}
    status.textContent='Загружаем сохранённые копии…';
    try{
      const {data:rows,error}=await cloudClient.from('setlog_user_snapshots').select('id,revision,created_at').eq('user_id',cloudSession.user.id).order('revision',{ascending:false}).limit(50);
      if(error)throw error;
      const list=rows||[];
      select.innerHTML=list.map(item=>{const stamp=new Date(item.created_at).toLocaleString('ru-RU',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});return `<option value="${safe(item.id)}">Сохранено ${safe(stamp)}</option>`;}).join('');
      empty.classList.toggle('hidden',list.length>0);
      status.textContent=list.length?`Доступно сохранённых копий: ${list.length}.`:'Пока нет предыдущих копий. Первая появится после следующего изменения программы или истории.';
      restore.disabled=list.length===0;
    }catch(error){console.error('Could not list cloud snapshots:',error);status.textContent='Не удалось загрузить список. Проверь интернет и попробуй ещё раз.';empty.classList.remove('hidden');}
  }

  async function restoreCloudHistoryVersion(){
    const selected=$('#cloudHistorySelect').value;
    if(!selected||!cloudClient||!cloudSession)return;
    if(!navigator.onLine)return notify('Подключись к интернету, чтобы восстановить облачную копию.');
    const status=$('#cloudHistoryStatus');const btn=$('#restoreCloudHistoryBtn');btn.disabled=true;status.textContent='Восстанавливаем дневник…';
    let oldRaw=null;let localPrewrite=false;let cloudSaveAttempted=false;let cloudSaveConfirmed=false;let restorePayload=null;
    try{
      const userId=cloudSession.user.id;
      const {data:snapshot,error:snapshotError}=await cloudClient.from('setlog_user_snapshots').select('id,user_id,revision,payload,created_at').eq('id',selected).eq('user_id',userId).maybeSingle();
      if(snapshotError)throw snapshotError;
      if(!snapshot)throw new Error('Сохранённая копия не найдена.');
      const current=await fetchCloudRow(userId);
      if(!current)throw new Error('В облаке пока нет текущего дневника.');
      const stamp=new Date(snapshot.created_at).toLocaleString('ru-RU',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
      if(!confirm(`Восстановить дневник к состоянию от ${stamp}? Текущая версия тоже останется среди облачных копий.`)){status.textContent='Восстановление отменено.';return;}
      const kept=await createCloudRestorePoint(current);
      if(!kept)throw new Error('Не удалось сохранить текущее состояние в облаке. Восстановление отменено; попробуй ещё раз.');
      const localBackup=await saveSafetySnapshot('Перед восстановлением копии из облака',JSON.stringify(data));
      if(!localBackup)throw new Error('Не удалось сохранить копию с этого устройства. Сначала скачай резервную копию.');
      const restored=normalizeData(snapshot.payload);
      const payload={...restored,schemaVersion:DATA_SCHEMA_VERSION,version:DATA_SCHEMA_VERSION,updatedAt:Date.now()};restorePayload=payload;
      try{oldRaw=localStorage.getItem(activeStorageKey);localStorage.setItem(activeStorageKey,JSON.stringify(payload));localPrewrite=true;}
      catch(storageError){console.error('Could not prepare local cache before cloud restore:',storageError);throw new Error('Не удалось подготовить дневник на этом устройстве. Освободи место и попробуй снова.');}
      cloudSaveAttempted=true;const {data:result,error:saveError}=await cloudClient.rpc('save_setlog_state',{p_payload:payload,p_expected_revision:Number(current.revision)||0});
      if(saveError){
        if(localPrewrite){try{if(oldRaw===null)localStorage.removeItem(activeStorageKey);else localStorage.setItem(activeStorageKey,oldRaw);}catch(e){console.error('Could not revert local cache after cloud restore conflict:',e);}}
        localPrewrite=false;cloudSaveAttempted=false;
        if(/revision_conflict|revision conflict/i.test(String(saveError.message||saveError)))throw new Error('Дневник уже изменился на другом устройстве. Обнови список копий и попробуй ещё раз.');
        console.error('Cloud restore failed:',saveError);throw new Error('Не удалось восстановить облачную копию. Текущая версия не заменена.');
      }
      cloudSaveConfirmed=true;
      data=normalizeData(payload);activeProgramId=data.activeProgramId;activeWorkout=data.activeWorkoutId||getWorkouts(activeProgramId)[0]?.id||'';
      cloudRevision=Number((Array.isArray(result)?result[0]:result)?.revision)||Number(current.revision)+1;cloudUserId=userId;cloudReady=true;cloudPaused=false;pendingCloudChoice=null;
      writeCloudMeta(userId,cloudRevision,data.updatedAt,(Array.isArray(result)?result[0]:result)?.updated_at||new Date().toISOString());
      try{localStorage.setItem(LOCAL_OWNER_KEY,String(userId));}catch(e){}
      $('#cloudHistoryDialog').close();renderAfterStorageScopeChange();renderHistory();renderProgress();await updateBackupStatus();
      setStorageStatus('Дневник восстановлен и сохранён в облаке.','saved');setCloudMessage('Дневник восстановлен. Предыдущая копия сохранена отдельно.','saved');notify('Дневник восстановлен из сохранённой копии.');
    }catch(error){
      if(localPrewrite&&!cloudSaveConfirmed){try{if(oldRaw===null)localStorage.removeItem(activeStorageKey);else localStorage.setItem(activeStorageKey,oldRaw);}catch(rollbackError){console.error('Could not restore local cache after interrupted cloud restore:',rollbackError);}localPrewrite=false;}
      console.error('Cloud diary restore failed:',error);
      if(cloudSaveAttempted&&!cloudSaveConfirmed){cloudReady=false;cloudPaused=true;setCloudMessage('Не удалось подтвердить результат восстановления. Подключись к интернету и перезагрузи приложение, чтобы проверить состояние дневника.','warning');status.textContent='Результат пока не подтверждён. Обнови страницу с интернетом перед продолжением.';}
      else status.textContent=error.message||'Не удалось восстановить копию. Текущие данные сохранены.';
      notify(status.textContent);
    }
    finally{btn.disabled=!$('#cloudHistorySelect').value;}
  }

  function ensureSupabaseSdk(){
    if(window.supabase&&typeof window.supabase.createClient==='function')return Promise.resolve();
    if(cloudSdkLoadPromise)return cloudSdkLoadPromise;
    cloudSdkLoadPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0';
      script.async=true;
      script.onload=()=>window.supabase&&typeof window.supabase.createClient==='function'?resolve():reject(new Error('Не удалось подключить облако.'));
      script.onerror=()=>reject(new Error('Не удалось загрузить компонент облачного сохранения.'));
      document.head.appendChild(script);
    }).finally(()=>{cloudSdkLoadPromise=null;});
    return cloudSdkLoadPromise;
  }
  async function initializeSupabaseCloud(){
    if(cloudInitializationPromise)return cloudInitializationPromise;
    cloudInitializationPromise=(async()=>{
    if((!window.supabase||typeof window.supabase.createClient!=='function')&&navigator.onLine){
      try{await ensureSupabaseSdk();}catch(error){console.warn('SetLog cloud component unavailable:',error);updateCloudUI('Облачное сохранение временно недоступно. Дневник на устройстве сохранён; попробуем подключиться снова, когда интернет заработает.','warning');return;}
    }
    if(!cloudConfigIsUsable()){updateCloudUI();return;}
    if(cloudClient){const {data:existingSession,error:sessionError}=await cloudClient.auth.getSession();if(sessionError){setCloudMessage('Не удалось проверить вход в аккаунт. Подключись к интернету и попробуй ещё раз.','error');return;}if(existingSession?.session){cloudSession=existingSession.session;updateCloudUI();await handleCloudSession(existingSession.session);}else updateCloudUI();return;}
    const cfg=window.SETLOG_SUPABASE_CONFIG;
    cloudClient=window.supabase.createClient(cfg.url.trim(),cfg.anonKey.trim(),{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
    cloudClient.auth.onAuthStateChange((event,session)=>{
      cloudSession=session||null;updateCloudUI();
      if(event==='PASSWORD_RECOVERY'){
        cloudRecoveryMode=true;updateCloudUI('Открой письмо восстановления и задай новый пароль.','pending');
        const dialog=$('#accountDialog');if(dialog&&!dialog.open)dialog.showModal();setTimeout(()=>$('#authNewPassword')?.focus(),50);return;
      }
      if(event==='SIGNED_OUT'){
        cloudReady=false;cloudPaused=false;cloudRevision=0;cloudUserId='';pendingCloudChoice=null;cloudRecoveryMode=false;$('#cloudChoicePanel')?.classList.add('hidden');
        activateGuestStorage();
        setCloudMessage('Ты вышел из аккаунта. Облачный дневник и копия на устройстве сохранены.','local');
        if(!storageWriteBlocked)setStorageStatus('Данные сохранены на этом устройстве. Войди, чтобы открыть облачный дневник.','saved');return;
      }
      if(session&&['SIGNED_IN','INITIAL_SESSION','TOKEN_REFRESHED','USER_UPDATED'].includes(event))setTimeout(()=>handleCloudSession(session),0);
    });
    const {data:sessionData,error}=await cloudClient.auth.getSession();
    if(error){console.error('SetLog auth session check failed:',error);setCloudMessage('Не удалось проверить вход в аккаунт. Перезагрузи страницу и попробуй снова.','error');return;}
    if(sessionData?.session){cloudSession=sessionData.session;updateCloudUI();await handleCloudSession(sessionData.session);}else updateCloudUI();
    })();
    try{return await cloudInitializationPromise;}finally{cloudInitializationPromise=null;}
  }
  function getAuthRedirectUrl(){
    // GitHub Pages project path is preserved; query string and hash are omitted.
    return new URL('./',window.location.href).href;
  }

  async function submitAuthAction(action){
    if(!cloudClient)return notify('Облачное сохранение пока недоступно. Попробуй позже.');
    const email=$('#authEmail').value.trim();const password=$('#authPassword').value;
    if(!email)return notify('Введи электронную почту.');
    if(!$('#authEmail').checkValidity())return notify('Проверь, правильно ли указана электронная почта.');
    setCloudMessage(action==='reset'?'Готовим письмо для восстановления…':'Проверяем данные аккаунта…','pending');
    try{
      let result;
      if(action==='signup'){
        if(password.length<8)return notify('Для пароля нужно не менее 8 символов.');
        result=await cloudClient.auth.signUp({email,password,options:{emailRedirectTo:getAuthRedirectUrl()}});
        if(result.error)throw result.error;
        if(result.data?.session){setCloudMessage('Аккаунт создан. Подключаем дневник…','pending');await handleCloudSession(result.data.session);}
        else setCloudMessage('Аккаунт создан. Проверь почту, подтверди адрес и войди в приложение.','pending');
      }else if(action==='signin'){
        if(!password)return notify('Введи пароль.');
        result=await cloudClient.auth.signInWithPassword({email,password});if(result.error)throw result.error;
        if(result.data?.session)await handleCloudSession(result.data.session);
      }else if(action==='reset'){
        result=await cloudClient.auth.resetPasswordForEmail(email,{redirectTo:getAuthRedirectUrl()});if(result.error)throw result.error;
        setCloudMessage('Если аккаунт с таким адресом существует, письмо для сброса пароля отправлено. Проверь входящие и папку «Спам». Ссылка вернёт тебя сюда, чтобы задать новый пароль.','info');notify('Запрос на восстановление отправлен. Проверь почту.');
      }
    }catch(error){
      console.error('SetLog authentication action failed:', error);
      const message=String(error?.message||'').toLowerCase();
      if(action==='reset'&&(message.includes('redirect')||message.includes('allow list')||message.includes('allowlist'))){
        setCloudMessage('Сброс пока не может открыть СЕТ: добавь https://sktkuzma.github.io/setlog/ в Supabase → Authentication → URL Configuration → Redirect URLs, затем попробуй снова.','error');
      }else{
        setCloudMessage(action==='signup'?'Не удалось создать аккаунт. Проверь адрес почты и подключение к интернету.':action==='signin'?'Не удалось войти. Проверь адрес почты и пароль.':action==='reset'?'Не удалось отправить письмо. Проверь адрес почты, подключение и настройки переадресации в Supabase.':'Не удалось выполнить действие с аккаунтом. Попробуй ещё раз.','error');
      }
    }
  }
  async function saveRecoveredPassword(){
    if(!cloudClient||!cloudSession)return notify('Открой ссылку восстановления из письма и попробуй ещё раз.');
    const password=$('#authNewPassword').value;const confirmation=$('#authConfirmPassword').value;
    if(password.length<8)return notify('Для пароля нужно не менее 8 символов.');
    if(password!==confirmation)return notify('Пароли не совпадают. Проверь оба поля.');
    const button=$('#authSaveNewPasswordBtn');button.disabled=true;setCloudMessage('Сохраняем новый пароль…','pending');
    try{
      const {error}=await cloudClient.auth.updateUser({password});if(error)throw error;
      cloudRecoveryMode=false;$('#authNewPassword').value='';$('#authConfirmPassword').value='';
      updateCloudUI('Пароль успешно изменён.','saved');await handleCloudSession(cloudSession);notify('Пароль изменён. Теперь можно входить с новым паролем.');
      const dialog=$('#accountDialog');if(dialog?.open)dialog.close();
    }catch(error){console.error('SetLog password update failed:',error);setCloudMessage('Не удалось изменить пароль. Ссылка могла устареть. Запроси новое письмо для восстановления и попробуй ещё раз.','error');}
    finally{button.disabled=false;}
  }
  async function leavePasswordRecoveryMode(){
    // The recovery link creates a temporary authenticated session. Sign it out so this button really returns to sign-in.
    try{if(cloudClient&&cloudRecoveryMode){const {error}=await cloudClient.auth.signOut();if(error)throw error;}}
    catch(error){console.warn('Could not close password recovery session:',error);notify('Не удалось завершить режим восстановления. Закрой окно и запроси новую ссылку, если она устарела.');return;}
    cloudRecoveryMode=false;$('#authNewPassword').value='';$('#authConfirmPassword').value='';
    updateCloudUI('Войди в облачный аккаунт по электронной почте и паролю.','local');
  }

  async function initializeApp(){
    if(storageReadFailure){
      const snapshots=await listSafetySnapshots();let restored=null;
      for(const snap of snapshots){try{const candidate=JSON.parse(snap.payload);if(candidate&&Array.isArray(candidate.history)){restored=candidate;break;}}catch(e){}}
      if(!restored){for(const backupKey of LEGACY_MIGRATION_BACKUP_KEYS){try{const localBackup=localStorage.getItem(backupKey);if(localBackup){const candidate=JSON.parse(localBackup);if(candidate&&Array.isArray(candidate.history)){restored=candidate;break;}}}catch(e){}}}
      if(restored){data=normalizeData(restored);activeProgramId=data.activeProgramId;activeWorkout=data.activeWorkoutId||getWorkouts(activeProgramId)[0]?.id||'';storageReadFailure=null;storageWriteBlocked=false;try{localStorage.setItem(activeStorageKey,JSON.stringify(data));}catch(e){storageWriteBlocked=true;}}
      else storageWriteBlocked=true;
    }
    if(initialStorageRaw&&startupNeedsMigration&&!storageReadFailure){
      let backedUp=await saveSafetySnapshot('Копия перед обновлением приложения',initialStorageRaw);
      if(!backedUp){try{localStorage.setItem(LEGACY_MIGRATION_BACKUP_KEY,initialStorageRaw);backedUp=true;}catch(e){}}
      if(!backedUp)storageWriteBlocked=true;
    }
    await loadImportedExerciseLibrary();
    renderExerciseLibraryGroupOptions();
    if(storageWriteBlocked){setStorageStatus('Нужно восстановить дневник из сохранённой копии','error');if(storageReadFailure)notify('Не удалось открыть данные на устройстве. Они не перезаписаны. Восстанови дневник из сохранённой копии.');else notify('Не удалось создать защитную копию перед обновлением. Скачай резервную копию, освободи место и повтори.');}
    $('#workoutDate').value=historyEditContext?(historyEditContext.date||todayISO()):todayISO();$('#todayLabel').textContent=historyEditContext?`ИСТОРИЯ · ${dateFmt(historyEditContext.date||todayISO()).toUpperCase()}`:dateFmt(todayISO()).toUpperCase();
    renderTraining();await updateBackupStatus();
    if(initialStorageRaw&&startupNeedsMigration&&!storageWriteBlocked)await saveSafetySnapshot('Копия после обновления приложения');
  }
  function handleClick(e){const nav=e.target.closest('[data-view]');if(nav){switchView(nav.dataset.view);return;}const go=e.target.closest('[data-go]');if(go){switchView(go.dataset.go);return;}const tab=e.target.closest('[data-workout]');if(tab){switchWorkout(tab.dataset.workout);return;}const action=e.target.closest('[data-action]');if(!action)return;const id=action.dataset.exercise;if(action.dataset.action==='open-share-export'){openShareExportDialog();return;}if(action.dataset.action==='open-exercise'){currentDetailExerciseId=id;renderExerciseDetail(id);const dialog=$('#exerciseDetailDialog');if(!dialog.open)dialog.showModal();return;}if(action.dataset.action==='close-exercise-detail'){const dialog=$('#exerciseDetailDialog');if(dialog.open)dialog.close();currentDetailExerciseId=null;return;}if(action.dataset.action==='add-set'||action.dataset.action==='remove-set'){const dr=ensureDraft()[id];if(!dr)return;const previous=JSON.parse(JSON.stringify(dr.sets||[]));if(action.dataset.action==='add-set'&&dr.sets.length<MAX_LOGGED_SETS)dr.sets.push({weight:'',reps:''});if(action.dataset.action==='remove-set'&&dr.sets.length>1)dr.sets.pop();const ok=historyEditContext?persistHistoryEditContext():persist();if(!ok){dr.sets=previous;return;}renderTraining();return;}if(action.dataset.action==='settings-select-program'){switchProgram(action.dataset.program);switchView('training');notify('Программа выбрана.');return;}if(action.dataset.action==='settings-manage-program'){if(data.programs.some(program=>program.id===action.dataset.program)){switchProgram(action.dataset.program);openProgramDialog();}return;}if(action.dataset.action==='edit-history-session'){beginHistoryEdit(action.dataset.session);return;}if(action.dataset.action==='cancel-history-edit'){cancelHistoryEdit();return;}if(action.dataset.action==='delete-session'){deleteSession(action.dataset.session);return;}if(action.dataset.action==='remove-exercise'){deleteExercise(id);return;}if(action.dataset.action==='edit-exercise'){openExerciseEditor(id);return;}if(action.dataset.action==='move-exercise-up'){moveExercise(id,-1);return;}if(action.dataset.action==='move-exercise-down'){moveExercise(id,1);return;}}
  $('#workoutDate').addEventListener('change',()=>{if(historyEditContext)return;ensureDraft();renderTraining();});
  $('#exerciseDetailDialog').addEventListener('input',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});$('#exerciseDetailDialog').addEventListener('change',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});
  document.addEventListener('click',handleClick);
  $('#programSelect').addEventListener('change',e=>switchProgram(e.target.value));$('#manageProgramsBtn').addEventListener('click',openProgramDialog);
  $('#moveWorkoutEarlierBtn').addEventListener('click',()=>moveWorkout(-1));$('#moveWorkoutLaterBtn').addEventListener('click',()=>moveWorkout(1));$('#moveProgramEarlierBtn').addEventListener('click',()=>moveProgram(-1));$('#moveProgramLaterBtn').addEventListener('click',()=>moveProgram(1));
  $('#exerciseList').addEventListener('input',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});$('#exerciseList').addEventListener('change',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});
  $('#saveWorkoutBtn').addEventListener('click',saveWorkoutDraft);$('#finishWorkoutBtn').addEventListener('click',()=>{if(historyEditContext)applyHistoryEdit();else finishWorkout();});$('#addExerciseBtn').addEventListener('click',openAddExerciseDialog);$('#addLibraryExerciseBtn').addEventListener('click',addLibraryExercise);$('#exerciseLibrarySearch').addEventListener('input',e=>renderExerciseLibraryOptions(e.target.value));$('#exerciseLibraryGroupFilter').addEventListener('change',()=>renderExerciseLibraryOptions());$('#addExerciseForm').addEventListener('submit',e=>{e.preventDefault();addCustomExercise();});
  $('#createProgramBtn').addEventListener('click',createProgram);$('#renameProgramBtn').addEventListener('click',renameProgram);$('#deleteProgramBtn').addEventListener('click',deleteProgram);$('#addWorkoutDayBtn').addEventListener('click',addWorkoutDay);$('#renameWorkoutBtn').addEventListener('click',renameWorkout);
  $('#editExerciseForm').addEventListener('submit',e=>{e.preventDefault();saveExerciseEdit();});$('#editExerciseReplacementSearch').addEventListener('input',renderReplacementOptions);$('#editExerciseReplacementGroup').addEventListener('change',renderReplacementOptions);$('#editExerciseReplacementSelect').addEventListener('change',()=>{$('#applyExerciseReplacementBtn').disabled=!$('#editExerciseReplacementSelect').value;});$('#applyExerciseReplacementBtn').addEventListener('click',replaceExerciseWithLibrary);$('#editExerciseImageFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{pendingImageData=await compressImageFile(file);const img=$('#exerciseImagePreview');img.src=pendingImageData;img.classList.remove('hidden');$('#exerciseImagePlaceholder').classList.add('hidden');$('#editExerciseImageUrl').value='';$('#removeExerciseImage').checked=false;}catch(err){notify(err.message||'Не удалось загрузить картинку.');}});$('#editExerciseImageUrl').addEventListener('input',()=>{if($('#editExerciseImageUrl').value.trim()){$('#exerciseImagePreview').classList.add('hidden');$('#exerciseImagePlaceholder').classList.remove('hidden');}});
  document.querySelectorAll('input[name="shareScope"]').forEach(input=>input.addEventListener('change',updateShareScopeUI));$('#shareSessionSelect').addEventListener('change',updateShareExportPreview);$('#shareDateFrom').addEventListener('change',updateShareExportPreview);$('#shareDateTo').addEventListener('change',updateShareExportPreview);$('#shareExerciseList').addEventListener('change',updateShareExportPreview);$('#shareSelectAllExercises').addEventListener('click',()=>{document.querySelectorAll('input[name="shareExercise"]').forEach(input=>input.checked=true);updateShareExportPreview();});$('#shareClearExercises').addEventListener('click',()=>{document.querySelectorAll('input[name="shareExercise"]').forEach(input=>input.checked=false);updateShareExportPreview();});document.querySelectorAll('[data-export-range]').forEach(button=>button.addEventListener('click',()=>{const val=button.dataset.exportRange;const to=todayISO();let from;if(val==='all'){from=[...data.history].map(item=>item.date).filter(Boolean).sort()[0]||to;}else{const d=new Date(`${to}T12:00:00`);d.setDate(d.getDate()-Math.max(0,Number(val)-1));from=shareLocalDateISO(d);}$('#shareDateFrom').value=from;$('#shareDateTo').value=to;updateShareExportPreview();}));$('#shareDownloadPngBtn').addEventListener('click',()=>exportShareResults('png'));$('#shareDownloadPdfBtn').addEventListener('click',()=>exportShareResults('pdf'));
  $('#exportBtn').addEventListener('click',exportData);$('#importBtn').addEventListener('click',()=>$('#importFile').click());$('#createSnapshotBtn').addEventListener('click',async()=>{const ok=await saveSafetySnapshot('Ручная копия дневника');if(ok)notify('Копия дневника сохранена на этом устройстве. Для дополнительной защиты скачай резервную копию.');else notify('Не удалось сохранить копию. Проверь свободное место и попробуй снова.');});$('#manageSnapshotsBtn').addEventListener('click',async()=>{await fillSnapshotDialog();$('#snapshotDialog').showModal();});$('#restoreSelectedSnapshotBtn').addEventListener('click',restoreSelectedSnapshot);$('#importFile').addEventListener('change',e=>{if(e.target.files?.[0])importData(e.target.files[0]);e.target.value='';});$('#progressExercise').addEventListener('change',updateProgressForSelection);
  let installPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});$('#installBtn').addEventListener('click',()=>switchView('settings'));$('#settingsInstallBtn').addEventListener('click',showInstallDialog);$('#settingsAccountBtn').addEventListener('click',()=>{updateCloudUI();$('#accountDialog').showModal();});$('#settingsAboutBtn').addEventListener('click',()=>notify('СЕТ · дневник тренировок. Результаты сохраняются на устройстве, а после входа синхронизируются с облаком.'));$('#settingsCreateProgramBtn').addEventListener('click',openProgramDialog);$('#settingsLibraryBtn').addEventListener('click',openAddExerciseDialog);
  $('#accountBtn').addEventListener('click',()=>{updateCloudUI();const dialog=$('#accountDialog');if(dialog&&!dialog.open)dialog.showModal();});$('#closeAccountDialogBtn').addEventListener('click',()=>$('#accountDialog').close());
  $('#authSignInBtn').addEventListener('click',()=>submitAuthAction('signin'));$('#authSignUpBtn').addEventListener('click',()=>submitAuthAction('signup'));$('#authResetBtn').addEventListener('click',()=>submitAuthAction('reset'));$('#authForm').addEventListener('submit',e=>{e.preventDefault();if(cloudRecoveryMode)saveRecoveredPassword();else submitAuthAction('signin');});$('#authSaveNewPasswordBtn').addEventListener('click',saveRecoveredPassword);$('#authBackToSignInBtn').addEventListener('click',leavePasswordRecoveryMode);
  $('#signOutBtn').addEventListener('click',async()=>{if(!cloudClient)return;if(!confirm('Выйти из аккаунта? Облачный дневник останется в безопасности. На этом устройстве останется отдельная локальная копия.'))return;const {error}=await cloudClient.auth.signOut();if(error){console.error('SetLog sign out failed:',error);notify('Не удалось выйти из аккаунта. Попробуй ещё раз.');}else notify('Ты вышел из аккаунта.');});
  $('#cloudSyncNowBtn').addEventListener('click',async()=>{if(!cloudClient||!cloudSession)return;await syncCloudState();});$('#cloudReloadBtn').addEventListener('click',reloadCloudData);$('#cloudUploadLocalBtn').addEventListener('click',()=>uploadLocalDataToCloud(false));$('#useCloudDataBtn').addEventListener('click',chooseCloudData);$('#useLocalDataBtn').addEventListener('click',chooseLocalDataForCloud);$('#cloudHistoryBtn').addEventListener('click',fillCloudHistoryDialog);$('#restoreCloudHistoryBtn').addEventListener('click',restoreCloudHistoryVersion);$('#cloudHistorySelect').addEventListener('change',()=>$('#restoreCloudHistoryBtn').disabled=!$('#cloudHistorySelect').value);
  window.addEventListener('offline',()=>{if(cloudSession){setStorageStatus('Нет интернета · изменения сохранены на устройстве','pending');setCloudMessage('Нет интернета. Изменения сохранены на устройстве и автоматически отправятся, когда связь восстановится.','pending');}});
  window.addEventListener('online',()=>{clearTimeout(cloudRetryTimer);cloudRetryTimer=null;cloudRetryDelay=5000;if(cloudSession&&cloudReady&&!cloudPaused){setCloudMessage('Связь восстановлена. Сохраняем изменения в облаке…','pending');scheduleCloudSync(250);}else if(cloudSession&&!cloudReady){handleCloudSession(cloudSession).catch(error=>console.error('Cloud reconnection failed:',error));}else if(!cloudClient){setStorageStatus('Связь восстановлена · подключаем облако…','pending');initializeSupabaseCloud().catch(error=>{console.error('Cloud reconnect failed:',error);setCloudMessage('Не удалось подключиться к облаку. Дневник сохранён на устройстве; попробуй ещё раз.','warning');});}});
  initializeApp().then(initializeSupabaseCloud).catch(error=>{console.error('SetLog initialization failed',error);updateCloudUI('Не удалось инициализировать приложение. Локальные данные не очищены.','error');});
})();
