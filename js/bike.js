/* Product page: gallery, buy box, description, specs, related bikes. */
(function () {
  const { BIKES, bySlug, card, esc, money, md, icon, wa, bag, lightbox, $, $$ } = window.MKP;
  const slug = new URLSearchParams(location.search).get('slug');
  const b = bySlug(slug) || BIKES[0];
  const main = $('[data-pdp]');

  document.title = `${b.name} (${b.size}) | ${money(b.price)} | MKP Bikes`;
  if (!b.tagline) b.tagline = Object.entries(b.specs || {}).slice(0, 3).map(([k, v]) => `${k} ${v}`).join(' · ');
  const isNew = b.type === 'new';
  const listUrl = isNew ? 'shop.html?type=new' : 'shop.html?type=pre-owned';

  $('[data-crumbs]', main).innerHTML = `<a href="index.html">Home</a><span>/</span><a href="${listUrl}">${isNew ? 'New bikes' : 'Pre-owned'}</a><span>/</span><a href="shop.html?category=${encodeURIComponent(b.category)}">${esc(b.category)}</a><span>/</span><span aria-current="page">${esc(b.name)}</span>`;

  /* gallery */
  const imgs = b.images.length ? b.images : ['assets/site/mkp-showroom.jpg'];
  $('[data-gallery]', main).innerHTML = imgs.map((src, i) => `<figure data-i="${i}"><img src="${esc(src)}" alt="${esc(b.name)}, photo ${i + 1}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></figure>`).join('');
  $('[data-gallery]', main).addEventListener('click', (e) => { const f = e.target.closest('figure'); if (f) lightbox(imgs, Number(f.dataset.i)); });

  /* buy box */
  const parts = b.parts && typeof b.parts === 'object' ? b.parts : null;
  const PART_LABELS = { frameSet: 'Frameset', groupSet: 'Groupset', wheelSet: 'Wheelset', cockpit: 'Cockpit' };
  const condition = parts ? `<div><span class="eyebrow">Condition, checked by our workshop</span><div class="cond" style="margin-top:10px">${Object.entries(PART_LABELS).map(([k, label]) => `<div>${label}<b>${esc(parts[k] || '—')}</b></div>`).join('')}</div></div>` : '';
  const price = b.deal ? `${money(b.deal)} <s>${money(b.price)}</s>` : b.was ? `${money(b.price)} <s>${money(b.was)}</s>` : money(b.price);
  const sizes = (b.sizes.length ? b.sizes : [b.size]).map((s) => `<span class="size">${esc(s)}</span>`).join('');
  const inBag = bag.has(b.slug);

  $('[data-buybox]', main).innerHTML = `
    <div class="row" style="gap:8px"><span class="badge ${isNew ? 'badge--dark' : ''}">${isNew ? 'Brand new' : 'Pre-owned'}</span><span class="badge"><span class="dot"></span>In stock in Cheltenham</span></div>
    <div><h1>${esc(b.name)}</h1><p class="lede" style="margin-top:12px">${esc(b.tagline)}</p></div>
    <div class="buybox__price">${price}<small>AUD</small></div>
    <div><span class="eyebrow">Frame size</span><div class="sizes" style="margin-top:10px">${sizes}</div><p class="muted" style="font-size:13px;margin-top:10px">${esc(b.size)}. <a class="link-arrow" href="#" data-open-size>Check your size</a></p></div>
    ${condition}
    <div style="display:grid;gap:10px">
      <button class="btn btn--dark btn--block" type="button" data-reserve>${inBag ? 'In your bag, view bag' : 'Add to bag'}</button>
      <a class="btn btn--line btn--block" href="${wa(`Hi MKP, I'd like to book a test ride on the ${b.name} (${b.size}).`)}" target="_blank" rel="noopener">${icon.wa} Book a test ride</a>
    </div>
    <ul class="assure">
      <li>${icon.wrench}<span><b>Inspected &amp; serviced</b> before it was listed</span></li>
      <li>${icon.pin}<span><b>Test ride in-store</b> at 5/17 Kylie Place, Cheltenham</span></li>
      <li>${icon.truck}<span><b>Australia-wide delivery</b>, free packing, insured FedEx</span></li>
      <li>${icon.chat}<span><b>Talk to a human</b>, <a class="link-arrow" href="${wa(`Hi MKP, I have a question about the ${b.name} (${b.size}).`)}" target="_blank" rel="noopener">message us</a></span></li>
      ${b.brand === 'Tavelo' ? `<li>${icon.award}<span><b>Lifetime frame warranty</b> and 40% crash replacement</span></li>` : ''}
    </ul>
    <div class="upsell"><span><b>Get fitted for $150</b><br><span class="muted">Save $30 on a pro fit with this bike.</span></span><a class="btn btn--sm btn--dark" href="fitting.html">Learn more</a></div>`;

  $('[data-reserve]', main).addEventListener('click', (e) => {
    if (!bag.has(b.slug)) bag.add(b.slug);
    else document.querySelector('[data-open-bag]').click();
    e.currentTarget.textContent = 'In your bag, view bag';
  });

  /* details */
  $('[data-about-title]', main).textContent = b.name;
  // the shop address block is repeated on every listing; the buy box already covers it
  const desc = b.desc.replace(/##\s*Test Ride[\s\S]*$/i, '').trim();
  $('[data-desc]', main).innerHTML = desc ? md(desc) : `<p>${esc(b.tagline)}</p>`;
  const specs = Object.entries(b.specs || {});
  $('[data-specs]', main).innerHTML = specs.length
    ? specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')
    : `<div><dt>Category</dt><dd>${esc(b.category)}</dd></div><div><dt>Size</dt><dd>${esc(b.size)}</dd></div>`;
  $('[data-features]', main).innerHTML = b.features.map((f) => `<span class="chip">+ ${esc(f)}</span>`).join('');

  /* related */
  const related = b.related.map(bySlug).filter(Boolean);
  const fill = BIKES.filter((x) => x.slug !== b.slug && x.category === b.category && !related.includes(x));
  $('[data-related]', main).innerHTML = related.concat(fill).slice(0, 4).map((x) => card(x, { reveal: true })).join('');

  window.MKP.refresh(main);
})();
