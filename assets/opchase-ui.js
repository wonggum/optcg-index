/* OPChase shared UI (all pages): light/dark theme toggle. The initial theme is set before paint by the inline <head> snippet (design/chrome.py THEME_INIT). */
(function(){
  var root=document.documentElement,KEY='opc-theme',mq=window.matchMedia?matchMedia('(prefers-color-scheme: light)'):null;
  function stored(){try{var t=localStorage.getItem(KEY);return t==='light'||t==='dark'?t:null}catch(e){return null}}
  function apply(t){root.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#fbfbfa':'#0b0d11');
    document.querySelectorAll('.js-theme').forEach(function(b){var n=t==='light'?'dark':'light';b.setAttribute('aria-label','Switch to '+n+' theme');b.setAttribute('title','Switch to '+n+' theme');b.setAttribute('aria-pressed',t==='light'?'true':'false')})}
  apply(stored()||(mq&&mq.matches?'light':'dark'));
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.js-theme');if(!b)return;var t=root.getAttribute('data-theme')==='light'?'dark':'light';try{localStorage.setItem(KEY,t)}catch(_){}apply(t)});
  if(mq){var f=function(e){if(!stored())apply(e.matches?'light':'dark')};mq.addEventListener?mq.addEventListener('change',f):mq.addListener&&mq.addListener(f)}
})();
