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
   customid come from the loader code copied verbatim below (campid 5339217952, rel "sponsored noopener"); no raw-card layer.
   Bandai thumbnails: assets/opchase-bdimg.json (signed imgmap_* tables, status mapped only). Kill switch: that file with "on":false
   (or the file removed) -> no official image is shown anywhere; no ?v change needed. */
(function(){if(window.OPC_SFB)return;window.OPC_SFB=1;
var EPN='mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339217952&customid={c}&toolid=10001&mkevt=1',REL='sponsored noopener',
MSG='Live listings updating \u2014 search on eBay',NOTE=0,FB=[],CACHE={},
ITM=/^[0-9]{9,15}$/,IMG=/^[A-Za-z0-9_~-]{8,40}$/,SEL=/^[A-Za-z0-9_.*\-]{1,64}$/,CK=/^[A-Za-z0-9]{1,60}$/,CID=/^[A-Za-z0-9_]{1,40}$/,FIRE=5,
DENY={'__proto__':1,constructor:1,prototype:1},HOLDK={ST01x012xSPR:1,ST13x003x2AxWIN:1,Px007xCELEB:1,Px041xONLINExV2:1,Px106xWIN:1},
/*BLOCKKEYS r1: r7 curate_policy key-level bans + GM whole-number bans; never rendered in any zone*/BLKK={CHxOP05x119yp7:1,CHxOP09x051yp4:1,CHxOP09x051yp5:1,CHxOP09x093yp4:1,CHxOP16x011yp1:1,CHxST10x006yp2:1,CHxST16x004yp1:1,OP05x119x3AxGOLD:1,OP05x119xMANGA:1,OP09x004xSPxGOLD:1,OP09x093xSPxGOLD:1,OP09x093xWANTED:1,OP09x119xMANGA:1,OP09x119xSPxEN:1},WLP=0,WLM={},WLU='opc_itm_whitelist.json',BLKN=/^(?:CHx|JPx)?(?:OP17x040|OP17x112|OP17x118|ST13x002)(?![0-9])/,/*/BLOCKKEYS*/
BAD=/[<>`{}\\\u0000-\u001f\u007f-\u009f\u00ad\u034f\u115f\u1160\u180e\u3164\u200b-\u200f\u2028\u2029\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff]|\udb40[\udc00-\udc7f]/;
/*SPAM-GEN*/var CONF={"\u0430": "a", "\u0432": "b", "\u0435": "e", "\u0451": "e", "\u043a": "k", "\u043c": "m", "\u043d": "h", "\u043e": "o", "\u0440": "p", "\u0441": "c", "\u0442": "t", "\u0443": "y", "\u0445": "x", "\u0456": "i", "\u0457": "i", "\u0458": "j", "\u0455": "s", "\u0501": "d", "\u051b": "q", "\u051d": "w", "\u0261": "g", "\u0251": "a", "\u03bf": "o", "\u03b1": "a", "\u03b2": "b", "\u03b5": "e", "\u03b9": "i", "\u03ba": "k", "\u03bd": "v", "\u03c1": "p", "\u03c4": "t", "\u03c5": "u", "\u03c7": "x", "\u03c9": "w", "\u0131": "i", "\u0269": "i", "\u2113": "l", "\u3002": ".", "\uff61": ".", "\u2024": ".", "\u2027": ".", "\u00b7": ".", "\u2022": ".", "\u2219": ".", "\u22c5": ".", "\uff20": "@", "\ufe6b": "@"},SAFE=[[new RegExp("([a-z])\\.d\\.(?=[a-z])","g"),"$1 d "],[new RegExp("\\bd\\.(?=[a-z])","g"),"d "],[new RegExp("\\bmr\\.2\\.bon\\.","g"),"mr 2 bon "],[new RegExp("\\bmr\\.(?=\\s*\\d)","g"),"mr "],[new RegExp("\\b(mr|mrs|ms|dr|jr|sr|st|vol|no|ver|ed|sp|alt|ft|pt|gem|mt|pr|ex|vs)\\.","g"),"$1 "]],SELU=new RegExp("^(?:https?|www)[.:]|^www|\\.(?:com|net|org|io|co|me|us|uk|ca|au|de|fr|jp|cn|ru|tv|cc|gg|ly|app|dev|shop|store|site|online|top|vip|club|link|live|xyz|info|biz)(?![\\s\\S])|\\.(?:com|co|net|org)\\.[a-z]{2}(?![\\s\\S])|\\.\\.|^\\.|\\.(?![\\s\\S])",'i'),SPAM=new RegExp("https?:|www\\.|\\b[a-z0-9][a-z0-9-]+\\.[a-z]{2,6}\\b(?!\\.?\\d)|\\b[a-z0-9]\\.(?:com|net|org|io|co|me|us|uk|ca|au|de|fr|jp|cn|ru|tv|cc|gg|ly|app|dev|shop|store|site|online|top|vip|club|link|live|xyz|info|biz)\\b|\\bdot\\s*(?:com|net|org)\\b|[(\\[]\\s*dot\\s*[)\\]]|@\\s*[a-z0-9_]|\\be[\\s._-]?mail\\b|\\b(?:g|hot|yahoo|proton)?mail\\s*(?:me|us)\\b|\\b(?:gmail|yahoo|hotmail|outlook|icloud|proton(?:mail|\\s*me)?|aol|gmx|ymail)\\b|\\blive\\s*(?:dot|\\.)\\s*com\\b|\\bat\\s+(?:gmail|yahoo|hotmail|outlook|icloud|proton\\w*|aol|gmx|ymail)\\b|\\b(?:telegram|whatsapp|instagram|insta|ig|discord|signal|snapchat|wechat|venmo|cashapp|zelle|paypal\\s*me)\\b|\\bt\\.me\\b|\\bwa\\.me\\b|(?:\\+?1[\\s.-]?)?\\(?\\b\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}\\b",""),SPNS=new RegExp("[a-z0-9]\\.(?:com|net|org|io|gg|me|shop|store|xyz|co|us|ly|app)(?![a-z])",""),SPSQ=new RegExp("gmail|hotmail|yahoomail|icloud|protonmail|outlookcom|telegram|whatsapp|instagram|discord|snapchat|https?www|www[a-z0-9]{2,}(?:com|net|org)|[a-z0-9]{3,}dotcom","");function selOk(s){return typeof s==='string'&&SEL.test(s)&&!SELU.test(s)}function fold(t){t=t.normalize('NFKD').replace(/\p{Mn}/gu,'').toLowerCase();var o='',i,c;for(i=0;i<2;i++){o='';for(c of t)o+=CONF.hasOwnProperty(c)?CONF[c]:c;t=o}return t}function spam(t){var f=fold(t),k;for(k=0;k<SAFE.length;k++)f=f.replace(SAFE[k][0],SAFE[k][1]);return SPAM.test(f)||SPNS.test(f.replace(/[ \t\n\r\f\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]+/g,''))||SPSQ.test(f.replace(/[^a-z0-9]+/g,''))}/*/SPAM-GEN*/
function ckOk(c){return typeof c==='string'&&CK.test(c)&&!DENY[c]&&!HOLDK[c]&&(WLP===c||!BLKK[c])&&!BLKN.test(c)}
function tOk(t){return typeof t==='string'&&t.length>0&&t.length<=80&&t.normalize('NFKC')===t&&!BAD.test(t)&&!spam(t)}
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
function put(ph,nodes){while(ph.firstChild)ph.removeChild(ph.firstChild);nodes.forEach(function(x){ph.appendChild(x)})}
var AT=['data-v4a','data-v4e','data-v4i','data-v4ck','data-v4tot'];
function back(ph){var s=SN.get(ph);if(s)put(ph,s.map(function(c){return c.cloneNode(true)}));ph.removeAttribute('data-sfb');AT.forEach(function(k){ph.removeAttribute(k)});ph.setAttribute('data-v4-live','0')}
function srch(ph){var s=SN.get(ph)||[],r=null;s.forEach(function(c){if(r||c.nodeType!==1)return;r=(c.matches&&c.matches('a[href*="/sch/"]'))?c:c.querySelector('a[href*="/sch/"]')});return r?r.cloneNode(true):null}
function note(fa){var p=document.querySelector('p[data-v4sn]');if(!isFinite(fa)){if(p)p.parentNode.removeChild(p);[].forEach.call(document.querySelectorAll('p[data-v4n]'),function(x){x.style.display=''});return}
 var txt='eBay listings here are from our last listing update ('+ptS(fa)+'). They can change on eBay at any time; ended auctions are not shown.';
 if(!p){p=el('p',{'class':'stl sm','data-v4sn':'1','role':'status'});var f=document.querySelector('.v4s[data-sfb="1"]')||document.querySelector('.v4s'),t=f&&((f.parentNode&&f.parentNode.closest('.tl,.lcar,.car,table,.chl-g'))||f);if(t&&t.parentNode)t.parentNode.insertBefore(p,t);else return}
 if(p.textContent!==txt)p.textContent=txt;[].forEach.call(document.querySelectorAll('p[data-v4n]'),function(x){x.style.display='none'})}
function pkey(){try{var b=new URL(BASE||'/',location.href).pathname,p=location.pathname;if(p.startsWith(b))p=p.slice(b.length);return p.replace(/[^\/]+\.html$/,'').replace(/^\/+/,'')}catch(_){return ''}}
function bd(){if(!BDP)BDP=rd(BASE+'assets/opchase-bdimg.json');return BDP}
function bdPass(){return bd().then(function(m){var on=!!(m&&m.on===true&&m.pages&&typeof m.pages==='object'),M=on&&Object.prototype.hasOwnProperty.call(m.pages,pkey())?m.pages[pkey()]:null;
 [].forEach.call(document.querySelectorAll('.v4s[data-kind="ph"]'),function(ph){var x=ph.querySelector('[data-bdimg]'),c=ph.getAttribute('data-card'),e=M&&ckOk(c)&&Object.prototype.hasOwnProperty.call(M,c)?M[c]:null;
  if(ph.getAttribute('data-v4-live')==='1'||!e||!Array.isArray(e)||!BDU.test(e[0]||'')||!tOk(e[1]||'x')){if(x)x.parentNode.removeChild(x);return}
  if(x)return;var w=el('span',{'class':'opc-bdimg','data-bdimg':'1'});w.appendChild(el('img',{src:e[0],alt:e[1],loading:'lazy',decoding:'async',width:'300',height:'419',referrerpolicy:'no-referrer'}));
  w.appendChild(el('span',{'class':'sm'},'Official card image: Bandai'));ph.insertBefore(w,ph.firstChild)})})}
function pass(){if(RUN)return Promise.resolve();RUN=1;var n=Date.now(),P=[].slice.call(document.querySelectorAll('.v4s[data-v4]')).filter(function(ph){return ph.getAttribute('data-v4st')==='1'}),U={};
 P.forEach(function(ph){if(ph.getAttribute('data-sfb')!=='1')SN.set(ph,[].slice.call(ph.childNodes).map(function(c){return c.cloneNode(true)}));U[ph.getAttribute('data-v4')]=1});
 var K=Object.keys(U);return Promise.all(K.map(rd)).then(function(R){var D={},ch=0,fa=NaN;K.forEach(function(u,i){D[u]=R[i]});
  P.forEach(function(ph){var d=D[ph.getAttribute('data-v4')],ok=d&&typeof d==='object'&&d.schema===4,L=ok?pickS(d,ph,n):null,was=ph.getAttribute('data-sfb')==='1';
   if(!L){if(was){back(ph);ch=1}return}
   var nodes=render(ph,L);if(ph.getAttribute('data-kind')==='btn'){var s=srch(ph);if(s){var w=el('span',{'class':'ebp-s'});w.appendChild(s);nodes.push(w)}}
   put(ph,nodes);ph.setAttribute('data-sfb','1');ph.setAttribute('data-v4-live','1');ph.setAttribute('data-v4a',L.auction?'1':'0');ph.setAttribute('data-v4e',L.auction?String(Date.parse(L.end)):'');
   ph.setAttribute('data-v4i',L.img?'1':'0');ph.setAttribute('data-v4ck',L.card);ph.setAttribute('data-v4tot',String(L.price));ch=1;
   var t=Date.parse(d.fetched_at);if(isFinite(t)&&!(t>=fa))fa=t});
  note(document.querySelector('.v4s[data-sfb="1"]')?fa:NaN);
  if(ch)document.dispatchEvent(new Event('opc:repage'));
  return bdPass()}).catch(function(){}).then(function(){RUN=0})}
document.addEventListener('opc:listings',function(){pass()});
setInterval(pass,60000);
if(document.querySelector('.v4s[data-v4st="1"]'))setTimeout(pass,0);   // loader may have finished before this file ran
window.OPC_SFB_PASS=pass;   // exposed for QA only
})();
