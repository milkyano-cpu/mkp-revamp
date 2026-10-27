#!/usr/bin/env python3
"""Regenerate site/js/articles-data.js from the live mkpbikes.com.au articles API.

    python3 tools/build-articles.py

Pulls every published article, converts its markdown to HTML, removes em/en dashes
(site copy rule) and points links at the local redesign pages where one exists.
"""
import html, json, pathlib, re, urllib.request

LIVE = 'https://www.mkpbikes.com.au'
OUT = pathlib.Path(__file__).resolve().parent.parent / 'site/js/articles-data.js'


def get(path):
    req = urllib.request.Request(LIVE + path, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def undash(s):
    s = re.sub(r'(\d)\s*[–—]\s*(\$?\d)', r'\1 to \2', s)   # ranges: 38–65mm
    s = re.sub(r'\s+[–—]\s+', ', ', s)                     # " — " asides
    return re.sub(r'[–—]', ', ', s)


# live paths that have a redesigned local page (articles are matched by slug below)
LOCAL = {
    '/bike-fitting': 'fitting.html',
    '/bikes/pre-owned': 'bikes.html?type=pre',
    '/bikes/new-bikes': 'bikes.html?type=new',
    '/bikes': 'bikes.html',
    '/tavelo': 'tavelo.html',
    '/about': 'about.html',
    '/find-your-size': 'size.html',
    '/articles/how-to-clean-road-bike': 'article.html?slug=road-bike-cleaning-tips-how-to-keep-your-road-bike-running-smooth-in-melbourne',
    '/articles/tyre-care-road-bike': 'article.html?slug=road-bike-tyre-care-tips-melbourne',
}


def fix_href(h):
    h = re.sub(r'[?&]utm_source=[^&]*', '', h)
    path = re.sub(r'^https?://(www\.)?mkpbikes\.com\.au', '', h) or '/'
    if path in LOCAL:
        return LOCAL[path]
    if path.startswith('/article/'):
        return 'article.html?slug=' + path.split('/article/', 1)[1]
    if path.startswith('/'):
        return LIVE + path          # e.g. /guides/..., still only on the live site
    return h


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: f'<a href="{fix_href(m.group(2))}">{m.group(1)}</a>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\w)', r'<em>\1</em>', s)
    return s


def md(text):
    out, lines, i = [], text.replace('\r', '').split('\n'), 0
    while i < len(lines):
        l = lines[i].rstrip()
        if not l.strip():
            i += 1; continue
        m = re.match(r'(#{1,4})\s+(.*)', l)
        if m:
            lvl = len(m.group(1))
            if lvl > 1:  # the page already shows the title, so the article's own H1 is dropped
                out.append(f'<h{lvl}>{inline(m.group(2))}</h{lvl}>')
            i += 1; continue
        if l.lstrip().startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', c) for c in cells):
                    rows.append(cells)
                i += 1
            head, body = rows[0], rows[1:]
            out.append('<div class="table"><table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead><tbody>'
                       + ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in body) + '</tbody></table></div>')
            continue
        for pat, tag in ((r'\s*[-*]\s+(.*)', 'ul'), (r'\s*\d+[.)]\s+(.*)', 'ol')):
            if re.match(pat, l):
                items = []
                while i < len(lines) and re.match(pat, lines[i]):
                    items.append(inline(re.match(pat, lines[i]).group(1))); i += 1
                out.append(f'<{tag}>' + ''.join(f'<li>{x}</li>' for x in items) + f'</{tag}>')
                break
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r'(#{1,4}\s|\s*[-*]\s|\s*\d+[.)]\s|\s*\|)', lines[i]):
                para.append(lines[i].strip()); i += 1
            out.append('<p>' + inline(' '.join(para)) + '</p>')
    return '\n'.join(out)


def body(content):
    if re.search(r'<(p|h2|ul)\b', content):          # already HTML (one article is)
        content = re.sub(r'<h1[^>]*>.*?</h1>', '', content, flags=re.S)
        content = re.sub(r'href="([^"]+)"', lambda m: f'href="{fix_href(m.group(1))}"', content)
        return re.sub(r'\n\s*', '\n', content).strip()
    return md(content)


def main():
    listing = get('/api/articles?page=1&limit=100')['articles']
    arts = []
    for a in listing:
        full = get('/api/articles/' + a['slug'])
        arts.append({
            'slug': a['slug'],
            'title': undash(full['title']).strip(),
            'excerpt': undash(full.get('excerpt') or '').strip(),
            'image': full.get('featuredImage') or '',
            'tags': full.get('tags') or [],
            'readTime': full.get('readTime') or 0,
            'date': (full.get('publishedAt') or full.get('createdAt') or '')[:10],
            'html': undash(body(full.get('content') or '')),
        })
    arts.sort(key=lambda a: a['date'], reverse=True)
    OUT.write_text('// Articles pulled from mkpbikes.com.au/api/articles (Oct 2026). Regenerate with tools/build-articles.py, do not hand edit.\n'
                   'window.MKP_ARTICLES = ' + json.dumps(arts, ensure_ascii=False) + ';\n')
    print(f'{len(arts)} articles -> {OUT}')


if __name__ == '__main__':
    main()
