import {mkdir,rm,cp,readFile} from 'node:fs/promises';
import {join} from 'node:path';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const name of ['index.html','style.css','app.js','src','sw.js','manifest.json','icons'])await cp(name,join('dist',name),{recursive:true});
const sw=await readFile('sw.js','utf8');if(!sw.includes('station-pa-shell-v6'))throw new Error('Unexpected service worker version');
console.log('Static build ready: dist/ (API functions remain server-side)');
