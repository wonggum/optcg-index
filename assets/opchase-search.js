/* OPChase Card Database search (2026-10-04 PM). Lazy-loads assets/db-search.json on first focus/typing.
   Markup: <div class="dbs" data-input="q" data-root="" data-limit="12" data-all="sets/?q=" data-url="0|1"></div>
   Matches card number (OP05-119, op05119, 119), character / card name, variant keywords (manga, sp, wanted, winner, alt art, aa, pre-release...),
   rarity and set code. Tracked printings (with checked listings) first. Text only, no images. */
(function () {
  var DATA = null, LOADING = null, ROWS = null, VKP = null, VKP_L = null;
  var LM7 = 'No PSA 10 listed right now \u2014 raw copies below if you want to grade one yourself';
  var EPN = 'mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339217952&customid={c}&toolid=10001&mkevt=1', REL = 'sponsored noopener';
  function vkLoad(root) {
    if (VKP) return Promise.resolve(VKP);
    /* EPIC-FIND-CARD-P1 r3: target-status strategy A; signed pilot preserved */
    if (!VKP_L) VKP_L = fetch(root + 'assets/version-keywords-pilot.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { VKP = (d && Array.isArray(d.rows)) ? d : { rows: [] }; return VKP; }).catch(function () { VKP = { rows: [] }; return VKP; });
    return VKP_L;
  }
  function vkByCode() {
    var m = {};
    if (!VKP || !VKP.rows) return m;
    VKP.rows.forEach(function (r) { if (!r || !r.c) return; (m[r.c] = m[r.c] || []).push(r); });
    return m;
  }
  function scoreVk(r, vlabel) {
    var vl = String(vlabel || ''), vll = vl.toLowerCase(), vt = String(r.vt || ''), vtl = vt.toLowerCase();
    var blob = ((r.psa || '') + ' ' + (r.raw || '') + ' ' + (r.req || '') + ' ' + vt).toLowerCase();
    var s = 0;
    if (vt && vl === vt) s += 100; /* exact runtime label match */
    else if (vt && (vtl === vll)) s += 90;
    else if (vt && vtl.indexOf(vll) === 0 && (vt.length === vl.length || vt.charAt(vl.length) === ' ' || vt.charAt(vl.length) === '·')) s += 40;
    else if (vt && vll.indexOf(vtl) === 0 && vtl.length >= 4) s += 25;
    String(vll).split(/[^a-z0-9]+/).filter(function (t) { return t.length > 2; }).forEach(function (t) { if (blob.indexOf(t) >= 0) s += 2; });
    if (/manga/.test(vll) && /manga/.test(blob)) s += 8;
    if (/\bsp\b|special/.test(vll) && /\bsp\b|special/.test(blob)) s += 8;
    if (/alternate|\baa\b|parallel/.test(vll) && /alt|alternate|parallel|aa/.test(blob)) s += 6;
    if (/pre-?release|prerelease/.test(vll) && /pre-?release|prerelease/.test(blob)) s += 8;
    if (/release event/.test(vll) && /release event/.test(blob)) s += 8;
    if (/anniversary/.test(vll) && /anniversary/.test(blob)) s += 8;
    if ((/^normal|base|^l$|^c$|^r$|^sr$|^sec$|^uc$|^p$/i.test(String(vl).split(/[·(]/)[0].trim()) || /(^|\s)normal(\s|$)/.test(vll)) && (r.k === r.c || /\bnormal\b/i.test(vt))) s += 6;
    /* penalize longer specialized vt when query is shorter generic AA/Normal */
    if (/alternate art \(aa\)/i.test(vl) && /super leader/i.test(vt)) s -= 20;
    if (/^normal$/i.test(vl.trim()) && /pre-?release|release event|anniversary|deck|dash pack/i.test(vt)) s -= 30;
    return s;
  }
  function pickVk(num, vlabel, setHint) {
    /* EPIC-FIND-CARD-P1 r3 strategy A: score ALL; enhance ONLY best TARGET if calibrated; never borrow other version */
    var list = vkByCode()[num] || [];
    if (!list.length) return null;
    var scored = list.map(function (r) {
      var s = scoreVk(r, vlabel);
      if (setHint && r.req && String(r.req).indexOf(String(setHint)) >= 0) s += 15;
      if (setHint && r.psa && String(r.psa).indexOf(String(setHint)) >= 0) s += 8;
      /* prefer calibrated over nm/paused on equal semantic score */
      var pri = (r.status === 'calibrated' || !r.status) ? 2 : (r.status === 'needs_manual' ? 0 : 1);
      return { r: r, s: s, pri: pri };
    }).sort(function (a, b) { return b.s - a.s || b.pri - a.pri; });
    var best = scored[0];
    if (!best || best.s < 8) return null;
    var tied = scored.filter(function (x) { return x.s === best.s && x.pri === best.pri; });
    if (tied.length > 1) return null; /* ambiguous same-status targets */
    var st = best.r.status;
    if (st === 'paused' || st === 'needs_manual') return null;
    if (st && st !== 'calibrated') return null;
    return best.r;
  }
  function schUrl(kw, ex, cid) {
    var c = /^[A-Za-z0-9_]{1,80}$/.test(cid || '') ? cid : 'findcard';
    return 'https://www.ebay.com/sch/i.html?_nkw=' + encodeURIComponent((String(kw || '') + ' ' + String(ex || '')).replace(/\s+/g, ' ').trim()) + '&_sacat=183454&LH_PrefLoc=1&' + EPN.replace('{c}', c);
  }
  function tierHtml(r, root) {
    if (!r) return '';
    var psa = '<a class="dbs-ebay dbs-psa" href="' + schUrl(r.psa, r.psa_x, 'findcard') + '" rel="' + REL + '" target="_blank" data-opc-tier="psa10">Search PSA 10 on eBay</a>';
    var raw = '<span class="dbs-raw" data-opc-tier="raw"><span class="dbs-lm7">' + LM7.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span> '
      + '<a class="dbs-guide" href="' + (root || '') + 'guides/read-psa-label/" rel="noopener noreferrer">How to read a PSA label</a> '
      + '<a class="dbs-ebay dbs-rawa" href="' + schUrl(r.raw, r.raw_x, 'findcard') + '" rel="' + REL + '" target="_blank" data-opc-tier="raw-search">Search on eBay</a></span>';
    return '<span class="dbs-tiers">' + psa + ' ' + raw + '</span>';
  }

  var ALIAS = [[/alternate art|parallel/i, 'aa alt alternate art parallel'], [/\bmanga\b/i, 'manga'], [/super aa/i, 'manga super aa'], [/red manga/i, 'red manga'],
    [/^sp\b|\bsp\b/i, 'sp special'], [/winner/i, 'winner win'], [/finalist|top cut/i, 'finalist top'], [/pre-release/i, 'prerelease pre release'],
    [/don!!/i, 'don'], [/treasure/i, 'tr treasure'], [/wanted/i, 'wanted poster'], [/promo/i, 'promo'], [/full art/i, 'fa full art'], [/serial/i, 'serial'],
    [/foil/i, 'foil'], [/reprint/i, 'reprint'], [/anniversary/i, 'anniversary anni'], [/release event/i, 'release event'], [/box topper/i, 'box topper']];
  function norm(s) { return String(s || '').toLowerCase(); }
  function words(s) {   // word starts: split on non-alnum + every whitespace chunk with punctuation removed (op05-119 -> op05119, monkey.d.luffy -> monkeydluffy)
    var t = norm(s), out = t.split(/[^a-z0-9]+/);
    t.split(/\s+/).forEach(function (c) { c = c.replace(/[^a-z0-9]/g, ''); if (c) out.push(c); });
    return out.filter(Boolean);
  }
  function joinw(s) {   // AB-4a TY-SEP-1: multi-word name -> one joined word (kouzuki oden -> kouzukioden); final key must be > 2 chars
    var p = norm(s).split(/[^a-z0-9]+/).filter(Boolean), j = p.join('');
    return p.length > 1 && j.length > 2 ? [j] : [];
  }
  var NUMS = {}, RX = /^\s*(op|st|eb|prb)(\d{1,2})-(\d{1,3})\s*$/i, RXP = /^\s*p-(\d{1,3})\s*$/i;
  function pad(d, w) { d = String(parseInt(d, 10)); return d.length > w ? null : new Array(w - d.length + 1).join('0') + d; }
  function r4(q) {   // AB-4a TY-NUM-1: op5-119 -> OP05-119 only when that number exists in c
    var m = RX.exec(q), k = null, a, b;
    if (m) { a = pad(m[2], 2); b = pad(m[3], 3); if (a && b) k = m[1].toUpperCase() + a + '-' + b; }
    else if ((m = RXP.exec(q))) { b = pad(m[1], 3); if (b) k = 'P-' + b; }
    return k && NUMS[k] ? k : null;
  }
  function build(d) {
    var rows = [], vtw = d.vt.map(function (l) { var x = l; ALIAS.forEach(function (a) { if (a[0].test(l)) x += ' ' + a[1]; }); return words(x); });
    d.c.forEach(function (c) {
      var num = c[0], cw = words(num + ' ' + c[1]).concat(joinw(c[1]));
      NUMS[num] = 1;
      c[2].forEach(function (p, i) {
        var nm = p[5] || c[1], w = cw.concat(vtw[p[0]], words((p[1] || '') + ' ' + (p[2] || '')), p[5] ? words(p[5]).concat(joinw(p[5])) : []);
        if (p[3] != null) w.push('opchase', 'checked', 'listings', 'tracked');
        rows.push({ num: num, name: nm, v: d.vt[p[0]], r: p[1] || '', s: p[2] || '', val: p[3], oc: p[4] || '', w: ' ' + w.join(' ') + ' ', nn: num.toLowerCase().replace(/[^a-z0-9]/g, ''), nw: ' ' + words(nm).join(' ') + ' ', o: rows.length });
      });
    });
    return rows;
  }
  function load(root) {
    if (DATA) { vkLoad(root); return Promise.resolve(DATA); }
    if (!LOADING) LOADING = Promise.all([
      fetch(root + 'assets/db-search.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }),
      vkLoad(root)
    ]).then(function (arr) { DATA = arr[0]; ROWS = build(arr[0]); return arr[0]; }).catch(function (e) { LOADING = null; throw e; });
    return LOADING;
  }
  function search(q) {
    var z = r4(q); if (z) q = z;
    var toks = norm(q).split(/\s+/).map(function (t) { return t.replace(/[^a-z0-9]/g, ''); }).filter(Boolean);
    if (!toks.length) return [];
    var whole = toks.join(''), res = [];
    for (var i = 0; i < ROWS.length; i++) {
      var r = ROWS[i], ok = true, sc = 0;
      for (var k = 0; k < toks.length; k++) { if (r.w.indexOf(' ' + toks[k]) < 0) { ok = false; break; } if (r.nw.indexOf(' ' + toks[k]) >= 0) sc += 40; }
      if (!ok) continue;
      if (r.val != null) sc += 1000;
      if (r.nn === whole) sc += 300; else if (r.nn.indexOf(whole) === 0 && whole.length >= 4) sc += 120;
      if (r.v.indexOf('Normal') === 0) sc += 5;
      res.push([sc, r]);
    }
    res.sort(function (a, b) { return b[0] - a[0] || (b[1].val || 0) - (a[1].val || 0) || a[1].o - b[1].o; });
    return res.map(function (x) { return x[1]; });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
  function row(r, root) {
    var set = DATA.sets[r.s] ? ' title="' + esc(DATA.sets[r.s]) + '"' : '';
    // 2026-10-07 affiliate-only pivot: no index value; tracked printings link to their checked eBay listings
    var badge = r.val != null ? (r.oc ? '<a class="dbs-ix" href="' + root + esc(r.oc) + '" title="Live eBay listings checked for this exact version, English, PSA 10">eBay listings</a>'
      : '<span class="dbs-ix">Tracked</span>') : '';
    // 2026-10-05: Bandai official card-list search link (only when the number is in our official scrape; freewords search URL)
    var bd = (DATA.bd && DATA.bd[r.num]) ? ('<a class="dbs-bd" href="https://en.onepiece-cardgame.com/cardlist/?freewords=' + encodeURIComponent(r.num) + '" rel="noopener noreferrer" target="_blank" title="Official Bandai English card list">Bandai ↗</a>') : '';
    var tier = '';
    try { var vk = pickVk(r.num, r.v, r.s); if (vk) tier = tierHtml(vk, root); } catch (_) {}
    return '<li class="dbs-r' + (r.val != null ? ' ix' : '') + '"><a class="dbs-a" href="' + root + 'card/' + esc(r.num.toLowerCase()) + '/"><b class="dbs-id">' + esc(r.num) + '</b> <span class="dbs-n">' + esc(r.name) + '</span>'
      + '<span class="dbs-m">' + esc(r.v) + (r.r ? ' · ' + esc(r.r) : '') + (r.s ? ' · <span' + set + '>' + esc(r.s) + '</span>' : '') + '</span></a>' + badge + bd + tier + '</li>';
  }
  function init(box) {
    var inp = document.getElementById(box.dataset.input); if (!inp) return;
    var root = box.dataset.root || '', lim = +box.dataset.limit || 12, all = box.dataset.all || '', step = lim, shown = lim, t, last = '';
    box.setAttribute('aria-live', 'polite');
    function render() {
      var q = inp.value.trim();
      if (box.dataset.url === '1') { try { var u = new URL(location.href); if (q) u.searchParams.set('q', q); else u.searchParams.delete('q'); history.replaceState(null, '', u); } catch (_) {} }
      if (q.replace(/[^a-z0-9]/gi, '').length < 2) { box.hidden = true; box.innerHTML = ''; return; }
      box.hidden = false;
      if (!DATA) { box.innerHTML = '<p class="dbs-h">Searching the Card Database…</p>'; }
      load(root).then(function () {
        if (inp.value.trim() !== q) return;
        if (q !== last) { shown = lim; last = q; }
        var res = search(q), qn = document.getElementById('qn');
        if (qn && box.dataset.input === 'q' && qn.dataset.zero === '1') qn.textContent = qn.textContent.replace(/\..*$/, '.') + (res.length ? ' Card Database matches are listed below.' : '');
        var nix = res.filter(function (r) { return r.val != null; }).length, href = all ? root + all + encodeURIComponent(q) : '';
        if (!res.length) { box.innerHTML = '<p class="dbs-h"><b>In the Card Database</b> · no printing matches “' + esc(q) + '”. Try a card number (OP05-119) or a character name.</p>'; return; }
        var more = res.length > shown ? (href ? '<a class="dbtn dbtn-sm dbs-all" href="' + href + '">See all ' + res.length.toLocaleString() + ' in Card Database ›</a>' : '<button type="button" class="dbtn dbtn-sm dbs-more">Show more</button>') : '';
        box.innerHTML = '<p class="dbs-h"><b>In the Card Database</b> · ' + res.length.toLocaleString() + ' printing' + (res.length === 1 ? '' : 's') + ' match' + (res.length === 1 ? 'es' : '')
          + (nix ? ' (' + nix + ' with checked listings)' : '') + (res.length > shown ? ', showing ' + shown : '') + '</p><ul class="dbs-l">' + res.slice(0, shown).map(function (r) { return row(r, root); }).join('') + '</ul>' + (more ? '<p class="dbs-f">' + more + '</p>' : '');
      }).catch(function () { box.innerHTML = '<p class="dbs-h">Card Database search is unavailable right now. <a href="' + root + 'sets/">Browse the Card Database</a>.</p>'; });
    }
    box.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.dbs-more')) { shown += step; render(); } });
    inp.addEventListener('focus', function () { load(root).catch(function () {}); }, { once: true });
    inp.addEventListener('input', function () { clearTimeout(t); t = setTimeout(render, 140); });
    if (box.dataset.url === '1') { try { var q0 = new URLSearchParams(location.search).get('q'); if (q0) { inp.value = q0; render(); } } catch (_) {} }
    else if (inp.value.trim()) render();
  }
  window.OPC_DB_SEARCH = function (q) { return ROWS ? search(q) : null; };   // QA hook
  function go() { [].forEach.call(document.querySelectorAll('.dbs[data-input]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
