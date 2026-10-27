import { clamp, ease as E, lerp, seg, sstep } from "./math";
import { buildWordmark, type Stroke, type WordLayout } from "./wordmark";
import { createSmoke, SMOKE_DURATION } from "./smoke";
import { createDusk } from "./dusk";

/**
 * Scroll engine for the story. One sticky stage, one timeline measured in "u":
 * 1u = one viewport height of scroll. Every layer is a pure function of u (plus a
 * little real time for idle life), written straight to the DOM in a rAF loop.
 *
 *   0.0–2.2   pencil line: a sketched car drives the hairpin, turns into a rear sketch
 *   2.0–4.6   the red band slides up, the sketch is painted in, lamps glow
 *   4.6–6.5   the car turns to profile, lifts its lamps and leaves at speed
 *   6.5–8.8   spec numerals rise from the band and the car jumps them
 *   8.6–11.4  a red wipe; seen from above, the car drives up a red road that narrows to a line
 *  11.3–13.2  the line becomes the T of the name
 *  13.2–15.0  burnout; tyre smoke takes the page
 *  14.8–17.0  dusk: driving into the sun
 */
export const U_TOTAL = 17;

class Writer {
  private cache = new WeakMap<Element, Record<string, string>>();
  private get(el: Element) {
    let c = this.cache.get(el);
    if (!c) {
      c = {};
      this.cache.set(el, c);
    }
    return c;
  }
  css(el: Element, prop: string, value: string) {
    const c = this.get(el);
    if (c[prop] === value) return;
    c[prop] = value;
    const st = (el as HTMLElement).style;
    if (prop.startsWith("--")) st.setProperty(prop, value);
    else st.setProperty(prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()), value);
  }
  attr(el: Element, name: string, value: string) {
    const c = this.get(el);
    const key = "@" + name;
    if (c[key] === value) return;
    c[key] = value;
    el.setAttribute(name, value);
  }
  cls(el: Element, name: string, on: boolean) {
    const c = this.get(el);
    const key = "." + name;
    const v = on ? "1" : "0";
    if (c[key] === v) return;
    c[key] = v;
    el.classList.toggle(name, on);
  }
}

const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);
const f3 = (n: number) => n.toFixed(3);
const DEG = 180 / Math.PI;

export function startEngine(root: HTMLElement): () => void {
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceMq.matches;
  const onReduce = (e: MediaQueryListEvent) => (reduced = e.matches);
  reduceMq.addEventListener("change", onReduce);

  const one = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = root) => {
    const found = scope.querySelector(sel);
    if (!found) throw new Error(`story: missing ${sel}`);
    return found as T;
  };
  const all = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = root) =>
    Array.from(scope.querySelectorAll(sel)) as T[];

  const stage = one("[data-stage]");
  const el = {
    progress: one("[data-progress]", document),
    navDark: one(".nav--dark", document),
    navLight: one(".nav--light", document),
    grid: one(".l-grid"),
    intro: one(".l-intro"),
    titleblock: one(".l-titleblock"),
    track: one<SVGSVGElement>(".l-track"),
    trackMain: one<SVGPathElement>(".track-main"),
    trackGhost: one<SVGPathElement>(".track-ghost"),
    trackTip: one<SVGCircleElement>(".track-tip"),
    pathCar: one(".l-pathcar"),
    band: one(".l-band"),
    tickerTrack: one(".ticker-track"),
    tickerGroup: one(".ticker-group"),
    numsWrap: one(".l-nums"),
    nums: all(".num"),
    gshadow: one(".l-gshadow"),
    puff: one(".l-puff"),
    rear: one(".l-rear"),
    rearRender: one(".rear-render"),
    rearSketch: one(".rear-sketch"),
    side: one(".l-side"),
    tq: one(".l-tq"),
    panel: one(".l-panel"),
    lane: one(".lane"),
    dims: one<SVGSVGElement>(".l-dims"),
    dimW: one<SVGPathElement>(".dim-w"),
    dimL: one<SVGPathElement>(".dim-l"),
    dimWText: one<SVGTextElement>(".dim-w-t"),
    dimLText: one<SVGTextElement>(".dim-l-t"),
    top: one(".l-top"),
    word: one<SVGSVGElement>(".l-word"),
    smoke: one<HTMLCanvasElement>(".l-smoke"),
    fog: one(".l-fog"),
    dusk: one(".l-dusk"),
    duskCanvas: one<HTMLCanvasElement>(".dusk-canvas"),
    palmL: one(".palm-l"),
    palmR: one(".palm-r"),
    night: one(".l-night"),
    finale: one(".finale"),
    finaleTitle: one(".finale-title"),
    capsDark: one(".l-caps--dark"),
    capsLight: one(".l-caps--light"),
  };

  const w = new Writer();
  // "inherit", not "visible": a child switched on must still disappear with its parent
  const vis = (e: Element, on: boolean) => w.css(e, "visibility", on ? "inherit" : "hidden");
  const place = (e: Element, x: number, y: number, sx: number, sy: number, ox: number, oy: number, rot = 0) =>
    w.css(
      e,
      "transform",
      `translate(${f2(x)}px, ${f2(y)}px) rotate(${f3(rot)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)}) translate(${-ox}px, ${-oy}px)`,
    );

  /* ---------- strokes to draw ---------- */
  const strokes = (scope: ParentNode, sel: string): Stroke[] =>
    all<SVGGeometryElement>(sel, scope).map((g) => {
      const len = g.getTotalLength();
      g.style.strokeDasharray = `${len} ${len}`;
      g.style.strokeDashoffset = `${len}`;
      return { el: g, len };
    });
  const rk = {
    cons: strokes(el.rearSketch, ".rk-cons .sk"),
    main: strokes(el.rearSketch, ".rk-main .sk"),
    ghost: strokes(el.rearSketch, ".rk-ghost .sk"),
    swoosh: strokes(el.rearSketch, ".rk-swoosh .sk"),
    consG: one(".rk-cons", el.rearSketch),
    swooshG: one(".rk-swoosh", el.rearSketch),
  };
  const draw = (list: Stroke[], p: number, spread: number) => {
    const n = list.length;
    for (let i = 0; i < n; i++) {
      const s = list[i];
      const t0 = n > 1 ? (i / (n - 1)) * spread : 0;
      const lp = clamp((p - t0) / (1 - spread));
      w.css(s.el, "strokeDashoffset", f2(s.len * (1 - E.out2(lp))));
    }
  };

  /* ---------- car parts ---------- */
  const pcWheels = all<SVGGElement>(".c-wheel", el.pathCar);
  const sideWheels = all<SVGGElement>(".c-wheel", el.side);
  const sideRoot = one<SVGGElement>(".c-root", el.side);
  const sidePopup = one<SVGGElement>(".c-popup", el.side);
  const sideFlare = one<SVGGElement>(".c-flare", el.side);
  const sideDim = one<SVGPathElement>(".c-dim", el.side);
  const sideShadow = one<SVGElement>(".c-shadow", el.side);
  const rearDim = one<SVGPathElement>(".c-dim", el.rearRender);
  const rearLamps = all<SVGElement>(".c-lamp-on", el.rearRender);
  const rearGlow = one<SVGElement>(".c-glow", el.rearRender);
  all<SVGElement>(".c-lamp-on", el.night).forEach((e) => e.setAttribute("opacity", "1"));
  one<SVGElement>(".c-glow", el.night).setAttribute("opacity", "1");
  const mblur = document.getElementById("f-mblur-b");
  const smear = document.getElementById("f-smear-b");

  const spin = (g: SVGGElement, deg: number) =>
    w.attr(g, "transform", `rotate(${f1(deg % 360)} ${g.dataset.cx} ${g.dataset.cy})`);

  const caps = all(".cap", el.capsDark).map((dark, i) => ({
    dark,
    light: all(".cap", el.capsLight)[i],
    a: Number(dark.dataset.in),
    b: Number(dark.dataset.out),
  }));

  const smoke = createSmoke(el.smoke, reduced ? 70 : 170);
  const dusk = createDusk(el.duskCanvas);

  /* ---------- layout ---------- */
  let W = 0;
  let H = 0;
  let storyTop = 0;
  let scrollMax = 1;
  let word: WordLayout | null = null;
  const L = {
    portrait: false,
    s: 1,
    sBig: 1,
    bandTop: 0,
    bandLow: 0,
    trackLen: 1,
    trackPts: new Float32Array(3),
    trackN: 1,
    pc: 0.2,
    carF0: 0.12,
    laneTop: 0,
    tickW: 1000,
    numH: 100,
    numsLeft: 0,
    numsRight: 0,
    sJump: 0.3,
    xTake: 0,
    xLand: 0,
    jumpH: 200,
    topLen: 300,
    sTop: 0.3,
    topW: 100,
    bandHalf: 200,
    sBurn: 0.4,
    burnX: 0,
    burnY: 0,
    smokeX: 0,
    smokeY: 0,
    smokeScale: 1,
    sNight: 1,
    nightY0: 0,
  };

  function buildTrack() {
    const P = L.portrait;
    const snap = (y: number) => Math.round(y / 32) * 32 - 1;
    const yB = snap(H * (P ? 0.72 : 0.74));
    const yT = snap(H * (P ? 0.47 : 0.38));
    const r = (yB - yT) / 2;
    const cx = W - r - W * (P ? 0.1 : 0.1);
    const xEnd = W * (P ? 0.34 : 0.4);
    const d = `M${f1(-W * 0.08)},${f1(yB)} L${f1(cx)},${f1(yB)} A${f1(r)},${f1(r)} 0 0 0 ${f1(cx)},${f1(yT)} L${f1(xEnd)},${f1(yT)}`;
    el.track.setAttribute("viewBox", `0 0 ${W} ${H}`);
    el.trackMain.setAttribute("d", d);
    el.trackGhost.setAttribute("d", d);
    const len = el.trackMain.getTotalLength();
    L.trackLen = len;
    const N = 480;
    const pts = new Float32Array((N + 1) * 3);
    let prev = 0;
    for (let i = 0; i <= N; i++) {
      const s = (i / N) * len;
      const p = el.trackMain.getPointAtLength(s);
      const pa = el.trackMain.getPointAtLength(Math.max(0, s - 1.5));
      const pb = el.trackMain.getPointAtLength(Math.min(len, s + 1.5));
      let a = Math.atan2(pb.y - pa.y, pb.x - pa.x);
      while (a - prev > Math.PI) a -= Math.PI * 2;
      while (a - prev < -Math.PI) a += Math.PI * 2;
      prev = a;
      pts[i * 3] = p.x;
      pts[i * 3 + 1] = p.y;
      pts[i * 3 + 2] = a;
    }
    L.trackPts = pts;
    L.trackN = N;
    for (const p of [el.trackMain, el.trackGhost]) p.style.strokeDasharray = `${len} ${len}`;
    w.css(el.trackMain, "strokeDashoffset", f1(len));
    w.css(el.trackGhost, "strokeDashoffset", f1(len));
  }

  const trackAt = (f: number) => {
    const pts = L.trackPts;
    const i = clamp(f) * L.trackN;
    const i0 = Math.min(L.trackN - 1, Math.floor(i));
    const k = i - i0;
    const a = i0 * 3;
    const b = a + 3;
    return { x: lerp(pts[a], pts[b], k), y: lerp(pts[a + 1], pts[b + 1], k), a: lerp(pts[a + 2], pts[b + 2], k) };
  };

  function layout() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    if (!W || !H) return;
    const P = H > W * 1.05;
    L.portrait = P;
    root.style.height = `${U_TOTAL * H + H}px`;
    storyTop = root.getBoundingClientRect().top + window.scrollY;
    scrollMax = U_TOTAL * H;

    L.s = (P ? W * 0.9 : Math.min(W * 0.56, H * 1.2)) / 1000;
    L.bandTop = Math.round(H * 0.64);
    L.bandLow = Math.round(H * (P ? 0.78 : 0.8));
    L.sBig = Math.min(L.s * (P ? 1.7 : 1.5), (L.bandTop - 64 - 56) / 262, (W * 0.84) / 480);
    w.css(el.rearSketch, "--skw", f3(1.5 / L.sBig));

    buildTrack();
    L.pc = clamp(W * (P ? 0.5 : 0.26), 160, 420) / 1000;
    w.css(el.pathCar, "--skw", f3((P ? 1.0 : 1.35) / L.pc));
    L.carF0 = Math.max(0.1, ((1000 * L.pc) / 2 + 24 + W * 0.08) / L.trackLen);

    // pencil filters live in user units: rescale noise and wobble to screen pixels per drawing
    const specFig = document.querySelector<SVGSVGElement>(".spec-drawing");
    const specK = specFig ? specFig.getBoundingClientRect().width / 1160 : 0.6;
    const tune = (name: string, k: number) => {
      for (const id of [`f-pencil-${name}`, `f-pencil-${name}-b`]) {
        const f = document.getElementById(id);
        if (!f) continue;
        f.querySelector(".pw")?.setAttribute("baseFrequency", f3(0.9 / k));
        f.querySelector(".pg")?.setAttribute("baseFrequency", f3(1.7 / k));
        f.querySelector(".pd")?.setAttribute("scale", f2(1.3 / k));
      }
    };
    tune("track", 1);
    tune("car", L.pc);
    tune("rear", L.sBig);
    tune("spec", specK || 0.6);

    L.tickW = el.tickerGroup.getBoundingClientRect().width || 1000;

    // numerals that the car will jump
    let numSize = P ? Math.min(W * 0.27, H * 0.16) : Math.min(H * 0.34, W * 0.155);
    const measure = () => {
      el.numsWrap.style.setProperty("--num-size", `${numSize}px`);
      const r = el.nums.map((n) => n.getBoundingClientRect());
      const g = numSize * (P ? 0.14 : 0.3);
      return { r, g, total: r.reduce((acc, x) => acc + x.width, 0) + g * (r.length - 1) };
    };
    let m = measure();
    if (m.total > W - 32) {
      numSize *= (W - 32) / m.total;
      m = measure();
    }
    const { r: rects, g: gapN, total } = m;
    let x = W / 2 - total / 2 + (P ? 0 : W * 0.03);
    L.numsLeft = x;
    L.numH = Math.max(...rects.map((r) => r.height));
    el.nums.forEach((n, i) => {
      n.style.left = `${f1(x)}px`;
      n.style.top = `${f1(L.bandLow - rects[i].height + numSize * 0.07)}px`;
      x += rects[i].width + gapN;
    });
    L.numsRight = x - gapN;

    L.sJump = (P ? W * 0.5 : Math.min(W * 0.31, H * 0.64)) / 1000;
    const len = 1000 * L.sJump;
    const span = L.numsRight - L.numsLeft;
    L.xTake = L.numsLeft - len * 0.42 - span * 0.1;
    L.xLand = L.numsRight + len * 0.42 + span * 0.1;
    L.jumpH = Math.min(L.bandLow - 64 - 262 * L.sJump - 12, (L.numH + 30) / 0.62);

    // seen from above
    L.topLen = P ? Math.min(H * 0.42, W * 0.95) : H * 0.46;
    L.sTop = L.topLen / 1000;
    L.topW = 440 * L.sTop;
    L.bandHalf = Math.max(L.topW / 2 + (P ? 64 : 110), P ? 0 : W * 0.17);
    if (P) L.bandHalf = Math.min(L.bandHalf, W / 2 - 14);
    const cy = H * 0.56;
    const x1 = W / 2 - L.topW / 2;
    const x2 = W / 2 + L.topW / 2;
    const yW = cy + L.topLen / 2 + 24;
    const xL = x2 + 24;
    const yA = cy - L.topLen / 2;
    const yB = cy + L.topLen / 2;
    el.dims.setAttribute("viewBox", `0 0 ${W} ${H}`);
    el.dimW.setAttribute("d", `M${f1(x1)},${f1(yW)} H${f1(x2)} M${f1(x1)},${f1(yW - 7)} V${f1(yW + 7)} M${f1(x2)},${f1(yW - 7)} V${f1(yW + 7)}`);
    el.dimL.setAttribute("d", `M${f1(xL)},${f1(yA)} V${f1(yB)} M${f1(xL - 7)},${f1(yA)} H${f1(xL + 7)} M${f1(xL - 7)},${f1(yB)} H${f1(xL + 7)}`);
    el.dimWText.setAttribute("x", f1(W / 2));
    el.dimWText.setAttribute("y", f1(yW + 24));
    el.dimLText.setAttribute("transform", `translate(${f1(xL + 20)} ${f1(cy)}) rotate(-90)`);
    el.lane.style.left = `${f1(W / 2 - 3)}px`;
    const planCap = caps.find((c) => c.a > 9 && c.a < 10)?.dark;
    L.laneTop = P && planCap ? planCap.offsetTop + planCap.offsetHeight + 16 : 0;
    el.lane.style.top = `${f1(L.laneTop)}px`;

    word = buildWordmark(el.word, W, H, P);
    for (const c of caps) {
      if (!c.dark.classList.contains("cap--name")) continue;
      for (const n of [c.dark, c.light]) {
        n.style.setProperty("--cap-x", `${f1(word.x2)}px`);
        n.style.setProperty("--cap-y", `${f1(word.y2 + word.h + (P ? 26 : 38))}px`);
      }
    }

    L.sBurn = (P ? W * 0.86 : Math.min(W * 0.44, H * 0.92)) / 1000;
    L.burnY = Math.round(H * (P ? 0.84 : 0.885));
    L.burnX = P ? W * 0.5 : W * 0.6;
    L.smokeX = L.burnX + (245 - 500) * L.sBurn;
    L.smokeY = L.burnY - 6;
    L.smokeScale = (Math.max(W, H) / 1400) * (P ? 1.3 : 1);
    smoke.resize(W, H);

    dusk.resize(W, H, P);
    L.sNight = (P ? W * 0.62 : Math.min(W * 0.33, H * 0.6)) / 444;
    L.nightY0 = H * (P ? 0.93 : 0.95);

    // the stroke-drawn spec drawing is sized by CSS; only its stroke weight follows width
    readScroll();
  }

  /* ---------- per-frame ---------- */
  let rearSpin = 0;

  /** The turn as a box rotation (rear face folds away, profile unfolds), plus the dissolve weights. */
  function turnAt(u: number) {
    const deg = 90 * E.inOut2(seg(u, 4.6, 5.3));
    const th = deg / DEG;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    const rearW = 444 * L.s;
    const total = rearW * c + 1000 * L.s * sn;
    return {
      th,
      c,
      sn,
      rearW,
      total,
      x0: W / 2 - total / 2,
      d1: sstep(seg(deg, 20, 35)), // rear → three-quarter
      d2: sstep(seg(deg, 55, 70)), // three-quarter → profile
    };
  }

  function render(u: number, t: number, dt: number) {
    if (!word) return;
    const P = L.portrait;
    w.css(el.progress, "transform", `scaleX(${(u / U_TOTAL).toFixed(4)})`);

    /* S1 · pencil line */
    const gridOn = u < 2.4;
    vis(el.grid, gridOn);
    if (gridOn) w.css(el.grid, "opacity", f3(1 - seg(u, 1.6, 2.4)));

    const io = seg(u, 0.04, 0.42);
    vis(el.intro, io < 1);
    w.css(el.intro, "opacity", f3(1 - E.in2(io)));
    w.css(el.intro, "transform", `translateY(${f1(-28 * E.in2(io))}px)`);

    const tbo = seg(u, 1.4, 1.8);
    vis(el.titleblock, tbo < 1);
    w.css(el.titleblock, "opacity", f3((1 - tbo) * E.out2(seg(t, 0.5, 1.3))));

    // on load the pencil draws the whole hairpin; scrolling then drives the car along it
    const boot = reduced ? 1 : E.inOut2(seg(t, 0.25, 2.3));
    const trackOn = u < 2.1;
    vis(el.track, trackOn);
    vis(el.pathCar, trackOn && u < 1.72);
    if (trackOn) {
      const carF = lerp(L.carF0, 1, E.inOut2(seg(u, 0, 1.5)));
      const drawF = Math.min(1, Math.max(carF + 0.2, boot));
      const len = L.trackLen;
      w.css(el.trackMain, "strokeDashoffset", f1(len * (1 - drawF)));
      w.css(el.trackGhost, "strokeDashoffset", f1(len * (1 - clamp(drawF - 0.03))));
      const tip = trackAt(drawF);
      w.attr(el.trackTip, "cx", f1(tip.x));
      w.attr(el.trackTip, "cy", f1(tip.y));
      w.css(el.trackTip, "opacity", drawF > 0.002 && drawF < 0.999 ? "1" : "0");
      w.css(el.track, "opacity", f3(1 - seg(u, 1.55, 2.05)));

      const exitP = seg(u, 1.42, 1.72);
      if (exitP < 1) {
        const pc = trackAt(carF);
        const f = clamp(-pc.a / Math.PI);
        let roll = Math.cos(Math.PI * sstep(seg(f, 0.3, 0.7)));
        if (Math.abs(roll) < 0.05) roll = roll < 0 ? -0.05 : 0.05;
        const sx = lerp(1, 0.2, E.in2(exitP));
        place(el.pathCar, pc.x, pc.y, L.pc * sx, L.pc * roll, 512, 270, pc.a * DEG);
        w.css(el.pathCar, "opacity", f3((1 - exitP) * E.out2(seg(t, 0.7, 1.4))));
        const deg = ((carF * len) / (L.pc * 74)) * DEG;
        for (const g of pcWheels) spin(g, deg);
      }
    }

    /* S2 · rear elevation: sketch → paint → lamps → turn */
    const rearOn = u >= 1.45 && u < 5.32 && turnAt(u).d1 < 1;
    vis(el.rear, rearOn);
    if (rearOn) {
      const skOn = u < 3.1;
      vis(el.rearSketch, skOn);
      if (skOn) {
        draw(rk.cons, seg(u, 1.46, 1.72), 0.3);
        draw(rk.main, seg(u, 1.5, 1.98), 0.6);
        draw(rk.ghost, seg(u, 1.58, 2.06), 0.6);
        draw(rk.swoosh, seg(u, 1.72, 2.08), 0.45);
        w.css(rk.consG, "opacity", f3(1 - seg(u, 2.0, 2.4)));
        w.css(rk.swooshG, "opacity", f3(1 - seg(u, 2.2, 2.55)));
        w.css(el.rearSketch, "opacity", f3(1 - seg(u, 2.55, 3.05)));
      }
      const fill = E.inOut2(seg(u, 2.3, 2.95));
      vis(el.rearRender, fill > 0);
      w.css(el.rearRender, "--fill", fill.toFixed(4));

      const lp = seg(u, 3.0, 3.45);
      let lamp = E.out2(lp);
      if (lp > 0 && lp < 0.55) lamp *= Math.sin(lp * 46) > 0 ? 1 : 0.3;
      for (const e of rearLamps) w.attr(e, "opacity", f3(lamp));
      w.attr(rearGlow, "opacity", f3(lamp * 0.9));

      const rs = lerp(L.sBig, L.s, E.inOut3(seg(u, 3.8, 4.6)));
      const tr = turnAt(u);
      const cx = tr.th > 0 ? tr.x0 + (tr.rearW * tr.c) / 2 : W / 2;
      place(el.rear, cx, L.bandTop, rs * Math.max(tr.c, 0.001), rs, 240, 270);
      w.attr(rearDim, "opacity", f3(0.5 * tr.sn));
      w.css(el.rear, "opacity", f3(1 - tr.d1));
    }

    /* side elevation: turn → drive → jump → burnout */
    let sideOn = false;
    let blur = 0;
    let flying = false;
    vis(el.gshadow, false);
    vis(el.puff, false);
    const turn = turnAt(u);
    const tqOn = u >= 4.6 && u < 5.32 && turn.d1 > 0 && turn.d2 < 1;
    vis(el.tq, tqOn);
    if (tqOn) {
      // the key drawing spans the turn's full footprint: far tail corner to nose (1021 units)
      place(el.tq, turn.x0, L.bandTop, turn.total / 1021, L.s, 23, 270);
      w.css(el.tq, "opacity", f3(turn.d1 * (1 - turn.d2)));
    }
    w.css(el.side, "opacity", u >= 4.6 && u < 5.32 ? f3(turn.d2) : "1");
    if (u >= 4.6 && u < 6.55 && turn.d2 > 0) {
      sideOn = true;
      const sideLen = 1000 * L.s;
      const dp = E.in3(seg(u, 5.6, 6.5));
      const dx = (W / 2 + sideLen * 0.62 + 80) * dp;
      place(el.side, turn.x0 + turn.rearW * turn.c + dx, L.bandTop, L.s * Math.max(turn.sn, 0.001), L.s, 15, 270);
      w.attr(sideDim, "opacity", f3(0.5 * turn.c));
      const deg = (dx / L.s / 74) * DEG;
      for (const g of sideWheels) spin(g, deg);
      blur = 30 * E.in2(seg(u, 5.75, 6.45));
      popup(E.out3(seg(u, 5.32, 5.58)));
    } else if (u >= 7.05 && u < 8.5) {
      sideOn = true;
      flying = true;
      const jt = seg(u, 7.05, 8.45);
      const len = 1000 * L.sJump;
      const xA = -len / 2 - 40;
      const xZ = W + len / 2 + 40;
      const x = lerp(xA, xZ, jt);
      const tT = (L.xTake - xA) / (xZ - xA);
      const tL = (L.xLand - xA) / (xZ - xA);
      let hgt = 0;
      let rot = 0;
      if (jt > tT && jt < tL) {
        const tau = (jt - tT) / (tL - tT);
        hgt = L.jumpH * 4 * tau * (1 - tau);
        rot = lerp(-8, 7, tau);
      } else if (jt <= tT) rot = -8 * seg(jt, tT - 0.035, tT);
      else rot = 7 * (1 - seg(jt, tL, tL + 0.05));
      place(el.side, x, L.bandLow - hgt, L.sJump, L.sJump, 512, 270, rot);
      w.attr(sideDim, "opacity", "0");
      const deg = ((x - xA) / L.sJump / 74) * DEG;
      for (const g of sideWheels) spin(g, deg);
      blur = 7;
      popup(1);
      const hf = clamp(hgt / L.jumpH);
      vis(el.gshadow, true);
      w.css(el.gshadow, "transform", `translate(${f1(x)}px, ${f1(L.bandLow)}px) translate(-50%, -50%) scale(${f3((len / 100) * (1 - 0.55 * hf))}, ${f3(1 - 0.4 * hf)})`);
      w.css(el.gshadow, "opacity", f3(0.5 * (1 - 0.75 * hf)));
      const pp = seg(jt, tL, tL + 0.12);
      if (pp > 0 && pp < 1) {
        vis(el.puff, true);
        w.css(el.puff, "transform", `translate(${f1(L.xLand)}px, ${f1(L.bandLow)}px) translate(-50%, -62%) scale(${f3(lerp(0.3, 1.8, E.out3(pp)) * (len / 420))})`);
        w.css(el.puff, "opacity", f3(0.6 * (1 - pp)));
      }
    } else if (u >= 13.2 && u < 14.95) {
      sideOn = true;
      const bi = E.out3(seg(u, 13.2, 13.62));
      const len = 1000 * L.sBurn;
      const x = lerp(-len / 2 - 60, L.burnX, bi);
      const k = seg(u, 13.58, 13.8);
      const shake = reduced ? 0 : Math.sin(t * 63) * 0.8 * k;
      place(el.side, x, L.burnY + shake, L.sBurn, L.sBurn, 512, 270, -1.1 * k);
      w.attr(sideDim, "opacity", "0");
      rearSpin += dt * 1500 * k;
      const roll = ((x + len / 2 + 60) / L.sBurn / 74) * DEG;
      spin(sideWheels[0], roll + rearSpin);
      spin(sideWheels[1], roll);
      blur = 5 * (1 - bi);
      popup(1);
    }
    vis(el.side, sideOn);
    w.cls(el.side, "is-flying", flying);
    if (sideOn) {
      const b = reduced ? 0 : blur;
      if (mblur) w.attr(mblur, "stdDeviation", `${f1(b)} 0`);
      w.attr(sideRoot, "filter", b > 0.3 ? "url(#f-mblur)" : "none");
    }

    /* the red band and its ticker */
    let bandY = H + 4;
    if (u >= 2 && u < 9.1) {
      bandY = lerp(H + 4, L.bandTop, E.out3(seg(u, 2.0, 2.4)));
      if (u > 6.5) bandY = lerp(L.bandTop, L.bandLow, E.inOut3(seg(u, 6.5, 6.85)));
      if (u > 8.7) bandY = lerp(L.bandLow, H + 4, E.in2(seg(u, 8.7, 9.1)));
    }
    const bandOn = bandY < H;
    vis(el.band, bandOn);
    if (bandOn) {
      w.css(el.band, "transform", `translateY(${f1(bandY)}px)`);
      const boost = W * 2.6 * E.in2(seg(u, 5.6, 6.5));
      const tx = -(((reduced ? 0 : t * 36) + u * 260 + boost) % L.tickW);
      w.css(el.tickerTrack, "transform", `translateX(${f1(tx)}px)`);
      const sm = reduced ? 0 : 48 * E.in2(seg(u, 5.6, 6.35)) * (1 - seg(u, 6.5, 6.85));
      if (smear) w.attr(smear, "stdDeviation", `${f1(sm)} 0`);
      w.css(el.tickerTrack, "filter", sm > 0.3 ? "url(#f-smear)" : "none");
    }

    /* S4 · numerals */
    const numsOn = u >= 6.55 && u < 8.8;
    vis(el.numsWrap, numsOn);
    if (numsOn) {
      el.nums.forEach((n, i) => {
        const r = E.out3(seg(u, 6.62 + i * 0.1, 7.0 + i * 0.1));
        const k = E.in2(seg(u, 8.3 + i * 0.05, 8.72 + i * 0.05));
        w.css(n, "transform", `translateY(${f1((1 - r + k) * (L.numH + 80))}px)`);
      });
    }

    /* S5–S6 · red panel → road → line → stem */
    const panelOn = u >= 8.6 && u < 14.95;
    vis(el.panel, panelOn);
    let lightClip = 'path("M0 0")';
    let darkClip = "none";
    if (panelOn) {
      const wp = E.inOut2(seg(u, 8.6, 9.25));
      let Lx = lerp(W * 1.75, W / 2, wp);
      const bulge = W * 0.95 * Math.pow(1 - wp, 1.6);
      let Rx = W + 4;
      if (P) {
        // phones: the paper strip would cut the caption, so the red takes the page while it reads
        Lx = lerp(Lx, 0, E.inOut3(seg(u, 9.95, 10.35)));
        Lx = lerp(Lx, W / 2 - L.bandHalf, E.inOut3(seg(u, 10.75, 10.95)));
        Rx = lerp(Rx, W / 2 + L.bandHalf, E.inOut3(seg(u, 10.75, 10.95)));
      } else {
        Lx = lerp(Lx, W / 2 - L.bandHalf, E.inOut3(seg(u, 9.95, 10.35)));
        Rx = lerp(Rx, W / 2 + L.bandHalf, E.inOut3(seg(u, 10.25, 10.6)));
      }
      const nr = E.inOut3(seg(u, 10.95, 11.45));
      Lx = lerp(Lx, word.xStem - word.sw / 2, nr);
      Rx = lerp(Rx, word.xStem + word.sw / 2, nr);
      const Ty = lerp(0, word.yCap, E.inOut3(seg(u, 11.4, 11.75)));
      const y1 = Ty + (H - Ty) * 0.3;
      const y2 = Ty + (H - Ty) * 0.7;
      const d = `M${f1(Lx)} ${f1(Ty)} C${f1(Lx - bulge)} ${f1(y1)} ${f1(Lx - bulge)} ${f1(y2)} ${f1(Lx)} ${f1(H)} L${f1(Rx)} ${f1(H)} L${f1(Rx)} ${f1(Ty)} Z`;
      w.css(el.panel, "clipPath", `path("${d}")`);
      lightClip = `path("${d}")`;
      darkClip = `path(evenodd, "M0 0 H${W} V${H} H0 Z ${d}")`;
      const laneO = seg(u, 9.95, 10.2) * (1 - seg(u, 10.5, 10.8));
      vis(el.lane, laneO > 0);
      w.css(el.lane, "opacity", f3(laneO));
      w.css(el.lane, "backgroundPositionY", `${f1(((u * 1300 + (reduced ? 0 : t * 80)) % 120))}px`);
    }

    /* S5 · plan view */
    const topOn = u >= 9.0 && u < 11.2;
    vis(el.top, topOn);
    if (topOn) {
      const tin = E.out3(seg(u, 9.0, 9.6));
      const tout = E.in2(seg(u, 10.55, 10.95));
      const yStop = H * 0.56;
      const cy = lerp(H + L.topLen / 2 + 30, yStop, tin) - (yStop + L.topLen / 2 + 30) * tout;
      place(el.top, W / 2, cy, L.sTop, L.sTop, 520, 250, -90);
    }
    const dimO = seg(u, 10.2, 10.4) * (1 - seg(u, 10.55, 10.7));
    vis(el.dims, dimO > 0);
    w.css(el.dims, "opacity", f3(dimO));

    /* S6 · the name */
    const wordOn = u >= 11.5 && u < 14.95;
    vis(el.word, wordOn);
    if (wordOn) {
      const cb = E.out3(seg(u, 11.65, 11.95));
      for (const s of word.cross) w.css(s.el, "strokeDashoffset", f2(s.len * (1 - cb)));
      word.letters.forEach((s, i) => {
        const p = E.inOut2(seg(u, 11.85 + i * 0.085, 12.17 + i * 0.085));
        w.css(s.el, "strokeDashoffset", f2(s.len * (1 - p)));
      });
    }

    /* S7 · burnout smoke and white-out */
    const smokeOn = u >= 13.55 && u < 15.6;
    vis(el.smoke, smokeOn);
    if (smokeOn) {
      const tau = seg(u, 13.6, 14.95) * SMOKE_DURATION;
      smoke.render(tau, reduced ? 0 : t, L.smokeX, L.smokeY, 1 - seg(u, 15.0, 15.55), L.smokeScale, 74 * L.sBurn);
    } else smoke.clear();
    const fog = E.inOut2(seg(u, 14.4, 14.85)) * (1 - E.inOut2(seg(u, 14.95, 15.5)));
    vis(el.fog, fog > 0.001);
    w.css(el.fog, "opacity", f3(fog));

    /* S8 · dusk */
    const duskOn = u >= 14.8;
    vis(el.dusk, duskOn);
    if (duskOn) {
      const away = E.inOut2(seg(u, 14.9, 17));
      const r = lerp(1, 0.4, away);
      const s = L.sNight * r;
      const gy = dusk.horizon + (L.nightY0 - dusk.horizon) * r;
      const bob = reduced ? 0 : Math.sin(t * 7.3) * 0.5;
      place(el.night, W / 2, gy + bob, s, s, 240, 270);
      dusk.render((u - 14.9) * 10 + (reduced ? 0 : t * 0.9), { x: W / 2, y: gy, s, lamp: 1 });
      const sc = 1 + 0.22 * away;
      w.css(el.palmL, "transform", `translateX(${f1(-W * 0.05 * away)}px) scale(${f3(sc)})`);
      w.css(el.palmR, "transform", `translateX(${f1(W * 0.05 * away)}px) scale(${f3(sc)})`);
      const fo = E.out3(seg(u, 15.55, 16.15));
      vis(el.finale, fo > 0.01);
      w.css(el.finale, "opacity", f3(fo));
      w.css(el.finale, "transform", `translateY(${f1(16 * (1 - fo))}px)`);
      w.css(el.finaleTitle, "letterSpacing", `${lerp(0.62, 0.3, fo).toFixed(3)}em`);
    }
    w.cls(root, "is-night", u >= 14.9);

    /* header + captions: a white copy clipped to the red (or the night), the dark original to the rest */
    if (u >= 14.88) {
      // the night stage owns the bar until the spec sheet slides up underneath it
      const sb = clamp(storyTop + scrollMax + H - window.scrollY, 0, H);
      lightClip = `path("M0 0 H${W} V${f1(sb)} H0 Z")`;
      darkClip = `path("M0 ${f1(sb)} H${W} V${H} H0 Z")`;
    }
    w.css(el.navLight, "clipPath", lightClip);
    w.css(el.navDark, "clipPath", darkClip);
    w.css(el.capsLight, "clipPath", lightClip);
    w.css(el.capsDark, "clipPath", darkClip);
    for (const c of caps) {
      const a = seg(u, c.a, c.a + 0.28);
      const b = seg(u, c.b - 0.28, c.b);
      const o = E.out2(a) * (1 - E.in2(b));
      const y = 12 * (1 - E.out3(a)) - 12 * E.in2(b);
      for (const n of [c.dark, c.light]) {
        vis(n, o > 0.001);
        w.css(n, "opacity", f3(o));
        w.css(n, "transform", `translateY(${f1(y)}px)`);
      }
    }
    void P;
  }

  function popup(p: number) {
    w.attr(sidePopup, "transform", `translate(0 ${f2(34 * (1 - p))}) rotate(${f2(24 * (1 - p))} 906 141)`);
    w.attr(sideFlare, "opacity", f3(seg(p, 0.6, 1) * 0.9));
    w.attr(sideShadow, "opacity", "1");
  }

  /* ---------- loop ---------- */
  let uT = 0;
  let uS = 0;
  let time = 0;
  let last = performance.now();
  let raf = 0;
  const readScroll = () => {
    uT = (clamp(window.scrollY - storyTop, 0, scrollMax) / scrollMax) * U_TOTAL;
  };
  const tick = (now: number) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    readScroll();
    if (reduced) uS = uT;
    else {
      uS += (uT - uS) * (1 - Math.exp(-dt * 8.5));
      if (Math.abs(uT - uS) < 0.0004) uS = uT;
    }
    time += dt;
    render(uS, time, dt);
    raf = requestAnimationFrame(tick);
  };

  layout();
  uS = uT;
  root.classList.add("is-live");
  raf = requestAnimationFrame(tick);

  const ro = new ResizeObserver(() => layout());
  ro.observe(stage);
  const onResize = () => layout();
  window.addEventListener("resize", onResize);
  // web fonts change the ticker and numeral metrics
  document.fonts?.ready.then(() => layout());

  /* chapter links: scroll to a point on the timeline */
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest<HTMLElement>("[data-jump]");
    if (!a) return;
    e.preventDefault();
    const u = Number(a.dataset.jump);
    window.scrollTo({ top: storyTop + (u / U_TOTAL) * scrollMax, behavior: reduced ? "auto" : "smooth" });
  };
  document.addEventListener("click", onClick);

  /* the spec sheet drawing pencils itself in when it arrives */
  const specStrokes = all<SVGGeometryElement>(".spec-drawing .sk", document);
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      specStrokes.forEach((g, i) => {
        g.style.transition = reduced ? "none" : `stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1) ${Math.min(i * 0.035, 1.1)}s`;
        g.style.strokeDashoffset = "0";
      });
      io.disconnect();
    },
    { threshold: 0.3 },
  );
  specStrokes.forEach((g) => {
    const len = g.getTotalLength();
    g.style.strokeDasharray = `${len} ${len}`;
    g.style.strokeDashoffset = `${len}`;
  });
  const specFig = document.querySelector(".spec-drawing");
  if (specFig) io.observe(specFig);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("resize", onResize);
    document.removeEventListener("click", onClick);
    reduceMq.removeEventListener("change", onReduce);
    root.classList.remove("is-live");
  };
}
