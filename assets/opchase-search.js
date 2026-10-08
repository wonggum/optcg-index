/* OPChase Card Database search (2026-10-04 PM). Lazy-loads assets/db-search.json (built by build_encyclopedia.py) on first focus/typing.
   Markup: <div class="dbs" data-input="q" data-root="" data-limit="12" data-all="sets/?q=" data-url="0|1"></div>
   Matches card number (OP05-119, op05119, 119), character / card name, variant keywords (manga, sp, wanted, winner, alt art, aa, pre-release...),
   rarity and set code. Tracked printings (with verified listings) first. Text only, no images. */
(function () {
  var DATA = null, LOADING = null, ROWS = null;
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
  function build(d) {
    var rows = [], vtw = d.vt.map(function (l) { var x = l; ALIAS.forEach(function (a) { if (a[0].test(l)) x += ' ' + a[1]; }); return words(x); });
    d.c.forEach(function (c) {
      var num = c[0], cw = words(num + ' ' + c[1]);
      c[2].forEach(function (p, i) {
        var nm = p[5] || c[1], w = cw.concat(vtw[p[0]], words((p[1] || '') + ' ' + (p[2] || '')), p[5] ? words(p[5]) : []);
        if (p[3] != null) w.push('opchase', 'verified', 'listings', 'tracked');
        rows.push({ num: num, name: nm, v: d.vt[p[0]], r: p[1] || '', s: p[2] || '', val: p[3], oc: p[4] || '', w: ' ' + w.join(' ') + ' ', nn: num.toLowerCase().replace(/[^a-z0-9]/g, ''), nw: ' ' + words(nm).join(' ') + ' ', o: rows.length });
      });
    });
    return rows;
  }
  function load(root) {
    if (DATA) return Promise.resolve(DATA);
    if (!LOADING) LOADING = fetch(root + 'assets/db-search.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { DATA = d; ROWS = build(d); return d; }).catch(function (e) { LOADING = null; throw e; });
    return LOADING;
  }
  function search(q) {
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
    // 2026-10-07 affiliate-only pivot: no index value; tracked printings link to their verified eBay listings
    var badge = r.val != null ? (r.oc ? '<a class="dbs-ix" href="' + root + esc(r.oc) + '" title="Live eBay listings checked for this exact version, English, PSA 10">Verified listings</a>'
      : '<span class="dbs-ix">Tracked</span>') : '';
    // 2026-10-05: Bandai official card-list search link (only when the number is in our official scrape; freewords search URL)
    var bd = (DATA.bd && DATA.bd[r.num]) ? ('<a class="dbs-bd" href="https://en.onepiece-cardgame.com/cardlist/?freewords=' + encodeURIComponent(r.num) + '" rel="noopener noreferrer" target="_blank" title="Official Bandai English card list">Bandai ↗</a>') : '';
    return '<li class="dbs-r' + (r.val != null ? ' ix' : '') + '"><a class="dbs-a" href="' + root + 'card/' + esc(r.num.toLowerCase()) + '/"><b class="dbs-id">' + esc(r.num) + '</b> <span class="dbs-n">' + esc(r.name) + '</span>'
      + '<span class="dbs-m">' + esc(r.v) + (r.r ? ' · ' + esc(r.r) : '') + (r.s ? ' · <span' + set + '>' + esc(r.s) + '</span>' : '') + '</span></a>' + badge + bd + '</li>';
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
          + (nix ? ' (' + nix + ' with verified listings)' : '') + (res.length > shown ? ', showing ' + shown : '') + '</p><ul class="dbs-l">' + res.slice(0, shown).map(function (r) { return row(r, root); }).join('') + '</ul>' + (more ? '<p class="dbs-f">' + more + '</p>' : '');
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
