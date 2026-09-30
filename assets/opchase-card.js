(function(){var lb=document.getElementById('lb'),im=lb.querySelector('img'),a=lb.querySelector('a');
document.addEventListener('click',function(e){var b=e.target.closest('.th');if(b){im.src=b.dataset.full;im.alt=b.getAttribute('aria-label')||'';a.href=b.dataset.href;lb.classList.add('on');return}
if(lb.classList.contains('on')&&(e.target===lb||e.target.closest('#lb button'))){lb.classList.remove('on');im.src=''}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){lb.classList.remove('on');im.src=''}});
function tick(){var n=Date.now();document.querySelectorAll('.left[data-end]').forEach(function(t){var d=Date.parse(t.dataset.end);if(isNaN(d))return;var m=(d-n)/6e4;
if(m<=0){var tr=t.closest('tr');if(tr)tr.remove();return}t.textContent=m<60?Math.floor(m)+'m':(m<2880?Math.floor(m/60)+'h '+Math.floor(m%60)+'m':Math.round(m/1440)+'d')})}
tick();setInterval(tick,30000);
function repU(a){var tr=a.closest('[data-id]'),id=a.dataset.rid||(tr&&tr.dataset.id)||'',ii=(tr&&tr.dataset.i)||'';if(!id)return;var v=(window.OPC_VAR||{})[id]||'';
var p=new URLSearchParams({template:'report.yml',labels:'report',title:'[Report] '+id+' '+v,card_id:id,variant:v});if(ii){p.set('item_id',ii);p.set('listing','https://www.ebay.com/itm/'+ii)}
a.href='https://github.com/wonggum/optcg-index/issues/new?'+p.toString()}
['mouseover','focusin','touchstart','click'].forEach(function(ev){document.addEventListener(ev,function(e){var a=e.target.closest&&e.target.closest('a.rep');if(a)repU(a)},{passive:true})});})();
