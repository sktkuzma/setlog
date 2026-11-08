/* СЕТ · experimental integration bridge. Not enabled in production.
   Uses the IndexedDB prototype as a durable journal of actual diary writes,
   while the existing localStorage remains authoritative for this phase.
   Web Locks gives the test build one active writer per browser origin.
   No Supabase calls and no real-user migration are performed in lab mode.
*/
(function(root){
  'use strict';
  const api=root.SetlogAtomicStorage;
  if(!api)return;
  class SetlogAtomicLab {
    constructor(){
      this.writer=false;
      this.ready=false;
      this.blocked=false;
      this.pending=Promise.resolve();
      this.error=null;
      this.onJournalError=null;
      this._release=null;
    }
    async start(scope,raw){
      if(!root.navigator?.locks?.request)return {ok:false,reason:'unsupported',message:'В браузере нет поддержки Web Locks.'};
      if(!api.parsePayload)return {ok:false,reason:'engine-missing'};
      let acquired;
      const gate=new Promise(resolve=>{acquired=resolve});
      root.navigator.locks.request('setlog-lab-exclusive-writer-v1',{ifAvailable:true},async lock=>{
        if(!lock){acquired(false);return}
        this.writer=true;acquired(true);
        await new Promise(resolve=>{this._release=resolve});
        this.writer=false;
      }).catch(e=>{
        this.blocked=true;this.error=e;acquired(false);
      });
      if(!(await gate))return {ok:false,reason:'other-tab',message:'Дневник уже открыт в другой тестовой вкладке.'};
      try{
        const snapshot=await api.read(scope);
        if(raw!==null&&raw!==undefined){
          api.parsePayload(raw);
          if(snapshot&&snapshot.payload!==raw){
            this.blocked=true;
            return {ok:false,reason:'diverged',message:'Локальный дневник и транзакционная копия различаются. Автоматически заменять данные небезопасно.'};
          }
          if(!snapshot)await api.initialize(scope,raw);
        }else if(snapshot){
          this.blocked=true;
          return {ok:false,reason:'missing-local',message:'Есть транзакционная копия, но исходный локальный дневник отсутствует.'};
        }
        this.ready=true;
        return {ok:true,revision:snapshot?.revision||0};
      }catch(error){
        this.blocked=true;this.error=error;
        return {ok:false,reason:'initialization-failed',message:'Не удалось проверить транзакционную копию: '+String(error.message||error)};
      }
    }
    queueDiary(scope,previousRaw,nextRaw){
      if(!this.ready||!this.writer||this.blocked)return Promise.reject(new Error('Atomic test writer is unavailable'));
      this.pending=this.pending.then(async()=>{
        if(!this.writer||this.blocked)throw new Error('Atomic writer lock lost');
        api.parsePayload(nextRaw);
        let saved=await api.read(scope);
        if(!saved){
          // First write of a new scoped diary: preserve the old local value if present.
          if(previousRaw!==null&&previousRaw!==undefined){
            api.parsePayload(previousRaw);
            await api.initialize(scope,previousRaw);
            saved=await api.read(scope);
          }else{
            const initialized=await api.initialize(scope,nextRaw);
            if(initialized.payload!==nextRaw)throw new Error('Atomic init conflict');
            return initialized.revision;
          }
        }
        if(saved.payload!==previousRaw)throw new Error('Atomic storage drift detected. Reload before editing.');
        const answer=await api.commit(scope,saved.revision,nextRaw);
        if(!answer.ok)throw new Error('Atomic write failed: '+answer.reason);
        return answer.revision;
      }).catch(error=>{
        this.blocked=true;this.error=error;
        if(typeof this.onJournalError==='function')this.onJournalError(error,scope);
        throw error;
      });
      return this.pending;
    }
    flush(){return this.pending}
    async inspect(scope){return api.read(scope)}
    close(){if(this._release)this._release();this.ready=false}
  }
  root.SetlogAtomicLab=SetlogAtomicLab;
})(typeof globalThis!=='undefined'?globalThis:window);
