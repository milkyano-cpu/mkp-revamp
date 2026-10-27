// Articles from the existing backend (written in the admin panel, served by /api/articles).
// js/articles-data.js is a snapshot for instant paint; this refreshes the list from the backend
// and renders any article that isn't in the snapshot (same markdown rules as tools/build-articles.py).
(() => {
  const A = window.MKP_ARTICLES = window.MKP_ARTICLES || [];
  const LIVE = 'https://www.mkpbikes.com.au';
  const getJSON = url => fetch(url, { headers: { Accept: 'application/json' } }).then(r => r.ok ? r.json() : Promise.reject(r.status));

  // site copy rule: no em/en dashes
  const undash = s => String(s || '').replace(/(\d)\s*[–—]\s*(\$?\d)/g, '$1 to $2').replace(/\s+[–—]\s+/g, ', ').replace(/[–—]/g, ', ');
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LOCAL = {
    '/bike-fitting': 'fitting.html', '/bikes/pre-owned': 'bikes.html?type=pre', '/bikes/new-bikes': 'bikes.html?type=new',
    '/bikes': 'bikes.html', '/tavelo': 'tavelo.html', '/about': 'about.html', '/find-your-size': 'size.html',
    '/sell-your-bike': 'sell.html', '/request-a-bike': 'request.html',
  };
  function fixHref(h) {
    h = h.replace(/[?&]utm_source=[^&]*/, '');
    const path = h.replace(/^https?:\/\/(www\.)?mkpbikes\.com\.au/, '') || '/';
    if (LOCAL[path]) return LOCAL[path];
    if (path.startsWith('/article/')) return 'article.html?slug=' + path.split('/article/')[1];
    if (path.startsWith('/')) return LIVE + path;
    return h;
  }
  const inline = s => esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, h) => `<a href="${fixHref(h)}">${t}</a>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '$1<em>$2</em>');
  function md(text) {
    const out = [], L = String(text).replace(/\r/g, '').split('\n');
    let i = 0;
    while (i < L.length) {
      const l = L[i].trimEnd();
      if (!l.trim()) { i++; continue; }
      let m = l.match(/^(#{1,4})\s+(.*)/);
      if (m) { if (m[1].length > 1) out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
      if (l.trimStart().startsWith('|')) {
        const rows = [];
        while (i < L.length && L[i].trim().startsWith('|')) {
          const cells = L[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
          if (!cells.every(c => /^:?-+:?$/.test(c))) rows.push(cells);
          i++;
        }
        const [head, ...body] = rows;
        out.push('<div class="table"><table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
          body.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
        continue;
      }
      const lists = [[/^\s*[-*]\s+(.*)/, 'ul'], [/^\s*\d+[.)]\s+(.*)/, 'ol']];
      const hit = lists.find(([re]) => re.test(l));
      if (hit) {
        const items = [];
        while (i < L.length && hit[0].test(L[i])) { items.push(inline(L[i].match(hit[0])[1])); i++; }
        out.push(`<${hit[1]}>` + items.map(x => `<li>${x}</li>`).join('') + `</${hit[1]}>`);
        continue;
      }
      const para = [];
      while (i < L.length && L[i].trim() && !/^(#{1,4}\s|\s*[-*]\s|\s*\d+[.)]\s|\s*\|)/.test(L[i])) { para.push(L[i].trim()); i++; }
      out.push('<p>' + inline(para.join(' ')) + '</p>');
    }
    return out.join('\n');
  }
  function body(content) {
    if (/<(p|h2|ul)\b/.test(content)) // already HTML (some articles are)
      return content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '').replace(/href="([^"]+)"/g, (m, h) => `href="${fixHref(h)}"`);
    return md(content);
  }
  const tagsOf = t => { if (Array.isArray(t)) return t; try { return JSON.parse(t || '[]'); } catch (e) { return []; } };
  const meta = x => ({
    slug: x.slug,
    title: undash(x.title).trim(),
    excerpt: undash(x.excerpt).trim(),
    image: x.featuredImage || '',
    tags: tagsOf(x.tags),
    readTime: Number(x.readTime) || 0,
    date: (x.publishedAt || x.createdAt || '').slice(0, 10),
  });

  // list refresh: new articles appear, unpublished ones drop out; snapshot bodies are kept
  const ready = getJSON('/api/articles?page=1&limit=100').then(d => {
    const live = (d.articles || []).filter(x => !x.status || x.status === 'PUBLISHED').map(meta);
    if (!live.length) return false;
    const old = Object.fromEntries(A.map(a => [a.slug, a]));
    const merged = live.map(m => Object.assign({ html: null }, old[m.slug] || {}, m)).sort((a, b) => b.date.localeCompare(a.date));
    A.splice(0, A.length, ...merged);
    document.dispatchEvent(new CustomEvent('mkp:articles'));
    return true;
  }).catch(() => false);

  // one full article (for slugs without a snapshot body)
  const full = slug => getJSON('/api/articles/' + encodeURIComponent(slug)).then(x => {
    const a = Object.assign(meta(x), { html: undash(body(x.content || '')) });
    const i = A.findIndex(y => y.slug === slug);
    if (i > -1) Object.assign(A[i], a); else A.push(a);
    return a;
  }).catch(() => null);

  window.MKP_ARTICLES_API = { ready, full };
})();
