/* MKP Bikes — shared site chrome and helpers (header, footer, bag, favourites, size finder, cards). */
(function () {
  const BIKES = window.MKP_BIKES || [];
  const WA = '61478165043';
  const PHONE = '+61 426 195 709';
  const ADDRESS = '5/17 Kylie Place, Cheltenham VIC 3192';
  const MAPS = 'https://maps.google.com/?q=' + encodeURIComponent('MKP Bikes, ' + ADDRESS);
  const IG = 'https://instagram.com/mkp.bikes';
  const YT = 'https://www.youtube.com/channel/UCt7V41qwWQOJDJtXbn-_GDw';
  const FB = 'https://www.facebook.com/p/MKP-Bikes-61574385731012/';

  /* ---------- icons ---------- */
  const s = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const icon = {
    bag: s('<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    heart: s('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>'),
    menu: s('<path d="M4 8h16M4 16h16"/>'),
    close: s('<path d="M6 6l12 12M18 6 6 18"/>'),
    arrow: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    left: s('<path d="M15 6l-6 6 6 6"/>'),
    right: s('<path d="M9 6l6 6-6 6"/>'),
    plus: s('<path d="M12 5v14M5 12h14"/>'),
    shield: s('<path class="ia-shield" d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6l-7-3Z"/><path class="ia-check" pathLength="1" d="m9 12 2 2 4-4"/>'),
    truck: s('<g class="ia-speed"><path d="M-2 9.5h3"/><path d="M-1 12.5h2.4"/></g><g class="ia-truck"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/></g><g class="ia-wheel" style="transform-origin:7px 17.5px"><circle cx="7" cy="17.5" r="1.6"/><path d="M7 17.5v-1.6"/></g><g class="ia-wheel" style="transform-origin:17px 17.5px"><circle cx="17" cy="17.5" r="1.6"/><path d="M17 17.5v-1.6"/></g>'),
    wrench: s('<g class="ia-wrench"><path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.6-.6-2.6 2.6-2.2Z"/></g><g class="ia-sparks"><path d="M19.5 3.5l1-1"/><path d="M21 6.5h1.4"/><path d="M17 2V.8"/></g>'),
    chat: s('<path d="M4 5h16v11H9l-5 4V5Z"/><circle class="ia-dot" cx="8.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle class="ia-dot" cx="12" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle class="ia-dot" cx="15.5" cy="10.5" r="1" fill="currentColor" stroke="none"/>'),
    pin: s('<path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    bike: s('<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8 8.5 5H7M12.5 16 10 8M15 8l-2.5 8"/>'),
    ruler: s('<path d="m3 17 14-14 4 4L7 21l-4-4Z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>'),
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>',
    swap: s('<path class="ia-swap-a" d="M7 7h12l-3-3"/><path class="ia-swap-b" d="M17 17H5l3 3"/>'),
    award: s('<g class="ia-medal"><circle cx="12" cy="9" r="5"/><path d="m8.5 13-1.5 8 5-3 5 3-1.5-8"/><path class="ia-star" d="M12 6.4l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" fill="currentColor" stroke="none"/></g>'),
    clock: s('<circle cx="12" cy="12" r="8.5"/><path d="M12 12l3 2"/><path class="ia-hand" d="M12 12V6.5"/>'),
    ig: s('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/>'),
    yt: s('<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9.5 5 2.5-5 2.5v-5Z" fill="currentColor"/>'),
    fb: s('<path d="M14 8h3V4.5h-3A4 4 0 0 0 10 8.5V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9a1 1 0 0 1 1-1Z"/>'),
    wa: s('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.3-1.3-2-1-1 .8a4 4 0 0 1-2.3-2.3l.8-1-1-2L9 9.5Z"/>'),
    search: s('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    filter: s('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    ride: s('<g class="ia-speed"><path d="M-1 8.5h3"/><path d="M0 11.5h2.4"/></g><g class="ia-bob"><path d="M6 16l4-8h5l3 8M10 8 8.5 5H7M12.5 16 10 8M15 8l-2.5 8"/></g><g class="ia-wheel" style="transform-origin:6px 16px"><circle cx="6" cy="16" r="3.5"/><path d="M6 12.5v7M2.5 16h7"/></g><g class="ia-wheel" style="transform-origin:18px 16px"><circle cx="18" cy="16" r="3.5"/><path d="M18 12.5v7M14.5 16h7"/></g>'),
    fit: s('<path d="M3 20.5h18"/><path d="M5 20.5V9"/><path d="M5 9l9-4"/><g class="ia-gauge" style="transform-origin:5px 20.5px"><path d="M5 20.5 18 11"/><circle cx="18" cy="11" r="1.4" fill="currentColor" stroke="none"/></g><path class="ia-arc" pathLength="1" d="M10 20.5a5 5 0 0 0-1-3"/>'),
    tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 12.5 4 4 8-9"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5 14 9.2 20.5 12 14 14.8 12 21.5 10 14.8 3.5 12 10 9.2z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5Z"/></svg>',
  };

  /* ---------- utils ---------- */
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => (n == null ? 'POA' : '$' + Number(n).toLocaleString('en-AU'));
  const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const bySlug = (slug) => BIKES.find((b) => b.slug === slug);
  const store = {
    get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const page = document.body.dataset.page || '';

  /* ---------- chrome ---------- */
  const NAV = [
    ['shop', 'shop.html', 'Shop bikes'],
    ['preowned', 'shop.html?type=pre-owned', 'Pre-owned'],
    ['tavelo', 'tavelo.html', 'Tavelo'],
    ['fitting', 'fitting.html', 'Bike fitting'],
    ['sell', 'sell.html', 'Sell your bike'],
  ];

  function renderChrome() {
    const announce = document.createElement('div');
    announce.className = 'announce';
    announce.innerHTML = `<span class="dot"></span><span class="announce__long">Authorised Tavelo dealer in Australia, lifetime warranty included.</span><span class="announce__short">Authorised Tavelo dealer, lifetime warranty</span> <a href="tavelo.html">Shop Tavelo</a>
      <button class="announce__close" type="button" aria-label="Dismiss announcement">${icon.close}</button>`;
    if (store.get('mkp-announce-off', false)) announce.classList.add('is-hidden');

    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `<div class="wrap header__inner">
        <a class="wordmark" href="index.html" aria-label="MKP Bikes home">mkp.</a>
        <nav class="nav" aria-label="Primary">${NAV.map(([k, href, label]) => `<a href="${href}" ${k === page ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
        <div class="header__actions">
          <a class="icon-btn" href="shop.html?fav=1" aria-label="Favourites">${icon.heart}<span class="count" data-fav-count></span></a>
          <button class="icon-btn" type="button" data-open-bag aria-label="Open bag">${icon.bag}<span class="count" data-bag-count></span></button>
          <a class="btn btn--dark btn--sm header__cta" href="${wa("Hi MKP, I'd like to book a test ride.")}" target="_blank" rel="noopener">Book a test ride</a>
          <button class="icon-btn menu-btn" type="button" data-open-menu aria-label="Open menu" aria-expanded="false">${icon.menu}</button>
        </div>
      </div>`;

    const mnav = document.createElement('div');
    mnav.className = 'mnav';
    mnav.setAttribute('aria-hidden', 'true');
    mnav.innerHTML = `<div class="mnav__top"><a class="wordmark" href="index.html">mkp.</a><button class="icon-btn" type="button" data-close-menu aria-label="Close menu">${icon.close}</button></div>
      <nav class="mnav__links" aria-label="Mobile">${NAV.map(([, href, label]) => `<a href="${href}">${label}</a>`).join('')}<a href="#" data-open-size>Find your size</a></nav>
      <div class="mnav__foot"><a class="btn btn--dark btn--block" href="${wa("Hi MKP, I'd like to book a test ride.")}" target="_blank" rel="noopener">Book a test ride</a>
      <p class="muted" style="font-size:14px">${ADDRESS}<br>Weekdays 11am–7pm · Weekends 10am–5pm</p></div>`;

    document.body.prepend(mnav);
    document.body.prepend(header);
    document.body.prepend(announce);

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `<div class="wrap">
      <div class="footer__cta">
        <div><span class="footer__kicker">Ready when you are</span><h2 class="footer__title">Find your next bike.</h2></div>
        <div class="row"><a class="btn btn--light" href="shop.html">Shop all bikes</a><a class="btn btn--line" href="${wa("Hi MKP, I'd like to book a test ride.")}" target="_blank" rel="noopener">Book a test ride</a></div>
      </div>
      <div class="footer__grid">
        <div><h4>Shop</h4><ul>
          <li><a href="shop.html?type=pre-owned">Pre-owned bikes</a></li><li><a href="shop.html?type=new">New bikes</a></li>
          <li><a href="shop.html?category=Road">Road</a></li><li><a href="shop.html?category=TT">Triathlon &amp; TT</a></li>
          <li><a href="shop.html?category=Gravel">Gravel</a></li><li><a href="tavelo.html">Tavelo</a></li></ul></div>
        <div><h4>Services</h4><ul>
          <li><a href="fitting.html">Bike fitting</a></li><li><a href="sell.html">Sell or trade-in</a></li>
          <li><a href="#" data-open-size>Find your size</a></li><li><a href="${wa("Hi MKP, I'd like to book a test ride.")}" target="_blank" rel="noopener">Book a test ride</a></li>
          <li><a href="https://www.mkpbikes.com.au/guides" target="_blank" rel="noopener">Guides</a></li></ul></div>
        <div><h4>Visit</h4>
          <p class="open-now" data-open-now></p>
          <ul>
          <li><a href="${MAPS}" target="_blank" rel="noopener">5/17 Kylie Place<br>Cheltenham VIC 3192</a></li>
          <li class="footer__hours"><span>Weekdays</span><span>11am–7pm</span><span>Weekends</span><span>10am–5pm</span></li>
          <li><a href="tel:+61426195709">${PHONE}</a></li><li><a href="${wa('Hi MKP!')}" target="_blank" rel="noopener">WhatsApp us</a></li></ul></div>
        <div><h4>Fresh bikes, first</h4>
          <form class="newsletter" data-newsletter><label class="sr-only" for="nl-email">Email</label><input id="nl-email" type="email" placeholder="Enter your email" required><button type="submit" aria-label="Subscribe">${icon.arrow}</button></form>
          <p class="fine">New arrivals, offers and riding tips. No spam, unsubscribe anytime.</p>
          <div class="socials"><a href="${IG}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a><a href="${YT}" target="_blank" rel="noopener" aria-label="YouTube">${icon.yt}</a><a href="${FB}" target="_blank" rel="noopener" aria-label="Facebook">${icon.fb}</a></div>
        </div>
      </div>
      <div class="footer__bottom"><span>© ${new Date().getFullYear()} MKP Bikes · Cheltenham, Melbourne</span>
        <nav><a href="https://www.mkpbikes.com.au/about" target="_blank" rel="noopener">About</a><a href="sell.html">Sell your bike</a><a href="tavelo.html">Tavelo warranty</a><button class="footer__top" type="button" data-to-top>Back to top <span aria-hidden="true">↑</span></button></nav></div>
      <div class="footer__mark" aria-hidden="true" data-mark><span><i>m</i></span><span><i>k</i></span><span><i>p</i></span><span class="mark-dot"><i>.</i></span></div>
    </div>`;
    document.body.append(footer);

    const bag = document.createElement('div');
    bag.innerHTML = `<div class="scrim" data-scrim></div>
      <aside class="drawer" aria-label="Bag" aria-hidden="true" data-drawer>
        <div class="drawer__head"><h2>Your bag</h2><button class="icon-btn" type="button" data-close aria-label="Close bag">${icon.close}</button></div>
        <div class="drawer__body" data-bag-body></div>
        <div class="drawer__foot" data-bag-foot></div>
      </aside>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="size-title" aria-hidden="true" data-size-modal>
        <div class="modal__media"><img src="assets/bikes/tavelo-arow-4-0.jpg" alt="" loading="lazy"></div>
        <form class="modal__body" data-size-form>
          <button class="icon-btn modal__close" type="button" data-close aria-label="Close size finder">${icon.close}</button>
          <span class="eyebrow">Road bike size finder</span>
          <h2 class="h3" id="size-title">Find your frame size in 10 seconds.</h2>
          <div class="field-row">
            <div class="field"><label for="sf-height">Height (cm)</label><input class="input" id="sf-height" type="number" inputmode="numeric" min="140" max="210" placeholder="e.g. 178" required></div>
            <div class="field"><label for="sf-inseam">Inseam (cm, optional)</label><input class="input" id="sf-inseam" type="number" inputmode="numeric" min="60" max="100" placeholder="e.g. 82"></div>
          </div>
          <button class="btn btn--dark btn--block" type="submit">Show my size</button>
          <div class="result" data-size-result aria-live="polite"></div>
          <p class="muted" style="font-size:13px">Between sizes or riding with pain? A <a class="link-arrow" href="fitting.html">professional bike fit</a> settles it.</p>
        </form>
      </div>
      <div class="lightbox" data-lightbox role="dialog" aria-modal="true" aria-label="Photo viewer" aria-hidden="true">
        <button class="icon-btn" type="button" data-lb-close aria-label="Close">${icon.close}</button>
        <button class="icon-btn" type="button" data-lb-prev aria-label="Previous">${icon.left}</button>
        <figure class="lightbox__stage" data-lb-stage><img alt=""><figcaption class="lightbox__caption" data-lb-caption hidden></figcaption></figure>
        <button class="icon-btn" type="button" data-lb-next aria-label="Next">${icon.right}</button>
        <span class="lightbox__count" data-lb-count></span>
      </div>
      <div class="toast" role="status" data-toast></div>`;
    document.body.append(bag);
  }

  /* ---------- footer: wordmark sized to the column width, open-now status, back to top ---------- */
  function footerBehaviour() {
    const mark = $('[data-mark]');
    const fit = () => {
      mark.style.fontSize = '100px';
      const w = mark.scrollWidth;
      const room = mark.parentElement.clientWidth - parseFloat(getComputedStyle(mark.parentElement).paddingLeft) * 2;
      mark.style.fontSize = `${(100 * room) / w}px`;
    };
    fit();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    addEventListener('resize', fit);
    // rise in once, then loop the wave only while the wordmark is on screen
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) mark.classList.add('is-in');
      mark.classList.toggle('is-playing', e.isIntersecting);
    }, { threshold: 0.2 }).observe(mark);

    // Melbourne time decides the badge, whatever the visitor's timezone
    const now = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).reduce((o, p) => ((o[p.type] = p.value), o), {});
    const weekend = now.weekday === 'Sat' || now.weekday === 'Sun';
    const [open, close] = weekend ? [10, 17] : [11, 19];
    const h = Number(now.hour) + Number(now.minute) / 60;
    const el = $('[data-open-now]');
    const isOpen = h >= open && h < close;
    el.classList.toggle('is-open', isOpen);
    el.innerHTML = `<i></i>${isOpen ? `Open now · until ${close - 12}pm` : h < open ? `Closed · opens ${open}am` : 'Closed · opens tomorrow'}`;

    $('[data-to-top]').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- header behaviour ---------- */
  function headerBehaviour() {
    const header = $('.header');
    const announce = $('.announce');
    const hero = $('[data-hero]');
    const update = () => {
      if (!hero) return;
      const clear = hero.getBoundingClientRect().bottom > header.offsetHeight + 4;
      header.classList.toggle('header--clear', clear);
    };
    if (hero) document.body.classList.add('page--hero');
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);

    $('.announce__close', announce).addEventListener('click', () => { announce.classList.add('is-hidden'); store.set('mkp-announce-off', true); update(); });

    const mnav = $('.mnav');
    const openBtn = $('[data-open-menu]');
    const setMenu = (open) => {
      mnav.classList.toggle('is-open', open);
      mnav.setAttribute('aria-hidden', String(!open));
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    };
    openBtn.addEventListener('click', () => setMenu(true));
    $('[data-close-menu]').addEventListener('click', () => setMenu(false));
    $$('.mnav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  }

  /* ---------- overlays ---------- */
  const scrim = () => $('[data-scrim]');
  let openLayer = null;
  function openOverlay(el) {
    closeOverlay();
    openLayer = el;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    scrim().classList.add('is-open');
    document.body.classList.add('is-locked');
    const focusable = el.querySelector('input, button:not([data-close]), a');
    setTimeout(() => focusable && focusable.focus(), 50);
  }
  function closeOverlay() {
    if (!openLayer) return;
    openLayer.classList.remove('is-open');
    openLayer.setAttribute('aria-hidden', 'true');
    scrim().classList.remove('is-open');
    document.body.classList.remove('is-locked');
    openLayer = null;
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(html) {
    const t = $('[data-toast]');
    t.innerHTML = html;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
  }

  /* ---------- bag ---------- */
  const bag = {
    items() { return store.get('mkp-bag', []).filter(bySlug); },
    has(slug) { return this.items().includes(slug); },
    add(slug) {
      const items = this.items();
      if (!items.includes(slug)) items.push(slug);
      store.set('mkp-bag', items);
      renderBag();
      const b = bySlug(slug);
      toast(`${esc(b.name)} added to your bag <a href="#" data-open-bag>View bag</a>`);
    },
    remove(slug) { store.set('mkp-bag', this.items().filter((x) => x !== slug)); renderBag(); },
  };

  function renderBag() {
    const items = bag.items().map(bySlug);
    $$('[data-bag-count]').forEach((el) => (el.textContent = items.length || ''));
    const body = $('[data-bag-body]');
    const foot = $('[data-bag-foot]');
    if (!items.length) {
      body.innerHTML = `<div class="empty">${icon.bag}<p>Your bag is empty.<br>Every bike is inspected, serviced and ready to ride.</p><a class="btn btn--dark btn--sm" href="shop.html">Shop bikes</a></div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = items.map((b) => `<div class="bagitem">
        <img src="${esc(b.images[0] || '')}" alt="">
        <div><b>${esc(b.name)}</b><small>${esc(b.category)} · ${esc(b.size)}${b.type === 'pre-owned' ? ' · Pre-owned' : ' · New'}</small><br><button type="button" data-remove="${esc(b.slug)}">Remove</button></div>
        <b>${money(b.deal || b.price)}</b></div>`).join('');
    const total = items.reduce((n, b) => n + (b.deal || b.price || 0), 0);
    const msg = `Hi MKP, I'd like to reserve:\n${items.map((b) => `• ${b.name} (${b.size}) ${money(b.deal || b.price)}`).join('\n')}\nTotal ${money(total)}. Is it still available?`;
    foot.innerHTML = `<div class="drawer__total"><span>Total</span><span>${money(total)}</span></div>
      <a class="btn btn--dark btn--block" href="${wa(msg)}" target="_blank" rel="noopener">${icon.wa} Reserve on WhatsApp</a>
      <a class="btn btn--line btn--block" href="${wa("Hi MKP, I'd like to book a test ride for the bikes in my bag.")}" target="_blank" rel="noopener">Book a test ride first</a>
      <p class="drawer__note">No payment is taken online. We confirm availability and hold the bike for you, then you pay in store or by bank transfer. Free packing and insured delivery Australia-wide.</p>`;
  }

  /* ---------- favourites ---------- */
  const favs = {
    all() { return store.get('mkp-favs', []); },
    toggle(slug) {
      const list = this.all();
      const i = list.indexOf(slug);
      i >= 0 ? list.splice(i, 1) : list.push(slug);
      store.set('mkp-favs', list);
      syncFavs();
      return i < 0;
    },
  };
  function syncFavs() {
    const list = favs.all();
    $$('[data-fav-count]').forEach((el) => (el.textContent = list.length || ''));
    $$('[data-fav]').forEach((btn) => btn.setAttribute('aria-pressed', String(list.includes(btn.dataset.fav))));
  }

  /* ---------- product card ---------- */
  // pre-owned: dark glass pill with a verified tick and the workshop's condition grade; new: lime "brand new"
  function tag(b) {
    if (b.type === 'new') return `<span class="tag tag--new">${icon.sparkle}<span>Brand new</span></span>`;
    const grade = b.condition ? b.condition[0].toUpperCase() + b.condition.slice(1) : 'Inspected';
    return `<span class="tag tag--used"><i class="tag__tick">${icon.tick}</i><span>Pre-owned</span><em>${esc(grade)}</em></span>`;
  }

  function card(b, opts = {}) {
    const [a, c] = b.images;
    const meta = [b.category, b.size].filter(Boolean).join(' · ');
    const price = b.deal ? `${money(b.deal)} <s>${money(b.price)}</s>` : b.was ? `${money(b.price)} <s>${money(b.was)}</s>` : money(b.price);
    return `<article class="card${opts.reveal ? ' reveal' : ''}">
      <div class="card__media">
        ${a ? `<img src="${esc(a)}" alt="${esc(b.name)}" loading="lazy">` : ''}${c ? `<img src="${esc(c)}" alt="" loading="lazy">` : ''}
        <div class="card__badges">${tag(b)}${b.deal ? '<span class="tag tag--deal">Deal</span>' : ''}</div>
        <button class="icon-btn card__fav" type="button" data-fav="${esc(b.slug)}" aria-pressed="false" aria-label="Save ${esc(b.name)}">${icon.heart}</button>
        <div class="card__quick"><button class="btn btn--light btn--sm btn--block" type="button" data-add="${esc(b.slug)}">${icon.plus} Add to bag</button></div>
      </div>
      <div class="card__body">
        <h3 class="card__title"><a href="bike.html?slug=${encodeURIComponent(b.slug)}">${esc(b.name)}</a></h3>
        <p class="card__meta">${esc(meta)}${b.groupset ? ' · ' + esc(b.groupset) : ''}</p>
        <p class="card__price">${price}</p>
      </div>
    </article>`;
  }

  /* ---------- size finder ---------- */
  const SIZES = [
    [0, 160, 'XS', '47–49 cm'], [160, 167, 'S', '50–52 cm'], [167, 175, 'M', '53–55 cm'],
    [175, 183, 'L', '56–57 cm'], [183, 190, 'XL', '58–60 cm'], [190, 999, 'XXL', '61+ cm'],
  ];
  function sizeFinder() {
    $('[data-size-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const h = Number($('#sf-height').value);
      const inseam = Number($('#sf-inseam').value);
      const row = SIZES.find(([lo, hi]) => h >= lo && h < hi);
      if (!row) return;
      const frame = inseam ? Math.round(inseam * 0.67) : null;
      const near = SIZES.some(([lo, hi]) => Math.abs(h - lo) <= 1 || Math.abs(h - hi) <= 1);
      const matches = BIKES.filter((b) => b.sizes.some((x) => x.replace(/\W/g, '').toUpperCase().startsWith(row[2]))).length;
      const out = $('[data-size-result]');
      out.innerHTML = `<span class="eyebrow">Your road size</span><strong>${row[2]}</strong>
        <p class="muted" style="font-size:14px">Roughly a ${row[3]} frame${frame ? `, or about ${frame} cm by inseam` : ''}.${near ? ' You sit near a size boundary, so geometry matters. Test ride both or book a fit.' : ''}</p>
        <a class="btn btn--dark btn--sm" style="margin-top:14px" href="shop.html?size=${row[2]}">See ${matches} bike${matches === 1 ? '' : 's'} in ${row[2]}</a>`;
      out.classList.add('is-on');
    });
  }

  /* ---------- lightbox ---------- */
  // items are image paths, or { src, alt, caption } where caption is trusted HTML built by the page
  let lbList = [];
  let lbIndex = 0;
  let lbReturn = null;
  const pad2 = (n) => String(n).padStart(2, '0');
  function lbRender() {
    const lb = $('[data-lightbox]');
    const raw = lbList[lbIndex];
    const item = typeof raw === 'string' ? { src: raw } : raw;
    const stage = $('[data-lb-stage]', lb);
    const cap = $('[data-lb-caption]', lb);
    $('img', stage).src = item.src;
    $('img', stage).alt = item.alt || '';
    cap.hidden = !item.caption;
    cap.innerHTML = item.caption || '';
    lb.classList.toggle('lightbox--caption', Boolean(item.caption));
    $('[data-lb-count]', lb).textContent = lbList.length > 1 ? `${pad2(lbIndex + 1)} / ${pad2(lbList.length)}` : '';
    stage.classList.remove('is-swapping');
    void stage.offsetWidth;
    stage.classList.add('is-swapping');
  }
  function lightbox(list, index) {
    lbList = list;
    lbIndex = index;
    lbReturn = document.activeElement;
    const lb = $('[data-lightbox]');
    lbRender();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('[data-lb-close]', lb).focus();
  }
  function lbStep(d) {
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    lbRender();
  }
  function lbClose() {
    const lb = $('[data-lightbox]');
    if (!lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lbReturn && lbReturn.focus) lbReturn.focus({ preventScroll: true });
  }
  function lbGestures() {
    const lb = $('[data-lightbox]');
    // clicking the dark backdrop (not the photo or caption) closes it
    lb.addEventListener('click', (e) => { if (e.target === lb) lbClose(); });
    let sx = null;
    lb.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
      sx = null;
    });
  }

  /* ---------- scroll effects ---------- */
  function scrollFx() {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    MKP.observe = (root = document) => $$('.reveal:not(.is-in)', root).forEach((el) => io.observe(el));
    MKP.observe();

    // word-by-word statement reveal
    $$('[data-words]').forEach((p) => {
      const marked = (p.dataset.markWords || '').toLowerCase().split(/\s+/).filter(Boolean);
      p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => {
        const hit = marked.includes(w.toLowerCase().replace(/[^a-z]/g, ''));
        return `<span class="w${hit ? ' w--mark' : ''}">${esc(w)}</span>`;
      }).join(' ');
    });
    const words = $$('[data-words] .w');
    // subtle parallax on full-bleed media
    const para = $$('[data-parallax]');
    const tick = () => {
      const vh = innerHeight;
      words.forEach((w) => w.classList.toggle('is-on', w.getBoundingClientRect().top < vh * 0.62));
      para.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = `translate3d(0, ${(p * -8).toFixed(2)}%, 0)`;
      });
    };
    tick();
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
  }

  /* ---------- global events ---------- */
  function events() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-open-bag],[data-add],[data-remove],[data-fav],[data-open-size],[data-close],[data-scrim],[data-lb-close],[data-lb-prev],[data-lb-next]');
      if (!t) return;
      if (t.matches('[data-open-bag]')) { e.preventDefault(); renderBag(); openOverlay($('[data-drawer]')); }
      else if (t.matches('[data-add]')) { e.preventDefault(); bag.add(t.dataset.add); }
      else if (t.matches('[data-remove]')) { bag.remove(t.dataset.remove); }
      else if (t.matches('[data-fav]')) {
        e.preventDefault();
        const on = favs.toggle(t.dataset.fav);
        toast(on ? 'Saved to favourites <a href="shop.html?fav=1">View</a>' : 'Removed from favourites');
      }
      else if (t.matches('[data-open-size]')) { e.preventDefault(); openOverlay($('[data-size-modal]')); }
      else if (t.matches('[data-close],[data-scrim]')) { closeOverlay(); }
      else if (t.matches('[data-lb-close]')) { lbClose(); }
      else if (t.matches('[data-lb-prev]')) { lbStep(-1); }
      else if (t.matches('[data-lb-next]')) { lbStep(1); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeOverlay(); lbClose(); }
      if ($('[data-lightbox].is-open') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) lbStep(e.key === 'ArrowLeft' ? -1 : 1);
    });
    $('[data-newsletter]').addEventListener('submit', (e) => {
      e.preventDefault();
      e.target.reset();
      toast("You're on the list. Fresh bikes, first.");
    });
  }

  /* ---------- count-up stats and in-view flags ---------- */
  function countUps() {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nums = $$('[data-count]');
    const label = (el, n) => `${el.dataset.prefix || ''}${n.toLocaleString('en-AU')}${el.dataset.suffix || ''}`;
    const run = (el) => {
      const target = Number(el.dataset.count);
      const t0 = performance.now();
      const dur = 1600;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = label(el, Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // background tabs throttle rAF; make sure the real figure always lands
      setTimeout(() => (el.textContent = label(el, target)), dur + 400);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      if (e.target.matches('[data-count]')) run(e.target);
      else e.target.classList.add('is-in');
    }), { threshold: 0.4 });
    nums.forEach((el) => {
      if (still) return;
      el.textContent = label(el, 0);
      io.observe(el);
    });
    $$('[data-inview]').forEach((el) => io.observe(el));
  }

  /* ---------- declarative bits in page markup ---------- */
  function hydrate(root = document) {
    $$('[data-icon]', root).forEach((el) => { if (!el.dataset.iconDone) { el.insertAdjacentHTML('afterbegin', icon[el.dataset.icon] || ''); el.dataset.iconDone = '1'; } });
    $$('[data-wa]', root).forEach((a) => (a.href = wa(a.dataset.wa)));
    $$('[data-maps]', root).forEach((a) => (a.href = MAPS));
    $$('.tile i:empty, .faq summary i:empty', root).forEach((i) => (i.innerHTML = i.closest('.faq') ? icon.plus : icon.arrow));
  }

  /* ---------- tiny markdown (bike descriptions) ---------- */
  function md(src) {
    const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    const out = [];
    let list = null;
    src.replace(/\r/g, '').split('\n').forEach((raw) => {
      const line = raw.trim();
      if (/^[-*•]\s+/.test(line)) { (list = list || []).push(`<li>${inline(line.replace(/^[-*•]\s+/, ''))}</li>`); return; }
      if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; }
      if (!line) return;
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) out.push(`<h3>${inline(h[2])}</h3>`);
      else out.push(`<p>${inline(line)}</p>`);
    });
    if (list) out.push(`<ul>${list.join('')}</ul>`);
    return out.join('');
  }

  const MKP = { BIKES, icon, esc, money, wa, bySlug, card, bag, favs, syncFavs, md, lightbox, toast, ADDRESS, PHONE, MAPS, IG, store, $, $$ };
  // page scripts call this after injecting cards so hearts and reveals pick them up
  MKP.refresh = (root) => { hydrate(root); syncFavs(); MKP.observe && MKP.observe(root); };
  window.MKP = MKP;

  renderChrome();
  footerBehaviour();
  lbGestures();
  hydrate();
  headerBehaviour();
  events();
  sizeFinder();
  renderBag();
  syncFavs();
  scrollFx();
  countUps();
})();
