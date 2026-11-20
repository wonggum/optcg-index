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
run()})()}else if(document.querySelector('main.cp1')){(function(){
var doc=document;
function parkCardImg(node){
  if(!node||!node.parentNode)return;
  var art=node.closest?node.closest('article.pcard'):null;
  if(!art)return;
  var side=art.querySelector(':scope > .pcard-side')||art.querySelector('.pcard-side');
  if(!side||node.parentNode===side)return;
  side.insertBefore(node,side.firstChild);
}
function parkAllCardImg(){
  [].forEach.call(doc.querySelectorAll('article.pcard > [data-opc-cardimg]'),parkCardImg);
}
parkAllCardImg();
if(window.MutationObserver){
  var parkRoot=doc.getElementById('printings')||doc.body;
  if(parkRoot){
    var parkOb=new MutationObserver(function(){parkAllCardImg()});
    parkOb.observe(parkRoot,{childList:true,subtree:true});
  }
}
function fresh(d){var t=Date.parse(d&&d.fetched_at);return isFinite(t)&& (Date.now()-t)<=6*60*60*1000}
function nOf(d,key){if(!d||d.schema!==4||!d.cards)return 0;var now=Date.now(),n=0,keys=key?[key]:Object.keys(d.cards);
keys.forEach(function(k){var c=d.cards[k]||{};
function add(arr,auc){(Array.isArray(arr)?arr:[]).forEach(function(x){if(!x)return;var e=Date.parse(x.exp);if(!(e>now))return;if(auc){var z=Date.parse(x.end);if(!(z-20*60*1000>now))return}n++})}
add(c.bin,0);add(c.auc,1)});return n}
var links=[].slice.call(doc.querySelectorAll('a.cp1-live[data-cp1-src]'));
var srcs={};links.forEach(function(a){srcs[a.getAttribute('data-cp1-src')]=1});
var urls=Object.keys(srcs);
function apply(map,stale){
if(stale)return;
var rows=[];
[].forEach.call(doc.querySelectorAll('article.pcard'),function(art){
var a=art.querySelector('a.cp1-live');if(!a)return;
var src=a.getAttribute('data-cp1-src'),d=map[src];if(!d||!fresh(d))return;
var n=nOf(d,a.getAttribute('data-cp1-key'));if(n<1)return;
if(a.classList.contains('cp1-ph')){var s=a.querySelector('.cp1-n');if(s){s.textContent=n+' live · ';s.hidden=false}}
else{a.hidden=false;a.textContent=n+' live'}
var nameEl=art.querySelector('.pcard-v');
rows.push({id:art.id,name:nameEl?(nameEl.textContent||'').replace(/\s+/g,' ').trim():art.id})});
var jump=doc.querySelector('p.cp1-jump');if(!jump||!rows.length)return;
var k=rows.length,show=rows.slice(0,4);
jump.textContent='';
jump.appendChild(doc.createTextNode((k===1?'1 version has live listings: ':k+' versions have live listings: ')));
show.forEach(function(r,i){if(i)jump.appendChild(doc.createTextNode(' · '));
var link=doc.createElement('a');link.href='#'+r.id;var label=r.name;
if(label.length>28){link.textContent=label.slice(0,27)+'\u2026';link.title=label}else link.textContent=label;
jump.appendChild(link)});
if(k>4)jump.appendChild(doc.createTextNode(' · +'+(k-4)+' more'));
jump.hidden=false}
if(window.fetch&&urls.length){Promise.all(urls.map(function(u){return fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(d){return [u,d]})})).then(function(pairs){
var map={},stale=false;pairs.forEach(function(p){map[p[0]]=p[1];if(p[1]&&p[1].schema===4&&!fresh(p[1]))stale=true});
if(stale)return;apply(map,false)})}
var box=doc.getElementById('printings'),line=doc.querySelector('p.cp1-imgsrc');
if(box&&line&&window.MutationObserver){var done=false;function stop(ob,t){if(done)return;done=true;ob.disconnect();clearTimeout(t)}
var ob=new MutationObserver(function(){if(box.querySelector('[data-opc-cardimg] img')){line.hidden=false;stop(ob,timer)}});
ob.observe(box,{childList:true,subtree:true});
var timer=setTimeout(function(){stop(ob,timer)},10000);
if(box.querySelector('[data-opc-cardimg] img')){line.hidden=false;stop(ob,timer)}}
var lastImg=null,dlg=null;
function zoom(img){lastImg=img;if(!dlg){dlg=doc.createElement('dialog');dlg.className='cp1-zoom';
var b=doc.createElement('button');b.type='button';b.className='cp1-zoom-x';b.textContent='Close';
var im=doc.createElement('img');var p=doc.createElement('p');p.textContent='Image \u00a9 Bandai Namco / One Piece Card Game';
b.addEventListener('click',function(){dlg.close()});
dlg.addEventListener('click',function(ev){if(ev.target===dlg)dlg.close()});
dlg.addEventListener('close',function(){if(lastImg&&lastImg.focus)lastImg.focus()});
dlg.appendChild(b);dlg.appendChild(im);dlg.appendChild(p);doc.body.appendChild(dlg)}
var im2=dlg.querySelector('img');im2.src=img.currentSrc||img.src;im2.alt=img.alt||'';
if(img.tabIndex<0)img.tabIndex=0;dlg.showModal()}
doc.addEventListener('click',function(ev){var t=ev.target;if(t&&t.tagName==='IMG'&&t.closest&&t.closest('.cp1 [data-opc-cardimg]')){ev.preventDefault();zoom(t)}});
})()}else
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
