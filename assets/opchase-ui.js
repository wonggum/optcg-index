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
   is configured) AND GoatCounter's count.js has loaded AND the browser sends no Do Not Track / Global Privacy Control signal AND the
   #toggle-goatcounter opt-out (localStorage skipgc) is not set; gcOff() checks this itself on every click, before count() is called. Event name: ebay/<page>/<slot>/<card>, decoded from the EPN
   customid <page>_<slot>__<cardkey>[__s<src>] (the B1 source suffix __s<src> is stripped first; cardkey: "x" = "-", "y" = "_", "z" = "."). No cookies, no personal data; nothing else is sent. */
(function(){
  var m=document.querySelector('meta[name="opc-click-events"]');if(!m||m.getAttribute('content')!=='on')return;
  function decode(cid){var p=String(cid||'').replace(/__s(gpt|ppx|bng|gem|cld|ggl|xtw|rdt|dir|oth)$/,'').split('__'),ps=p[0],i=ps.indexOf('_'),page=i<0?ps:ps.slice(0,i),slot=i<0?'link':ps.slice(i+1),
    card=p[1]?p[1].replace(/x/g,'-').replace(/y/g,'_').replace(/z/g,'.'):'none';return 'ebay/'+(page||'site')+'/'+(slot||'link')+'/'+card}
  function gcOff(){if(navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true)return true;try{return localStorage.getItem('skipgc')==='t'}catch(_){return true}}
  function send(a){if(gcOff())return;var gc=window.goatcounter;if(!gc||typeof gc.count!=='function'||gc.no_onload)return;var h=a.getAttribute('href')||'',mm=h.match(/[?&]customid=([A-Za-z0-9_]+)/);
    try{gc.count({path:decode(mm?mm[1]:''),title:'eBay outbound click',event:true})}catch(_){}}
  function onClick(e){var a=e.target.closest&&e.target.closest('a[href*="ebay.com"]');if(a)send(a)}
  document.addEventListener('click',onClick,true);
  document.addEventListener('auxclick',function(e){if(e.button===1)onClick(e)},true);
  window.OPC_EBAY_EVENT=decode;   // exposed for QA only
})();
/* EPN source tag, sitewide (opchase_epn_srctag_r1, extends B1 opchase_epn_b1_r1 to every page that loads this file). Reads utm_source and
   document.referrer of THIS pageview only; at click time appends __s<code> to the customid of eBay links that carry campid (campid, rel and
   every other parameter untouched). Codes: gpt ppx bng gem cld ggl xtw rdt dir oth. No cookies, no storage, no network requests.
   Skips links already tagged (e.g. by the B1 inline script) and never makes a customid longer than 200 characters. */
(function(){
var C=[['gpt',['chatgpt','chatgpt.com','openai'],['chatgpt.com','chat.openai.com','openai.com']],
['ppx',['perplexity','perplexity.ai'],['perplexity.ai']],
['bng',['copilot','bing'],['copilot.microsoft.com','copilot.cloud.microsoft','bing.com','edgeservices.bing.com']],
['gem',['gemini','bard'],['gemini.google.com','bard.google.com']],
['cld',['claude','claude.ai','anthropic'],['claude.ai']],
['ggl',['google'],null],
['xtw',['x','twitter','t.co'],['t.co','x.com','twitter.com','mobile.twitter.com']],
['rdt',['reddit','reddit.com'],['reddit.com','redd.it']]];
var GG=/^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/,DONE=/__s(gpt|ppx|bng|gem|cld|ggl|xtw|rdt|dir|oth)$/,CID=/([?&]customid=)([A-Za-z0-9_]{1,200})(?=&|#|$)/,EB=/^https?:\/\/([a-z0-9-]+\.)*ebay\.[a-z.]+\//i;
function sub(h,d){return h===d||h.slice(-d.length-1)==='.'+d}
function code(us,ref,self){var i,j,h='';us=String(us||'').toLowerCase().trim();
  if(us){for(i=0;i<C.length;i++)if(C[i][1].includes(us))return C[i][0];return 'oth'}
  try{h=ref?new URL(ref).hostname.toLowerCase():''}catch(e){h=''}
  if(!h||h===String(self||'').toLowerCase())return 'dir';
  for(i=0;i<C.length;i++){if(!C[i][2]){if(GG.test(h)||h==='news.google.com')return C[i][0];continue}
    for(j=0;j<C[i][2].length;j++)if(sub(h,C[i][2][j]))return C[i][0]}
  return 'oth'}
function tagHref(h,k){h=String(h||'');if(!EB.test(h)||!/[?&]campid=/.test(h))return h;var m=h.match(CID);if(!m||DONE.test(m[2]))return h;
  var v=m[2]+'__s'+k;return v.length>200?h:h.replace(CID,function(_,k){return k+v})}
var us='';try{us=new URLSearchParams(location.search).get('utm_source')||''}catch(e){}
var K=code(us,document.referrer,location.hostname);
function on(e){var a=e.target&&e.target.closest&&e.target.closest('a[href*="ebay."]');if(!a)return;var h=a.getAttribute('href'),n=tagHref(h,K);if(n!==h)a.setAttribute('href',n)}
['pointerdown','mousedown','touchstart','keydown','click','auxclick','contextmenu'].forEach(function(t){document.addEventListener(t,on,true)});
window.OPC_SRC_ALL={code:code,tagHref:tagHref,k:K};   // exposed for QA only
})();
