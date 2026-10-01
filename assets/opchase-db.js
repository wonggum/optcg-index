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
