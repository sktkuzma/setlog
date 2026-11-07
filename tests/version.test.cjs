const fs=require('node:fs');
const assert=require('node:assert/strict');
const version=fs.readFileSync('VERSION.txt','utf8').trim();
const readme=fs.readFileSync('README.md','utf8');
assert.match(version,/^\d+\.\d+\.\d+$/);
assert(readme.includes('**Текущая версия: '+version+'**'),'README version differs from VERSION.txt');
assert(fs.existsSync('CHANGELOG_v'+version+'.md'),'Missing changelog for current version');
console.log('Version metadata consistent:',version);
