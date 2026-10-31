// "Tony", the Bike Finder assistant from the live site, rebuilt in the new design.
// Same backend as the current site:
//   free text    -> POST /api/chat {histories, lastHistory}  (AI; returns content, suggestions, recommendations)
//   guided picks -> POST /api/recommendations {height, minBudget, maxBudget, bikeType}
// If the AI endpoint fails (it returned 500 on the live site in Oct 2026) the chat drops to the guided
// questions, like the live "Quick search mode". If the backend is unreachable entirely (local preview),
// recommendations are picked from the bikes already on the page.
(() => {
  const S = window.MKPsite, API = window.MKP_API;
  if (!S || document.querySelector('.tony')) return;
  const esc = S.esc;

  const el = document.createElement('div');
  el.className = 'tony' + (API && API.onLive ? ' above-widget' : '');
  el.innerHTML = `
<button class="tony-fab" type="button" aria-label="Open bike finder chat assistant" aria-expanded="false">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>
</button>
<section class="tony-panel" role="dialog" aria-label="Tony, Bike Finder Assistant" hidden>
  <header class="tony-head">
    <img class="tony-av" src="/img/tony-duck.webp" width="40" height="40" alt="Tony">
    <div><b>Tony | Bike Finder Assistant</b><span>Find the perfect bike for you</span></div>
    <button class="tony-reset" type="button">Reset</button>
    <button class="tony-x" type="button" aria-label="Close">✕</button>
  </header>
  <div class="tony-log" aria-live="polite"></div>
  <div class="tony-chips"></div>
  <form class="tony-form"><input type="text" placeholder="Or type your message..." aria-label="Message" autocomplete="off"><button type="submit" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button></form>
</section>`;
  document.body.appendChild(el);
  const fab = el.querySelector('.tony-fab'), panel = el.querySelector('.tony-panel'), log = el.querySelector('.tony-log'),
    chips = el.querySelector('.tony-chips'), form = el.querySelector('.tony-form'), input = form.querySelector('input');

  let history = [], memory = {}, aiOk = true, busy = false;
  const undash = t => String(t || '').replace(/\s+[-–—]+\s+/g, ', ').replace(/[–—]/g, ', ');

  function say(who, html, extra = '') {
    log.insertAdjacentHTML('beforeend', `<div class="tony-msg ${who}"><div class="tony-bubble">${html}</div>${extra}</div>`);
    log.scrollTop = log.scrollHeight;
  }
  const bot = (text, extra) => { say('bot', esc(undash(text)), extra); history.push({ role: 'assistant', content: text }); };
  const user = text => { say('me', esc(text)); history.push({ role: 'user', content: text }); };
  function setChips(list) { chips.innerHTML = list.map(c => `<button type="button" data-v="${esc(c.value || c.label)}">${esc(c.label)}</button>`).join(''); }
  function typing(on) {
    busy = on;
    log.querySelector('.tony-typing')?.remove();
    if (on) { log.insertAdjacentHTML('beforeend', '<div class="tony-msg bot tony-typing"><div class="tony-bubble"><i></i><i></i><i></i></div></div>'); log.scrollTop = log.scrollHeight; }
  }

  // bike cards: recommendations come back as slugs; show them with the photos we already have
  function bikeCards(recs) {
    // with the live list loaded, skip anything no longer listed (the API can still recommend sold/archived bikes)
    if (window.MKP_LIVE) recs = recs.filter(r => S.bySlug(r.slug));
    if (!recs.length) return '';
    const items = recs.map(r => S.bySlug(r.slug) || { slug: r.slug, name: r.slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '), price: parseFloat(String(r.price).replace(/[^0-9.]/g, '')), images: [], category: r.category, sizing: r.sizing || [] });
    return `<div class="tony-bikes">${items.slice(0, 4).map(b => `
<a class="tony-bike" href="/product.html?bike=${encodeURIComponent(b.slug)}">
  <span class="tb-img">${b.images && b.images[0] ? `<img src="${esc(b.images[0])}" alt="" loading="lazy">` : ''}</span>
  <span class="tb-copy"><b>${esc(b.name)}</b><span>${S.money(b.price)}${S.sizeLabel(b) ? ' · ' + esc(S.sizeLabel(b)) : ''}</span></span>
</a>`).join('')}</div>`;
  }

  const WELCOME = [{ label: 'Find my bike size' }, { label: 'Get a bike recommendation' }];
  const TYPES = [{ label: 'Road' }, { label: 'Gravel' }, { label: 'TT / Triathlon', value: 'TT' }];
  const HEIGHTS = [{ label: 'Under 165cm', value: '160cm' }, { label: '165 to 175cm', value: '170cm' }, { label: '175 to 185cm', value: '180cm' }, { label: 'Over 185cm', value: '190cm' }];
  // same brackets as the Request a Bike form (fixed by the backend's /api/request-bike validation), so leads are logged one way
  const BUDGETS = [{ label: 'Under $1,000', value: 'budget 1 1000' }, { label: '$1,000 to $2,000', value: 'budget 1000 2000' }, { label: '$2,000 to $3,500', value: 'budget 2000 3500' }, { label: '$3,500+', value: 'budget 3500 20000' }];
  const AFTER = [{ label: 'Start new search' }, { label: 'Browse all bikes' }];

  function start() {
    log.innerHTML = ''; history = []; memory = {};
    bot("Hey there! I'm Tony, your bike advisor. I can help you figure out the right bike size or find the perfect bike for you. Which one sounds good?");
    setChips(WELCOME);
  }

  // the live site's own parsing rules for typed answers
  function parse(t) {
    const m = {}, low = t.toLowerCase();
    let h = t.match(/(\d{3})\s*cm/i) || t.match(/^\s*(1[4-9]\d|2[01]\d)\s*$/); if (h) m.height = +h[1];
    const hm = t.match(/(\d\.\d{1,2})\s*m\b/i); if (hm) m.height = Math.round(parseFloat(hm[1]) * 100);
    const b = t.match(/^budget (\d+) (\d+)$/); if (b) { m.minBudget = +b[1]; m.maxBudget = +b[2]; }
    else {
      const under = t.match(/(?:under|below|less than|max|up to)\s*\$?\s*([\d,]+)\s*(k)?/i);
      const range = t.match(/\$?\s*([\d,]+)\s*(k)?\s*(?:to|-|and)\s*\$?\s*([\d,]+)\s*(k)?/i);
      const one = t.match(/\$\s*([\d,]+)\s*(k)?/);
      const n = (v, k) => parseInt(String(v).replace(/,/g, '')) * (k ? 1000 : 1);
      if (range && n(range[3], range[4]) > 300) { m.minBudget = n(range[1], range[2]); m.maxBudget = n(range[3], range[4]); }
      else if (under) { m.minBudget = 0; m.maxBudget = n(under[1], under[2]); }
      else if (one) { const v = n(one[1], one[2]); m.minBudget = Math.max(0, v - 500); m.maxBudget = v + 500; }
    }
    if (/\btt\b|triathlon|time trial/.test(low)) m.bikeType = 'TT';
    else if (low.includes('gravel') && !low.includes('road')) m.bikeType = 'Gravel';
    else if (low.includes('road') && !low.includes('gravel')) m.bikeType = 'Road';
    return m;
  }

  // guided flow: ask for whatever is still missing, then fetch recommendations
  async function next() {
    if (!memory.bikeType) { bot('What kind of riding is it for?'); setChips(TYPES); return; }
    if (!memory.height) { bot("Got it. What's your height in cm?"); setChips(HEIGHTS); return; }
    if (memory.maxBudget == null) { bot("And what's your budget?"); setChips(BUDGETS); return; }
    setChips([]); typing(true);
    let recs = null;
    try {
      const r = await fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...memory, minBudget: Math.max(1, memory.minBudget || 0) }) }); // backend rejects 0 as missing
      if (!r.ok) throw new Error(r.status);
      recs = (await r.json()).recommendations || [];
    } catch (e) {
      // backend unreachable: pick from the bikes on the page
      recs = S.bikes.filter(b => b.productType === 'Full Bikes' && (!memory.bikeType || b.category === memory.bikeType) && b.price >= (memory.minBudget || 0) && b.price <= memory.maxBudget)
        .sort((a, b) => b.price - a.price).slice(0, 4);
    }
    typing(false);
    if (window.MKP_LIVE) recs = recs.filter(r => S.bySlug(r.slug));
    if (recs.length) { bot('Here are my top recommendations for you:', bikeCards(recs)); }
    else bot("I couldn't find bikes matching that right now. Try a different budget, or tell us what you're after and we'll find it.", `<div class="tony-bikes"><a class="tony-bike tb-link" href="/request.html"><span class="tb-copy"><b>Request a bike</b><span>We'll source it for you</span></span></a></div>`);
    setChips(AFTER);
  }

  async function handle(text, fromChip) {
    if (busy || !text) return;
    const low = text.toLowerCase();
    if (low === 'find my bike size' || (!fromChip && /\b(what size|bike size|my size|sizing)\b/.test(low))) {
      user(text);
      bot('Our size finder works out your frame size from your height and inseam in about a minute.', `<div class="tony-bikes"><a class="tony-bike tb-link" href="/size.html"><span class="tb-copy"><b>Find your size</b><span>Height, inseam and riding style</span></span></a></div>`);
      setChips([{ label: 'Get a bike recommendation' }]); return;
    }
    if (low === 'browse all bikes') { location.href = '/bikes.html'; return; }
    if (low === 'start new search') { start(); return; }
    if (low === 'get a bike recommendation') { user(text); memory = {}; next(); return; }

    if (fromChip) { user(text === 'TT' ? 'TT / Triathlon' : text.startsWith('budget ') ? chips.querySelector(`[data-v="${text}"]`)?.textContent || text : text); Object.assign(memory, parse(text)); next(); return; }

    // typed message: AI first, guided fallback
    user(text);
    Object.assign(memory, parse(text));
    if (aiOk) {
      setChips([]); typing(true);
      try {
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ histories: history.slice(0, -1), lastHistory: history[history.length - 1] }) });
        if (!r.ok) throw new Error(r.status);
        const o = await r.json();
        typing(false);
        if (o.memory) Object.assign(memory, o.memory);
        bot(o.content || 'Here is what I found:', o.recommendations && o.recommendations.length ? bikeCards(o.recommendations) : '');
        setChips(o.suggestions && o.suggestions.length ? o.suggestions : o.recommendations && o.recommendations.length ? AFTER : []);
        if (!o.suggestions?.length && !o.recommendations?.length) next();
        return;
      } catch (e) { typing(false); aiOk = false; }
    }
    next();
  }

  function open(o) {
    panel.hidden = !o; el.classList.toggle('open', o); fab.setAttribute('aria-expanded', o);
    if (o && !log.children.length) start();
    if (o && matchMedia('(hover: hover)').matches) setTimeout(() => input.focus({ preventScroll: true }), 50);
  }
  fab.addEventListener('click', () => open(panel.hidden));
  el.querySelector('.tony-x').addEventListener('click', () => open(false));
  el.querySelector('.tony-reset').addEventListener('click', start);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) open(false); });
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) handle(b.dataset.v, true); });
  form.addEventListener('submit', e => { e.preventDefault(); const t = input.value.trim(); input.value = ''; handle(t, false); });
  // a bike in the chat opens the quick view; close the chat so it is visible
  log.addEventListener('click', e => { if (e.target.closest('.tony-bike') && matchMedia('(max-width: 640px)').matches) open(false); });
})();
