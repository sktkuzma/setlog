/* СЕТ · IDB-first storage bridge, opt-in lab ONLY.
   All account scopes are test-only; published SET never loads this module.
   localStorage is a compatibility mirror written AFTER IDB transaction completion.
   The durable IndexedDB revision is authoritative inside this laboratory build.
*/
(function(root){
  'use strict';
  const api=root.SetlogAtomicStorage;
  if(!api)return;

  class SetlogAtomicLab{
    constructor(){
      this.writer=false;
      this.ready=false;
      this.blocked=false;
      this.pending=Promise.resolve();
      this.pendingCount=0;
      this.error=null;
      this.onJournalError=null;
      this._release=null;
      this.scope=null;
      this.mirrorRaw=null;
      this._lockPromise=null;
    }

    async start(scope,raw){
      if(!root.navigator?.locks?.request){
        return {ok:false,reason:'unsupported',message:'Web Locks недоступен. Тестовое сохранение отключено.'};
      }
      let respond;
      const acquired=new Promise(resolve=>{respond=resolve});
      this._lockPromise=root.navigator.locks.request(
        'setlog-lab-exclusive-writer-v1',{ifAvailable:true},
        async lock=>{
          if(!lock){respond(false);return}
          this.writer=true;respond(true);
          await new Promise(resolve=>{this._release=resolve});
          this.writer=false;
        }
      ).catch(error=>{this.error=error;this.blocked=true;respond(false)});
      if(!await acquired){
        return {ok:false,reason:'other-tab',message:'Дневник уже открыт для записи в другой тестовой вкладке.'};
      }
      try{
        this.scope=scope;
        this.mirrorRaw=raw??null;
        const current=await api.read(scope);
        if(raw!==null&&raw!==undefined){
          api.parsePayload(raw);
          if(current&&current.payload!==raw){
            this.blocked=true;
            return {ok:false,reason:'diverged',message:'Локальная и транзакционная копии различаются. Обе сохранены; выбери нужную вручную.'};
          }
          if(!current)await api.initialize(scope,raw);
        }else if(current){
          this.blocked=true;
          return {ok:false,reason:'missing-local',message:'Локальная копия отсутствует, но транзакционная осталась. Восстановление только вручную.'};
        }
        this.ready=true;
        return {ok:true,revision:current?.revision||0};
      }catch(error){
        this.blocked=true;
        this.error=error;
        return {ok:false,reason:'init-failure',message:'Не удалось проверить хранилище: '+String(error.message||error)};
      }
    }

    queuePrimary(scope,nextRaw){
      if(!this.ready||!this.writer||this.blocked||scope!==this.scope)
        return Promise.reject(new Error('Transactional writer unavailable'));
      api.parsePayload(nextRaw);
      this.pendingCount+=1;
      const operation=this.pending.then(async()=>{
        if(!this.ready||!this.writer||this.blocked||scope!==this.scope)
          throw new Error('Transactional writer lost its lock or account scope');

        // Browser storage can be changed by legacy tabs that bypass Web Locks.
        if(root.localStorage.getItem(scope)!==this.mirrorRaw)
          throw new Error('Legacy localStorage was modified outside transactional writer');

        let current=await api.read(scope);
        if(!current){
          if(this.mirrorRaw!==null){
            await api.initialize(scope,this.mirrorRaw);
            current=await api.read(scope);
          }else{
            const result=await api.initialize(scope,nextRaw);
            if(!result.inserted&&result.payload!==nextRaw)throw new Error('Initialization race');
            if(root.localStorage.getItem(scope)!==this.mirrorRaw)
              throw new Error('Legacy localStorage changed before mirror');
            // The durable value is already committed. The mirror can fail without losing it.
            root.localStorage.setItem(scope,nextRaw);
            this.mirrorRaw=nextRaw;
            return {revision:result.revision,payload:nextRaw};
          }
        }
        if(current.payload!==this.mirrorRaw)
          throw new Error('Durable and compatibility copies diverged');
        const saved=await api.commit(scope,current.revision,nextRaw);
        if(!saved.ok)throw new Error('Transactional commit rejected: '+saved.reason);

        // IDB transaction.oncomplete happened before this line.
        if(root.localStorage.getItem(scope)!==this.mirrorRaw)
          throw new Error('Legacy localStorage changed during committed transaction');
        root.localStorage.setItem(scope,nextRaw);
        this.mirrorRaw=nextRaw;
        return {revision:saved.revision,payload:nextRaw};
      });
      this.pending=operation.then(
        value=>{this.pendingCount-=1;return value},
        error=>{
          this.pendingCount-=1;
          this.blocked=true;
          this.error=error;
          if(typeof this.onJournalError==='function')this.onJournalError(error,scope);
          throw error;
        }
      );
      return this.pending;
    }

    flush(){return this.pending}
    hasPending(){return this.pendingCount>0}
    async verifiedCloudPayload(scope,expectedRaw){
      if(!this.ready||!this.writer||this.blocked||scope!==this.scope)
        throw new Error('The durable writer is not ready for cloud upload');
      await this.flush();
      const stored=await api.read(scope);
      if(!stored||stored.payload!==expectedRaw||this.mirrorRaw!==expectedRaw)
        throw new Error('Refusing cloud upload because the durable payload differs from local mirror');
      return {revision:stored.revision,payload:JSON.parse(stored.payload)};
    }
    async inspect(scope){return api.read(scope)}
    close(){if(this._release){this._release();this._release=null}this.ready=false}
  }

  root.SetlogAtomicLab=SetlogAtomicLab;
})(typeof globalThis!=='undefined'?globalThis:window);
