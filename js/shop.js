/* Shop listing: type tabs, filters, sort, favourites view, URL state. */
(function () {
  const { BIKES, card, esc, favs, $, $$ } = window.MKP;
  const params = new URLSearchParams(location.search);
  const state = {
    type: params.get('type') || 'all',
    category: params.get('category') || '',
    size: params.get('size') || '',
    brand: params.get('brand') || '',
    price: params.get('price') || '',
    sort: params.get('sort') || 'new',
    fav: params.get('fav') === '1',
  };

  const grid = $('[data-grid]');
  const empty = $('[data-empty]');
  const count = $('[data-count]');
  const brandSel = $('#f-brand');
  const brands = [...new Set(BIKES.map((b) => b.brand))].sort((a, b) => a.localeCompare(b));
  brandSel.insertAdjacentHTML('beforeend', brands.map((b) => `<option>${esc(b)}</option>`).join(''));

  const sizeKey = (s) => String(s).replace(/[^A-Za-z]/g, '').toUpperCase();
  function matches(b) {
    if (state.fav && !favs.all().includes(b.slug)) return false;
    if (state.type !== 'all' && b.type !== state.type) return false;
    if (state.category && b.category !== state.category) return false;
    if (state.brand && b.brand !== state.brand) return false;
    if (state.size) {
      const want = state.size.toUpperCase();
      const has = b.sizes.map(sizeKey).concat(sizeKey(b.size.split(/[ (]/)[0]));
      // "ML" counts for both M and L
      if (!has.some((s) => s === want || (s === 'ML' && (want === 'M' || want === 'L')))) return false;
    }
    if (state.price) {
      const [lo, hi] = state.price.split('-').map(Number);
      const p = b.deal || b.price || 0;
      if (p < lo || p >= hi) return false;
    }
    return true;
  }
  const SORTS = {
    new: (a, b) => (b.added || '').localeCompare(a.added || ''),
    low: (a, b) => (a.deal || a.price) - (b.deal || b.price),
    high: (a, b) => (b.deal || b.price) - (a.deal || a.price),
    name: (a, b) => a.name.localeCompare(b.name),
  };

  const COPY = {
    all: ['Shop bikes', 'Every bike, inspected.'],
    'pre-owned': ['Pre-owned bikes', 'Pre-owned, not second-rate.'],
    new: ['New bikes', 'Brand new, built by us.'],
  };

  function render() {
    const list = BIKES.filter(matches).sort(SORTS[state.sort] || SORTS.new);
    grid.innerHTML = list.map((b) => card(b)).join('');
    empty.hidden = list.length > 0;
    count.textContent = `${list.length} bike${list.length === 1 ? '' : 's'}`;
    const [eyebrow, title] = state.fav ? ['Favourites', 'Your shortlist.'] : COPY[state.type] || COPY.all;
    $('[data-shop-eyebrow]').textContent = state.category ? `${eyebrow} · ${state.category === 'TT' ? 'Triathlon / TT' : state.category}` : eyebrow;
    $('[data-shop-title]').textContent = title;
    $$('[data-type]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.type === state.type)));
    $$('[data-f]').forEach((sel) => (sel.value = state[sel.dataset.f]));
    const q = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (k === 'fav') { if (v) q.set('fav', '1'); return; }
      if (v && !(k === 'type' && v === 'all') && !(k === 'sort' && v === 'new')) q.set(k, v);
    });
    history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
    window.MKP.refresh(grid);
  }

  $$('[data-type]').forEach((t) => t.addEventListener('click', () => { state.type = t.dataset.type; render(); }));
  $$('[data-f]').forEach((sel) => sel.addEventListener('change', () => { state[sel.dataset.f] = sel.value; render(); }));
  $('[data-reset]').addEventListener('click', () => { Object.assign(state, { type: 'all', category: '', size: '', brand: '', price: '', fav: false }); render(); });
  const toolbar = $('[data-toolbar]');
  $('[data-filter-toggle]').addEventListener('click', (e) => {
    const open = toolbar.classList.toggle('is-expanded');
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });
  // unfavouriting inside the favourites view should drop the card
  document.addEventListener('click', (e) => { if (state.fav && e.target.closest('[data-fav]')) setTimeout(render, 0); });

  render();
})();
