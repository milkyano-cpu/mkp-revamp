#!/usr/bin/env python3
"""Local preview server for the MKP redesign.

Serves site/ on http://localhost:4173 and forwards /api/* to the live backend
(https://www.mkpbikes.com.au), so the new frontend runs against real data the same
way it will once it is deployed on mkpbikes.com.au (same origin, no CORS needed).

Safety: only GET requests and the read-only chat endpoints are forwarded. Form posts
(request-bike, newsletter, klaviyo, size emails) are NOT sent to the live backend from
here; they get a 503 so you never create real leads or emails while testing.
"""
import http.server, os, socketserver, sys, urllib.request, urllib.error

LIVE = 'https://www.mkpbikes.com.au'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
POST_OK = ('/api/chat', '/api/chat/size', '/api/recommendations', '/api/bikes/favourites')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def _proxy(self, body=None):
        req = urllib.request.Request(LIVE + self.path, data=body, method=self.command,
                                     headers={'Content-Type': self.headers.get('Content-Type', 'application/json'),
                                              'User-Agent': 'mkp-redesign-dev'})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                code, data, ctype = r.status, r.read(), r.headers.get('Content-Type', 'application/json')
        except urllib.error.HTTPError as e:
            code, data, ctype = e.code, e.read(), e.headers.get('Content-Type', 'application/json')
        except Exception as e:
            code, data, ctype = 502, str(e).encode(), 'text/plain'
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('X-MKP-Proxy', '1')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.startswith('/api/'):
            return self._proxy()
        return super().do_GET()

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length') or 0))
        if self.path.split('?')[0] in POST_OK:
            return self._proxy(body)
        msg = b'{"error":"Blocked in local preview: this form only posts to the live backend once deployed."}'
        self.send_response(503)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(msg)))
        self.end_headers()
        self.wfile.write(msg)

    def end_headers(self):
        if not self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('', PORT), Handler) as s:
    print(f'MKP preview on http://localhost:{PORT} (API -> {LIVE})')
    s.serve_forever()
