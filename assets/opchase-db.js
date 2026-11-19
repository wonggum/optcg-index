/* SETPAGE-LAYOUT-1 start: set pages (main.sp1) only; every other page runs the original 10 lines below unchanged */
if(document.querySelector('main.sp1')){(function(){
var LIM=30,doc=document,UC=['DON!!','Event','No card number'];
[].forEach.call(doc.querySelectorAll('a.sp1-live[data-sp1-live]'),function(a){var s=a.getAttribute('data-sp1-live');if(!/^[a-z0-9-]+$/.test(s)||!window.fetch)return;
fetch('../../data/listings/cards/'+s+'.v4.json',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():null}).then(function(d){if(!d||!d.cards||typeof d.cards!=='object')return;var now=Date.now(),n=0;
Object.keys(d.cards).forEach(function(k){var c=d.cards[k]||{};['bin','auc'].forEach(function(f){(Array.isArray(c[f])?c[f]:[]).forEach(function(x){var e=x&&typeof x.exp==='string'?Date.parse(x.exp):NaN;if(e>now)n++})})});
if(n>=1){a.textContent=n+' live';a.hidden=false}}).catch(function(){})});
(function(){var im=doc.querySelectorAll('img.sp1-ci');if(!im.length)return;function rm(i){if(i.parentNode)i.parentNode.removeChild(i);if(!doc.querySelector('img.sp1-ci')){var p=doc.querySelector('.sp1-cisrc');if(p&&p.parentNode)p.parentNode.removeChild(p)}}[].forEach.call(im,function(i){if(i.complete&&i.naturalWidth===0&&i.getAttribute('loading')!=='lazy')rm(i);else i.addEventListener('error',function(){rm(i)})});if(window.fetch)fetch('../../assets/opchase-cardimg.json',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(d){if(!d||d.on!==true)[].forEach.call(doc.querySelectorAll('img.sp1-ci'),rm)})})();
var q=doc.getElementById('q'),t=doc.getElementById('cl');if(!q||!t)return;
var tb=t.tBodies[0],tpl=doc.getElementById('cl-rest'),more=doc.getElementById('cl-more'),fn=doc.getElementById('fn'),btn=doc.getElementById('sp1-more');
if(btn&&+btn.getAttribute('data-lim')>0)LIM=+btn.getAttribute('data-lim');
if(tpl){tb.appendChild(tpl.content);tpl.remove();if(more&&more.parentNode)more.parentNode.remove()}
var rows=[].slice.call(tb.rows),sel=['fg','fc','ft','fv'].map(function(i){return doc.getElementById(i)}),key={fg:'g',fc:'c',ft:'t',fv:'v'};
var fg=sel[0],fg0=fg?fg.value:'',chips=[].slice.call(doc.querySelectorAll('.sp1-rchips button[data-k]')),ck='',open=false;
var N=btn?+btn.getAttribute('data-n'):0;if(!N){N=0;rows.forEach(function(r){if(UC.indexOf(r.getAttribute('data-k'))<0&&(!fg0||r.getAttribute('data-g')===fg0))N++})}
var ec=[].slice.call(t.querySelectorAll('td[data-l="PSA 10"]'));if(ec.length&&ec.every(function(c){return !c.textContent.trim()&&!c.children.length})){ec.forEach(function(c){c.style.display='none'});[].forEach.call(t.tHead.rows[0].cells,function(h){if(h.textContent.trim()==='On eBay')h.style.display='none'})}
function active(){return !!(ck||q.value.trim()||sel.some(function(e){return e&&(e===fg?e.value!==fg0:e.value)}))}
function run(){var s=q.value.trim().toLowerCase(),act=active(),m=[];
rows.forEach(function(r){var k=r.getAttribute('data-k')||'',ok=ck?k===ck:UC.indexOf(k)<0;
if(ok&&s)ok=(r.getAttribute('data-s')||r.textContent.toLowerCase()).indexOf(s)>=0;
sel.forEach(function(e){if(ok&&e&&e.value){var v=r.getAttribute('data-'+key[e.id])||'';ok=e.id==='fc'?(' '+v+' ').indexOf(' '+e.value+' ')>=0:v===e.value}});
if(ok)m.push(r);r.style.display='none'});
var show=act||open?m:m.slice(0,LIM);show.forEach(function(r){r.style.display=''});
if(fn)fn.textContent=act?('Showing '+m.length+' matching cards'):('Showing '+show.length+' of '+N);
if(btn){btn.hidden=act||N<=LIM;btn.textContent=open?'Show fewer \u2191':'Show all '+N+' cards \u2193'}}
chips.forEach(function(b){b.addEventListener('click',function(){ck=b.getAttribute('data-k')||'';chips.forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')});run()})});
q.addEventListener('input',run);sel.forEach(function(e){if(e)e.addEventListener('change',run)});
if(btn)btn.addEventListener('click',function(){open=!open;run();if(!open){var l=doc.getElementById('list');if(l&&l.scrollIntoView)l.scrollIntoView()}});
run()})()}else
/* SETPAGE-LAYOUT-1 end */
(function(){var q=document.getElementById('q'),t=document.getElementById('cl');if(!q||!t)return;
var sel=['fg','fc','ft','fr','fv'].map(function(i){return document.getElementById(i)});var key={fg:'g',fc:'c',ft:'t',fr:'r',fv:'v'};
var tb=t.tBodies[0],rows=[].slice.call(tb.rows),fn=document.getElementById('fn'),tpl=document.getElementById('cl-rest'),more=document.getElementById('cl-more');
var total=more?+more.dataset.total:rows.length;
function expand(){if(!tpl)return;tb.appendChild(tpl.content);tpl.remove();tpl=null;rows=[].slice.call(tb.rows);if(more)more.parentNode.remove()}
function active(){return q.value.trim()||sel.some(function(e){return e&&e.value&&e.id!=='fg'})}
function run(){var s=q.value.trim().toLowerCase(),n=0;rows.forEach(function(r){var ok=!s||(r.dataset.s||r.textContent.toLowerCase()).indexOf(s)>=0;sel.forEach(function(e){if(ok&&e&&e.value){var v=r.dataset[key[e.id]]||'';ok=e.id==='fc'?(' '+v+' ').indexOf(' '+e.value+' ')>=0:v===e.value}});r.style.display=ok?'':'none';if(ok)n++});
if(fn)fn.textContent=tpl?('First '+rows.length+' of '+total.toLocaleString()+' printings'):(n+' of '+rows.length+' shown')}
function go(){if(tpl&&(active()||this===more))expand();run()}
q.addEventListener('input',go);sel.forEach(function(e){if(e)e.addEventListener('change',function(){expand();run()})});if(more)more.addEventListener('click',function(){expand();run()});run()})();
