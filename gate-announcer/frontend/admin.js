'use strict';
let adminData=null;
function adminMessage(text){$('adminMessage').textContent=text}
async function refreshPublic(){state.data=await api('/api/templates');state.catalog=await api('/api/voices');for(const lang of ['en','ar','ur']){const list=state.catalog.voices[lang]||[];if(!list.includes(state.voices[lang]))state.voices[lang]=list[0]||''}voiceList();select(state.id)}
function adminEditor(){
 const t=adminData.templates_data.find(t=>t.id===$('adminTemplate').value);
 const lang=$('adminLanguage').value;
 $('adminText').value=adminData.templates[t.id]?.[lang]??t.texts[lang];$('adminText').dataset.original=$('adminText').value;
 $('adminPlaceholders').textContent='Keep placeholders such as: '+t.fields.map(k=>'['+k+']').join(' ');
}
function stashEditor(){if(adminData){const id=$('adminText').dataset.template,lang=$('adminText').dataset.language;if(id&&lang&&$('adminText').value!==$('adminText').dataset.original){adminData.templates[id]??={};adminData.templates[id][lang]=$('adminText').value}}}
function changeEditor(){stashEditor();adminEditor();$('adminText').dataset.template=$('adminTemplate').value;$('adminText').dataset.language=$('adminLanguage').value}
function adminVoices(){
 $('adminVoices').replaceChildren();
 for(const [lang,names] of Object.entries(adminData.catalog)){
  const group=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent={en:'English',ar:'Arabic',ur:'Urdu'}[lang];group.append(legend);
  for(const voice of names){const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.checked=!adminData.locked_voices.includes(voice);input.onchange=()=>{adminData.locked_voices=adminData.locked_voices.filter(v=>v!==voice);if(!input.checked)adminData.locked_voices.push(voice)};label.append(input,document.createTextNode(voice));group.append(label)}
  $('adminVoices').append(group);
 }
}
async function loadAdmin(){
 adminData=await api('/api/admin/settings');$('adminLogin').hidden=true;$('adminControls').hidden=false;
 $('adminTemplate').replaceChildren(...adminData.templates_data.map(t=>new Option(t.title,t.id)));
 $('adminText').dataset.template='';$('adminText').dataset.language='';changeEditor();adminVoices();adminMessage('Changes apply to all users after saving.');
}
$('adminOpen').onclick=async()=>{$('adminDialog').showModal();adminMessage('');try{await loadAdmin()}catch(e){$('adminLogin').hidden=false;$('adminControls').hidden=true;adminMessage(e.message==='Admin login required'?'':e.message)}};
$('adminClose').onclick=()=>$('adminDialog').close();
$('adminLogin').onsubmit=async e=>{e.preventDefault();try{await api('/api/admin/login',{username:$('adminUsername').value,password:$('adminPassword').value});$('adminPassword').value='';await loadAdmin()}catch(err){adminMessage(err.message)}};
$('adminLogout').onclick=async()=>{try{await api('/api/admin/logout',{});adminData=null;$('adminLogin').hidden=false;$('adminControls').hidden=true;adminMessage('Signed out')}catch(e){adminMessage(e.message)}};
$('adminTemplate').onchange=changeEditor;$('adminLanguage').onchange=changeEditor;
$('adminUnlockAll').onclick=()=>{adminData.locked_voices=[];adminVoices()};
$('adminLockAll').onclick=()=>{adminData.locked_voices=Object.values(adminData.catalog).flat();adminVoices()};
$('adminSave').onclick=async()=>{
 $('adminSave').disabled=true;
 try{stashEditor();const saved=await api('/api/admin/settings',{revision:adminData.revision,locked_voices:adminData.locked_voices,templates:adminData.templates});adminData.revision=saved.revision;await refreshPublic();adminMessage('Saved for all users. Voice locks are active and templates are updated.')}catch(e){adminMessage(e.message)}finally{$('adminSave').disabled=false}
};
// Refresh catalog/template revisions before using a cached announcement.
setInterval(()=>{if(state.data&&!state.building&&!finishPlayback)refreshPublic().catch(()=>{})},60000);
