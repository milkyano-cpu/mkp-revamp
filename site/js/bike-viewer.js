// Hero 3D bike: "Bianchi Oltre RC_ Classic" by Dav1d- on Sketchfab, shown through Sketchfab's
// official embed + Viewer API (the model is view-only, so it is never downloaded or copied).
// The page drives the viewer camera: one orbit around the bike while the story words play
// (window.MKP.p from home.js), landing on a clean side profile for the headline.
(() => {
  const UID = '221a1c0a1faf42ef98beb75c375995b6';
  const iframe = document.getElementById('bikeViewer');
  const stage = iframe.closest('.story-stage');
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fail = () => root.classList.add('no-webgl');
  if (!window.Sketchfab) { fail(); return; }
  // The poster still (img/hero-bike-*.webp) is on screen from the first paint, so a slow viewer
  // just means the still stays a little longer. Only a real error hides the viewer.

  const client = new Sketchfab('1.12.1', iframe);
  client.init(UID, {
    autostart: 1, preload: 1, camera: 0, transparent: 1, dnt: 1, scrollwheel: 0, autospin: 0,
    ui_animations: 0, ui_annotations: 0, ui_controls: 0, ui_fullscreen: 0, ui_general_controls: 0,
    ui_help: 0, ui_hint: 0, ui_infos: 0, ui_inspector: 0, ui_settings: 0, ui_stop: 0, ui_theme: 'dark',
    ui_vr: 0, ui_ar: 0, ui_watermark: 0, ui_watermark_link: 0, ui_loading: 0,
    success(api) {
      api.start();
      api.addEventListener('viewerready', () => {
        // match the page background so the viewer blends in (ignored if the plan does not allow it)
        api.setBackground({ transparent: true }, () => {});
        api.getCameraLookAt((err, cam) => {
          if (err) return;
          setup(api, cam);
        });
      });
    },
    error: fail,
  });

  function setup(api, cam) {
    const [px, py, pz] = cam.position, [tx, ty, tz] = cam.target;
    // Sketchfab scenes are Z-up: orbit around the vertical axis through the target
    const dx = px - tx, dy = py - ty;
    const r0 = Math.hypot(dx, dy), h0 = pz - tz, a0 = Math.atan2(dy, dx);
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // the viewer's field of view is vertical, so a narrow frame needs the camera further back
    // to keep the whole bike in view (the default camera is framed for a ~16:9 window)
    const frameEl = iframe.parentElement;
    const fit = () => 0.94 * Math.max(1, 1.7 / (frameEl.clientWidth / frameEl.clientHeight));
    let ZOOM = fit();
    addEventListener('resize', () => { ZOOM = fit(); });
    // opening view: front three-quarter (front wheel slightly closer), as the user picked
    const START = 0.6;
    // target pose for a story progress p (0..1): one full turn, then a slight zoom out and lift
    function pose(p) {
      const turn = ease(Math.min(p / 0.84, 1));
      const endK = p > 0.74 ? Math.min((p - 0.74) / 0.12, 1) : 0;
      return { ang: a0 + START + turn * (Math.PI * 2 - START), zoom: ZOOM * (1 + endK * 0.12), drop: endK * 0.22 };
    }
    // start exactly where the visitor has scrolled to, so the live 3D never spins to catch up
    const p0 = pose((window.MKP && window.MKP.p) || 0);
    let ang = p0.ang, zoom = p0.zoom, drop = p0.drop, last = '';
    let shown = false;
    window.MKP && (window.MKP.bike3d = true, window.MKP.viewerApi = api);

    function frame() {
      requestAnimationFrame(frame);
      const t = pose((window.MKP && window.MKP.p) || 0);
      const k = reduce || (window.MKP && window.MKP.snap) ? 1 : 0.085;
      ang += (t.ang - ang) * k;
      zoom += (t.zoom - zoom) * k;
      drop += (t.drop - drop) * k;

      const r = r0 * zoom;
      const target = [tx, ty, tz - drop * r0];
      const pos = [tx + Math.cos(ang) * r, ty + Math.sin(ang) * r, tz + h0 * zoom - drop * r0];
      const key = pos.map(v => v.toFixed(4)).join(',');
      if (key !== last) {
        last = key;
        api.setCameraLookAt(pos, target, 0);
        // reveal once the camera sits in the opening pose, so the poster hands over seamlessly
        if (!shown) { shown = true; setTimeout(() => stage.classList.add('viewer-ready'), 250); }
      }
    }
    frame();
  }
})();
