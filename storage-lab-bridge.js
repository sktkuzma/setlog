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
      this.editMirrorRaw=null;
      this.editKey=null;
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
        this.editKey=scope+':history-edit-v1';
        this.editMirrorRaw=root.localStorage.getItem(this.editKey);
        if(this.editMirrorRaw!==null)api.validateEdit(this.editMirrorRaw);
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
        let confirmed=await api.read(scope);
        if(confirmed){
          if(!Object.prototype.hasOwnProperty.call(confirmed,'historyEditRaw')){
            const migrated=await api.migrateEdit(scope,confirmed.revision,confirmed.payload,this.editMirrorRaw);
            if(!migrated.ok)throw new Error('History edit migration conflict');
            confirmed=await api.read(scope);
          }
          if((confirmed.historyEditRaw??null)!==this.editMirrorRaw){
            this.blocked=true;
            return {ok:false,reason:'history-edit-diverged',
              message:'Черновик редактирования истории отличается от транзакционной копии. Автоматическое восстановление заблокировано.'};
          }
        }else if(this.editMirrorRaw!==null){
          this.blocked=true;
          return {ok:false,reason:'orphan-history-edit',message:'Есть черновик доработки истории, но нет дневника. Автоматическая миграция остановлена.'};
        }
        this.ready=true;
        return {ok:true,revision:confirmed?.revision||0};
      }catch(error){
        this.blocked=true;
        this.error=error;
        return {ok:false,reason:'init-failure',message:'Не удалось проверить хранилище: '+String(error.message||error)};
      }
    }

    queuePrimary(scope,nextRaw,options={}){
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
        const clearEdit=options.clearHistoryEdit===true;
        if(clearEdit&&root.localStorage.getItem(this.editKey)!==this.editMirrorRaw)
          throw new Error('History-edit mirror changed before finishing edited session');
        if((current.historyEditRaw??null)!==this.editMirrorRaw)
          throw new Error('History-edit copy diverged before committing diary');
        const saved=clearEdit
          ?await api.commitWithEdit(scope,current.revision,nextRaw,this.editMirrorRaw,null)
          :await api.commit(scope,current.revision,nextRaw);
        if(!saved.ok)throw new Error('Transactional commit rejected: '+saved.reason);

        // IDB transaction.oncomplete happened before this line.
        if(root.localStorage.getItem(scope)!==this.mirrorRaw)
          throw new Error('Legacy localStorage changed during committed transaction');
        root.localStorage.setItem(scope,nextRaw);
        this.mirrorRaw=nextRaw;
        if(clearEdit){
          if(root.localStorage.getItem(this.editKey)!==this.editMirrorRaw)
            throw new Error('History-edit mirror modified after durable commit');
          root.localStorage.removeItem(this.editKey);
          this.editMirrorRaw=null;
        }
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

    queueHistoryEdit(scope,raw){
      if(!this.ready||!this.writer||this.blocked||scope!==this.scope)
        return Promise.reject(new Error('History-edit writer unavailable'));
      api.validateEdit(raw);
      this.pendingCount+=1;
      const operation=this.pending.then(async()=>{
        if(!this.writer||this.blocked||scope!==this.scope)
          throw new Error('History-edit writer lost its account lock');
        if(root.localStorage.getItem(this.editKey)!==this.editMirrorRaw)
          throw new Error('History-edit localStorage changed in another tab');
        const stored=await api.read(scope);
        if(!stored||stored.payload!==this.mirrorRaw||
          (stored.historyEditRaw??null)!==this.editMirrorRaw)
          throw new Error('History edit or diary copy diverged');
        if(raw===this.editMirrorRaw)return {revision:stored.revision,historyEditRaw:raw};
        const written=await api.commitEdit(scope,stored.revision,this.editMirrorRaw,raw);
        if(!written.ok)throw new Error('History edit transaction rejected: '+written.reason);
        if(root.localStorage.getItem(this.editKey)!==this.editMirrorRaw)
          throw new Error('History-edit mirror changed during the transaction');
        if(raw===null)root.localStorage.removeItem(this.editKey);
        else root.localStorage.setItem(this.editKey,raw);
        this.editMirrorRaw=raw;
        return {revision:written.revision,historyEditRaw:raw};
      });
      this.pending=operation.then(value=>{this.pendingCount-=1;return value},
        error=>{
          this.pendingCount-=1;this.blocked=true;this.error=error;
          if(typeof this.onJournalError==='function')this.onJournalError(error,scope);
          throw error;
        });
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
