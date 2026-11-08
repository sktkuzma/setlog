/* СЕТ · experimental atomic diary storage, isolated and not connected to production.
   Pure IndexedDB engine; no Supabase, no window.localStorage changes.
   Every mutation is a compare-and-swap in the same readwrite transaction. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SetlogAtomicStorage=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const NAME='setlog-atomic-prototype-v1',VERSION=1;
  const STORE='diaries',LOG='revisions',MAX_REVISIONS=4;
  function open(dbName=NAME){
    return new Promise((resolve,reject)=>{
      if(typeof indexedDB==='undefined')return reject(new Error('IndexedDB unavailable'));
      const req=indexedDB.open(dbName,VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'scope'});
        if(!db.objectStoreNames.contains(LOG))db.createObjectStore(LOG,{keyPath:'id'});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Database open failed'));
      req.onblocked=()=>reject(new Error('Database open blocked by another tab'));
    });
  }
  function validScope(scope){return typeof scope==='string'&&scope.length>0&&scope.length<512;}
  function assertScope(scope){if(!validScope(scope))throw new Error('Invalid diary scope');}
  function parsePayload(raw){
    if(typeof raw!=='string')throw new Error('Diary must be a JSON string');
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Invalid diary object');
    if(!Array.isArray(parsed.history)||!Array.isArray(parsed.programs))throw new Error('Invalid diary schema');
    return parsed;
  }
  function record(scope,revision,payload,historyEditRaw=null){
    return {scope,revision,payload,historyEditRaw,updatedAt:Date.now()};
  }
  function editValue(current){return current?.historyEditRaw??null}
  function validateEdit(raw){
    if(raw===null)return null;
    if(typeof raw!=='string')throw new Error('Invalid history edit raw');
    const ctx=JSON.parse(raw);
    if(!ctx||typeof ctx!=='object'||Array.isArray(ctx)||!ctx.sessionId||
      !ctx.originalSession||!Array.isArray(ctx.exercises)||!ctx.draft||
      typeof ctx.draft!=='object'||Array.isArray(ctx.draft))
      throw new Error('Invalid history edit context');
    return ctx;
  }
  function keepPrior(revisions,scope,nextRevision,previous){
    revisions.put({id:scope+'::'+nextRevision,scope,revision:nextRevision,
      previousRevision:previous.revision,previousPayload:previous.payload,
      previousHistoryEditRaw:editValue(previous),createdAt:Date.now()});
    const history=revisions.getAll();
    history.onsuccess=()=>{
      const relevant=(history.result||[]).filter(item=>item.scope===scope)
        .sort((a,b)=>b.revision-a.revision);
      for(const stale of relevant.slice(MAX_REVISIONS))revisions.delete(stale.id);
    };
  }
  function txn(db,scope,action){
    return new Promise((resolve,reject)=>{
      const transaction=db.transaction([STORE,LOG],'readwrite');
      const diaries=transaction.objectStore(STORE),revisions=transaction.objectStore(LOG);
      let result=null,failed=false;
      const req=diaries.get(scope);
      req.onsuccess=()=>{
        try{result=action({diaries,revisions},req.result||null)}
        catch(e){failed=e;transaction.abort()}
      };
      transaction.oncomplete=()=>resolve(result);
      transaction.onerror=()=>reject(failed||transaction.error||new Error('Atomic transaction failed'));
      transaction.onabort=()=>reject(failed||transaction.error||new Error('Atomic transaction aborted'));
    });
  }
  async function withDB(dbName,fn){
    const db=await open(dbName);
    try{return await fn(db)}finally{db.close()}
  }
  async function read(scope,dbName=NAME){
    assertScope(scope);
    return withDB(dbName,db=>new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(scope);
      r.onsuccess=()=>resolve(r.result||null);
      r.onerror=()=>reject(r.error);
      tx.onabort=()=>reject(tx.error);
    }));
  }
  async function initialize(scope,raw,dbName=NAME){
    assertScope(scope);parsePayload(raw);
    return withDB(dbName,db=>txn(db,scope,({diaries},current)=>{
      if(current)return {inserted:false,revision:current.revision,payload:current.payload};
      const next=record(scope,1,raw);diaries.put(next);
      return {inserted:true,revision:1,payload:raw};
    }));
  }
  async function commit(scope,expectedRevision,newRaw,dbName=NAME){
    assertScope(scope);parsePayload(newRaw);
    if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1)throw new Error('Invalid expected revision');
    return withDB(dbName,db=>txn(db,scope,({diaries,revisions},current)=>{
      if(!current)return {ok:false,reason:'missing',revision:null};
      if(current.revision!==expectedRevision)
        return {ok:false,reason:'conflict',revision:current.revision};
      const next=record(scope,current.revision+1,newRaw,editValue(current));
      keepPrior(revisions,scope,next.revision,current);
      diaries.put(next);
      return {ok:true,revision:next.revision};
    }));
  }
  // An edit draft and its diary share one IndexedDB record and one revision.
  // Legacy records from prior lab versions had no historyEditRaw property.
  async function migrateEdit(scope,expectedRevision,expectedPayload,editRaw,dbName=NAME){
    assertScope(scope);validateEdit(editRaw);
    return withDB(dbName,db=>txn(db,scope,({diaries,revisions},current)=>{
      if(!current||current.revision!==expectedRevision||current.payload!==expectedPayload)
        return {ok:false,reason:'conflict'};
      if(Object.prototype.hasOwnProperty.call(current,'historyEditRaw'))
        return {ok:editValue(current)===editRaw,reason:editValue(current)===editRaw?null:'conflict',revision:current.revision};
      const next=record(scope,current.revision+1,current.payload,editRaw);
      keepPrior(revisions,scope,next.revision,current);
      diaries.put(next);
      return {ok:true,revision:next.revision};
    }));
  }
  async function commitEdit(scope,expectedRevision,expectedEditRaw,nextEditRaw,dbName=NAME){
    assertScope(scope);validateEdit(expectedEditRaw);validateEdit(nextEditRaw);
    if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1)throw new Error('Invalid revision');
    return withDB(dbName,db=>txn(db,scope,({diaries,revisions},current)=>{
      if(!current||current.revision!==expectedRevision||editValue(current)!==expectedEditRaw)
        return {ok:false,reason:'conflict'};
      const next=record(scope,current.revision+1,current.payload,nextEditRaw);
      keepPrior(revisions,scope,next.revision,current);
      diaries.put(next);
      return {ok:true,revision:next.revision};
    }));
  }
  async function commitWithEdit(scope,expectedRevision,nextDiaryRaw,expectedEditRaw,nextEditRaw,dbName=NAME){
    assertScope(scope);parsePayload(nextDiaryRaw);validateEdit(expectedEditRaw);validateEdit(nextEditRaw);
    if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1)throw new Error('Invalid revision');
    return withDB(dbName,db=>txn(db,scope,({diaries,revisions},current)=>{
      if(!current||current.revision!==expectedRevision||editValue(current)!==expectedEditRaw)
        return {ok:false,reason:'conflict'};
      const next=record(scope,current.revision+1,nextDiaryRaw,nextEditRaw);
      keepPrior(revisions,scope,next.revision,current);
      diaries.put(next);
      return {ok:true,revision:next.revision};
    }));
  }
  async function listRollback(scope,dbName=NAME){
    assertScope(scope);
    return withDB(dbName,db=>new Promise((resolve,reject)=>{
      const tx=db.transaction(LOG,'readonly'),req=tx.objectStore(LOG).getAll();
      req.onsuccess=()=>resolve((req.result||[]).filter(x=>x.scope===scope).sort((a,b)=>b.revision-a.revision));
      req.onerror=()=>reject(req.error);tx.onabort=()=>reject(tx.error);
    }));
  }
  async function restorePrevious(scope,expectedRevision,revisionRecordId,dbName=NAME){
    assertScope(scope);
    if(!Number.isSafeInteger(expectedRevision)||expectedRevision<1)throw new Error('Invalid expected revision');
    return withDB(dbName,db=>txn(db,scope,({diaries,revisions},current)=>{
      if(!current||current.revision!==expectedRevision)return {ok:false,reason:'conflict'};
      const request=revisions.get(revisionRecordId);
      // This inner read is asynchronous but remains in the same transaction.
      // Return result object is mutated on success before transaction.oncomplete.
      const result={ok:false,reason:'missing'};
      request.onsuccess=()=>{
        const back=request.result;
        if(!back||back.scope!==scope)return;
        try{
          parsePayload(back.previousPayload);
          const edit=Object.prototype.hasOwnProperty.call(back,'previousHistoryEditRaw')
            ?back.previousHistoryEditRaw:editValue(current);
          validateEdit(edit);
          const next=record(scope,current.revision+1,back.previousPayload,edit);
          keepPrior(revisions,scope,next.revision,current);
          diaries.put(next);
          Object.assign(result,{ok:true,revision:next.revision,reason:null});
        }catch(e){result.reason='invalid-backup'}
      };
      return result;
    }));
  }
  return {open,read,initialize,commit,migrateEdit,commitEdit,commitWithEdit,listRollback,restorePrevious,parsePayload,validateEdit,NAME};
});
