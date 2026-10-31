// Homepage only: scroll story, word sizing, featured filter, split parallax.
// Nav, footer, reveals and WhatsApp links live in site.js.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- scroll story: progress 0..1 across the tall hero -----
  const story = document.getElementById('story');
  const words = [...document.querySelectorAll('.story-words .w')];
  const end = document.querySelector('.story-end');
  const hint = document.querySelector('.story-hint');
  const bar = document.getElementById('storyBar');
  const stage = document.querySelector('.story-stage'), bike = document.getElementById('storyBike');
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 701px)').matches;
  let lastBs = '';
  window.MKP = window.MKP || {};
  window.MKP.p = 0;

  // every story word gets the same size, set so the longest one fits on one line.
  // bike3d.js reads wordH to keep the word and the bike balanced on screen.
  function fitWords() {
    const max = innerWidth < 700 ? 120 : 220;
    let widest = 0;
    const range = document.createRange();
    words.forEach(w => {
      w.style.fontSize = '100px';
      range.selectNodeContents(w);
      widest = Math.max(widest, range.getBoundingClientRect().width);
    });
    // fit the width, and on desktop keep the word inside the dark band above the bike
    const size = Math.min(max, (innerWidth * (innerWidth < 700 ? 0.9 : 0.82)) / widest * 100);
    words.forEach(w => { w.style.fontSize = size.toFixed(1) + 'px'; });
    window.MKP.wordH = size * 0.9;
  }
  fitWords();
  addEventListener('resize', fitWords);
  document.fonts && document.fonts.ready.then(fitWords);

  // Story progress from scrollY and cached sizes: no layout reads while scrolling (iOS jank),
  // and the DOM is only touched when the visible state actually changes.
  let storyTop = 0, storyTotal = 1, lastState = '', lastBar = -1, lastHint = -1;
  function measureStory() {
    storyTop = story.getBoundingClientRect().top + scrollY;
    storyTotal = Math.max(1, story.offsetHeight - innerHeight);
  }
  measureStory();
  addEventListener('resize', measureStory);
  addEventListener('load', measureStory);
  const isStatic = story.classList.contains('story-static');
  function storyTick() {
    if (isStatic) return; // static hero: nothing changes on scroll
    const p = Math.min(1, Math.max(0, (scrollY - storyTop) / storyTotal));
    window.MKP.p = p;
    // four words share the first 72%, then the headline lands
    const seg = 0.72 / words.length;
    const idx = Math.min(words.length, Math.floor(p / seg)), ending = p >= 0.78 || reduce;
    const state = idx + '|' + ending;
    if (state !== lastState) {
      lastState = state;
      words.forEach((w, i) => { w.classList.toggle('on', i === idx && p < 0.72); w.classList.toggle('past', i < idx); });
      end.classList.toggle('on', ending);
      stage.classList.toggle('ending', p >= 0.78);
    }
    // desktop only: the photo settles from a slight zoom as you scroll (no per-scroll style write on phones)
    if (bike && fine) {
      const bs = (1.04 - 0.08 * Math.min(1, p / 0.72)).toFixed(3);
      if (bs !== lastBs) { bike.style.setProperty('--bs', bs); lastBs = bs; }
    }
    const h = p > 0.03 ? 0 : 1;
    if (h !== lastHint) { hint.style.opacity = h; lastHint = h; }
    const pb = Math.round(p * 200) / 200;
    if (pb !== lastBar) { bar.style.transform = `scaleX(${pb})`; lastBar = pb; }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { storyTick(); ticking = false; });
  }
  if (!isStatic) addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  storyTick();

  // ----- lineup filter (also driven by the split halves) -----
  const segBtns = [...document.querySelectorAll('.seg button')];
  let curFilter = 'all';
  function setFilter(f) {
    curFilter = f;
    segBtns.forEach(b => { const on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    document.querySelectorAll('.models .model').forEach(m => m.classList.toggle('hide', f !== 'all' && m.dataset.t !== f));
  }

  // ----- featured bikes stay hand-picked (nicer photos), but price/condition come from the backend,
  // sold bikes drop out, and the row is topped up with the newest listings -----
  function syncFeatured() {
    const S = window.MKPsite, grid = document.querySelector('.models');
    if (!S || !grid) return;
    const live = !!window.MKP_LIVE;
    grid.querySelectorAll('.model').forEach(m => {
      const a = m.querySelector('a[href*="/product.html?bike="]');
      const slug = a && new URL(a.href).searchParams.get('bike');
      const b = slug && S.bySlug(slug);
      if (!b) { if (live) m.remove(); return; }
      m.querySelectorAll('.specs > div').forEach(d => {
        const k = d.querySelector('dt').textContent.trim(), dd = d.querySelector('dd');
        if (k === 'Price') dd.innerHTML = S.money(b.price) + (b.priceBefore ? ` <s>${S.money(b.priceBefore)}</s>` : '');
        if (k === 'Condition' && b.condition) dd.textContent = S.gradePct(b.condition) + '%';
      });
    });
    const want = 4, shown = new Set([...grid.querySelectorAll('a[href*="/product.html?bike="]')].map(a => new URL(a.href).searchParams.get('bike')));
    if (live && shown.size < want) {
      const extra = S.bikes.filter(b => !shown.has(b.slug) && b.productType === 'Full Bikes')
        .sort((a, b) => (b.created || '').localeCompare(a.created || '')).slice(0, want - shown.size);
      grid.insertAdjacentHTML('beforeend', extra.map(S.card).join(''));
      S.wireWa(grid); S.reveal(grid);
    }
    setFilter(curFilter);
  }
  syncFeatured();
  document.addEventListener('mkp:bikes', syncFeatured);
  segBtns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));

  // ----- split: photos drift slightly toward the cursor -----
  if (!reduce && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.half').forEach(h => {
      const img = h.querySelector('.bg');
      h.addEventListener('mousemove', e => {
        const r = h.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        img.style.transform = `translate3d(${x * -14}px, ${y * -8}px, 0) scale(1.04)`;
      });
      h.addEventListener('mouseleave', () => { img.style.transform = ''; });
    });
  }

  // ----- Google reviews: two rows gliding in opposite directions (swipe on touch / reduced motion) -----
  const R = window.MKP_REVIEWS, rows = document.getElementById('revRows');
  if (R && rows) {
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const G = '<svg class="g-logo" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
    const card = (r, i) => `<figure class="rev-card" data-i="${i}"><div class="rev-top">${G}<span class="mono">${r.topic === 'fitting' ? 'Bike Fitting' : 'Bike Purchase'}</span></div><blockquote>${esc(r.text)}</blockquote><figcaption><b>${esc(r.name)}</b>${r.text.length > 230 ? '<button type="button" class="rev-more">Read more</button>' : ''}</figcaption></figure>`;
    const items = R.items.slice(0, 30);
    const half = Math.ceil(items.length / 2);
    const rowHTML = (list, offset, dir) => `<div class="rev-row ${dir}"><div class="rev-track">${list.map((r, k) => card(r, k + offset)).join('')}${list.map((r, k) => card(r, k + offset)).join('')}</div></div>`;
    rows.innerHTML = rowHTML(items.slice(0, half), 0, 'left') + rowHTML(items.slice(half), half, 'right');
    const dlg = document.getElementById('revDialog');
    const openRev = i => {
      const r = items[i];
      dlg.querySelector('.rev-dialog-body').innerHTML = `<div class="rev-top">${G}<span class="mono">Google review</span></div><p>${esc(r.text)}</p><b>${esc(r.name)}</b>`;
      dlg.hidden = false; requestAnimationFrame(() => dlg.classList.add('open'));
      document.documentElement.classList.add('pop-lock');
    };
    const closeRev = () => { dlg.classList.remove('open'); document.documentElement.classList.remove('pop-lock'); setTimeout(() => { dlg.hidden = true; }, 300); };
    rows.addEventListener('click', e => { const c = e.target.closest('.rev-card'); if (c && (e.target.closest('.rev-more') || c.querySelector('.rev-more'))) openRev(+c.dataset.i); });
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.rev-dialog-x')) closeRev(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !dlg.hidden) closeRev(); });
  }
})();
