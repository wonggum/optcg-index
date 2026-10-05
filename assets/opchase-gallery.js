/* OPChase gallery (design system v2, 2026-10-01): hero carousel (home featured strip) + fullscreen photo lightbox (all pages with listing photos).
   Triggers: <button data-gal="<group>" data-imgs="url1|url2" data-href="<listing>" data-by="<seller>" data-cap="<card>" data-sub="<variant · price>">.
   The lightbox steps through every visible trigger of the same group (left/right) and through one listing's photos (up/down, thumbnails).
   Photos are eBay listing photos hotlinked from i.ebayimg.com (never rehosted); every slide shows "Photo: eBay listing by <seller> · View on eBay". */
(function () {
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sz(u, n) { return (u || '').replace(/\/s-l\d+(\.\w+)$/, '/s-l' + n + '$1'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function visible(b) { return !!(b.offsetWidth || b.offsetHeight || b.getClientRects().length) || !!b.closest('.car'); }

  /* ------------------------------------------------------------------ lightbox */
  var G = null, items = [], ii = 0, pi = 0, opener = null, zs = 1, zx = 0, zy = 0, ptrs = {}, pinch = null, drag = null, swipe = null, lastTap = 0;
  function build() {
    G = el('div', 'gx');
    G.setAttribute('role', 'dialog'); G.setAttribute('aria-modal', 'true'); G.setAttribute('aria-label', 'Listing photo gallery'); G.hidden = true;
    G.innerHTML =
      '<div class="gx-top"><div class="gx-cap"><b class="gx-t"></b><span class="gx-s"></span></div>' +
      '<div class="gx-tools"><span class="gx-n" aria-live="polite"></span>' +
      '<button type="button" class="gx-b gx-zo" aria-label="Zoom out">&minus;</button><button type="button" class="gx-b gx-zi" aria-label="Zoom in">+</button>' +
      '<button type="button" class="gx-b gx-x" aria-label="Close gallery">&#x2715;</button></div></div>' +
      '<div class="gx-stage"><div class="gx-pan"><img class="gx-img" alt="" referrerpolicy="no-referrer" draggable="false"></div>' +
      '<div class="gx-load" aria-hidden="true"></div>' +
      '<button type="button" class="gx-nav gx-prev" aria-label="Previous listing">&#x2039;</button><button type="button" class="gx-nav gx-next" aria-label="Next listing">&#x203A;</button></div>' +
      '<div class="gx-bot"><div class="gx-th" role="group" aria-label="Photos of this listing"></div>' +
      '<p class="gx-attr"></p></div>';
    document.body.appendChild(G);
    G.querySelector('.gx-x').onclick = close;
    G.querySelector('.gx-prev').onclick = function () { step(-1); };
    G.querySelector('.gx-next').onclick = function () { step(1); };
    G.querySelector('.gx-zi').onclick = function () { zoomTo(zs * 1.6); };
    G.querySelector('.gx-zo').onclick = function () { zoomTo(zs / 1.6); };
    var st = G.querySelector('.gx-stage'), im = G.querySelector('.gx-img');
    im.addEventListener('load', function () { G.classList.remove('is-loading'); });
    st.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(zs * (e.deltaY < 0 ? 1.18 : 1 / 1.18), e.clientX, e.clientY); }, { passive: false });
    st.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      if (e.target === st && zs === 1) { close(); return; }   // click on the dark backdrop closes
      if (e.target.closest('.gx-img') && e.pointerType !== 'touch' && !st._moved) zs > 1 ? zoomTo(1) : zoomAt(2.5, e.clientX, e.clientY);
    });
    st.addEventListener('pointerdown', pdown); st.addEventListener('pointermove', pmove);
    st.addEventListener('pointerup', pup); st.addEventListener('pointercancel', pup);
    G.addEventListener('keydown', key);
  }
  function apply() { var p = G.querySelector('.gx-pan'); p.style.transform = 'translate(' + zx + 'px,' + zy + 'px) scale(' + zs + ')'; G.classList.toggle('is-zoomed', zs > 1.01); }
  function clampPan() {
    var im = G.querySelector('.gx-img'), st = G.querySelector('.gx-stage');
    var w = im.offsetWidth * zs, h = im.offsetHeight * zs, mx = Math.max(0, (w - st.clientWidth) / 2), my = Math.max(0, (h - st.clientHeight) / 2);
    zx = Math.max(-mx, Math.min(mx, zx)); zy = Math.max(-my, Math.min(my, zy));
  }
  function zoomAt(s, cx, cy) {
    s = Math.max(1, Math.min(5, s)); var st = G.querySelector('.gx-stage').getBoundingClientRect();
    var ox = cx - (st.left + st.width / 2), oy = cy - (st.top + st.height / 2), k = s / zs;
    zx = ox - (ox - zx) * k; zy = oy - (oy - zy) * k; zs = s; if (zs === 1) { zx = zy = 0; } clampPan(); apply();
  }
  function zoomTo(s) { var r = G.querySelector('.gx-stage').getBoundingClientRect(); zoomAt(s, r.left + r.width / 2, r.top + r.height / 2); }
  function pdown(e) {
    if (e.target.closest('button')) return;
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; this.setPointerCapture && this.setPointerCapture(e.pointerId); this._moved = false;
    var ids = Object.keys(ptrs);
    if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: zs }; drag = swipe = null; }
    else if (zs > 1) drag = { x: e.clientX - zx, y: e.clientY - zy };
    else swipe = { x: e.clientX, y: e.clientY, t: Date.now() };
  }
  function pmove(e) {
    if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(ptrs);
    if (pinch && ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; zoomAt(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2); this._moved = true; return; }
    if (drag) { zx = e.clientX - drag.x; zy = e.clientY - drag.y; clampPan(); apply(); this._moved = true; return; }
    if (swipe && Math.abs(e.clientX - swipe.x) > 8) { this._moved = true; G.querySelector('.gx-pan').style.transform = 'translateX(' + (e.clientX - swipe.x) + 'px)'; }
  }
  function pup(e) {
    var p = ptrs[e.pointerId]; delete ptrs[e.pointerId];
    if (pinch && Object.keys(ptrs).length < 2) { pinch = null; return; }
    if (drag) { drag = null; return; }
    if (swipe && p) {
      var dx = p.x - swipe.x, dy = p.y - swipe.y; swipe = null; apply();
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { step(dx < 0 ? 1 : -1); return; }
      if (e.pointerType === 'touch' && Math.abs(dx) < 10 && Math.abs(dy) < 10) {   // double-tap toggles zoom
        var now = Date.now(); if (now - lastTap < 300) { zs > 1 ? zoomTo(1) : zoomAt(2.5, p.x, p.y); lastTap = 0; } else lastTap = now;
      }
    }
  }
  function key(e) {
    var k = e.key;
    if (k === 'Escape') { e.preventDefault(); close(); }
    else if (k === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (k === 'ArrowDown') { e.preventDefault(); photo(pi + 1); }
    else if (k === 'ArrowUp') { e.preventDefault(); photo(pi - 1); }
    else if (k === '+' || k === '=') zoomTo(zs * 1.6);
    else if (k === '-') zoomTo(zs / 1.6);
    else if (k === 'Tab') {   // keep focus inside the dialog
      var f = [].filter.call(G.querySelectorAll('button,a[href]'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  }
  // EPN (2026-10-03): links arrive already tagged by the page (customid=<page>_photo); the lightbox link gets "_gx" so clicks from it are counted separately
  // 2026-10-04: customid = <page>_<slot>__<cardkey>; "_gx" goes on the slot (before "__") so the card key stays decodable
  function gxHref(h) { return /[?&]campid=/.test(h) ? h.replace(/([?&]customid=)([A-Za-z0-9_]+)/, function (m, k, v) { var p = v.split('__'); if (!/_gx$/.test(p[0])) p[0] += '_gx'; return k + p.join('__'); }) : h; }
  function data(b) { return { imgs: (b.dataset.imgs || '').split('|').filter(Boolean), href: b.dataset.href || '', by: b.dataset.by || '', cap: b.dataset.cap || '', sub: b.dataset.sub || '' }; }
  function render() {
    var d = items[ii], u = d.imgs[pi], im = G.querySelector('.gx-img');
    zs = 1; zx = zy = 0; apply();
    G.classList.add('is-loading');
    im.src = sz(u, 500); im.srcset = sz(u, 1000) + ' 1000w, ' + sz(u, 1600) + ' 1600w'; im.sizes = '100vw';
    im.alt = d.cap + (d.imgs.length > 1 ? ' — photo ' + (pi + 1) + ' of ' + d.imgs.length : '') + ' (eBay listing photo)';
    if (im.complete && im.naturalWidth) G.classList.remove('is-loading');
    G.querySelector('.gx-t').textContent = d.cap; G.querySelector('.gx-s').textContent = d.sub;
    G.querySelector('.gx-n').textContent = (items.length > 1 ? 'Listing ' + (ii + 1) + ' / ' + items.length : '') + (d.imgs.length > 1 ? (items.length > 1 ? ' · ' : '') + 'Photo ' + (pi + 1) + ' / ' + d.imgs.length : '');
    G.querySelector('.gx-attr').innerHTML = 'Photo: eBay listing' + (d.by ? ' by <b>' + esc(d.by) + '</b>' : '') + ' · <a href="' + esc(gxHref(d.href)) + '" target="_blank" rel="sponsored noopener">View on eBay &#x2197;</a>';
    var th = G.querySelector('.gx-th'); th.innerHTML = '';
    if (d.imgs.length > 1) d.imgs.forEach(function (x, j) {
      var b = el('button', 'gx-tb' + (j === pi ? ' on' : ''), '<img src="' + esc(sz(x, 140)) + '" alt="" referrerpolicy="no-referrer" loading="lazy">');
      b.type = 'button'; b.setAttribute('aria-label', 'Photo ' + (j + 1) + ' of ' + d.imgs.length); if (j === pi) b.setAttribute('aria-current', 'true');
      b.onclick = function () { photo(j); }; th.appendChild(b);
    });
    G.querySelector('.gx-prev').hidden = G.querySelector('.gx-next').hidden = items.length < 2;
    [ii + 1, ii - 1].forEach(function (j) { var n = items[(j + items.length) % items.length]; if (n && n.imgs[0]) { var p = new Image(); p.referrerPolicy = 'no-referrer'; p.src = sz(n.imgs[0], 1000); } });   // preload neighbours
  }
  function step(k) { if (items.length < 2) return; ii = (ii + k + items.length) % items.length; pi = 0; render(); }
  function photo(j) { var n = items[ii].imgs.length; if (n < 2) return; pi = (j + n) % n; render(); }
  function open(btn) {
    if (!G) build();
    var grp = btn.dataset.gal, all = [].filter.call(document.querySelectorAll('[data-gal]'), function (b) { return b.dataset.gal === grp && visible(b) && b.dataset.imgs; });
    var seen = {}; all = all.filter(function (b) { var k = b.dataset.href || b.dataset.imgs; if (b !== btn && (seen[k] || k === btn.dataset.href)) return false; seen[k] = 1; return true; });   // one entry per listing
    if (all.indexOf(btn) < 0) all = [btn];
    items = all.map(data); ii = all.indexOf(btn); pi = 0; opener = btn;
    G.hidden = false; document.documentElement.classList.add('gx-lock'); render();
    requestAnimationFrame(function () { G.classList.add('on'); G.querySelector('.gx-x').focus(); });
    if (window.OPC_CAR) window.OPC_CAR.forEach(function (c) { c.hold(true); });
  }
  function close() {
    if (!G || G.hidden) return;
    G.classList.remove('on'); G.hidden = true; document.documentElement.classList.remove('gx-lock');
    G.querySelector('.gx-img').removeAttribute('src'); G.querySelector('.gx-img').removeAttribute('srcset');
    if (opener) opener.focus({ preventScroll: true });
    if (window.OPC_CAR) window.OPC_CAR.forEach(function (c) { c.hold(false); });
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button[data-gal]'); if (b && b.dataset.imgs) { e.preventDefault(); open(b); } });

  /* photo load state (2026-10-01): a photo button shows its "Loading photo" placeholder until the image has pixels;
     on error it retries once at s-l500, then shows "Photo unavailable" (never a blank box) */
  function imgState(im) {
    var b = im.closest('.th'); if (!b) return;
    function ok() { if (im.naturalWidth) { b.classList.add('img-ok'); b.classList.remove('img-err'); } }
    im.addEventListener('load', ok);
    im.addEventListener('error', function () {
      if (!im.dataset.retry) { im.dataset.retry = '1'; im.removeAttribute('srcset'); im.src = sz(im.src, 500); return; }
      b.classList.add('img-err');
    });
    if (im.complete && im.naturalWidth) ok(); else if (im.complete && im.loading !== 'lazy' && (im.currentSrc || im.src)) im.dispatchEvent(new Event('error'));   // broke before this script ran
  }
  [].forEach.call(document.querySelectorAll('.th img'), imgState);
  function wake(im) {   // lazy -> eager, and re-set srcset so every engine (incl. older Safari) re-runs image selection and starts the fetch
    if (im.loading !== 'lazy') return;
    im.loading = 'eager'; var ss = im.getAttribute('srcset'); if (ss) { im.removeAttribute('srcset'); im.setAttribute('srcset', ss); }
  }

  /* ------------------------------------------------------------------ carousels (home: one endless gallery per tier) */
  // <section class="car" data-delay="5000" data-phase="0"> .car-track > .hs slides; optional .car-dots / .car-count / .car-pp / .car-prev / .car-next.
  // Autoplay only while the row is on screen; images of slides near the current one are loaded early (all others stay lazy).
  window.OPC_CAR = [];
  var NEAR = 3;
  /* paged tier grid (2026-10-03): .car.tgp shows 3 tiles per page on desktop, 2 on tablet, 1 on mobile (CSS decides the tile width);
     arrows page by the visible count and wrap at the ends, native swipe/scroll-snap, counter shows the visible range "1–3 / 17".
     Autoplay (2026-10-04): one page every data-delay ms (staggered by data-phase), wraps; pauses on hover/focus/touch/off-screen/hidden tab/reduced motion,
     resumes ~8s after interaction; .car-pp toggles a sticky user pause. */
  function pager(root) {
    var track = root.querySelector('.car-track'), cnt = root.querySelector('.car-count'), items = [], N = 0;
    function its() { items = [].filter.call(track.children, function (x) { return x.style.display !== 'none'; }); N = items.length; return items; }
    its(); if (!track.children.length) return;
    var pv = root.querySelector('.car-prev'), nx = root.querySelector('.car-next'), raf = 0, onscreen = false, tgt = 0, busy = 0;
    function step() { var g = parseFloat(getComputedStyle(track).columnGap) || 0; return (items[0] ? items[0].getBoundingClientRect().width : 0) + g || 1; }
    function per() { return Math.max(1, Math.min(N, Math.round((track.clientWidth + (parseFloat(getComputedStyle(track).columnGap) || 0)) / step()))); }
    function first() { return Math.max(0, Math.min(N - 1, Math.round(track.scrollLeft / step()))); }
    function wakeFrom(a, k) { for (var j = Math.max(0, a - k); j < Math.min(N, a + 2 * k); j++) [].forEach.call(items[j].querySelectorAll('img[loading="lazy"]'), wake); }
    function upd() {
      its(); if (!N || !track.clientWidth) { if (cnt) cnt.textContent = N ? (N === 1 ? '1' : '1\u2013' + Math.min(3, N)) + ' / ' + N : '0 / 0'; if (pv) pv.hidden = true; if (nx) nx.hidden = true; return; }
      var k = per(), a = first(), b = Math.min(N, a + k);
      if (a + k >= N) { a = Math.max(0, N - k); b = N; }   // last page (scroll clamps at the end)
      if (cnt) cnt.textContent = (k === 1 ? (a + 1) : (a + 1) + '\u2013' + b) + ' / ' + N;
      // 1-per-page (mobile): fit the row to the visible tile so a short tile doesn't leave an empty band inside the tier frame
      track.style.height = k === 1 ? (items[Math.min(N - 1, first())].offsetHeight + 12) + 'px' : '';
      var multi = N > k; if (pv) pv.hidden = !multi; if (nx) nx.hidden = !multi;
      if (onscreen) wakeFrom(a, k);
    }
    function to(i) { tgt = Math.max(0, Math.min(i, N - per())); busy = Date.now() + 1000; track.scrollTo({ left: Math.max(0, i) * step(), behavior: RM ? 'auto' : 'smooth' }); }
    function nav(d) {
      its(); if (!N) return;
      var k = per(), a = Date.now() < busy ? tgt : first(), atEnd = a >= N - k;
      if (d > 0) to(atEnd ? 0 : a + k); else to(a <= 0 ? N - k : a - k);
      wakeFrom(d > 0 ? (atEnd ? 0 : a + k) : Math.max(0, a - k), k);
    }
    var pp = root.querySelector('.car-pp'), DELAY = +root.dataset.delay || 5000, PHASE = +root.dataset.phase || 0;
    var hover = false, focus = false, held = false, stopped = RM, idleUntil = 0, timer = 0;
    function poke() { idleUntil = Date.now() + 8000; arm(); }
    function canRun() { return track.clientWidth > 0 && !stopped && !held && !hover && !focus && onscreen && !document.hidden && N > per() && Date.now() >= idleUntil; }
    function arm(ph) {
      clearTimeout(timer); if (stopped || N <= 1) return;
      var wait = Math.max(DELAY + (ph || 0), idleUntil - Date.now());
      timer = setTimeout(function () { if (canRun()) nav(1); arm(); }, wait);
    }
    function syncPP() { if (!pp) return; its(); pp.setAttribute('aria-pressed', stopped ? 'true' : 'false'); pp.setAttribute('aria-label', (stopped ? 'Play' : 'Pause') + ' auto-scroll'); pp.hidden = N <= per(); }
    if (pp) pp.onclick = function () { stopped = !stopped; idleUntil = 0; syncPP(); arm(); };
    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; poke(); });
    root.addEventListener('focusin', function (e) { if (e.target !== pp) focus = true; });
    root.addEventListener('focusout', function () { focus = false; poke(); });
    track.addEventListener('touchstart', poke, { passive: true });
    track.addEventListener('pointerdown', poke, { passive: true });
    track.addEventListener('wheel', poke, { passive: true });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) arm(); });
    if (pv) pv.onclick = function () { nav(-1); poke(); }; if (nx) nx.onclick = function () { nav(1); poke(); };
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); }, { passive: true });
    track.addEventListener('scrollend', function () { busy = 0; });
    ['touchstart', 'wheel'].forEach(function (ev) { track.addEventListener(ev, function () { busy = 0; }, { passive: true }); });
    root.addEventListener('keydown', function (e) {
      if (e.target.closest('input,select,textarea') || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      if (!root.classList.contains('lcar') && e.target.closest('.lcar')) return;   // listing carousels handle their own keys
      e.preventDefault(); nav(e.key === 'ArrowRight' ? 1 : -1); poke();
    });
    window.addEventListener('resize', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { upd(); syncPP(); }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { onscreen = e.isIntersecting; if (onscreen) upd(); }); }, { rootMargin: '300px 0px', threshold: 0.01 }).observe(root);
    else onscreen = true;
    if ('ResizeObserver' in window) new ResizeObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { upd(); syncPP(); }); }).observe(track);   // tab panels opening
    document.addEventListener('opc:repage', function () { track.scrollLeft = 0; busy = 0; upd(); syncPP(); });   // Find a card filters / sort
    upd(); syncPP(); arm(PHASE);
    window.OPC_CAR.push({ hold: function (h) { held = h; if (!h) poke(); } });
  }
  [].forEach.call(document.querySelectorAll('.lcar'), pager);   // listing tab carousels inside tier frames (2026-10-04)
  [].forEach.call(document.querySelectorAll('.car'), function (root) {
    if (root.classList.contains('tgp')) { pager(root); return; }
    var track = root.querySelector('.car-track'), slides = [].slice.call(track.children), dots = root.querySelector('.car-dots'), cnt = root.querySelector('.car-count'), pp = root.querySelector('.car-pp');
    var N = slides.length; if (!N) return;
    var DELAY = +root.dataset.delay || 5000, PHASE = +root.dataset.phase || 0;
    var cur = 0, hover = false, focus = false, touchUntil = 0, held = false, user = false, onscreen = false, raf = 0, pend = null, jt = 0, st = 0;
    var cl = null, cf = null;
    if (N > 1) {   // decorative clones of the last/first slide: the first and last slides also get a peeking neighbour (endless loop)
      cl = slides[N - 1].cloneNode(true); cf = slides[0].cloneNode(true);
      [cl, cf].forEach(function (c) {
        c.classList.add('hs-clone'); c.classList.remove('is-cur'); c.setAttribute('aria-hidden', 'true'); ['role', 'aria-roledescription', 'aria-label', 'data-i', 'data-id', 'id'].forEach(function (a) { c.removeAttribute(a); });
        [].forEach.call(c.querySelectorAll('[data-gal]'), function (b) { b.removeAttribute('data-gal'); });
        [].forEach.call(c.querySelectorAll('a,button,[tabindex]'), function (x) { x.tabIndex = -1; });
        [].forEach.call(c.querySelectorAll('img'), function (im) { im.loading = 'lazy'; im.removeAttribute('fetchpriority'); var b = im.closest('.th'); if (b) b.classList.remove('img-ok', 'img-err'); imgState(im); });
      });
      track.insertBefore(cl, slides[0]); track.appendChild(cf);
    }
    var all = [].slice.call(track.children);
    if (dots) slides.forEach(function (s, i) {
      var b = el('button', 'car-dot'); b.type = 'button'; b.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + N);
      b.onclick = function () { user = true; sync(); go(i); }; dots.appendChild(b);
    });
    function cx(s) { return s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2; }
    function realOf(s) { return s === cl ? N - 1 : s === cf ? 0 : slides.indexOf(s); }
    function preload(i) {   // real slide i sits at all[i + 1] when clones exist
      var k = cl ? i + 1 : i;
      for (var j = k - NEAR; j <= k + NEAR; j++) { var s = all[j]; if (s) [].forEach.call(s.querySelectorAll('img[loading="lazy"]'), wake); }
    }
    function mark(i) {
      cur = i;
      slides.forEach(function (s, j) { s.classList.toggle('is-cur', j === i); s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); [].forEach.call(s.querySelectorAll('a,button,[tabindex]'), function (x) { x.tabIndex = j === i ? 0 : -1; }); });
      if (dots) [].forEach.call(dots.children, function (d, j) { d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      if (cnt) cnt.textContent = (i + 1) + ' / ' + N;
      if (onscreen || user) preload(i);
    }
    function jump(i) {   // instant, invisible re-position from a clone onto the real slide
      track.classList.add('jump'); if (cl) cl.classList.remove('is-cur'); if (cf) cf.classList.remove('is-cur');
      track.scrollTo({ left: cx(slides[i]), behavior: 'auto' }); mark(i);
      requestAnimationFrame(function () { requestAnimationFrame(function () { track.classList.remove('jump'); }); });
    }
    function go(i, instant) {
      if (N > 1 && (i >= N || i < 0) && !RM && !instant) {   // wrap: glide onto the clone, then jump to the real slide
        var tgt = i >= N ? cf : cl, r = i >= N ? 0 : N - 1;
        [].forEach.call(tgt.querySelectorAll('img[loading="lazy"]'), wake);
        tgt.classList.add('is-cur'); mark(r); slides[r].classList.remove('is-cur'); pend = r;
        track.scrollTo({ left: cx(tgt), behavior: 'smooth' });
        clearTimeout(jt); jt = setTimeout(function () { if (pend !== null) { var q = pend; pend = null; jump(q); } }, 900);
        return;
      }
      i = (i + N) % N; pend = null;
      track.scrollTo({ left: cx(slides[i]), behavior: (RM || instant) ? 'auto' : 'smooth' }); mark(i);
    }
    function paused() { return !onscreen || held || hover || focus || Date.now() < touchUntil || document.hidden || (pp && pp.getAttribute('aria-pressed') === 'true'); }
    function sync() { var auto = !RM && !(pp && pp.getAttribute('aria-pressed') === 'true'); track.setAttribute('aria-live', auto && !user ? 'off' : 'polite'); }
    function nearest() { var best = null, bd = 1e9; all.forEach(function (s) { var d = Math.abs(cx(s) - track.scrollLeft); if (d < bd) { bd = d; best = s; } }); return best; }
    function settle() {   // after any scroll (swipe, wheel, smooth scroll) ends: leave clones, update the current slide
      if (pend !== null) { var q = pend; pend = null; clearTimeout(jt); jump(q); return; }
      var s = nearest(); if (!s) return;
      if (s === cl || s === cf) { jump(realOf(s)); return; }
      var r = realOf(s); if (r !== cur) mark(r);
    }
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { if (pend === null) { var s = nearest(); var r = s ? realOf(s) : cur; if (r !== cur && s !== cl && s !== cf) mark(r); } });
      clearTimeout(st); st = setTimeout(settle, 160);   // fallback for browsers without 'scrollend'
    }, { passive: true });
    track.addEventListener('scrollend', function () { clearTimeout(st); settle(); });
    function nav(k) { user = true; sync(); go(cur + k); }
    var pv = root.querySelector('.car-prev'), nx = root.querySelector('.car-next');
    var pp = root.querySelector('.car-pp'), DELAY = +root.dataset.delay || 5000, PHASE = +root.dataset.phase || 0;
    var hover = false, focus = false, held = false, stopped = RM, idleUntil = 0, timer = 0;
    function poke() { idleUntil = Date.now() + 8000; arm(); }
    function canRun() { return track.clientWidth > 0 && !stopped && !held && !hover && !focus && onscreen && !document.hidden && N > per() && Date.now() >= idleUntil; }
    function arm(ph) {
      clearTimeout(timer); if (stopped || N <= 1) return;
      var wait = Math.max(DELAY + (ph || 0), idleUntil - Date.now());
      timer = setTimeout(function () { if (canRun()) nav(1); arm(); }, wait);
    }
    function syncPP() { if (!pp) return; its(); pp.setAttribute('aria-pressed', stopped ? 'true' : 'false'); pp.setAttribute('aria-label', (stopped ? 'Play' : 'Pause') + ' auto-scroll'); pp.hidden = N <= per(); }
    if (pp) pp.onclick = function () { stopped = !stopped; idleUntil = 0; syncPP(); arm(); };
    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; poke(); });
    root.addEventListener('focusin', function (e) { if (e.target !== pp) focus = true; });
    root.addEventListener('focusout', function () { focus = false; poke(); });
    track.addEventListener('touchstart', poke, { passive: true });
    track.addEventListener('pointerdown', poke, { passive: true });
    track.addEventListener('wheel', poke, { passive: true });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) arm(); });
    if (pv) pv.onclick = function () { nav(-1); poke(); }; if (nx) nx.onclick = function () { nav(1); poke(); };
    root.addEventListener('mouseenter', function () { hover = true; }); root.addEventListener('mouseleave', function () { hover = false; });
    root.addEventListener('focusin', function () { focus = true; }); root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) focus = false; });
    root.addEventListener('touchstart', function () { touchUntil = Date.now() + 12000; user = true; sync(); }, { passive: true });
    root.addEventListener('keydown', function (e) {
      if (e.target.closest('input,select,textarea') || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      if (!root.classList.contains('lcar') && e.target.closest('.lcar')) return;   // listing carousels handle their own keys
      e.preventDefault(); nav(e.key === 'ArrowRight' ? 1 : -1);
      if (e.target.closest('.hs')) { var f = slides[cur].querySelector('.th,a'); if (f) f.focus({ preventScroll: true }); }
    });
    // clicking a peeking neighbour (or a clone) brings it to the centre instead of following its links
    track.addEventListener('click', function (e) {
      var s = e.target.closest('.hs'); if (!s || s.classList.contains('is-cur') && !s.classList.contains('hs-clone')) return;
      e.preventDefault(); e.stopPropagation(); user = true; sync();
      if (s === cl) go(cur === 0 ? -1 : N - 1); else if (s === cf) go(cur === N - 1 ? N : 0); else go(slides.indexOf(s));
    }, true);
    if (pp) {
      pp.onclick = function () { var p = pp.getAttribute('aria-pressed') !== 'true'; pp.setAttribute('aria-pressed', p ? 'true' : 'false'); pp.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow'); sync(); };
      if (RM) pp.hidden = true;
    }
    window.addEventListener('resize', function () { jump(cur); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { onscreen = e.isIntersecting; if (onscreen) preload(cur); }); }, { rootMargin: '200px 0px', threshold: 0.01 }).observe(root);
    else onscreen = true;
    jump(0); sync();
    // staggered timing: each row starts its 5 s cycle at its own phase so the rows never move in lockstep
    if (!RM && N > 1) setTimeout(function () { setInterval(function () { if (!paused()) go(cur + 1); }, DELAY); }, PHASE);
    window.OPC_CAR.push({ hold: function (h) { held = h; } });
  });
})();
