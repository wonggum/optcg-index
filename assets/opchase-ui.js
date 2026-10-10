/* OPChase shared UI (all pages): light/dark theme toggle (light default; dark only when chosen, saved in localStorage opc-theme). The initial theme is set before paint by an inline <head> snippet. */
(function(){
  var root=document.documentElement,KEY='opc-theme';
  function stored(){try{var t=localStorage.getItem(KEY);return t==='light'||t==='dark'?t:null}catch(e){return null}}
  function apply(t){root.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#fbfbfa':'#0b0d11');
    document.querySelectorAll('.js-theme').forEach(function(b){var n=t==='light'?'dark':'light';b.setAttribute('aria-label','Switch to '+n+' theme');b.setAttribute('title','Switch to '+n+' theme');b.setAttribute('aria-pressed',t==='light'?'true':'false')})}
  apply(stored()||'light');   // light is the default; dark only after an explicit toggle (2026-10-01)
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.js-theme');if(!b)return;var t=root.getAttribute('data-theme')==='light'?'dark':'light';try{localStorage.setItem(KEY,t)}catch(_){}apply(t)});
})();
/* Outbound eBay click events (2026-10-04). No-op unless the page has <meta name="opc-click-events" content="on"> (set only when GoatCounter
   is configured) AND GoatCounter's count.js has loaded. Event name: ebay/<page>/<slot>/<card>, decoded from the EPN
   customid <page>_<slot>__<cardkey> (cardkey: "x" = "-", "y" = "_", "z" = "."). No cookies, no personal data; nothing else is sent. */
(function(){
  var m=document.querySelector('meta[name="opc-click-events"]');if(!m||m.getAttribute('content')!=='on')return;
  function decode(cid){var p=String(cid||'').split('__'),ps=p[0],i=ps.indexOf('_'),page=i<0?ps:ps.slice(0,i),slot=i<0?'link':ps.slice(i+1),
    card=p[1]?p[1].replace(/x/g,'-').replace(/y/g,'_').replace(/z/g,'.'):'none';return 'ebay/'+(page||'site')+'/'+(slot||'link')+'/'+card}
  function send(a){var gc=window.goatcounter;if(!gc||typeof gc.count!=='function')return;var h=a.getAttribute('href')||'',mm=h.match(/[?&]customid=([A-Za-z0-9_]+)/);
    try{gc.count({path:decode(mm?mm[1]:''),title:'eBay outbound click',event:true})}catch(_){}}
  function onClick(e){var a=e.target.closest&&e.target.closest('a[href*="ebay.com"]');if(a)send(a)}
  document.addEventListener('click',onClick,true);
  document.addEventListener('auxclick',function(e){if(e.button===1)onClick(e)},true);
  window.OPC_EBAY_EVENT=decode;   // exposed for QA only
})();
