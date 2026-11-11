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
/* Stale-listing fallback module. Independent of the inline v4 loader (which is not changed).
   When the loader marks a slot data-v4st="1" (listing file older than its 6 h window, or invalid), this module re-reads the SAME JSON
   (data-v4 URL, cache:'no-cache') on every opc:listings event and every 60 s, and renders the last listing data without the 6 h FRESH
   cap and without the per-listing exp cap. Auctions are still filtered by end time (an ended auction is never shown); auctions are
   ordered by soonest end, Buy It Now by lowest listed amount. A neutral line says when the listings were last updated. Every slot keeps
   its static Search on eBay link (a rendered Buy It Now / bid button gets that same link below it). Affiliate params, rel and the
   customid come from the loader code copied verbatim below (campid 5339217952, rel "sponsored noopener"); AB-4b adds a raw-card layer for pilot keys (OP10 + Luffy calibrated rows from assets/version-keywords-pilot.json).
   Bandai thumbnails: assets/opchase-bdimg.json (signed imgmap_* tables, status mapped only). Kill switch: that file with "on":false
   (or the file removed) -> no official image is shown anywhere; no ?v change needed. */
(function(){if(window.OPC_SFB)return;window.OPC_SFB=1;
var EPN='mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339217952&customid={c}&toolid=10001&mkevt=1',REL='sponsored noopener',
MSG='Live listings updating \u2014 search on eBay',NOTE=0,FB=[],CACHE={},
ITM=/^[0-9]{9,15}$/,IMG=/^[A-Za-z0-9_~-]{8,40}$/,SEL=/^[A-Za-z0-9_.*\-]{1,64}$/,CK=/^[A-Za-z0-9]{1,60}$/,CID=/^[A-Za-z0-9_]{1,40}$/,FIRE=5,
DENY={'__proto__':1,constructor:1,prototype:1},HOLDK={ST01x012xSPR:1,ST13x003x2AxWIN:1,Px007xCELEB:1,Px041xONLINExV2:1,Px106xWIN:1},
/*BLOCKKEYS r1: r7 curate_policy key-level bans + GM whole-number bans; never rendered in any zone*/BLKK={CHxOP05x119yp7:1,CHxOP09x051yp4:1,CHxOP09x051yp5:1,CHxOP09x093yp4:1,CHxOP16x011yp1:1,CHxST10x006yp2:1,CHxST16x004yp1:1,OP09x004xSPxGOLD:1,OP09x093xWANTED:1,OP09x119xSPxEN:1},WLP=0,WLM={},WLU='opc_itm_whitelist.json',BLKN=/^(?!(?:OP17x112xMANGA|OP17x118xSAA)$)(?:CHx|JPx)?(?:OP17x040|OP17x112|OP17x118|ST13x002)(?![0-9])/,/*/BLOCKKEYS*/
BAD=/[<>`{}\\\u0000-\u001f\u007f-\u009f\u00ad\u034f\u115f\u1160\u180e\u3164\u200b-\u200f\u2028\u2029\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff]|\udb40[\udc00-\udc7f]/;
/*SPAM-GEN*/var CONF={"\u0430": "a", "\u0432": "b", "\u0435": "e", "\u0451": "e", "\u043a": "k", "\u043c": "m", "\u043d": "h", "\u043e": "o", "\u0440": "p", "\u0441": "c", "\u0442": "t", "\u0443": "y", "\u0445": "x", "\u0456": "i", "\u0457": "i", "\u0458": "j", "\u0455": "s", "\u0501": "d", "\u051b": "q", "\u051d": "w", "\u0261": "g", "\u0251": "a", "\u03bf": "o", "\u03b1": "a", "\u03b2": "b", "\u03b5": "e", "\u03b9": "i", "\u03ba": "k", "\u03bd": "v", "\u03c1": "p", "\u03c4": "t", "\u03c5": "u", "\u03c7": "x", "\u03c9": "w", "\u0131": "i", "\u0269": "i", "\u2113": "l", "\u3002": ".", "\uff61": ".", "\u2024": ".", "\u2027": ".", "\u00b7": ".", "\u2022": ".", "\u2219": ".", "\u22c5": ".", "\uff20": "@", "\ufe6b": "@"},SAFE=[[new RegExp("([a-z])\\.d\\.(?=[a-z])","g"),"$1 d "],[new RegExp("\\bd\\.(?=[a-z])","g"),"d "],[new RegExp("\\bmr\\.2\\.bon\\.","g"),"mr 2 bon "],[new RegExp("\\bmr\\.(?=\\s*\\d)","g"),"mr "],[new RegExp("\\b(mr|mrs|ms|dr|jr|sr|st|vol|no|ver|ed|sp|alt|ft|pt|gem|mt|pr|ex|vs)\\.","g"),"$1 "]],SELU=new RegExp("^(?:https?|www)[.:]|^www|\\.(?:com|net|org|io|co|me|us|uk|ca|au|de|fr|jp|cn|ru|tv|cc|gg|ly|app|dev|shop|store|site|online|top|vip|club|link|live|xyz|info|biz)(?![\\s\\S])|\\.(?:com|co|net|org)\\.[a-z]{2}(?![\\s\\S])|\\.\\.|^\\.|\\.(?![\\s\\S])",'i'),SPAM=new RegExp("https?:|www\\.|\\b[a-z0-9][a-z0-9-]+\\.[a-z]{2,6}\\b(?!\\.?\\d)|\\b[a-z0-9]\\.(?:com|net|org|io|co|me|us|uk|ca|au|de|fr|jp|cn|ru|tv|cc|gg|ly|app|dev|shop|store|site|online|top|vip|club|link|live|xyz|info|biz)\\b|\\bdot\\s*(?:com|net|org)\\b|[(\\[]\\s*dot\\s*[)\\]]|@\\s*[a-z0-9_]|\\be[\\s._-]?mail\\b|\\b(?:g|hot|yahoo|proton)?mail\\s*(?:me|us)\\b|\\b(?:gmail|yahoo|hotmail|outlook|icloud|proton(?:mail|\\s*me)?|aol|gmx|ymail)\\b|\\blive\\s*(?:dot|\\.)\\s*com\\b|\\bat\\s+(?:gmail|yahoo|hotmail|outlook|icloud|proton\\w*|aol|gmx|ymail)\\b|\\b(?:telegram|whatsapp|instagram|insta|ig|discord|signal|snapchat|wechat|venmo|cashapp|zelle|paypal\\s*me)\\b|\\bt\\.me\\b|\\bwa\\.me\\b|(?:\\+?1[\\s.-]?)?\\(?\\b\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}\\b",""),SPNS=new RegExp("[a-z0-9]\\.(?:com|net|org|io|gg|me|shop|store|xyz|co|us|ly|app)(?![a-z])",""),SPSQ=new RegExp("gmail|hotmail|yahoomail|icloud|protonmail|outlookcom|telegram|whatsapp|instagram|discord|snapchat|https?www|www[a-z0-9]{2,}(?:com|net|org)|[a-z0-9]{3,}dotcom","");function selOk(s){return typeof s==='string'&&SEL.test(s)&&!SELU.test(s)}function fold(t){t=t.normalize('NFKD').replace(/\p{Mn}/gu,'').toLowerCase();var o='',i,c;for(i=0;i<2;i++){o='';for(c of t)o+=CONF.hasOwnProperty(c)?CONF[c]:c;t=o}return t}function spam(t){var f=fold(t),k;for(k=0;k<SAFE.length;k++)f=f.replace(SAFE[k][0],SAFE[k][1]);return SPAM.test(f)||SPNS.test(f.replace(/[ \t\n\r\f\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]+/g,''))||SPSQ.test(f.replace(/[^a-z0-9]+/g,''))}/*/SPAM-GEN*/
function ckOk(c){return typeof c==='string'&&CK.test(c)&&!DENY[c]&&!HOLDK[c]&&(WLP===c||!BLKK[c])&&!BLKN.test(c)}
function tOk(t){return typeof t==='string'&&t.length>0&&t.length<=80&&t.normalize('NFKC')===t&&!BAD.test(t)&&!spam(t)}
function aOk(t){return typeof t==='string'&&t.length>0&&t.length<=160&&t.normalize('NFKC')===t&&!BAD.test(t)&&!spam(t)}   // Bandai alt only (cap 160); eBay titles keep tOk 80
function mskT(t){return typeof t==='string'?t.replace(/(^|[^0-9])([0-9]{5,})([0-9]{4})(?![0-9])/g,function(m,a,b,c){return a+b.replace(/[0-9]/g,'*')+c}):t}
function mskD(d,z){if(d&&typeof d==='object'&&(z|0)<8){var k;if(Array.isArray(d)){for(k=0;k<d.length;k++)mskD(d[k],(z|0)+1)}else for(k in d){if(!Object.prototype.hasOwnProperty.call(d,k))continue;if(k==='title'&&typeof d[k]==='string')d[k]=mskT(d[k]);else mskD(d[k],(z|0)+1)}}return d}
function own(d,c){return d.cards&&typeof d.cards==='object'&&ckOk(c)&&Object.prototype.hasOwnProperty.call(d.cards,c)?d.cards[c]:null}
function wb(e){e.style.overflowWrap='anywhere';e.style.wordBreak='break-word';return e}
function el(t,a,txt){var e=document.createElement(t);if(a)for(var k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e}
var CKO=null;function href(L,cid){var c=CID.test(cid||'')?cid:'site';return 'https://www.ebay.com/itm/'+L.itm+'?'+EPN.replace('{c}',c+'__'+(CKO||L.card))}
function a(L,cid,cls,txt){var x=el('a',{href:href(L,cid),rel:REL,target:'_blank'},txt);if(cls)x.className=cls;return x}
function fire(L){return !!L&&L.auction===true&&typeof L.bids==='number'&&L.bids>=FIRE}
function money(v){return '$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function left(end){var m=(Date.parse(end)-Date.now())/6e4;return m<60?Math.max(1,Math.floor(m))+'m':(m<2880?Math.floor(m/60)+'h '+Math.floor(m%60)+'m':Math.round(m/1440)+'d')}
function btn(L,p){var s=el('span',{'class':'ebp-i'}),x;
 if(L.auction){x=a(L,p+'_bid','ebtn ebtn-sm ebtn-au',(fire(L)?'\ud83d\udd25 ':'')+'Current bid '+money(L.price)+' \u00b7 '+(L.bids!=null?L.bids+' bid'+(L.bids===1?'':'s')+' \u00b7 ':''));
  var t=el('span',{'class':'left','data-end':L.end},left(L.end));x.appendChild(t);x.appendChild(document.createTextNode(' left'))}
 else x=a(L,p+'_bin','ebtn ebtn-sm ebtn-bn','Buy Now '+money(L.price));s.appendChild(x);return s}
function photo(L,cid,w,h){if(!L.img)return null;var u='https://i.ebayimg.com/images/g/'+L.img+'/s-l',x=a(L,cid,'chl-ph');
 x.appendChild(el('img',{src:u+'500.jpg',srcset:u+'500.jpg 500w, '+u+'1000.jpg 1000w',alt:'eBay listing photo',loading:'lazy',decoding:'async',width:w,height:h,referrerpolicy:'no-referrer'}));return x}
function credit(L,cid){var p=el('p',{'class':'hs-attr'},'Photo: eBay listing'+(L.seller?' by '+L.seller:'')+' \u00b7 ');p.appendChild(a(L,cid,null,'View on eBay'));return p}
function pill(mini){var s=el('span',{'class':'pill ok tC'+(mini?' mini':''),'data-tip':''},'\u2713 Details checked');if(!mini)s.setAttribute('tabindex','0');return s}
function render(ph,L){CKO=ph.getAttribute('data-cid-key');if(!CK.test(CKO||''))CKO=null;var k=ph.getAttribute('data-kind'),p=ph.getAttribute('data-pfx')||'site',cp=ph.getAttribute('data-cid-photo')||p+'_photo',cc=ph.getAttribute('data-cid-credit')||p+'_credit',out=[],im;
 if(k==='chk'){if(L.chk===true)out.push(pill(1))}
 else if(k==='btn')out.push(btn(L,p));
 else if(k==='ph'){im=photo(L,cp,300,400);if(im)out.push(im);out.push(credit(L,cc))}
 else if(k==='row'){var td=el('td',{'class':'im'});im=photo(L,cp,72,96);if(im)td.appendChild(im);out.push(td,wb(el('td',{'class':'sm ttl'},L.title)),el('td',{'class':'r'},(L.auction?'Current bid ':'')+money(L.price)));var t2=el('td');t2.appendChild(btn(L,p));out.push(t2)}
 else{var w=el('div',{'class':k==='tile'?'tile-eb':'chl-i'});im=photo(L,cp,k==='tile'?300:220,k==='tile'?400:293);if(im)w.appendChild(im);w.appendChild(credit(L,cc));
  w.appendChild(wb(el('div',{'class':'lt-ttl',title:L.title},L.title)));var e=el('div',{'class':'ebp'});e.appendChild(btn(L,p));w.appendChild(e);out.push(w)}
 return out}
var BASE=(function(){var s=(document.currentScript&&document.currentScript.src)||'',i=s.lastIndexOf('assets/opchase-ui.js');return i>=0?s.slice(0,i):''})();
var SN=new WeakMap(),RUN=0,BDP=null,BDU=/^https:\/\/en\.onepiece-cardgame\.com\/images\/cardlist\/card\/[A-Za-z0-9_-]{3,40}\.png(\?[0-9]{1,10})?$/;
/* same field checks as the loader's okL, minus FRESH / exp; auction: only "not ended yet" (now < end) */
function okS(L,n){var d=L&&L.auction?Date.parse(L.end):0;return !!L&&typeof L==='object'&&!Array.isArray(L)&&typeof L.itm==='string'&&ITM.test(L.itm)&&tOk(L.title)
 &&typeof L.price==='number'&&isFinite(L.price)&&L.price>0&&L.price<=200000&&(L.seller===null||selOk(L.seller))&&(L.img==null||(typeof L.img==='string'&&IMG.test(L.img)))
 &&ckOk(L.card)&&typeof L.auction==='boolean'&&typeof L.chk==='boolean'&&(!L.auction||(isFinite(d)&&n<d))}
function byEnd(x,y){return Date.parse(x.end)-Date.parse(y.end)||(x.itm<y.itm?-1:x.itm>y.itm?1:0)}
function byAmt(x,y){return x.price-y.price||(x.itm<y.itm?-1:x.itm>y.itm?1:0)}
function uniq(v){var u={};return v.filter(function(L){if(u[L.itm])return false;u[L.itm]=1;return true})}
function pickS(d,ph,n){if(ph.hasAttribute('data-itm-wl'))return null;
 var c=ph.getAttribute('data-card'),l=ph.getAttribute('data-list'),k=+ph.getAttribute('data-n')||0,C,A,S={},B;
 if(l==='ending'){A=(Array.isArray(d.ending)?d.ending:[]).filter(function(L){if(!L||typeof L!=='object'||!L.auction)return false;var O=own(d,L.card);
   return !!O&&Array.isArray(O.auc)&&O.auc.some(function(x){return x&&x.itm===L.itm})&&okS(L,n)});return uniq(A).sort(byEnd)[k]||null}
 C=own(d,c);if(!C)return null;
 A=uniq((Array.isArray(C.auc)?C.auc:[]).filter(function(L){return !!L&&L.card===c&&L.auction===true&&okS(L,n)})).sort(byEnd);A.forEach(function(L){S[L.itm]=1});
 B=uniq((Array.isArray(l==='grail'?C.grail:C.bin)?(l==='grail'?C.grail:C.bin):[]).filter(function(L){return !!L&&L.card===c&&L.auction===false&&!S[L.itm]&&okS(L,n)})).sort(byAmt);
 if(l==='auc')return A[k]||B[k-A.length]||null;
 if(l==='bin'||l==='grail')return B[k]||null;
 return null}
function ptS(t){try{var q={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).formatToParts(new Date(t)).forEach(function(x){q[x.type]=x.value});return q.month+' '+q.day+', '+q.hour+':'+q.minute+' '+q.dayPeriod+' PT'}catch(_){return new Date(t).toISOString()}}
function rd(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){return mskD(d,0)}).catch(function(){return null})}
function isBd(x){return x&&x.nodeType===1&&x.hasAttribute('data-bdimg')}
function put(ph,nodes){var k=null;[].slice.call(ph.childNodes).forEach(function(c){if(isBd(c)&&!k)k=c;else ph.removeChild(c)});nodes.forEach(function(x){if(!isBd(x))ph.appendChild(x)});if(k&&ph.firstChild!==k)ph.insertBefore(k,ph.firstChild)}   // keeps the Bandai image first
var AT=['data-v4a','data-v4e','data-v4i','data-v4ck','data-v4tot'];
function back(ph){var s=SN.get(ph);if(s)put(ph,s.map(function(c){return c.cloneNode(true)}));ph.removeAttribute('data-sfb');AT.forEach(function(k){ph.removeAttribute(k)});ph.setAttribute('data-v4-live','0')}
function srch(ph){var s=SN.get(ph)||[],r=null;s.forEach(function(c){if(r||c.nodeType!==1)return;r=(c.matches&&c.matches('a[href*="/sch/"]'))?c:c.querySelector('a[href*="/sch/"]')});return r?r.cloneNode(true):null}
function note(fa){var p=document.querySelector('p[data-v4sn]');if(!isFinite(fa)){if(p)p.parentNode.removeChild(p);[].forEach.call(document.querySelectorAll('p[data-v4n]'),function(x){x.style.display=''});return}
 var txt='eBay listings here are from our last listing update ('+ptS(fa)+'). They can change on eBay at any time; ended auctions are not shown.';
 if(!p){p=el('p',{'class':'stl sm','data-v4sn':'1','role':'status'});var f=document.querySelector('.v4s[data-sfb="1"]')||document.querySelector('.v4s'),t=f&&((f.parentNode&&f.parentNode.closest('.tl,.lcar,.car,table,.chl-g'))||f);if(t&&t.parentNode)t.parentNode.insertBefore(p,t);else return}
 if(p.textContent!==txt)p.textContent=txt;[].forEach.call(document.querySelectorAll('p[data-v4n]'),function(x){x.style.display='none'})}
function pkey(){try{var b=new URL(BASE||'/',location.href).pathname,p=location.pathname;if(p.startsWith(b))p=p.slice(b.length);return p.replace(/[^\/]+\.html$/,'').replace(/^\/+/,'')}catch(_){return ''}}
function bd(){if(!BDP)BDP=rd(BASE+'assets/opchase-bdimg.json');return BDP}
var BDSRC='Card image: \u00a9 Bandai / ONE PIECE CARD GAME official card list';   // verbatim WL2:8; the only source line
function bdE(e){var o=Array.isArray(e)?{u:e[0],a:e[1]}:(e&&typeof e==='object'?e:null);if(!o||!BDU.test(o.u||'')||!aOk(o.a||''))return null;
 var w=+o.w,h=+o.h;if(!(w>0&&w<=1200&&w===Math.floor(w)&&h>0&&h<=1700&&h===Math.floor(h))){w=600;h=838}return{u:o.u,a:o.a,w:w,h:h}}
function bdPass(){return bd().then(function(m){var on=!!(m&&m.on===true&&m.pages&&typeof m.pages==='object'),M=on&&Object.prototype.hasOwnProperty.call(m.pages,pkey())?m.pages[pkey()]:null;
 [].forEach.call(document.querySelectorAll('.v4s[data-kind="ph"]'),function(ph){var X=[].slice.call(ph.querySelectorAll('[data-bdimg]')),c=ph.getAttribute('data-card'),e=M&&ckOk(c)&&Object.prototype.hasOwnProperty.call(M,c)?bdE(M[c]):null;
  if(!e){X.forEach(function(x){x.parentNode.removeChild(x)});return}
  var x=X.shift();X.forEach(function(y){y.parentNode.removeChild(y)});if(x&&x.getAttribute('data-bdu')===e.u){if(ph.firstChild!==x)ph.insertBefore(x,ph.firstChild);return}if(x)x.parentNode.removeChild(x);
  var w=el('span',{'class':'opc-bdimg','data-bdimg':'1','data-bdu':e.u,style:'display:block;margin:0 0 .75em'});
  w.appendChild(el('img',{src:e.u,alt:e.a,loading:'lazy',decoding:'async',width:String(e.w),height:String(e.h),referrerpolicy:'no-referrer',style:'display:block;width:100%;max-width:min(100%,'+e.w+'px);height:auto'}));
  w.appendChild(el('span',{'class':'sm'},BDSRC));ph.insertBefore(w,ph.firstChild)})})}

/* AB-4b: pilot two-tier raw-card layer (assets/version-keywords-pilot.json). */
var VKP=null,VKP_L=null,LM7='No PSA 10 listed right now \u2014 raw copies below if you want to grade one yourself',GUIDE_REL='guides/read-psa-label/';
function vkLoad(){if(VKP_L)return VKP_L;VKP_L=rd(BASE+'assets/version-keywords-pilot.json').then(function(d){VKP=(d&&typeof d==='object'&&Array.isArray(d.rows))?d:null;return VKP}).catch(function(){VKP=null;return null});return VKP_L}
function vkIdx(){var byK={},byC={};if(!VKP)return{byK:byK,byC:byC};VKP.rows.forEach(function(r){if(!r||typeof r.k!=='string'||typeof r.c!=='string')return;byK[r.k]=r;(byC[r.c]=byC[r.c]||[]).push(r)});return{byK:byK,byC:byC}}
function tok(s){return String(s||'').toLowerCase().match(/[a-z0-9]+/g)||[]}
function hasWords(t,w){if(!w||!String(w).trim())return true;var tl=String(t||'').toLowerCase();return String(w).toLowerCase().split(/\s+/).filter(Boolean).every(function(x){return tl.indexOf(x)>=0})}
function exclOk(t,ex){if(!ex||!String(ex).trim())return true;var tl=String(t||'').toLowerCase(),parts=String(ex).match(/"[^"]+"|[^\s]+/g)||[];for(var i=0;i<parts.length;i++){var p=parts[i].replace(/^-+/,'').replace(/^"|"$/g,'').toLowerCase();if(!p)continue;if(tl.indexOf(p)>=0)return false}return true}
function isPsa10(t){return /\bpsa\s*10\b/i.test(String(t||''))}
function isGraded(t){return /\b(psa|bgs|cgc|sgc|beckett|graded)\b/i.test(String(t||''))}
function okPsaTitle(t,r){return !!r&&hasWords(t,r.c)&&hasWords(t,r.req)&&exclOk(t,r.psa_x)&&isPsa10(t)}
function okRawTitle(t,r){return !!r&&hasWords(t,r.c)&&hasWords(t,r.req)&&exclOk(t,r.raw_x)&&!isGraded(t)}
function schUrl(kw,ex,cid){var c=/^[A-Za-z0-9_]{1,80}$/.test(cid||'')?cid:'site';return 'https://www.ebay.com/sch/i.html?_nkw='+encodeURIComponent((String(kw||'')+' '+String(ex||'')).replace(/\s+/g,' ').trim())+'&_sacat=183454&LH_PrefLoc=1&'+EPN.replace('{c}',c)}
function guideHref(){try{return new URL(GUIDE_REL,BASE||location.href).href}catch(_){return '/'+GUIDE_REL}}
function pathSlug(){try{var p=location.pathname.toLowerCase(),m=p.match(/\/cards\/([a-z0-9-]+)/);return m?m[1].replace(/-psa-10\/?$/,''):''}catch(_){return ''}}
function resolvePilot(ph,I){var slug=pathSlug(),best=null,sc=-1;if(!I||!I.byC)return null;var id=(document.querySelector('.cp[data-id],.panel.cp[data-id]')||{getAttribute:function(){return ''}}).getAttribute('data-id')||'',TS=tok(slug);Object.keys(I.byC).forEach(function(code){var cl=code.toLowerCase(),compact=cl.replace(/-/g,'');(I.byC[code]||[]).forEach(function(r){var s=0;if(slug&&(slug.indexOf(cl)>=0||slug.indexOf(compact)>=0))s+=10;if(id&&(id.indexOf(code)>=0||id.replace(/-/g,'').indexOf(compact)>=0))s+=8;TS.forEach(function(t){if(t.length<3)return;var blob=((r.psa||'')+' '+(r.raw||'')+' '+(r.req||'')).toLowerCase();if(blob.indexOf(t)>=0)s+=1});if(s>sc){sc=s;best=r}})});return sc>=10?best:null}
function pickSPilot(d,ph,n,r){var L=pickS(d,ph,n);if(!r)return L;if(L&&okPsaTitle(L.title,r))return L;var c=ph.getAttribute('data-card'),C=own(d,c);if(!C)return null;var list=ph.getAttribute('data-list'),pool=[];
 if(list==='auc'||list==='ending')pool=(C.auc||[]);else pool=(list==='grail'?C.grail:C.bin)||[];
 var A=uniq((pool||[]).filter(function(x){return !!x&&x.card===c&&okS(x,n)&&okPsaTitle(x.title,r)}));
 if(list==='auc'||list==='ending')A.sort(byEnd);else A.sort(byAmt);
 return A[+ph.getAttribute('data-n')||0]||null}
function renderRaw(ph,r){var p=ph.getAttribute('data-pfx')||'site',ck=ph.getAttribute('data-card')||'x',prev=srch(ph),cid='site',mm;if(prev){mm=(prev.getAttribute('href')||'').match(/[?&]customid=([A-Za-z0-9_]+)/);if(mm){var parts=mm[1].split('__');cid=(parts[0]?parts[0].replace(/_(?:search|bin|bid|photo|credit|raw)$/,'_raw'):p+'_raw')+'__'+(parts[1]||ck)}}
 else cid=p+'_raw__'+ck;if(!/^[A-Za-z0-9_]{1,80}$/.test(cid))cid=p+'_raw';
 var box=el('div',{'class':'opc-raw','data-opc-raw':'1'});box.appendChild(el('p',{'class':'stl sm','data-opc-lm7':'1'},LM7));
 var gp=el('p',{'class':'sm'});gp.appendChild(el('a',{href:guideHref(),rel:'noopener noreferrer'},'How to read a PSA label'));box.appendChild(gp);
 box.appendChild(el('a',{'class':'ebtn ebtn-sm ebtn-sr',href:schUrl(r.raw,r.raw_x,cid),rel:REL,target:'_blank'},'Search on eBay \u203a'));
 if(prev){var fb=prev.cloneNode(true);fb.setAttribute('data-opc-fb','1');box.appendChild(fb)}
 else box.appendChild(el('a',{'class':'ebtn ebtn-sm ebtn-sr',href:schUrl(r.psa,r.psa_x,p+'_search__'+ck),rel:REL,target:'_blank','data-opc-fb':'1'},'Search on eBay \u203a'));
 return [box]}

function pass(){if(RUN)return Promise.resolve();RUN=1;var n=Date.now();
 return vkLoad().then(function(){var I=vkIdx(),onCards=pathSlug().length>0;
 var P=[].slice.call(document.querySelectorAll('.v4s[data-v4]')).filter(function(ph){var st=ph.getAttribute('data-v4st')==='1',pr=onCards&&!!resolvePilot(ph,I);return st||pr});
 var U={};P.forEach(function(ph){if(ph.getAttribute('data-sfb')!=='1')SN.set(ph,[].slice.call(ph.childNodes).filter(function(c){return !isBd(c)}).map(function(c){return c.cloneNode(true)}));U[ph.getAttribute('data-v4')]=1});
 var K=Object.keys(U);return Promise.all(K.map(rd)).then(function(R){var D={},ch=0,fa=NaN;K.forEach(function(u,i){D[u]=R[i]});
  P.forEach(function(ph){var d=D[ph.getAttribute('data-v4')],ok=d&&typeof d==='object'&&d.schema===4,pr=onCards?resolvePilot(ph,I):null,L=ok?(pr?pickSPilot(d,ph,n,pr):pickS(d,ph,n)):null,was=ph.getAttribute('data-sfb')==='1';
   if(!L){if(pr&&ok){var nodes=renderRaw(ph,pr);put(ph,nodes);ph.setAttribute('data-sfb','1');ph.setAttribute('data-v4-live','0');ph.setAttribute('data-opc-tier','raw');AT.forEach(function(k){ph.removeAttribute(k)});ch=1;return}
    if(was){back(ph);ch=1}return}
   var nodes=render(ph,L);if(ph.getAttribute('data-kind')==='btn'){var s=srch(ph);if(s){var w=el('span',{'class':'ebp-s'});w.appendChild(s);nodes.push(w)}}
   put(ph,nodes);ph.setAttribute('data-sfb','1');ph.setAttribute('data-v4-live','1');ph.setAttribute('data-opc-tier','psa10');ph.setAttribute('data-v4a',L.auction?'1':'0');ph.setAttribute('data-v4e',L.auction?String(Date.parse(L.end)):'');
   ph.setAttribute('data-v4i',L.img?'1':'0');ph.setAttribute('data-v4ck',L.card);ph.setAttribute('data-v4tot',String(L.price));ch=1;
   var t=Date.parse(d.fetched_at);if(isFinite(t)&&!(t>=fa))fa=t});
  note(document.querySelector('.v4s[data-sfb="1"]')?fa:NaN);
  if(ch)document.dispatchEvent(new Event('opc:repage'));
  return bdPass()})}).catch(function(){}).then(function(){RUN=0})}
document.addEventListener('opc:listings',function(){pass()});
setInterval(function(){if(document.visibilityState!=='visible')return;pass()},60000);
if(document.querySelector('.v4s[data-v4st="1"]'))setTimeout(pass,0);   // loader may have finished before this file ran
window.OPC_AOK=aOk;  // cardimg reader (kill_op17_r2); BJ/ph behavior unchanged
window.OPC_SFB_PASS=pass;   // exposed for QA only
})();

/* AB-4b: /card/<num>/ two-tier link enhance for pilot printing keys only (D2a). */
(function(){if(window.OPC_CARD_TIER)return;window.OPC_CARD_TIER=1;
var EPN='mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339217952&customid={c}&toolid=10001&mkevt=1',REL='sponsored noopener',
LM7='No PSA 10 listed right now \u2014 raw copies below if you want to grade one yourself',GUIDE_REL='guides/read-psa-label/';
var BASE=(function(){var s=(document.currentScript&&document.currentScript.src)||'',i=s.lastIndexOf('assets/opchase-ui.js');return i>=0?s.slice(0,i):''})();
function rd(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return null})}
function schUrl(kw,ex,cid){var c=/^[A-Za-z0-9_]{1,80}$/.test(cid||'')?cid:'site';return 'https://www.ebay.com/sch/i.html?_nkw='+encodeURIComponent((String(kw||'')+' '+String(ex||'')).replace(/\s+/g,' ').trim())+'&_sacat=183454&LH_PrefLoc=1&'+EPN.replace('{c}',c)}
function guideHref(){try{return new URL(GUIDE_REL,BASE||location.href).href}catch(_){return '/'+GUIDE_REL}}
function onCard(){try{return /\/card\/[^/]+\/?$/.test(location.pathname)}catch(_){return false}}
function enhance(rows){if(!onCard()||!rows||!rows.length)return;var byId={},conflict={};
 rows.forEach(function(r){var ids=(r.dom_ids&&r.dom_ids.length)?r.dom_ids:[];ids.forEach(function(id){if(!id)return;if(byId[id]&&byId[id]!==r){conflict[id]=1;return}byId[id]=r})});
 Object.keys(conflict).forEach(function(id){delete byId[id]});
 [].forEach.call(document.querySelectorAll('article.pcard[id^="p-"]'),function(art){var r=byId[art.id];if(!r)return;var k=art.id.replace(/^p-/,'');
  var acts=art.querySelector('.pcard-acts');if(!acts||acts.querySelector('[data-opc-tier]'))return;
  var a=acts.querySelector('a.pcard-ebay,a.ebtn-sr');if(!a)return;
  var href=a.getAttribute('href')||'',mm=href.match(/[?&]customid=([A-Za-z0-9_]+)/),cid=mm?mm[1]:'db_search__'+k.replace(/-/g,'x').replace(/_/g,'y'),
  cidRaw=(mm?(mm[1].split('__')[0].replace(/_search$/,'_raw')+'__'+(mm[1].split('__')[1]||'')):('db_raw__'+k.replace(/-/g,'x').replace(/_/g,'y')));
  if(!/^[A-Za-z0-9_]{1,80}$/.test(cid))cid='db_search';if(!/^[A-Za-z0-9_]{1,80}$/.test(cidRaw))cidRaw='db_raw';
  a.setAttribute('href',schUrl(r.psa,r.psa_x,cid));a.setAttribute('data-opc-tier','psa10');
  var box=document.createElement('div');box.setAttribute('data-opc-tier','raw');box.className='opc-raw';
  var p=document.createElement('p');p.className='stl sm';p.setAttribute('data-opc-lm7','1');p.textContent=LM7;box.appendChild(p);
  var gp=document.createElement('p');gp.className='sm';var gl=document.createElement('a');gl.href=guideHref();gl.rel='noopener noreferrer';gl.textContent='How to read a PSA label';gp.appendChild(gl);box.appendChild(gp);
  var ra=document.createElement('a');ra.className='ebtn ebtn-sm ebtn-sr';ra.rel=REL;ra.target='_blank';ra.href=schUrl(r.raw,r.raw_x,cidRaw);ra.textContent='Search on eBay \u203a';ra.setAttribute('data-opc-tier','raw-search');box.appendChild(ra);
  acts.appendChild(box)})}
function go(){rd(BASE+'assets/version-keywords-pilot.json').then(function(d){if(d&&Array.isArray(d.rows))enhance(d.rows)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
/* OP17 cardimg kill-switch reader (opchase_cardimg_kill_op17_r3). Footer+binding = package B. BJ/ph untouched. */
(function(){if(window.OPC_CARDIMG)return;window.OPC_CARDIMG=1;
var BASE=(function(){var s=(document.currentScript&&document.currentScript.src)||'',i=s.lastIndexOf('assets/opchase-ui.js');return i>=0?s.slice(0,i):''})();
var SRC_RE=/^assets\/cardimg\/op17\/OP17-[0-9]{3}(_[A-Za-z0-9]+)?\.webp$/;
var SHA_RE=/^[0-9a-f]{64}$/;
var ENTRY_RE=/^OP17-[0-9]{3}(_[A-Za-z0-9]+)?$/;
var MARK='data-opc-cardimg';
function rd(u){return fetch(u,{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return null})}
function pageKey(){try{var p=location.pathname.replace(/\/index\.html$/i,'/');if(!/\/$/.test(p)&&/\/card\/op17-\d{3}$/i.test(p))p+='/';var m=p.match(/\/card\/(op17-\d{3})\/$/i);return m?('card/'+m[1].toLowerCase()+'/'):''}catch(_){return ''}}
function pageCard(pk){var m=/^card\/(op17-\d{3})\/$/.exec(pk||'');return m?m[1].toUpperCase():''}
function aOk(t){if(typeof window.OPC_AOK!=='function')return false;try{return !!window.OPC_AOK(t)}catch(_){return false}}
function validRec(e,pk){if(!e||typeof e!=='object'||Array.isArray(e))return null;
 if(typeof e.entry_id!=='string'||!ENTRY_RE.test(e.entry_id))return null;
 var want='assets/cardimg/op17/'+e.entry_id+'.webp';
 if(typeof e.src!=='string'||e.src!==want||!SRC_RE.test(e.src))return null;
 var pc=pageCard(pk);if(!pc)return null;
 if(e.entry_id.split('_')[0]!==pc)return null;
 if(typeof e.alt!=='string'||!aOk(e.alt))return null;
 if(e.alt.indexOf(pc)<0)return null;
 if(!/ official card image$/.test(e.alt))return null;
 if(typeof e.sha256!=='string'||!SHA_RE.test(e.sha256))return null;
 if(typeof e.w!=='number'||typeof e.h!=='number')return null;
 if(!Number.isInteger(e.w)||!Number.isInteger(e.h))return null;
 if(!(e.w>0&&e.w<=1200&&e.h>0&&e.h<=1700))return null;
 return{entry_id:e.entry_id,src:e.src,w:e.w,h:e.h,alt:e.alt,sha256:e.sha256}}
function rmAll(){[].forEach.call(document.querySelectorAll('['+MARK+']'),function(x){if(x.parentNode)x.parentNode.removeChild(x)})}
function rmIn(art){[].forEach.call(art.querySelectorAll('['+MARK+']'),function(x){if(x.parentNode)x.parentNode.removeChild(x)})}
function place(art,rec){var h=art.querySelector('.pcard-h');
 if(!h||!h.parentNode){rmIn(art);return}
 var olds=art.querySelectorAll('['+MARK+']');
 if(olds.length===1&&olds[0].getAttribute('data-opc-entry')===rec.entry_id){
  var img0=olds[0].querySelector('img');
  if(img0&&img0.getAttribute('src')===(BASE+rec.src)&&img0.getAttribute('alt')===rec.alt&&+img0.getAttribute('width')===rec.w&&+img0.getAttribute('height')===rec.h)return;
 }
 rmIn(art);
 var w=document.createElement('div');w.setAttribute(MARK,'1');w.setAttribute('data-opc-entry',rec.entry_id);
 w.style.cssText='display:block;text-align:center;margin:.5em 0';
 var img=document.createElement('img');img.src=BASE+rec.src;img.alt=rec.alt;img.loading='lazy';img.decoding='async';
 img.width=rec.w;img.height=rec.h;img.style.cssText='display:inline-block;max-width:min(100%,240px);height:auto';
 w.appendChild(img);
 if(h.nextSibling)h.parentNode.insertBefore(w,h.nextSibling);else h.parentNode.appendChild(w)}
function apply(m){
  var on=!!(m&&m.on===true&&m.pages&&typeof m.pages==='object'&&!Array.isArray(m.pages)&&m.v===1);
  if(!on){rmAll();return}
  var pk=pageKey();
  if(!pk){rmAll();return}
  if(!Object.prototype.hasOwnProperty.call(m.pages,pk)){rmAll();return}
  var M=m.pages[pk];
  if(!M||typeof M!=='object'||Array.isArray(M)){rmAll();return}
  [].forEach.call(document.querySelectorAll('article.pcard[id^="p-"]'),function(art){
    if(!Object.prototype.hasOwnProperty.call(M,art.id)){rmIn(art);return}
    var rec=validRec(M[art.id],pk);
    if(!rec){rmIn(art);return}
    place(art,rec)})}
function pass(){var pk=pageKey();
  if(!pk){rmAll();return Promise.resolve()}
  return rd(BASE+'assets/opchase-cardimg.json').then(function(m){apply(m)}).catch(function(){rmAll()})}
function go(){pass()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
setInterval(function(){if(document.visibilityState!=='visible')return;if(!pageKey())return;pass()},60000);
document.addEventListener('visibilitychange',function(){if(document.visibilityState!=='visible')return;if(!pageKey())return;pass()});
window.OPC_CARDIMG_PASS=pass;
})();
