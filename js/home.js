/* Home page: featured showcase slider, range grid, rider marquee. */
(function () {
  const { BIKES, bySlug, card, esc, money, icon, $, $$ } = window.MKP;

  /* ---------- hero film: crossfade three scenes, progress bars, pause ---------- */
  const film = $('[data-film]');
  const scenes = $$('.scene', film);
  const bars = $$('[data-film-progress] i');
  const toggle = $('[data-film-toggle]');
  const SCENE_MS = 7000;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sceneAt = 0;
  let sceneTimer = null;
  let sceneStart = 0;
  let remaining = SCENE_MS;
  let paused = still;

  function showScene(i) {
    const prevScene = scenes[sceneAt];
    sceneAt = (i + scenes.length) % scenes.length;
    scenes.forEach((s, n) => {
      s.classList.toggle('is-active', n === sceneAt);
      // keep the outgoing scene moving while it fades, so the cut never freezes
      s.classList.toggle('is-leaving', s === prevScene && n !== sceneAt);
    });
    bars.forEach((b, n) => {
      b.classList.toggle('is-done', n < sceneAt);
      b.classList.remove('is-active');
      if (n === sceneAt) { void b.offsetWidth; b.classList.add('is-active'); }
    });
    remaining = SCENE_MS;
    schedule();
  }
  function schedule() {
    clearTimeout(sceneTimer);
    if (paused) return;
    sceneStart = performance.now();
    sceneTimer = setTimeout(() => showScene(sceneAt + 1), remaining);
  }
  function setPaused(p) {
    paused = p;
    film.classList.toggle('is-paused', p);
    toggle.setAttribute('aria-pressed', String(p));
    toggle.setAttribute('aria-label', p ? 'Play background animation' : 'Pause background animation');
    toggle.innerHTML = p ? icon.play : icon.pause;
    if (p) { clearTimeout(sceneTimer); remaining = Math.max(0, remaining - (performance.now() - sceneStart)); }
    else schedule();
  }
  let userPaused = still;
  toggle.addEventListener('click', () => { userPaused = !paused; setPaused(userPaused); });
  // stop the film when the hero is off screen or the tab is hidden, unless the visitor paused it
  const autoPause = (hidden) => { if (!userPaused) setPaused(hidden); };
  new IntersectionObserver(([e]) => autoPause(!e.isIntersecting)).observe(film);
  document.addEventListener('visibilitychange', () => autoPause(document.hidden));
  showScene(0);
  setPaused(paused);
  autoPause(document.hidden);


  /* ---------- bike-type tab icons (28×20, side-on bikes; animated parts are classed) ---------- */
  const svg = (body) => `<svg class="bk" viewBox="0 0 28 20" aria-hidden="true">${body}</svg>`;
  // shared road frame: rear hub (7,14), bottom bracket (13,14), seat (11,7), head tube (19.5,7.5), front hub (21,14)
  const FRAME = '<path d="M7 14 11 7.2h8.5M13 14l-2-6.8M13 14l6.5-6.4L21 14M7 14h6"/><path d="M9.4 6h3.2M19.5 7.5l1.4-1.2 1.2.5"/>';
  const BIKE_ICONS = {
    // deep-section wheels with wind streaming past
    Aero: svg(`<g class="wind"><path d="M2 3.5h5"/><path d="M4 6h4"/><path d="M1 8.5h3.5"/></g>
      <circle cx="7" cy="14" r="4.6"/><circle cx="7" cy="14" r="2.4"/><circle cx="21" cy="14" r="4.6"/><circle cx="21" cy="14" r="2.4"/>${FRAME}`),
    // bike riding up a gradient towards a summit flag
    Climbing: svg(`<path d="M1 19.5 27 11"/><path d="M23 3v6.5"/><path class="flag fill" d="M23 3h3.6l-1 1.3 1 1.3H23z"/>
      <g transform="rotate(-18 14 14) translate(0 -3.6)"><g class="climber"><circle cx="7" cy="14" r="4.2"/><circle cx="21" cy="14" r="4.2"/>${FRAME}</g></g>`),
    // TT bike: rear disc, tri-spoke front, aero bars out front
    Triathlon: svg(`<circle class="fill" cx="7" cy="14" r="4.6"/><g class="spin-r"><path d="M7 14V9.4" stroke="var(--bg)" stroke-width="1.2"/></g>
      <circle cx="21" cy="14" r="4.6"/><g class="spin-f"><path d="M21 14V9.4M21 14l4 2.3M21 14l-4 2.3"/></g>
      <path d="M7 14 12 7.6h7.5M13 14l-1-6.4M13 14l6.5-6.4L21 14M7 14h6"/><path d="M10.4 6.4h3M19.5 7.6h5.3"/>`),
    // chunky tyres, bouncing over stones
    Gravel: svg(`<g class="stones"><circle class="fill" cx="5" cy="19.6" r=".7"/><circle class="fill" cx="14" cy="19.8" r=".55"/><circle class="fill" cx="24" cy="19.6" r=".7"/></g>
      <g class="bounce"><circle cx="7" cy="14" r="4.6"/><circle cx="7" cy="14" r="3.3"/><circle cx="21" cy="14" r="4.6"/><circle cx="21" cy="14" r="3.3"/>${FRAME}</g>`),
    // a fresh carbon frameset with a sparkle: brand new
    Tavelo: svg(`<path d="M7 14 11 7.2h8.5M13 14l-2-6.8M13 14l6.5-6.4L21 14M7 14h6"/><path d="M9.4 6h3.2"/>
      <path class="shine" d="M7 14 11 7.2h8.5L13 14z"/><circle cx="13" cy="14" r="1.3"/>
      <path class="spark fill" d="M24 1.2 24.8 3.2 26.8 4 24.8 4.8 24 6.8 23.2 4.8 21.2 4 23.2 3.2z"/>`),
  };

  /* ---------- showcase ---------- */
  const FEATURED = [
    { slug: 'bianchi-oltre-pro-2025-2', tab: 'Aero', title: 'The Tour stage winner' },
    { slug: 'specialized-aethos-expert', tab: 'Climbing', title: 'The featherweight' },
    { slug: 'scott-plasma-2', tab: 'Triathlon', title: 'Built for long course' },
    { slug: 'giant-tcx-advanced-pro-1', tab: 'Gravel', title: 'Road, then dirt' },
    { slug: 'tavelo-arow-race-alpha-radiance', tab: 'Tavelo', title: 'Race-proven, brand new' },
  ].filter((f) => bySlug(f.slug));

  const stage = $('[data-showcase]');
  const tabs = $('[data-showcase-tabs]');
  const count = $('[data-slide-count]');
  const prev = $('[data-slide-prev]');
  const next = $('[data-slide-next]');
  prev.innerHTML = icon.left;
  next.innerHTML = icon.right;

  stage.innerHTML = FEATURED.map((f, i) => {
    const b = bySlug(f.slug);
    const chips = b.features.slice(0, 6).map((x) => `<span class="chip">+ ${esc(x)}</span>`).join('');
    return `<article class="slide" id="slide-${i}" role="tabpanel" aria-label="${esc(b.name)}" ${i ? 'hidden' : ''}>
      <div class="slide__copy">
        <span class="eyebrow">${esc(b.name)} · ${esc(b.size)}</span>
        <h3 class="slide__title">${esc(f.title)}</h3>
        <p class="lede">${esc(b.tagline)}</p>
        <div class="chips">${chips}</div>
        <div class="slide__price"><strong>${money(b.price)}</strong><span class="muted">${b.type === 'new' ? 'Brand new · Lifetime frame warranty' : 'Pre-owned · Inspected &amp; serviced'}</span></div>
        <div class="row"><a class="btn btn--dark" href="bike.html?slug=${encodeURIComponent(b.slug)}">View bike</a><button class="btn btn--line" type="button" data-add="${esc(b.slug)}">Add to bag</button></div>
      </div>
      <a class="slide__media" href="bike.html?slug=${encodeURIComponent(b.slug)}" aria-label="View ${esc(b.name)}"><img src="${esc(b.images[0])}" alt="${esc(b.name)}" loading="${i ? 'lazy' : 'eager'}"></a>
    </article>`;
  }).join('');
  tabs.classList.add('seg--icons');
  tabs.innerHTML = FEATURED.map((f, i) => `<button type="button" role="tab" aria-controls="slide-${i}" aria-selected="${i === 0}">${BIKE_ICONS[f.tab] || ''}${esc(f.tab)}</button>`).join('');

  let current = 0;
  function go(i) {
    current = (i + FEATURED.length) % FEATURED.length;
    $$('.slide', stage).forEach((el, n) => {
      el.hidden = n !== current;
      el.classList.toggle('is-entering', n === current);
    });
    $$('button', tabs).forEach((t, n) => t.setAttribute('aria-selected', String(n === current)));
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(FEATURED.length).padStart(2, '0')}`;
  }
  tabs.addEventListener('click', (e) => { const t = e.target.closest('button'); if (t) go($$('button', tabs).indexOf(t)); });
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  let sx = null;
  stage.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    sx = null;
  });
  go(0);

  /* ---------- range grid ---------- */
  const grid = $('[data-range-grid]');
  const all = $('[data-range-all]');
  const bikesOnly = BIKES.filter((b) => b.productType === 'Full Bikes');
  const RANGES = {
    latest: () => bikesOnly.filter((b) => b.type === 'pre-owned'),
    Road: () => bikesOnly.filter((b) => b.type === 'pre-owned' && b.category === 'Road').sort((a, b) => b.price - a.price),
    TT: () => bikesOnly.filter((b) => b.category === 'TT'),
    new: () => bikesOnly.filter((b) => b.type === 'new'),
  };
  const LINKS = { latest: 'shop.html?type=pre-owned', Road: 'shop.html?category=Road', TT: 'shop.html?category=TT', new: 'shop.html?type=new' };
  function range(key) {
    grid.innerHTML = RANGES[key]().slice(0, 8).map((b) => card(b, { reveal: true })).join('');
    all.href = LINKS[key];
    $$('[data-range]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.range === key)));
    window.MKP.refresh(grid);
  }
  $('[data-range-tabs]').addEventListener('click', (e) => { const t = e.target.closest('[data-range]'); if (t) range(t.dataset.range); });
  range('latest');

  /* ---------- rider marquee ---------- */
  const QUOTES = [
    'Amazing service and smooth experience.', 'Bike arrived perfectly packed.', 'Highly recommend MKP Bikes.', 'Super helpful team, no pressure at all.',
    'Best bike purchase I’ve made.', 'Quality bikes and great advice.', 'Everything was easy and smooth.', 'Bike feels perfect after setup.',
    'Very professional and friendly.', 'Couldn’t be happier with my bike.', 'Fast response and great service.', 'Highly recommend to anyone.',
    'Bike arrived in perfect condition.', 'Great communication throughout.', 'Smooth process from start to finish.', 'Very knowledgeable team.',
    'Top quality bikes and service.', 'Really happy with the purchase.', 'Setup was perfect, ready to ride.', 'Would definitely buy again.', 'Fantastic experience overall.',
  ];
  const fig = (n, copy) => `<button class="review" type="button" data-review="${n}" ${copy ? 'tabindex="-1" aria-hidden="true"' : `aria-label="Open review: ${esc(QUOTES[n - 1])}"`}><figure><img src="assets/reviews/review${n}.jpg" alt="" loading="lazy"><figcaption><span aria-label="5 stars">★★★★★</span>${esc(QUOTES[n - 1])}</figcaption></figure></button>`;
  const rowA = Array.from({ length: 11 }, (_, i) => i + 1);
  const rowB = Array.from({ length: 10 }, (_, i) => i + 12);
  // each row is doubled so the loop is seamless; the copies are hidden from keyboard and screen readers
  const track = (nums, rev) => `<div class="marquee__track${rev ? ' marquee__track--rev' : ''}">${nums.map((n) => fig(n)).join('')}${nums.map((n) => fig(n, true)).join('')}</div>`;
  const marquee = $('[data-marquee]');
  marquee.innerHTML = track(rowA) + track(rowB, true);

  // open any review large, with the quote beside it; arrows page through all 21
  const star = icon.star.replace('<svg', '<svg aria-hidden="true"');
  const reviews = QUOTES.map((q, i) => ({
    src: `assets/reviews/review${i + 1}.jpg`,
    alt: 'MKP customer with their new bike in the Cheltenham showroom',
    caption: `<div class="rv-stars" aria-label="Rated 5 out of 5">${`<span>${star}</span>`.repeat(5)}</div>
      <blockquote>“${esc(q)}”</blockquote>
      <div class="rv-meta"><b><i>${icon.tick}</i>MKP customer</b><span>Picked up at the Cheltenham showroom</span></div>
      <a class="btn btn--dark btn--sm" href="shop.html">Find your bike</a>`,
  }));
  marquee.addEventListener('click', (e) => {
    const r = e.target.closest('[data-review]');
    if (r) window.MKP.lightbox(reviews, Number(r.dataset.review) - 1);
  });

  window.MKP.refresh();
})();
