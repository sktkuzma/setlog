const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync}=require('node:child_process');
const base=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const catalogFile='exercise-library-coach.json';
const files=execFileSync('git',['ls-files'],{cwd:base,encoding:'utf8'}).trim().split(/\r?\n/);
const libraryFiles=files.filter(name=>/^exercise-library-.*\.json$/.test(name)&&fs.existsSync(path.join(base,name)));
assert.deepEqual(libraryFiles,[catalogFile],'Only one deployed library file is expected');
const library=JSON.parse(read(catalogFile));
assert.equal(library.catalog?.id,'coach');
assert.equal(library.catalog?.exerciseCount,201);
assert.equal(library.exercises?.length,201);
const ids=new Set(),names=new Set(),videos=new Set();
for(const exercise of library.exercises){
 assert.equal(typeof exercise.id,'string');
 assert.match(exercise.id,/^coach-[a-zA-Z0-9_-]+$/,'Stable coach exercise ID');
 assert(!ids.has(exercise.id),'Duplicate exercise ID: '+exercise.id);ids.add(exercise.id);
 assert.equal(typeof exercise.name,'string');
 assert(exercise.name.trim(),'Exercise must have a name');
 assert(!names.has(exercise.name),'Duplicate name: '+exercise.name);names.add(exercise.name);
 const url=new URL(exercise.video);
 assert.equal(url.protocol,'https:');
 assert(url.hostname==='t.me'||url.hostname==='telegram.me','Trusted exercise video host');
 assert(!videos.has(exercise.video),'Duplicate video: '+exercise.video);videos.add(exercise.video);
}
assert(read('app.js').includes("fetch('./exercise-library-coach.json'"),'App must read canonical library');
assert(read('sw.js').includes("'./exercise-library-coach.json'"),'PWA must cache canonical library');
assert.equal(/fetch\(['"]\.\/exercise-library-(?!coach\b)/.test(read('app.js')),false,'No secondary exercise source');
const obsoleteLabel=['tulu','pavel'].join('');
for(const name of ['app.js','index.html','sw.js','README.md','exercise-library-coach.json']){
 assert(!read(name).toLowerCase().includes(obsoleteLabel),'Obsolete source label in '+name);
}
console.log('PASS only canonical coach library, 201 unique IDs/names/video links; app and PWA references validated');
