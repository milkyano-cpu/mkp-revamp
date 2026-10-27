// Real-time 3D Tavelo Arow (the pink/purple build at mkpbikes.com.au/bikes/new-bikes/tavelo-arow-2).
// Built from primitives (no model file): fade-painted aero frame with the TAVELO wordmark,
// one-piece black cockpit, Pertual Sharp 62/70 deep carbon wheels, Shimano 105 Di2.
// Turns with the scroll story (window.MKP.p), tilts toward the cursor, and reports its
// on-screen bounds so the story words can sit in balance with it.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('bike3d');
const stage = canvas.parentElement;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(2, 4, 3);
scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));

// ---------- materials ----------
const M = {
  // gloss paint; colour comes from per-vertex fade (purple rear to hot pink front)
  paint: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06 }),
  carbon: new THREE.MeshPhysicalMaterial({ color: 0x141416, roughness: 0.5, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
  rimCarbon: new THREE.MeshPhysicalMaterial({ color: 0x0e0e10, roughness: 0.42, metalness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 1, roughness: 0.16 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x2c2d31, metalness: 0.85, roughness: 0.34 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.88, metalness: 0 }),
  rimText: new THREE.MeshStandardMaterial({ color: 0x55565c, roughness: 0.6, metalness: 0.3 }),
};
const PURPLE = new THREE.Color('#6a2bb4'), MAGENTA = new THREE.Color('#c21fb0'), PINK = new THREE.Color('#ff2f72');

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

// a straight tube between two points; ratio < 1 flattens it sideways (aero profile)
function tube(a, b, r, mat, ratio = 1, rEnd = r) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(rEnd, r, len, 28, 6);
  g.scale(1, 1, ratio);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}
function curveTube(pts, r, mat, closed = false) {
  const c = new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', 0.4);
  return new THREE.Mesh(new THREE.TubeGeometry(c, 64, r, 12, closed), mat);
}
function ring(outer, inner, depth, mat, bevel = 0.002) {
  const s = new THREE.Shape();
  s.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const h = new THREE.Path();
  h.absarc(0, 0, inner, 0, Math.PI * 2, true);
  s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 96 });
  g.translate(0, 0, -depth / 2);
  return new THREE.Mesh(g, mat);
}
// bake the purple to pink fade into a painted mesh, by its position along the bike
function fade(mesh) {
  mesh.updateMatrix();
  const g = mesh.geometry, pos = g.attributes.position, col = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrix);
    const t = THREE.MathUtils.smoothstep(v.x + (v.y - 0.5) * 0.25, -0.42, 0.42);
    if (t < 0.5) c.copy(PURPLE).lerp(MAGENTA, t * 2); else c.copy(MAGENTA).lerp(PINK, (t - 0.5) * 2);
    c.toArray(col, i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return mesh;
}
function textTexture(text, w, h, font, color = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = color;
  x.font = font;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, w / 2, h / 2 + h * 0.04);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---------- geometry (metres; x forward, y up, z = drive side) ----------
const R = 0.34;
const AR = V(-0.5, R), AF = V(0.5, R);
const BB = V(-0.08, 0.28);
const ST = V(-0.215, 0.755), HT = V(0.36, 0.8), HB = V(0.405, 0.64);

const bike = new THREE.Group();
const frame = new THREE.Group();
bike.add(frame);

const DT = { a: BB.clone(), b: HB.clone().add(V(0, 0.01)), r: 0.034, ratio: 0.58 };
const painted = [
  tube(DT.a, DT.b, DT.r, M.paint, DT.ratio, 0.03),                              // big aero down tube
  tube(ST, HT.clone().add(V(-0.012, -0.012)), 0.019, M.paint, 0.72, 0.022),    // top tube, slight slope
  tube(BB, ST, 0.026, M.paint, 0.6, 0.022),                                    // aero seat tube
  tube(HB.clone().add(V(0.008, -0.04)), HT.clone().add(V(-0.004, 0.02)), 0.031, M.paint, 0.62, 0.026), // narrow head tube
  tube(HB.clone().add(V(0, -0.035, -0.036)), HB.clone().add(V(0, -0.035, 0.036)), 0.028, M.paint, 1), // fork crown
];
for (const s of [-1, 1]) {
  painted.push(tube(BB.clone().setZ(0.036 * s), AR.clone().setZ(0.062 * s), 0.014, M.paint, 0.75, 0.009));          // chainstay
  painted.push(tube(V(-0.205, 0.69, 0.02 * s), AR.clone().setZ(0.064 * s), 0.012, M.paint, 0.55, 0.008));          // dropped seatstay
  painted.push(tube(HB.clone().add(V(0.004, -0.035, 0.034 * s)), AF.clone().setZ(0.052 * s), 0.021, M.paint, 0.5, 0.012)); // aero fork blade
}
painted.forEach(m => frame.add(fade(m)));

// TAVELO wordmark down both sides of the down tube
{
  const dir = DT.b.clone().sub(DT.a), len = dir.length(), ang = Math.atan2(dir.y, dir.x);
  const mid = DT.a.clone().add(DT.b).multiplyScalar(0.5);
  const tex = textTexture('TAVELO', 1024, 160, '800 132px Inter, Arial, sans-serif');
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const halfW = DT.r * DT.ratio + 0.0022;
  for (const s of [1, -1]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(len * 0.62, len * 0.62 * 160 / 1024), mat);
    p.position.copy(mid).add(V(-0.01, -0.006, s * halfW));
    p.rotation.z = ang;
    if (s < 0) { p.rotation.y = Math.PI; p.rotation.z = -ang; }
    p.renderOrder = 2;
    frame.add(p);
  }
}

// black aero seat post + Selle Italia style saddle
const SP = V(-0.262, 0.93);
frame.add(tube(ST.clone().add(V(0.004, -0.02)), SP, 0.017, M.carbon, 0.55));
const saddle = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.2, 8, 20), M.rubber);
saddle.rotation.z = Math.PI / 2 + 0.03;
saddle.scale.set(0.32, 1, 1);
saddle.position.copy(SP).add(V(0.012, 0.016));
frame.add(saddle);
frame.add(tube(SP.clone().add(V(-0.07, 0.003)), SP.clone().add(V(0.09, 0.003)), 0.004, M.steel));

// one-piece integrated carbon cockpit (Avro Rise): flat aero tops into drops
const STEM = V(0.46, 0.84);
frame.add(tube(HT.clone().add(V(-0.004, 0.02)), STEM, 0.02, M.carbon, 0.7, 0.017));
for (const s of [-1, 1]) {
  const z = 0.2 * s;
  frame.add(curveTube([
    V(0.455, 0.84, 0), V(0.47, 0.842, z * 0.5), V(0.5, 0.842, z), V(0.545, 0.836, z),
  ], 0.012, M.carbon));
  frame.add(curveTube([
    V(0.54, 0.837, z), V(0.582, 0.808, z * 1.04), V(0.578, 0.748, z * 1.06),
    V(0.54, 0.718, z * 1.06), V(0.49, 0.722, z * 1.06),
  ], 0.0125, M.rubber));
  // Di2 hood + lever
  frame.add(tube(V(0.545, 0.84, z), V(0.598, 0.856, z), 0.016, M.rubber, 0.8, 0.012));
  frame.add(curveTube([V(0.594, 0.852, z), V(0.604, 0.795, z), V(0.59, 0.745, z)], 0.006, M.steel));
}

// ---------- wheels: Pertual Sharp ADV, 62mm front / 70mm rear ----------
const rimTex = textTexture('SHARP', 512, 128, 'italic 800 96px Inter, Arial, sans-serif', '#ffffff');
function wheel(rear) {
  const w = new THREE.Group();
  const spin = new THREE.Group();
  w.add(spin);
  const depth = rear ? 0.07 : 0.062;
  const tire = new THREE.Mesh(new THREE.TorusGeometry(R - 0.014, 0.014, 18, 120), M.rubber);
  const rimIn = R - 0.026 - depth;
  const rim = ring(R - 0.026, rimIn, 0.022, M.rimCarbon, 0.004);
  spin.add(tire, rim);
  // SHARP logos: two per side, tangent to the rim
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI + 0.9;
      const lw = depth * 1.7, lh = lw / 4;
      const lg = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshBasicMaterial({ map: rimTex, transparent: true, opacity: 0.55, depthWrite: false }));
      const rr = R - 0.026 - depth * 0.5;
      lg.position.set(Math.cos(a) * rr, Math.sin(a) * rr, side * 0.0152);
      lg.rotation.z = a - Math.PI / 2;
      if (side < 0) { lg.rotation.y = Math.PI; lg.rotation.z = -(a - Math.PI / 2); lg.position.x *= 1; }
      spin.add(lg);
    }
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, rear ? 0.13 : 0.1, 24), M.steel);
  hub.rotation.x = Math.PI / 2;
  spin.add(hub);
  // 24 bladed spokes, alternating flange sides
  const inner = rimIn + 0.004;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const side = i % 2 ? 1 : -1;
    const fl = V(Math.cos(a + 0.18 * side) * 0.026, Math.sin(a + 0.18 * side) * 0.026, side * 0.034);
    const rp = V(Math.cos(a) * inner, Math.sin(a) * inner, 0);
    spin.add(tube(fl, rp, 0.0018, M.steel, 0.5));
  }
  // disc rotor on the non-drive side
  const rotor = ring(0.08, 0.05, 0.002, M.chrome, 0);
  rotor.position.z = rear ? -0.058 : -0.046;
  spin.add(rotor);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    spin.add(tube(V(Math.cos(a) * 0.02, Math.sin(a) * 0.02, rotor.position.z), V(Math.cos(a + 0.4) * 0.052, Math.sin(a + 0.4) * 0.052, rotor.position.z), 0.004, M.steel));
  }
  if (rear) {
    for (let i = 0; i < 8; i++) {
      const cog = new THREE.Mesh(new THREE.CylinderGeometry(0.052 - i * 0.004, 0.052 - i * 0.004, 0.0022, 40), i % 2 ? M.chrome : M.steel);
      cog.rotation.x = Math.PI / 2;
      cog.position.z = 0.028 + i * 0.0042;
      spin.add(cog);
    }
  }
  const cal = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.03, 0.022), M.steel);
  cal.position.set(rear ? 0.04 : -0.05, rear ? 0.05 : 0.055, rotor.position.z - 0.006);
  w.add(cal);
  w.userData.spin = spin;
  return w;
}
const wr = wheel(true), wf = wheel(false);
wr.position.copy(AR);
wf.position.copy(AF);
bike.add(wr, wf);

// ---------- drivetrain: Shimano 105 Di2, black 4-arm crank ----------
const crank = new THREE.Group();
crank.position.copy(BB);
const ringBig = ring(0.106, 0.088, 0.003, M.steel, 0.0008);
ringBig.position.z = 0.066;
const ringSmall = ring(0.078, 0.064, 0.003, M.steel, 0.0008);
ringSmall.position.z = 0.058;
crank.add(ringBig, ringSmall);
for (let i = 0; i < 4; i++) {
  const a = (i / 4) * Math.PI * 2 + 0.4;
  crank.add(tube(V(0, 0, 0.068), V(Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0.066), 0.008, M.carbon, 0.6));
}
for (const s of [-1, 1]) {
  const tip = V(0, -0.172 * s, 0.088 * s);
  crank.add(tube(V(0, 0, 0.088 * s), tip, 0.012, M.carbon, 0.55, 0.008));
  const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.014, 0.07), M.steel);
  pedal.position.copy(tip).add(V(0, 0, 0.04 * s));
  crank.add(pedal);
}
const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.09, 24), M.carbon);
axle.rotation.x = Math.PI / 2;
crank.add(axle);
bike.add(crank);
const cz = 0.066;
bike.add(curveTube([
  V(BB.x, BB.y + 0.104, cz), V((BB.x + AR.x) / 2, (BB.y + AR.y) / 2 + 0.078, cz),
  V(AR.x, AR.y + 0.048, cz), V(AR.x - 0.048, AR.y, cz), V(AR.x - 0.02, AR.y - 0.08, cz),
  V((BB.x + AR.x) / 2, (BB.y + AR.y) / 2 - 0.07, cz), V(BB.x, BB.y - 0.104, cz), V(BB.x + 0.104, BB.y, cz),
], 0.0045, M.chrome, true));
bike.add(tube(V(AR.x - 0.01, AR.y - 0.02, cz + 0.012), V(AR.x - 0.02, AR.y - 0.085, cz + 0.012), 0.013, M.carbon, 0.5));

// center the bike on its own middle so it turns on the spot
const pivot = new THREE.Group();
bike.position.set(0, -0.52, 0);
pivot.add(bike);
scene.add(pivot);

// bounds in pivot space, used to place the story words around the bike
pivot.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(bike);
const corners = [];
for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(V(x, y, z));

// soft contact shadow
const sc = document.createElement('canvas');
sc.width = sc.height = 256;
const cx = sc.getContext('2d');
const grd = cx.createRadialGradient(128, 128, 0, 128, 128, 128);
grd.addColorStop(0, 'rgba(0,0,0,0.38)');
grd.addColorStop(0.55, 'rgba(0,0,0,0.12)');
grd.addColorStop(1, 'rgba(0,0,0,0)');
cx.fillStyle = grd;
cx.fillRect(0, 0, 256, 256);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.55), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = -0.52 + 0.001;
pivot.add(shadow);

// ---------- layout ----------
let W = 1, H = 1;
function resize() {
  W = stage.clientWidth; H = stage.clientHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  // fit: bike ~ 58% of width on desktop, 84% on phones, never taller than 62% of height
  const want = W < 700 ? 0.84 : 0.58;
  const visW = 1.5 / want, visH = visW / camera.aspect;
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2;
  camera.userData.d = Math.max(visH / t, (1.12 / 0.62) / t);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// screen-space top / bottom of the bike, in CSS px
const pv = new THREE.Vector3();
function bikeBounds() {
  let top = Infinity, bot = -Infinity;
  for (const c of corners) {
    pv.copy(c).applyMatrix4(pivot.matrixWorld).project(camera);
    const y = (1 - pv.y) / 2 * H;
    if (y < top) top = y;
    if (y > bot) bot = y;
  }
  return [top, bot];
}

// ---------- motion ----------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let rotY = -0.62, lift = 0, scl = 1, mx = 0, my = 0, tmx = 0, tmy = 0, shift = 0, wy = null;
let wheelA = 0, lastP = 0;
addEventListener('pointermove', e => {
  tmx = e.clientX / innerWidth - 0.5;
  tmy = e.clientY / innerHeight - 0.5;
}, { passive: true });

let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(stage.parentElement);

const clock = new THREE.Clock();
function frameLoop() {
  requestAnimationFrame(frameLoop);
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const p = (window.MKP && window.MKP.p) || 0;

  // one full turn while the words play, landing on a clean side profile
  const turn = ease(Math.min(p / 0.84, 1));
  const tRot = -0.62 + turn * (Math.PI * 2 + 0.62);
  const endK = p > 0.74 ? Math.min((p - 0.74) / 0.12, 1) : 0;
  const tLift = endK * (W < 700 ? 0.3 : 0.22);
  const tScl = 1 - endK * 0.24;
  const k = reduce ? 1 : 1 - Math.pow(0.0015, dt);
  rotY += (tRot - rotY) * k;
  lift += (tLift - lift) * k;
  scl += (tScl - scl) * k;
  mx += (tmx - mx) * k * 0.5;
  my += (tmy - my) * k * 0.5;

  const dp = p - lastP;
  lastP = p;
  wheelA -= dp * 40 + (reduce ? 0 : dt * 0.6);
  wr.userData.spin.rotation.z = wheelA;
  wf.userData.spin.rotation.z = wheelA;
  crank.rotation.z = wheelA * 0.42;

  const idle = reduce ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.012;
  pivot.rotation.y = rotY + mx * 0.25;
  pivot.rotation.x = 0.06 + my * 0.06;
  pivot.position.y = lift + idle;
  pivot.scale.setScalar(scl);

  const d = camera.userData.d;
  camera.position.set(0, 0.16 * d / 4, d);
  camera.lookAt(0, 0.02, 0);
  pivot.updateMatrixWorld(true);

  // balance the words with the bike.
  // Wide screens: the word sits behind the bike, centred on it (starboy).
  // Narrow screens: the word sits just above the bike and the pair is centred on screen together.
  const [top, bot] = bikeBounds();
  const wordH = (window.MKP && window.MKP.wordH) || 0;
  let tShift = 0, tWy = (top + bot) / 2;
  if (W < 700 && endK < 1) {
    const gap = Math.max(20, H * 0.03);
    const group = wordH + gap + (bot - top);
    const metaBottom = 110;
    const groupTop = metaBottom + (H - metaBottom - group) / 2;
    tShift = (groupTop + wordH + gap - top) * (1 - endK);
    tWy = top + tShift - gap - wordH / 2;
  }
  shift += (tShift - shift) * k;
  wy = wy === null ? tWy : wy + (tWy - wy) * k;
  canvas.style.transform = `translate3d(0,${shift.toFixed(1)}px,0)`;
  stage.style.setProperty('--wy', `${wy.toFixed(1)}px`);

  renderer.render(scene, camera);
}
window.MKP && (window.MKP.bike3d = true);
frameLoop();
