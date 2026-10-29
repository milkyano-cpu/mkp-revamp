// Shared across every page: nav (desktop pill + phone menu), footer, WhatsApp links,
// scroll reveals, nav colour over dark sections, and the bike card used in every grid.
(() => {
  // Destinations copied from the live mkpbikes.com.au buttons (Oct 2026)
  const LIVE = 'https://www.mkpbikes.com.au';
  const WA_NUMBER = '61478165043';            // the number every live WhatsApp button uses
  const PHONE_LABEL = '+61 426 195 709';      // the number the live site displays
  const MAPS = 'https://www.google.com/maps/place/MKP+Bikes/@-37.9497897,145.0586702,17z/data=!3m1!4b1!4m6!3m5!1s0x6ad66d000df5bfe7:0xf6dcfd7e918ac714!8m2!3d-37.949794!4d145.0635411!16s%2Fg%2F11y3c3bjnt';
  const KLAVIYO = { company: 'RMdpdR', listId: '' }; // listId: the guide list from his Klaviyo account
  // secondary pages (all local now); Strava and Instagram stay external
  const more = [
    ['sell.html', 'Sell Your Bike', 'Get a fair offer or trade in', 'sell'],
    ['size.html', 'Find Your Size', 'Sizing help for any bike', 'size'],
    ['request.html', 'Request a Bike', 'We will find it for you', 'request'],
    ['content.html', 'Our Content', 'Rides, builds and videos', 'content'],
    ['articles.html', 'Articles', 'Guides and buying advice', 'articles'],
    ['about.html', 'About Us', 'The team in Cheltenham', 'about'],
    ['https://strava.app.link/eqFU77Znl4b', 'Strava Club', 'Join the ride'],
    ['https://instagram.com/mkp.bikes', 'Instagram', '@mkp.bikes'],
  ];
  const ext = h => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
  const page = document.body.dataset.page || '';

  const wa = text => `https://wa.me/${WA_NUMBER}` + (text ? `?text=${encodeURIComponent(text)}` : '');
  const liveUrl = b => `${LIVE}/bikes/${b.kind === 'pre' ? 'pre-owned' : 'new-bikes'}/${b.slug}`;
  const money = n => '$' + Number(n).toLocaleString('en-AU');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  // sizes as words, from each bike's own sizing data: S -> Small, ML -> Medium/Large, several -> "Small · Extra Large"
  const SIZE_WORDS = { XXS: 'XX Small', XS: 'Extra Small', S: 'Small', SM: 'Small/Medium', M: 'Medium', ML: 'Medium/Large', 'M/L': 'Medium/Large', L: 'Large', XL: 'Extra Large', XXL: 'XX Large' };
  function sizeLabel(b) {
    const codes = (b.sizing || []).map(x => String(x.size || '').toUpperCase().trim()).filter(Boolean);
    if (!codes.length) return b.productType === 'Wheels' ? 'One size' : '';
    const words = codes.map(c => SIZE_WORDS[c] || c);
    return words.length === 1 ? words[0] : words.join(' · ');
  }
  // cards: one size as a word ("Medium"); several as short codes on one line ("S · XL · XXL") so the label never wraps
  const shortSize = b => {
    const codes = (b.sizing || []).map(x => String(x.size || '').toUpperCase().trim()).filter(Boolean);
    return codes.length > 1 ? codes.join(' · ') : sizeLabel(b);
  };
  const findBike = slug => (window.MKP_BIKES || []).find(x => x.slug === slug);

  // ---------- nav ----------
  const links = [
    ['index.html', 'Home', 'home'],
    ['bikes.html', 'Shop', 'shop'],
    ['tavelo.html', 'Tavelo', 'tavelo'],
    ['fitting.html', 'Bike Fitting', 'fitting'],
  ];
  const navHost = document.getElementById('site-nav');
  if (navHost) {
    navHost.outerHTML = `
<header class="nav" id="nav">
  <a class="brand" href="index.html" aria-label="MKP Bikes home"><img src="img/mkp-logo.jpg" alt=""><span>MKP</span></a>
  <nav class="nav-links" aria-label="Main">
    ${links.map(([h, t, k]) => `<a href="${h}"${k === page ? ' class="cur" aria-current="page"' : ''}>${t}</a>`).join('')}
    <div class="nav-more">
      <button type="button" class="more-btn${more.some(m => m[3] === page) ? ' cur' : ''}" aria-expanded="false" aria-haspopup="true">More <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
      <div class="more-panel" hidden>
        ${more.map(([h, t, d, k]) => `<a href="${h}"${ext(h)}${k && k === page ? ' aria-current="page"' : ''}><b>${t}</b><span>${d}</span></a>`).join('')}
      </div>
    </div>
  </nav>
  <button class="nav-ico" type="button" data-open-favs aria-label="Open favourites"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg><span class="fav-count" hidden>0</span></button>
  <a class="nav-ico" href="tel:${PHONE_LABEL.replace(/\s/g, '')}" aria-label="Call MKP Bikes"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg></a>
  <a class="nav-cta" href="bikes.html">Shop bikes</a>
  <button class="nav-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
</header>
<div class="menu" id="menu" hidden>
  <nav class="menu-links" aria-label="Menu">
    ${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    ${more.slice(0, 6).map(([h, t]) => `<a class="menu-sm" href="${h}"${ext(h)}>${t}</a>`).join('')}
  </nav>
  <div class="menu-foot">
    <a class="btn light" href="${wa()}" target="_blank" rel="noopener">WhatsApp us</a>
    <a class="btn outline menu-dir" href="${MAPS}" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>Get directions</a>
    <p class="menu-addr">5/17 Kylie Place, Cheltenham VIC 3192</p>
  </div>
</div>`;
  }

  // "More" dropdown (desktop)
  const moreBtn = document.querySelector('.more-btn'), morePanel = document.querySelector('.more-panel');
  if (moreBtn) {
    const setMore = open => { morePanel.hidden = !open; moreBtn.setAttribute('aria-expanded', open); };
    moreBtn.addEventListener('click', e => { e.stopPropagation(); setMore(morePanel.hidden); });
    document.addEventListener('click', e => { if (!e.target.closest(".nav-more")) setMore(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setMore(false); });
  }

  // phone menu
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const burger = document.querySelector('.nav-burger');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger && burger.addEventListener('click', () => setMenu(menu.hidden));
  menu && menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // ---------- footer ----------
  const footHost = document.getElementById('site-foot');
  if (footHost) {
    footHost.outerHTML = `
<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-brand-col">
      <div class="foot-brand"><img src="img/mkp-logo.jpg" alt=""><span>MKP Bikes</span></div>
      <p class="foot-tag">Hand-selected pre-owned and new road bikes.</p>
    </div>
    <div class="foot-cols">
      <div><h5 class="mono">Shop</h5><a href="bikes.html?type=pre">Pre-Owned Bikes</a><a href="bikes.html?type=new">New Bikes</a><a href="tavelo.html">Tavelo</a><a href="sell.html">Sell Your Bike</a></div>
      <div><h5 class="mono">Quick links</h5><a href="about.html">About Us</a><a href="size.html">Find Your Size</a><a href="fitting.html">Bike Fitting</a><a href="request.html">Request a Bike</a><a href="content.html">Our Content</a><a href="articles.html">Articles</a></div>
      <div><h5 class="mono">Visit us</h5><a href="${MAPS}" target="_blank" rel="noopener">5/17 Kylie Place<br>Cheltenham VIC 3192</a><a href="tel:${PHONE_LABEL.replace(/\s/g, '')}">${PHONE_LABEL}</a><a href="${wa()}" target="_blank" rel="noopener">WhatsApp us</a><a href="https://instagram.com/mkp.bikes" target="_blank" rel="noopener">@mkp.bikes</a></div>
    </div>
  </div>
  <div class="wrap foot-fine mono"><span>© ${new Date().getFullYear()} MKP Bikes</span><a href="${window.MKP_API && MKP_API.onLive ? '' : LIVE}/admin" rel="nofollow">Admin Panel</a></div>
</footer>`;
  }

  // ---------- favourites (saved in this browser, like "My Favourites" on the live site) ----------
  // Same storage as the live site: cookie "mkp_favourites" (JSON array of slugs, 30 days, path=/),
  // so favourites saved on the old design are still there after the swap. Older local previews used localStorage "mkp-favs".
  const FAV_COOKIE = 'mkp_favourites';
  const favList = () => {
    const c = document.cookie.split('; ').find(x => x.startsWith(FAV_COOKIE + '='));
    if (c) { try { return JSON.parse(decodeURIComponent(c.split('=')[1])) || []; } catch (e) { return []; } }
    try { return JSON.parse(localStorage.getItem('mkp-favs') || '[]'); } catch (e) { return []; }
  };
  const favSave = l => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    document.cookie = `${FAV_COOKIE}=${encodeURIComponent(JSON.stringify(l))};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  };
  const HEART = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
  function favSync() {
    const l = favList();
    document.querySelectorAll('[data-fav]').forEach(b => {
      const on = l.includes(b.dataset.fav);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      const t = b.querySelector('.fav-label');
      if (t) t.textContent = on ? 'Saved to favourites' : 'Save to favourites';
    });
    document.querySelectorAll('.fav-count').forEach(c => { c.textContent = l.length; c.hidden = !l.length; });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault();
    const l = favList(), i = l.indexOf(b.dataset.fav);
    if (i > -1) l.splice(i, 1); else l.push(b.dataset.fav);
    favSave(l); favSync();
    // note: not "pop" (that class is the guide popup overlay)
    b.classList.remove('heart-pop', 'heart-unpop'); void b.offsetWidth;
    if (i > -1) { b.classList.add('heart-unpop'); return; }
    b.classList.add('heart-pop');
    heartBurst(b);
  });
  // ---------- favourites drawer (slides in from the right, no page load) ----------
  const drawer = document.createElement('div');
  drawer.className = 'favs';
  drawer.hidden = true;
  drawer.innerHTML = `
<aside class="favs-panel" role="dialog" aria-modal="true" aria-labelledby="favsTitle">
  <header class="favs-head">
    <h2 id="favsTitle">Your favourites <span class="favs-badge fav-count" hidden>0</span></h2>
    <button class="favs-x" type="button" aria-label="Close favourites">✕</button>
  </header>
  <div class="favs-list"></div>
  <footer class="favs-foot">
    <a class="btn favs-cta" href="#" target="_blank" rel="noopener">Ask about these bikes</a>
    <div class="favs-trust mono"><span>Inspected</span><span>Test ride in store</span><span>Australia-wide delivery</span></div>
  </footer>
</aside>`;
  document.body.appendChild(drawer);
  const trash = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>';
  function renderFavs() {
    const items = favList().map(bySlug).filter(Boolean);
    const list = drawer.querySelector('.favs-list'), foot = drawer.querySelector('.favs-foot');
    foot.hidden = !items.length;
    if (!items.length) {
      list.innerHTML = `<div class="favs-empty"><span class="favs-empty-ico">${HEART}</span><h3>No favourites yet</h3><p>Tap the heart on any bike to save it here.</p><a class="btn dark" href="bikes.html">Shop bikes</a></div>`;
      return;
    }
    list.innerHTML = items.map(b => `
<article class="fav-item">
  <a class="fav-thumb" href="product.html?bike=${encodeURIComponent(b.slug)}"><img src="${esc(b.images[0])}" alt="" loading="lazy"></a>
  <div class="fav-info">
    <span class="mono">${b.kind === 'pre' ? 'Pre-owned' : 'Brand new'} · ${esc(sizeLabel(b))}</span>
    <a class="fav-name" href="product.html?bike=${encodeURIComponent(b.slug)}">${esc(b.name)}</a>
    <a class="fav-ride" href="${wa(`Hey MKP, I'd like to book a test ride for this bike: ${liveUrl(b)}`)}" target="_blank" rel="noopener">Book a test ride</a>
  </div>
  <div class="fav-side"><b>${money(b.price)}</b><button class="fav-del" type="button" data-fav="${esc(b.slug)}" aria-label="Remove ${esc(b.name)}">${trash}</button></div>
</article>`).join('');
    drawer.querySelector('.favs-cta').href = wa(`Hey MKP, I'm interested in these bikes:\n${items.map(b => `- ${b.name} (${sizeLabel(b) || b.size}, ${money(b.price)}): ${liveUrl(b)}`).join('\n')}`);
  }
  function openFavs() {
    renderFavs();
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('open'));
    document.documentElement.classList.add('pop-lock');
    setTimeout(() => drawer.querySelector('.favs-x').focus({ preventScroll: true }), 350);
  }
  function closeFavs() {
    drawer.classList.remove('open');
    document.documentElement.classList.remove('pop-lock');
    setTimeout(() => { drawer.hidden = true; }, 400);
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-open-favs]')) { e.preventDefault(); setMenu && setMenu(false); openFavs(); } });
  drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('.favs-x')) closeFavs(); });
  // the live /favourites page maps to any page + #favourites (opens the drawer)
  if (location.hash === '#favourites') setTimeout(openFavs, 60);
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeFavs(); });
  // keep the open drawer in sync when a heart is toggled
  document.addEventListener('click', e => { if (e.target.closest('[data-fav]') && drawer.classList.contains('open')) setTimeout(renderFavs, 0); });

  // ---------- product view: one renderer for product.html and the quick-view popup ----------
  const gradeNames = { frameSet: 'Frame set', wheelSet: 'Wheel set', groupSet: 'Group set', cockpit: 'Cockpit' };
  // grades are 0 to 100 (Low to High). The live backend currently stores words, so map those until it sends numbers.
  const gradeWords = { amazing: 96, excellent: 90, great: 84, good: 74, fair: 58, poor: 35 };
  const gradePct = v => { const n = typeof v === 'number' ? v : parseFloat(v); return Math.max(0, Math.min(100, Math.round(isNaN(n) ? (gradeWords[String(v).toLowerCase()] ?? 80) : n))); };
  const TICK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  // tiny markdown: ## headings, - lists, **bold**
  function md(src) {
    const out = []; let list = false;
    const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    src.split('\n').forEach(line => {
      const l = line.trim();
      if (/^- /.test(l)) { if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${inline(l.slice(2))}</li>`); return; }
      if (list) { out.push('</ul>'); list = false; }
      if (/^#{1,3} /.test(l)) out.push(`<h2>${inline(l.replace(/^#+ /, ''))}</h2>`);
      else if (l) out.push(`<p>${inline(l)}</p>`);
    });
    if (list) out.push('</ul>');
    return out.join('');
  }
  function gradeBox(b) {
    const grades = b.grades ? Object.entries(gradeNames).filter(([k]) => b.grades[k]).map(([k, n]) =>
      { const p = gradePct(b.grades[k]); return `<li><span>${n}</span><i style="--v:${p / 100}"></i><b>${p}%</b></li>`; }).join('') : '';
    return grades ? `<div class="grade-box" id="grades"><div class="gb-head mono"><span>MKP grade</span><span>Overall: ${b.condition ? gradePct(b.condition) + '%' : 'Inspected'}</span></div><ul>${grades}</ul><div class="grade-scale mono" aria-hidden="true"><span></span><span class="gs"><span>Low</span><span>High</span></span><b>100%</b></div></div>` : '';
  }
  function productHTML(b, modal) {
    const kindLabel = b.kind === 'pre' ? 'Pre-owned' : 'New';
    const sizes = sizeLabel(b) || b.size;
    const specs = Object.entries(b.specs || {});
    const url = `product.html?bike=${encodeURIComponent(b.slug)}`;
    return `
<section class="pdp${modal ? ' in-modal' : ''}">
  <div class="wrap">
    <nav class="crumbs mono" aria-label="Breadcrumb">${modal
      ? `<span>${kindLabel}</span><span aria-hidden="true">/</span><span>${esc(b.name)}</span><a class="crumb-full" href="${url}" data-full>Open full page ↗</a>`
      : `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="bikes.html?type=${b.kind}">${kindLabel}</a><span aria-hidden="true">/</span><span>${esc(b.name)}</span>`}</nav>
    <div class="pdp-in">
      <div class="gallery">
        <div class="gallery-main">
          <img class="g-img" src="${esc(b.images[0])}" alt="${esc(b.name)}">
          ${b.images.length > 1 ? `<button class="g-nav g-prev" type="button" aria-label="Previous photo">‹</button><button class="g-nav g-next" type="button" aria-label="Next photo">›</button>` : ''}
          <span class="g-count mono">1 / ${b.images.length}</span>
        </div>
        <div class="thumbs">${b.images.map((src, i) => `<button type="button" class="${i ? '' : 'on'}" data-i="${i}" aria-label="Photo ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div>
      </div>
      <aside class="buy">
        ${tag(b)}
        <h1>${esc(b.name)}</h1>
        <p class="size mono">Size ${esc(sizes)} · ${esc(b.category)}</p>
        <div class="price"><b>${money(b.price)}</b>${b.priceBefore ? `<s>${money(b.priceBefore)}</s>` : ''}${b.deal ? `<span class="tag orange">On deal${b.deal.percent ? `, save ${esc(b.deal.percent)}%` : ''}</span>` : ''}</div>
        <p class="afterpay">Inspected, serviced and ready to ride.</p>
        <div data-grades="${esc(b.slug)}">${gradeBox(b)}</div>
        <div class="buy-btns">
          <a class="btn dark" href="#" data-wa="Hey MKP, I'd like to place a $100 deposit to reserve this bike: ${liveUrl(b)}">Place a $100 holding deposit</a>
          <a class="btn ghost" href="#" data-wa="Hey MKP, I'd like to book a test ride for this bike: ${liveUrl(b)}">Book a test ride</a>
          <button class="btn ghost fav-big" type="button" data-fav="${esc(b.slug)}" aria-pressed="false">${HEART}<span class="fav-label">Save to favourites</span></button>
        </div>
        <ul class="perks">
          <li>${TICK}Inspected and serviced</li>
          <li>${TICK}Test ride in store</li>
          <li>${TICK}Australia-wide delivery</li>
          <li>${TICK}Talk to a human</li>
        </ul>
      </aside>
    </div>
    <div class="pdp-body">
      <div>
        <div class="prose">${b.body ? md(b.body) : `<h2>About the ${esc(b.name)}</h2><p>${esc(b.name)}, size ${esc(sizeLabel(b) || b.size)}. Fully inspected and ready to ride. Message us for more photos or a walkaround video.</p>`}</div>
        ${b.features.length ? `<div class="features">${b.features.map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
      </div>
      ${specs.length ? `<div class="spec-table"><h3>Specifications</h3><dl>${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>` : ''}
    </div>
  </div>
</section>`;
  }
  // gallery behaviour (arrows, thumbs, swipe); returns a go(i) so keys can drive it
  function bindGallery(root, b) {
    const img = root.querySelector('.g-img'), thumbs = [...root.querySelectorAll('.thumbs button')], count = root.querySelector('.g-count');
    let cur = 0;
    function go(i) {
      cur = (i + b.images.length) % b.images.length;
      img.style.opacity = 0;
      setTimeout(() => { img.src = b.images[cur]; img.style.opacity = 1; }, 160);
      thumbs.forEach((t, j) => t.classList.toggle('on', j === cur));
      count.textContent = `${cur + 1} / ${b.images.length}`;
    }
    thumbs.forEach(t => t.addEventListener('click', () => go(+t.dataset.i)));
    root.querySelector('.g-prev')?.addEventListener('click', () => go(cur - 1));
    root.querySelector('.g-next')?.addEventListener('click', () => go(cur + 1));
    let x0 = null;
    img.parentElement.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    img.parentElement.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); x0 = null; });
    return { next: () => go(cur + 1), prev: () => go(cur - 1) };
  }
  function renderProduct(root, b, modal) {
    root.innerHTML = productHTML(b, modal);
    wireWa(root);
    // grades live on the single-bike endpoint: fetch them and fill the grade box in place
    if (window.MKP_API) MKP_API.bike(b.slug).then(full => {
      const slot = full && root.querySelector(`[data-grades="${CSS.escape(b.slug)}"]`);
      if (slot) slot.innerHTML = gradeBox(full);
    });
    return bindGallery(root, b);
  }

  // ---------- bike quick view: the product page itself, in a floating panel ----------
  const qv = document.createElement('div');
  qv.className = 'qv';
  qv.hidden = true;
  qv.innerHTML = '<div class="qv-card" role="dialog" aria-modal="true" aria-label="Bike details"><button class="qv-x" type="button" aria-label="Close">✕</button><div class="qv-scroll"></div></div>';
  document.body.appendChild(qv);
  let qvGal = null, qvFromHash = false;
  function openQv(b, push = true) {
    const sc = qv.querySelector('.qv-scroll');
    qvGal = renderProduct(sc, b, true);
    sc.scrollTop = 0;
    qv.hidden = false;
    requestAnimationFrame(() => qv.classList.add('open'));
    document.documentElement.classList.add('pop-lock');
    if (push) { history.pushState({ qv: b.slug }, '', `#bike=${b.slug}`); qvFromHash = true; }
    setTimeout(() => qv.querySelector('.qv-x').focus({ preventScroll: true }), 350);
  }
  function closeQv(fromPop = false) {
    if (qv.hidden) return;
    qv.classList.remove('open');
    document.documentElement.classList.remove('pop-lock');
    setTimeout(() => { qv.hidden = true; }, 380);
    if (!fromPop && qvFromHash && location.hash.startsWith('#bike=')) history.back();
    qvFromHash = false; qvGal = null;
  }
  // any link to a product page opens the quick view (new-tab clicks and "Open full page" still navigate)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="product.html?bike="]');
    if (!a || a.hasAttribute('data-full') || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const b = bySlug(new URL(a.href, location.href).searchParams.get('bike'));
    if (!b) return;
    e.preventDefault();
    if (drawer.classList.contains('open')) closeFavs();
    const wasOpen = qv.classList.contains('open');
    openQv(b, !wasOpen);
    if (wasOpen) history.replaceState({ qv: b.slug }, '', `#bike=${b.slug}`);
  });
  qv.addEventListener('click', e => { if (e.target === qv || e.target.closest('.qv-x')) closeQv(); });
  addEventListener('keydown', e => {
    if (!qv.classList.contains('open') || !qvGal) return;
    if (e.key === 'Escape') closeQv();
    if (e.key === 'ArrowLeft') qvGal.prev();
    if (e.key === 'ArrowRight') qvGal.next();
  });
  addEventListener('popstate', () => {
    const m = location.hash.match(/^#bike=(.+)$/);
    if (m && bySlug(m[1])) openQv(bySlug(m[1]), false); else closeQv(true);
  });
  // a shared link like bikes.html#bike=<slug> opens straight into the quick view (after the page has set up)
  setTimeout(() => { const m = location.hash.match(/^#bike=(.+)$/); if (m && bySlug(m[1])) openQv(bySlug(m[1]), false); }, 50);

  // ---------- heart effect: ring pulse + particle burst + a small heart flying to the menu heart ----------
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function heartBurst(b) {
    if (reduceMotion) return;
    const burst = document.createElement('span');
    burst.className = 'heart-burst';
    burst.innerHTML = '<i class="ring"></i>' + Array.from({ length: 10 }, (_, k) => {
      const a = (k / 10) * Math.PI * 2, d = k % 2 ? 26 : 34;
      return `<i class="dot" style="--x:${(Math.cos(a) * d).toFixed(1)}px;--y:${(Math.sin(a) * d).toFixed(1)}px;--c:${k % 3 ? '#ff3b5c' : '#ff9a3c'}"></i>`;
    }).join('');
    const svg = b.querySelector('svg');
    b.appendChild(burst);
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    // centre the burst on the heart icon itself (on wide buttons the icon is left of centre)
    if (svg) {
      const br = b.getBoundingClientRect(), sr = svg.getBoundingClientRect();
      burst.style.left = (sr.left - br.left + sr.width / 2) + 'px';
      burst.style.top = (sr.top - br.top + sr.height / 2) + 'px';
    }
    setTimeout(() => burst.remove(), 800);
    // fly a heart to the nav heart, then bump its badge
    const target = document.querySelector('.nav [data-open-favs]');
    if (!target || !svg) return;
    const from = svg.getBoundingClientRect(), to = target.getBoundingClientRect();
    const fly = document.createElement('span');
    fly.className = 'heart-fly';
    fly.innerHTML = HEART;
    fly.style.left = from.left + from.width / 2 + 'px';
    fly.style.top = from.top + from.height / 2 + 'px';
    document.body.appendChild(fly);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2), dy = to.top + to.height / 2 - (from.top + from.height / 2);
    fly.animate([
      { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
      { transform: `translate(calc(-50% + ${dx * 0.35}px), calc(-50% + ${dy * 0.35 - 40}px)) scale(1.25)`, opacity: 1, offset: .35 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.45)`, opacity: .9 },
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => {
      fly.remove();
      target.classList.remove('bump'); void target.offsetWidth; target.classList.add('bump');
    };
  }

  // put a heart on every bike photo that links to a product page
  function addFavs(root = document) {
    root.querySelectorAll('.model').forEach(m => {
      const a = m.querySelector('a[href*="bike="]'), sz = m.querySelector('.size');
      const bk = a && findBike(new URL(a.href, location.href).searchParams.get('bike'));
      if (bk && sz) sz.textContent = shortSize(bk);
    });
    root.querySelectorAll('a.m-img[href*="bike="]').forEach(a => {
      if (a.parentElement.classList.contains('m-media')) return;
      const slug = new URL(a.href, location.href).searchParams.get('bike');
      const wrap = document.createElement('div');
      wrap.className = 'm-media';
      a.replaceWith(wrap); wrap.appendChild(a);
      wrap.insertAdjacentHTML('beforeend', `<button class="fav-btn" type="button" data-fav="${slug}" aria-label="Save to favourites">${HEART}</button>`);
    });
    favSync();
  }

  // ---------- WhatsApp: any [data-wa="message"] becomes a prefilled chat link; [data-maps] opens his Google listing ----------
  function wireWa(root = document) {
    root.querySelectorAll('[data-wa]').forEach(a => {
      a.href = wa(a.dataset.wa || '');
      a.target = '_blank';
      a.rel = 'noopener';
    });
    root.querySelectorAll('[data-maps]').forEach(a => { a.href = MAPS; a.target = '_blank'; a.rel = 'noopener'; });
    addFavs(root);
  }
  wireWa();

  // ---------- reveal on enter ----------
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  function reveal(root = document) {
    root.querySelectorAll('.reveal:not(.in)').forEach(el => {
      const sibs = [...el.parentElement.querySelectorAll(':scope > .reveal')];
      el.style.transitionDelay = (Math.min(sibs.indexOf(el), 6) * 0.07) + 's';
      io.observe(el);
    });
  }
  reveal();

  // ---------- nav goes dark over dark sections ([data-dark] and the footer) ----------
  function navTick() {
    if (!nav) return;
    const y = 40;
    const dark = [...document.querySelectorAll('[data-dark], .foot')].some(s => {
      const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y;
    });
    nav.classList.toggle('on-dark', dark);
  }
  // one nav check per frame at most (several scroll events can fire per frame on iOS)
  let navQueued = false;
  addEventListener('scroll', () => { if (navQueued) return; navQueued = true; requestAnimationFrame(() => { navQueued = false; navTick(); }); }, { passive: true });
  navTick();

  // ---------- shared bike helpers ----------
  const bikes = window.MKP_BIKES || [];
  const bySlug = slug => bikes.find(b => b.slug === slug);
  const tag = b => b.kind === 'pre'
    ? '<span class="tag orange">Pre-owned</span>'
    : `<span class="tag blue">${b.productType === 'Frames' ? 'Frameset' : b.productType === 'Wheels' ? 'Wheelset' : 'Brand new'}</span>`;
  function card(b) {
    const url = `product.html?bike=${encodeURIComponent(b.slug)}`;
    const groupset = (b.specs && (b.specs.Groupset || b.specs.groupset) || '').split(',')[0];
    // second spec: condition for pre-owned; for new, what it is (Full bike / Frameset / Wheelset), never a repeat of Category
    const mid = b.kind === 'pre' ? ['Condition', b.condition ? gradePct(b.condition) + '%' : 'Inspected'] : ['Type', { 'Full Bikes': 'Full bike', Frames: 'Frameset', Wheels: 'Wheelset' }[b.productType] || b.productType];
    return `
<article class="model reveal" data-t="${b.kind}" data-cat="${esc(b.category)}">
  <div class="m-top">${tag(b)}<span class="mono size">${esc(shortSize(b))}</span></div>
  <a class="m-img portrait" href="${url}"><img src="${esc(b.images[0])}" alt="${esc(b.name)}" loading="lazy"></a>
  <h3><a href="${url}">${esc(b.name)}</a></h3>
  <p class="m-line">${esc(groupset || b.category)}</p>
  <dl class="specs"><div><dt>${mid[0]}</dt><dd>${esc(mid[1])}</dd></div><div><dt>Category</dt><dd>${esc(b.category)}</dd></div><div><dt>Price</dt><dd>${money(b.price)}</dd></div></dl>
  <div class="m-btns"><a class="btn dark sm" href="${url}">View bike</a><a class="btn ghost sm" data-wa="Hey MKP, I'd like to book a test ride for this bike: ${liveUrl(b)}" href="#">Test ride</a></div>
</article>`;
  }

  // ---------- triathlete guide popup (from the live site, restyled) ----------
  // Shows once per visitor: after 15s or when they're halfway down the page.
  // The live site's email list should be connected where marked below.
  // Two popups, on the same pages as the live site:
  //   homepage: triathlete race-bike guide (type "triathlon")
  //   bike fitting page: 5-point bike fit checklist after 30s (type "bikefit")
  const POPS = {
    home: { key: 'mkp-guide-popup', type: 'triathlon', delay: 15000, scroll: true, img: 'img/studio/popup-tt.jpg', imgTag: 'Free PDF guide', tag: 'Beginner triathletes',
      title: 'Choosing your first race bike?', text: 'Get our free guide to picking the right triathlon bike: sizing, aero vs road, and what to pay for a good second-hand TT bike.',
      btn: 'Send me the guide', ok: "<b>You're on the list.</b> The guide is on its way to your inbox." },
    fitting: { key: 'mkp-fit-popup', type: 'bikefit', delay: 30000, scroll: false, img: 'img/bike-fitting-landscape.jpg', imgTag: 'Free checklist', tag: 'Bike fitting',
      title: 'Is a Bike Fit Worth It for You?', text: 'Not everyone needs one. Get our free 5-point checklist and find out in 30 seconds.',
      btn: 'Send me the checklist', ok: "<b>Check your inbox.</b> We've sent your Bike Fit Checklist. Can't find it? Check your spam or promotions folder." },
  };
  const P = POPS[page];
  const POP_KEY = P && P.key;
  let seen = false;
  try { seen = !!localStorage.getItem(POP_KEY); } catch (e) {}
  if (P && !seen && !document.body.dataset.noPopup) {
    const pop = document.createElement('div');
    pop.className = 'pop';
    pop.hidden = true;
    pop.innerHTML = `
<div class="pop-card" role="dialog" aria-modal="true" aria-labelledby="popTitle">
  <button class="pop-x" type="button" aria-label="Close">✕</button>
  <div class="pop-img"><img src="${P.img}" alt=""><span class="mono">${P.imgTag}</span></div>
  <form class="pop-body" novalidate>
    <span class="tag pop-tag">${P.tag}</span>
    <h3 id="popTitle">${P.title}</h3>
    <p>${P.text}</p>
    <label class="pop-field"><span class="sr">Email address</span><input type="email" name="email" placeholder="you@email.com" autocomplete="email" required></label>
    <button class="btn pop-btn" type="submit">${P.btn}</button>
    <p class="pop-note mono">No spam. Unsubscribe anytime.</p>
    <p class="pop-ok" hidden>${P.ok}</p>
  </form>
</div>`;
    document.body.appendChild(pop);
    const close = () => {
      pop.classList.remove('open');
      setTimeout(() => { pop.hidden = true; }, 400);
      document.documentElement.classList.remove('pop-lock');
      try { localStorage.setItem(POP_KEY, '1'); } catch (e) {}
    };
    let shown = false;
    const show = () => {
      if (shown || document.documentElement.classList.contains('menu-open')) return;
      shown = true;
      pop.hidden = false;
      requestAnimationFrame(() => pop.classList.add('open'));
      document.documentElement.classList.add('pop-lock');
      setTimeout(() => pop.querySelector('input').focus({ preventScroll: true }), 450);
    };
    setTimeout(show, P.delay);
    // halfway trigger: page height measured once (not on every scroll event), listener removed once shown
    if (P.scroll) {
      let half = (document.documentElement.scrollHeight - innerHeight) / 2;
      addEventListener('resize', () => { half = (document.documentElement.scrollHeight - innerHeight) / 2; }, { passive: true });
      const onS = () => { if (scrollY > half) { removeEventListener('scroll', onS); show(); } };
      addEventListener('scroll', onS, { passive: true });
    }
    pop.addEventListener('click', e => { if (e.target === pop || e.target.closest('.pop-x')) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && pop.classList.contains('open')) close(); });
    pop.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const input = pop.querySelector('input');
      if (!input.checkValidity()) { input.closest('.pop-field').classList.add('bad'); input.focus(); return; }
      subscribe(input.value.trim(), P.type);
      pop.querySelector('.pop-body').classList.add('done');
      pop.querySelector('.pop-ok').hidden = false;
      try { localStorage.setItem(POP_KEY, '1'); } catch (e) {}
      setTimeout(close, 2600);
    });
    pop.querySelector('input').addEventListener('input', e => e.target.closest('.pop-field').classList.remove('bad'));
  }

  // Email capture, same flows as the live site:
  //   triathlete popup -> POST /api/klaviyo/subscribe {email, type:"triathlon"}
  //   fitting checklist -> POST /api/klaviyo/subscribe {email, type:"bikefit"}
  //   footer newsletter -> POST /api/newsletter/subscribe {email}
  // The backend handles the Klaviyo lists and emails. The email is kept in localStorage "klaviyo_email"
  // (live key) so later events like "Clicked Book Fitting" are tied to the person.
  // Off the live domain (local preview) the backend isn't there, so the profile goes straight to Klaviyo instead.
  const API = window.MKP_API;
  function subscribe(email, type) {
    try { localStorage.setItem('klaviyo_email', email); } catch (e) {}
    if (API && API.onLive) return API.post('/api/klaviyo/subscribe', { email, type });
    return sendToKlaviyo(email, type).then(() => ({ ok: true }));
  }
  function track(event) {
    let email = null; try { email = localStorage.getItem('klaviyo_email'); } catch (e) {}
    if (API && API.onLive) return API.post('/api/klaviyo-track', { event, page_url: location.href, email }).catch(() => {});
    return Promise.resolve();
  }
  function sendToKlaviyo(email, type) {
    const headers = { 'Content-Type': 'application/json', revision: '2024-10-15' };
    const base = 'https://a.klaviyo.com/client';
    const source = type === 'bikefit' ? 'Bike fit checklist popup' : type === 'newsletter' ? 'Footer newsletter' : 'Triathlete guide popup';
    const profile = { data: { type: 'profile', attributes: { email, properties: { source } } } };
    const body = KLAVIYO.listId
      ? { data: { type: 'subscription', attributes: { profile, custom_source: source }, relationships: { list: { data: { type: 'list', id: KLAVIYO.listId } } } } }
      : { data: { type: 'event', attributes: { properties: { source }, metric: { data: { type: 'metric', attributes: { name: source } } }, profile } } };
    return fetch(`${base}/${KLAVIYO.listId ? 'subscriptions' : 'events'}/?company_id=${KLAVIYO.company}`, { method: 'POST', headers, body: JSON.stringify(body) }).catch(() => {});
  }
  // any [data-track="Event name"] link sends that event (e.g. "Clicked Book Fitting" on the fitting page)
  document.addEventListener('click', e => { const t = e.target.closest('[data-track]'); if (t) track(t.dataset.track); });

  // footer newsletter ("Stay Updated" on the live footer)
  document.addEventListener('submit', async e => {
    const f = e.target.closest('.foot-news');
    if (!f) return;
    e.preventDefault();
    const input = f.querySelector('input'), msg = f.querySelector('.fn-msg'), btn = f.querySelector('button');
    if (!input.checkValidity()) { msg.textContent = 'Please enter a valid email.'; input.focus(); return; }
    btn.disabled = true; msg.textContent = '';
    try {
      let r;
      if (API && API.onLive) r = await API.post('/api/newsletter/subscribe', { email: input.value.trim() });
      else { try { localStorage.setItem('klaviyo_email', input.value.trim()); } catch (er) {} await sendToKlaviyo(input.value.trim(), 'newsletter'); }
      msg.textContent = (r && r.message) || "You're subscribed. Thanks!"; input.value = '';
    } catch (er) { msg.textContent = er.message && isNaN(er.message) ? er.message : 'Something went wrong. Please try again.'; }
    btn.disabled = false;
  });

  // ---------- third-party scripts from the live site (layout.tsx), production domain only ----------
  // Same IDs as the current site so analytics, ads, Klaviyo forms and the respond.io inbox keep working after the swap.
  // Not loaded on localhost so testing never pollutes his data.
  if (window.MKP_API && MKP_API.onLive) {
    const add = (src, attrs = {}) => { const el = document.createElement('script'); el.async = true; el.src = src; Object.assign(el, attrs); document.head.appendChild(el); return el; };
    ['GTM-TXV97Z5R', 'GTM-PGFC2PF6'].forEach(id => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      add('https://www.googletagmanager.com/gtm.js?id=' + id);
    });
    add('https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=' + KLAVIYO.company);
    add('https://cdn.respond.io/webchat/widget/widget.js?cId=99a288a24b32520fb838a04a2677885', { id: 'respondio__widget' });
    add('https://data.auscycles.com/js/vhhjjtmy0f1745552696185.js', { onload: () => { if (window.gass) window.gass.run({ subdomain: 'data.auscycles.com', pkey: '89EEBA6C309607BA1ADD5E55371BAC99', interval: 2, connector: ['2CE5B915F633F2E930AD78558E0EBF2E'], cta_hidden: 1 }, () => {}); } });
  }

  // Tony, the bike finder chat (js/chat.js), on every page like the live site
  if (!document.body.dataset.noChat) setTimeout(() => { const c = document.createElement('script'); c.src = 'js/chat.js'; document.body.appendChild(c); }, 0);

  window.MKPsite = { gradePct, subscribe, track, sizeLabel, wa, money, esc, cap, bikes, bySlug, card, tag, reveal, wireWa, liveUrl, LIVE, MAPS, PHONE_LABEL, favList, favSync, HEART, renderProduct };
})();
