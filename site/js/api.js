// Live data from the existing MKP backend (the Next.js app + admin panel at mkpbikes.com.au/admin).
// Nothing here changes the backend: it reads the same public endpoints the current site uses.
//
// How it works
// - /js/bikes-data.js is a snapshot so pages paint instantly (and work offline in the preview).
// - On load we fetch /api/bikes/paginated (same origin, so it works once this frontend is deployed on
//   mkpbikes.com.au; locally tools/dev-server.py forwards /api to the live site).
// - The live list replaces the snapshot IN PLACE (same array), then 'mkp:bikes' fires and pages re-render.
//   So bikes added, edited, discounted or sold in the admin show up here with no code change.
// - Grades (componentConditions) are only on the single-bike endpoint, so product views call MKP_API.bike(slug).
(() => {
  const SNAP = window.MKP_BIKES = window.MKP_BIKES || [];
  const snapBySlug = Object.fromEntries(SNAP.map(b => [b.slug, b]));
  const num = v => { if (v == null || v === '') return null; if (typeof v === 'number') return v; const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; };

  // A deal set in the admin (isOnDeal + dealPrice, optional start/end dates) shows as the price with the old price struck out
  function dealOn(x) {
    if (!x.isOnDeal || num(x.dealPrice) == null) return false;
    const now = Date.now();
    if (x.dealStartDate && new Date(x.dealStartDate).getTime() > now) return false;
    if (x.dealEndDate && new Date(x.dealEndDate).getTime() < now) return false;
    return true;
  }

  // live API record -> the shape the new design renders (same shape as bikes-data.js)
  function fromLive(x) {
    const typeSlug = x.type && (x.type.slug || x.type) || (x.isNew ? 'new-bikes' : 'pre-owned');
    const old = snapBySlug[x.slug] || {};
    const deal = dealOn(x);
    return {
      id: x.id,
      slug: x.slug,
      name: x.name,
      kind: typeSlug === 'pre-owned' ? 'pre' : 'new',
      category: x.category,
      productType: x.productType,
      year: x.year,
      price: deal ? num(x.dealPrice) : num(x.price),
      priceBefore: deal ? (num(x.originalPrice) || num(x.price)) : num(x.priceBefore),
      deal: deal ? { percent: x.dealPercentage, ends: x.dealEndDate } : null,
      size: x.description,
      condition: x.condition,
      grades: x.componentConditions || old.grades || null,
      specs: x.specs || {},
      features: x.features || [],
      sizing: x.sizing || [],
      colors: x.colors || [],
      images: (x.images || []).map(i => typeof i === 'string' ? i : (i.src || i.landscapeThumbnail || i.portraitThumbnail)).filter(Boolean),
      body: x.longDescription || '',
      related: x.relatedProducts || [],
      inStock: x.inStock !== false,
      created: x.createdAt || old.created,
      brand: x.brand,
      _live: true,
    };
  }

  const getJSON = url => fetch(url, { headers: { Accept: 'application/json' } }).then(r => r.ok ? r.json() : Promise.reject(r.status));
  const visible = x => x.inStock !== false && !(x.type && x.type.slug === 'archived');

  const ready = getJSON('/api/bikes/paginated?limit=500')
    .then(d => {
      const list = (d.bikes || d).filter(visible).map(fromLive);
      if (!list.length) return false;
      SNAP.splice(0, SNAP.length, ...list);
      SNAP.forEach(b => { snapBySlug[b.slug] = b; });
      window.MKP_LIVE = true;
      document.dispatchEvent(new CustomEvent('mkp:bikes', { detail: { live: true } }));
      return true;
    })
    .catch(() => false); // no backend (plain static preview): keep the snapshot

  // full record for one bike (adds grades); merged into the shared list
  const cache = {};
  function bike(slug) {
    if (!cache[slug]) cache[slug] = getJSON('/api/bikes/' + encodeURIComponent(slug)).then(x => {
      const b = fromLive(x);
      const i = SNAP.findIndex(y => y.slug === slug);
      if (i > -1) Object.assign(SNAP[i], b); else if (b.inStock) SNAP.push(b);
      return i > -1 ? SNAP[i] : b;
    }).catch(() => { delete cache[slug]; return null; });
    return cache[slug];
  }

  // same-origin POST used by every form (works once deployed on mkpbikes.com.au)
  const onLive = /(^|\.)mkpbikes\.com\.au$/.test(location.hostname);
  const post = (path, data) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(async r => { let j = null; try { j = await r.json(); } catch (e) {} if (!r.ok) throw Object.assign(new Error((j && j.error) || r.status), { status: r.status }); return j; });

  window.MKP_API = { ready, bike, post, onLive, fromLive };
})();
