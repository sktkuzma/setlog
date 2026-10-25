(() => {
  'use strict';
  const STORAGE_KEY = 'setlog-pwa-v1';
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
  const WORKOUTS = {'1':'Верх + ноги','2':'Руки + верх спины','3':'Изоляция + спина'};
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const todayISO = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const num = v => { if (v === '' || v === null || v === undefined) return null; const n=Number(String(v).replace(',','.')); return Number.isFinite(n)&&n>=0?n:null; };
  const fmt = n => Number.isFinite(n) ? (Math.round(n*10)/10).toLocaleString('ru-RU',{maximumFractionDigits:1}) : '—';
  const dateFmt = iso => { if(!iso) return 'Без даты'; const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric'}).replace(' г.',''); };
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data = loadData();
  let activeView = 'training';
  let activeWorkout = '1';
  let toastTimer;
  const currentDate = () => $('#workoutDate').value || todayISO();
  const draftKey = (date=currentDate(), workout=activeWorkout) => `${date}::${workout}`;
  function loadData(){
    try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){const d=JSON.parse(raw);return {version:1,history:Array.isArray(d.history)?d.history:[],drafts:d.drafts&&typeof d.drafts==='object'?d.drafts:{},customExercises:d.customExercises&&typeof d.customExercises==='object'?d.customExercises:{}};}}catch(e){}
    return {version:1,history:[],drafts:{},customExercises:{}};
  }
  function persist(){ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(e){notify('Не получилось сохранить данные. Проверь свободное место в браузере.');} }
  function getExercises(workout=activeWorkout){ return [...(PROGRAM.find(w=>w.id===workout)?.exercises||[]), ...(data.customExercises[workout]||[])]; }
  function defaultDraft(ex){return {weight:'',rir:'',notes:'',sets:Array.from({length:Math.max(1,Math.min(8,ex.sets||3))},()=>({reps:''}))};}
  function ensureDraft(date=currentDate(),workout=activeWorkout){
    const key=draftKey(date,workout);
    if(!data.drafts[key]) data.drafts[key]={};
    for(const ex of getExercises(workout)) if(!data.drafts[key][ex.id]) data.drafts[key][ex.id]=defaultDraft(ex);
    for(const ex of getExercises(workout)){
      const dr=data.drafts[key][ex.id]; if(!Array.isArray(dr.sets)) dr.sets=defaultDraft(ex).sets;
      if(dr.sets.length===0) dr.sets.push({reps:''});
    }
    persist(); return data.drafts[key];
  }
  function getLastEntry(exId, exName){
    const all=[]; for(const session of data.history) for(const e of session.entries||[]) if(e.exerciseId===exId||(!exId&&e.exerciseName===exName)) all.push({...e,date:session.date,workout:session.workout,sessionId:session.id});
    all.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0))); return all[0]||null;
  }
  function exerciseCard(ex,index,draft){
    const last=getLastEntry(ex.id,ex.name); const lastText=last ? `${fmt(last.weight)} кг · ${(last.reps||[]).filter(Boolean).join(' / ')||'повторы не указаны'}` : 'Пока нет записей';
    const custom=(data.customExercises[activeWorkout]||[]).some(x=>x.id===ex.id);
    return `<article class="exercise-card ${hasDraftData(draft)?'has-data':''} ${custom?'custom-exercise':''}" data-exercise-card="${safe(ex.id)}">
      <div class="exercise-top"><span class="exercise-num">${String(index+1).padStart(2,'0')}</span><div class="exercise-main"><div class="exercise-name">${safe(ex.name)}</div><div class="exercise-meta"><span>${safe(ex.muscle||'Своя группа')}</span><span>${safe(ex.target||'Без диапазона')}</span><span>${(draft.sets||[]).length} подхода</span></div>${ex.alt?`<div class="alt-label">Замена: ${safe(ex.alt)}</div>`:''}</div></div>
      <div class="last-result"><span class="last-label">ПРОШЛЫЙ РАЗ</span><strong>${safe(lastText)}</strong>${last?`<span>· ${safe(dateFmt(last.date))}</span>`:''}</div>
      <div class="exercise-fields">
        <div class="field-group"><label class="field-label" for="weight-${safe(ex.id)}">ВЕС, КГ</label><input class="field-input" id="weight-${safe(ex.id)}" type="number" inputmode="decimal" min="0" max="1000" step="0.25" placeholder="${ex.bodyweight?'Свой вес / 0':'0'}" data-field="weight" data-exercise="${safe(ex.id)}" value="${safe(draft.weight)}"></div>
        <div class="field-group"><label class="field-label" for="rir-${safe(ex.id)}">ЗАПАС (RIR)</label><select class="field-input" id="rir-${safe(ex.id)}" data-field="rir" data-exercise="${safe(ex.id)}"><option value="">Не указан</option>${[0,1,2,3,4,5].map(v=>`<option value="${v}" ${String(draft.rir)===String(v)?'selected':''}>${v===0?'0 · отказ':v}</option>`).join('')}</select></div>
      </div>
      <div class="sets-heading"><span class="field-label">ПОВТОРЕНИЯ ПО ПОДХОДАМ</span><div class="sets-actions"><button type="button" class="mini-button" data-action="remove-set" data-exercise="${safe(ex.id)}" aria-label="Убрать подход" ${draft.sets.length<=1?'disabled':''}>−</button><button type="button" class="mini-button" data-action="add-set" data-exercise="${safe(ex.id)}" aria-label="Добавить подход" ${draft.sets.length>=8?'disabled':''}>+</button></div></div>
      <div class="sets-list">${draft.sets.map((set,i)=>`<div class="set-row"><span class="set-label">СЕТ ${String(i+1).padStart(2,'0')}</span><input class="field-input" type="number" min="0" max="300" step="1" inputmode="numeric" aria-label="Повторы в подходе ${i+1}" placeholder="повторы" data-field="reps" data-set-index="${i}" data-exercise="${safe(ex.id)}" value="${safe(set.reps)}"><span class="set-label">ПОДХОД ${i+1}</span></div>`).join('')}</div>
      <div class="note-field"><label class="field-label" for="note-${safe(ex.id)}">ЗАМЕТКА</label><input class="field-input" id="note-${safe(ex.id)}" type="text" maxlength="220" placeholder="Техника, самочувствие, замена…" data-field="notes" data-exercise="${safe(ex.id)}" value="${safe(draft.notes)}"></div>
      ${custom?`<button class="remove-custom" type="button" data-action="remove-exercise" data-exercise="${safe(ex.id)}">Удалить из плана ×</button>`:''}
    </article>`;
  }
  function hasDraftData(d){return !!(num(d.weight)!==null||(d.sets||[]).some(s=>String(s.reps??'').trim()!==''));}
  function renderTraining(){
    const wk=PROGRAM.find(w=>w.id===activeWorkout); const list=getExercises(); const draft=ensureDraft();
    $('#workoutKicker').textContent=`ПЛАН / 0${activeWorkout}`; $('#workoutTitle').textContent=wk?.name||'Своя тренировка'; $('#exerciseCount').textContent=`${list.length} УПР.`;
    $$('.workout-tab').forEach(b=>{const on=b.dataset.workout===activeWorkout;b.classList.toggle('selected',on);b.setAttribute('aria-selected',String(on));});
    $('#exerciseList').innerHTML=list.map((ex,i)=>exerciseCard(ex,i,draft[ex.id]||defaultDraft(ex))).join(''); updateFilledCount();
    $('#sessionNumber').textContent=String(data.history.length+1).padStart(3,'0');
  }
  function updateFilledCount(){
    const draft=data.drafts[draftKey()]||{}; const count=getExercises().filter(ex=>draft[ex.id]&&hasDraftData(draft[ex.id])).length;
    $('#filledCount').textContent=`${count} ${plural(count,'упражнение','упражнения','упражнений')}`;
  }
  function plural(n,a,b,c){const x=n%100,y=n%10;return x>10&&x<20?c:y>1&&y<5?b:y===1?a:c;}
  function notify(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2800);}
  function switchView(view){activeView=view;$$('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));$$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));if(view==='history')renderHistory();if(view==='progress')renderProgress();window.scrollTo({top:0,behavior:'smooth'});}
  function entryFromDraft(ex,d){
    const reps=(d.sets||[]).map(s=>num(s.reps)).filter(v=>v!==null);
    const weight=num(d.weight); if(reps.length===0 && weight===null)return null;
    const effectiveWeight=weight===null?0:weight; const totalReps=reps.reduce((s,v)=>s+v,0); const firstReps=reps[0]||0;
    const e1rm=effectiveWeight>0&&firstReps>0&&firstReps<30?effectiveWeight/(1-0.0333*firstReps):null;
    return {exerciseId:ex.id,exerciseName:ex.name,muscle:ex.muscle||'',target:ex.target||'',weight,sets:(d.sets||[]).length,reps,rir:d.rir===''?null:Number(d.rir),notes:(d.notes||'').trim(),e1rm:e1rm&&Number.isFinite(e1rm)?Math.round(e1rm*10)/10:null,volume:Math.round(effectiveWeight*totalReps*10)/10};
  }
  function saveWorkout(){
    const draft=ensureDraft(); const entries=[];
    for(const ex of getExercises()){const e=entryFromDraft(ex,draft[ex.id]||{});if(e)entries.push(e);}
    if(!entries.length){notify('Сначала внеси вес или повторы хотя бы в одно упражнение.');return;}
    const session={id:uid(),date:currentDate(),workout:activeWorkout,workoutName:WORKOUTS[activeWorkout]||PROGRAM.find(w=>w.id===activeWorkout)?.name||`Тренировка ${activeWorkout}`,savedAt:Date.now(),entries};
    data.history.push(session); delete data.drafts[draftKey()]; persist(); renderTraining(); notify(`Сохранено: ${entries.length} ${plural(entries.length,'упражнение','упражнения','упражнений')}`); 
  }
  function renderHistory(){
    const hist=[...data.history].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||((b.savedAt||0)-(a.savedAt||0)));
    const exCount=hist.reduce((s,h)=>s+(h.entries||[]).length,0); $('#historyCounter').textContent=`${hist.length} ${plural(hist.length,'СЕССИЯ','СЕССИИ','СЕССИЙ')}`;
    $('#historyStatSessions').textContent=hist.length; $('#historyStatExercises').textContent=exCount; $('#historyStatLast').textContent=hist[0]?dateFmt(hist[0].date).replace(/\s+\d{4}$/,''):'—';
    $('#historyEmpty').classList.toggle('hidden',hist.length>0); $('#historyList').innerHTML=hist.map(s=>{
      const totalVol=(s.entries||[]).reduce((n,e)=>n+(e.volume||0),0);const firstLine=(s.entries||[]).slice(0,8).map(e=>`<div class="history-entry"><div><div class="history-entry-name">${safe(e.exerciseName)}</div><div class="history-entry-sub">${safe(e.sets||e.reps?.length||0)} подх. · ${(e.reps||[]).filter(v=>v!==null&&v!==undefined).join(' / ')||'—'} повт.${e.notes?`<div class="history-note">${safe(e.notes)}</div>`:''}</div></div><div class="history-entry-val">${e.weight===null?'—':fmt(e.weight)+' кг'}<br><span style="color:var(--muted);font-size:9px">объём ${fmt(e.volume||0)}</span></div></div>`).join('');
      return `<article class="history-card"><div class="history-card-top"><div><div class="history-date">${safe(dateFmt(s.date))}</div><div class="history-name">${safe(s.workoutName||WORKOUTS[s.workout]||'Тренировка')}</div><div class="history-meta">${(s.entries||[]).length} упражнений · объём ${fmt(totalVol)} кг</div></div><span class="history-badge">ДЕНЬ ${safe(s.workout||'—')}</span></div>${firstLine}${(s.entries||[]).length>8?`<div class="history-entry"><span class="history-entry-sub">И ещё ${(s.entries||[]).length-8} упражнений</span></div>`:''}<div class="history-card-bottom"><span class="history-entry-sub">Записано ${safe(new Date(s.savedAt||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}))}</span><button type="button" class="delete-button" data-action="delete-session" data-session="${safe(s.id)}">Удалить запись ×</button></div></article>`;
    }).join('');
  }
  function allExercisesForStats(){
    const map=new Map(); for(const w of PROGRAM) for(const e of w.exercises) map.set(e.id,{id:e.id,name:e.name});
    for(const [w,arr] of Object.entries(data.customExercises)) for(const e of arr)map.set(e.id,{id:e.id,name:e.name});
    for(const s of data.history) for(const e of s.entries||[]) if(!map.has(e.exerciseId))map.set(e.exerciseId,{id:e.exerciseId||e.exerciseName,name:e.exerciseName});
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  }
  function currentExerciseStats(){return $('#progressExercise').value;}
  function renderProgress(){
    const sel=$('#progressExercise'); const old=sel.value; const exercises=allExercisesForStats(); sel.innerHTML=exercises.map(e=>`<option value="${safe(e.id)}">${safe(e.name)}</option>`).join(''); if(exercises.some(e=>e.id===old))sel.value=old;
    updateProgressForSelection();
  }
  function getEntriesForExercise(id){const arr=[];for(const s of data.history){for(const e of s.entries||[])if(e.exerciseId===id||(!e.exerciseId&&e.exerciseName===id))arr.push({...e,date:s.date,workout:s.workout,savedAt:s.savedAt});}return arr.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||((a.savedAt||0)-(b.savedAt||0)));}
  function updateProgressForSelection(){
    const id=currentExerciseStats(); if(!id){$('#metricWeight').textContent='—';$('#metricE1rm').textContent='—';$('#metricVolume').textContent='—';$('#metricBest').textContent='—';$('#metricWeightDelta').textContent='Нет записей';$('#weightChart').innerHTML='<div class="chart-empty">Здесь появится график после первой записи.</div>';$('#repsChart').innerHTML='<div class="chart-empty">Недостаточно данных для графика.</div>';return;}
    const es=getEntriesForExercise(id); const withWeight=es.filter(e=>num(e.weight)!==null&&num(e.weight)>0); const last=es[es.length-1];const lw=withWeight[withWeight.length-1];const prev=withWeight[withWeight.length-2];
    $('#metricWeight').textContent=lw?`${fmt(lw.weight)} кг`:'—'; $('#metricE1rm').textContent=last?.e1rm?`${fmt(last.e1rm)} кг`:'—'; $('#metricVolume').textContent=last?fmt(last.volume||0):'—'; $('#metricBest').textContent=withWeight.length?`${fmt(Math.max(...withWeight.map(e=>e.weight)))} кг`:'—';
    $('#metricWeightDelta').textContent=lw&&prev?`${lw.weight-prev.weight>0?'+':''}${fmt(lw.weight-prev.weight)} кг к прошлому разу`:lw?'Последняя запись':'Нет записей с весом';
    drawChart($('#weightChart'),withWeight.slice(-10).map(e=>({label:dateFmt(e.date).replace(/\s+\d{4}$/,''),value:Number(e.weight)})),'кг');
    const repEntries=es.filter(e=>(e.reps||[]).length>0).map(e=>({label:dateFmt(e.date).replace(/\s+\d{4}$/,''),value:Math.max(...e.reps.filter(v=>Number.isFinite(v)))})).filter(e=>Number.isFinite(e.value)); drawChart($('#repsChart'),repEntries.slice(-10),'повт.');
  }
  function drawChart(container,items,unit){
    if(items.length<2){container.innerHTML=`<div class="chart-empty">${items.length===0?'Здесь появится график после первой записи.':'Добавь ещё одну запись, чтобы увидеть динамику.'}</div>`;return;}
    const w=320,h=160,p={l:29,r:10,t:13,b:26};const vals=items.map(x=>x.value);let min=Math.min(...vals),max=Math.max(...vals);if(max===min){min=Math.max(0,min-2);max=max+2;}else{const pad=(max-min)*.18;min=Math.max(0,min-pad);max+=pad;}const x=i=>p.l+i*((w-p.l-p.r)/(items.length-1));const y=v=>p.t+(max-v)*(h-p.t-p.b)/(max-min);const grid=[0,1,2,3].map(i=>{const val=min+(max-min)*i/3;const yy=y(val);return `<line x1="${p.l}" y1="${yy}" x2="${w-p.r}" y2="${yy}" stroke="#34392f" stroke-width="1"/><text x="${p.l-6}" y="${yy+3}" font-family="DM Mono,monospace" font-size="8" text-anchor="end" fill="#818879">${fmt(val)}</text>`;}).join('');const line=items.map((d,i)=>`${x(i)},${y(d.value)}`).join(' ');const marks=items.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d.value)}" r="3.2" fill="#c8f169" stroke="#1d201b" stroke-width="1.5"><title>${safe(d.label)}: ${fmt(d.value)} ${unit}</title></circle>`).join('');const labels=items.map((d,i)=>i===0||i===items.length-1||i===Math.floor(items.length/2)?`<text x="${x(i)}" y="${h-7}" font-family="DM Mono,monospace" font-size="8" text-anchor="${i===0?'start':i===items.length-1?'end':'middle'}" fill="#818879">${safe(d.label)}</text>`:'').join('');
    container.innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="График изменения ${unit}">${grid}<polyline points="${line}" fill="none" stroke="#c8f169" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${marks}${labels}</svg>`;
  }
  function exportData(){
    const payload={app:'setlog-pwa',version:1,exportedAt:new Date().toISOString(),history:data.history,drafts:data.drafts,customExercises:data.customExercises};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`setlog-backup-${todayISO()}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);notify('Резервная копия подготовлена.');
  }
  function importData(file){
    const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!d||!Array.isArray(d.history))throw new Error('bad');if(!confirm(`Импорт заменит текущий журнал. В файле ${d.history.length} тренировок. Продолжить?`))return;data={version:1,history:d.history,drafts:d.drafts&&typeof d.drafts==='object'?d.drafts:{},customExercises:d.customExercises&&typeof d.customExercises==='object'?d.customExercises:{}};persist();renderTraining();renderHistory();renderProgress();notify('Данные импортированы.');}catch(e){notify('Не удалось прочитать файл. Нужна резервная копия SetLog в формате JSON.');}};reader.readAsText(file);
  }
  function addCustomExercise(){const name=$('#customExerciseName').value.trim();if(!name)return;const ex={id:`custom-${uid()}`,name,muscle:$('#customExerciseMuscle').value.trim()||'Своё упражнение',target:$('#customExerciseTarget').value.trim()||'По плану',sets:3,custom:true};if(!data.customExercises[activeWorkout])data.customExercises[activeWorkout]=[];data.customExercises[activeWorkout].push(ex);data.drafts[draftKey()] ||= {};data.drafts[draftKey()][ex.id]=defaultDraft(ex);persist();$('#addExerciseDialog').close();$('#addExerciseForm').reset();renderTraining();notify('Упражнение добавлено в этот день.');}
  function deleteSession(id){if(!confirm('Удалить эту тренировку из истории?'))return;data.history=data.history.filter(s=>s.id!==id);persist();renderHistory();renderProgress();renderTraining();notify('Запись удалена.');}
  function deleteCustomExercise(id){if(!confirm('Убрать упражнение из программы? Сохранённая история останется.'))return;data.customExercises[activeWorkout]=(data.customExercises[activeWorkout]||[]).filter(e=>e.id!==id);for(const k of Object.keys(data.drafts)){if(k.endsWith(`::${activeWorkout}`)&&data.drafts[k])delete data.drafts[k][id];}persist();renderTraining();notify('Упражнение удалено из плана.');}
  function updateDraftFromInput(input){const id=input.dataset.exercise;const field=input.dataset.field;const dr=ensureDraft()[id];if(!dr)return;if(field==='reps'){const idx=Number(input.dataset.setIndex);if(!dr.sets[idx])dr.sets[idx]={reps:''};dr.sets[idx].reps=input.value;}else dr[field]=input.value;const card=$(`[data-exercise-card="${CSS.escape(id)}"]`);if(card)card.classList.toggle('has-data',hasDraftData(dr));persist();updateFilledCount();}
  function switchWorkout(id){if(!PROGRAM.some(w=>w.id===id))return;activeWorkout=id;renderTraining();}
  function handleClick(e){
    const nav=e.target.closest('[data-view]');if(nav){switchView(nav.dataset.view);return;}
    const go=e.target.closest('[data-go]');if(go){switchView(go.dataset.go);return;}
    const tab=e.target.closest('[data-workout]');if(tab){switchWorkout(tab.dataset.workout);return;}
    const action=e.target.closest('[data-action]');if(!action)return;const id=action.dataset.exercise;
    if(action.dataset.action==='add-set'||action.dataset.action==='remove-set'){
      const dr=ensureDraft()[id];if(action.dataset.action==='add-set'&&dr.sets.length<8)dr.sets.push({reps:''});if(action.dataset.action==='remove-set'&&dr.sets.length>1)dr.sets.pop();persist();renderTraining();return;
    }
    if(action.dataset.action==='delete-session'){deleteSession(action.dataset.session);return;}
    if(action.dataset.action==='remove-exercise'){deleteCustomExercise(id);return;}
  }
  $('#workoutDate').value=todayISO();$('#todayLabel').textContent=dateFmt(todayISO()).toUpperCase();$('#workoutDate').addEventListener('change',()=>{ensureDraft();renderTraining();});
  document.addEventListener('click',handleClick);
  $('#exerciseList').addEventListener('input',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});
  $('#exerciseList').addEventListener('change',e=>{const input=e.target.closest('[data-field]');if(input)updateDraftFromInput(input);});
  $('#saveWorkoutBtn').addEventListener('click',saveWorkout);
  $('#addExerciseBtn').addEventListener('click',()=>$('#addExerciseDialog').showModal());
  $('#addExerciseForm').addEventListener('submit',e=>{e.preventDefault();addCustomExercise();});
  $('#exportBtn').addEventListener('click',exportData);$('#importBtn').addEventListener('click',()=>$('#importFile').click());$('#importFile').addEventListener('change',e=>{if(e.target.files?.[0])importData(e.target.files[0]);e.target.value='';});
  $('#progressExercise').addEventListener('change',updateProgressForSelection);
  let installPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
  $('#installBtn').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();try{await installPrompt.userChoice;}catch(e){}installPrompt=null;}else $('#installDialog').showModal();});
  renderTraining();
})();
