import { clamp, mulberry32 } from "./math";

/**
 * The closing scene: a 1984 dusk. Sky, stars, a banded sun and the hills are baked
 * once per resize; the road, its dashes and the perspective grid are drawn per frame
 * so the ground keeps rolling toward the viewer.
 */
export function createDusk(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const back = document.createElement("canvas");
  const bctx = back.getContext("2d")!;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let horizon = 0;
  let vpx = 0;
  let roadHalf = 0;

  function bake() {
    back.width = canvas.width;
    back.height = canvas.height;
    const g = bctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#07061A");
    sky.addColorStop(0.42, "#1C0B33");
    sky.addColorStop(0.7, "#541748");
    sky.addColorStop(0.9, "#B0324F");
    sky.addColorStop(1, "#EE774B");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, horizon + 2);

    const rnd = mulberry32(84);
    const stars = Math.round((W * horizon) / 5200);
    for (let i = 0; i < stars; i++) {
      const x = rnd() * W;
      const y = Math.pow(rnd(), 1.6) * horizon * 0.72;
      const a = (1 - y / (horizon * 0.72)) * (0.25 + rnd() * 0.65);
      const r = rnd() < 0.08 ? 1.3 : 0.7;
      g.fillStyle = `rgba(255,240,236,${a.toFixed(3)})`;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }

    const R = Math.min(H * 0.19, W * 0.24);
    const sunY = horizon - R * 0.38;
    const glow = g.createRadialGradient(vpx, sunY, R * 0.4, vpx, sunY, R * 3.2);
    glow.addColorStop(0, "rgba(255,138,92,0.42)");
    glow.addColorStop(0.45, "rgba(214,60,90,0.16)");
    glow.addColorStop(1, "rgba(120,20,80,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, W, horizon);

    // banded sun, cut on its own canvas so the stripes reveal the sky behind
    const sun = document.createElement("canvas");
    const sd = Math.ceil(R * 2 * dpr);
    sun.width = sun.height = sd;
    const sg = sun.getContext("2d")!;
    sg.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sunFill = sg.createLinearGradient(0, 0, 0, R * 2);
    sunFill.addColorStop(0, "#FFE7A3");
    sunFill.addColorStop(0.5, "#FFA45A");
    sunFill.addColorStop(1, "#FF4A62");
    sg.fillStyle = sunFill;
    sg.beginPath();
    sg.arc(R, R, R, 0, Math.PI * 2);
    sg.fill();
    sg.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 8; i++) {
      const y = R + R * (-0.2 + i * 0.105);
      sg.fillRect(0, y, R * 2, R * (0.012 + i * 0.011));
    }
    g.drawImage(sun, vpx - R, sunY - R, R * 2, R * 2);

    const ridge = (color: string, amp: number, seed: number, step: number) => {
      const r2 = mulberry32(seed);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(0, horizon + 1);
      let y = horizon - amp * 0.4;
      for (let x = 0; x <= W + step; x += step) {
        y = clamp(y + (r2() - 0.5) * amp * 0.7, horizon - amp, horizon - amp * 0.12);
        // keep a low saddle under the sun so it sets into the road
        const near = Math.abs(x - vpx) / (W * 0.18);
        g.lineTo(x, near < 1 ? horizon - (horizon - y) * (0.35 + 0.65 * near) : y);
      }
      g.lineTo(W, horizon + 1);
      g.closePath();
      g.fill();
    };
    ridge("#3A1442", H * 0.07, 3, Math.max(18, W / 60));
    ridge("#1D0A2A", H * 0.045, 9, Math.max(14, W / 80));
  }

  return {
    get horizon() {
      return horizon;
    },
    get vpx() {
      return vpx;
    },
    get roadHalf() {
      return roadHalf;
    },
    resize(w: number, h: number, portrait: boolean) {
      W = w;
      H = h;
      dpr = Math.min(1.75, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      horizon = Math.round(h * (portrait ? 0.56 : 0.6));
      vpx = w / 2;
      roadHalf = portrait ? w * 0.46 : Math.max(w * 0.2, h * 0.32);
      bake();
    },
    /** z: distance travelled (ground units) · car: screen position and scale of the car for lamp reflections */
    render(z: number, car: { x: number; y: number; s: number; lamp: number }) {
      const g = ctx;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(back, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      const depth = H - horizon;
      const ground = g.createLinearGradient(0, horizon, 0, H);
      ground.addColorStop(0, "#1A0A26");
      ground.addColorStop(1, "#050309");
      g.fillStyle = ground;
      g.fillRect(0, horizon, W, depth);

      // sun reflection on the ground: a soft half-ellipse, no hard edges
      const rr = W * 0.14;
      g.save();
      g.translate(vpx, horizon);
      g.scale(1, (depth * 0.75) / rr);
      const refl = g.createRadialGradient(0, 0, 0, 0, 0, rr);
      refl.addColorStop(0, "rgba(255,128,92,0.3)");
      refl.addColorStop(1, "rgba(255,128,92,0)");
      g.fillStyle = refl;
      g.beginPath();
      g.arc(0, 0, rr, 0, Math.PI);
      g.fill();
      g.restore();

      // perspective grid
      const gridAlpha = g.createLinearGradient(0, horizon, 0, H);
      // the opening's drafting grid, laid down as the floor: paper-grey lines on night
      gridAlpha.addColorStop(0, "rgba(238,239,240,0)");
      gridAlpha.addColorStop(0.25, "rgba(238,239,240,0.1)");
      gridAlpha.addColorStop(1, "rgba(238,239,240,0.32)");
      g.strokeStyle = gridAlpha;
      g.lineWidth = 1;
      g.beginPath();
      const spacing = roadHalf * 0.55;
      for (let k = -16; k <= 16; k++) {
        g.moveTo(vpx, horizon);
        g.lineTo(vpx + k * spacing * 2.2, H + depth * 0.2);
      }
      const phase = z % 1;
      for (let i = 0; i < 46; i++) {
        const zz = 1 + i * 0.75 - phase * 0.75;
        if (zz < 0.85) continue;
        const y = horizon + depth / zz;
        if (y > H + 2) continue;
        g.moveTo(0, y);
        g.lineTo(W, y);
      }
      g.stroke();

      // Rosso horizon
      g.fillStyle = "rgba(211,21,28,0.9)";
      g.fillRect(0, horizon - 0.75, W, 1.5);

      // road
      g.fillStyle = "#0A0510";
      g.beginPath();
      g.moveTo(vpx - 1, horizon);
      g.lineTo(vpx + 1, horizon);
      g.lineTo(vpx + roadHalf, H);
      g.lineTo(vpx - roadHalf, H);
      g.closePath();
      g.fill();
      const edge = g.createLinearGradient(0, horizon, 0, H);
      edge.addColorStop(0, "rgba(255,214,190,0)");
      edge.addColorStop(1, "rgba(255,214,190,0.6)");
      g.strokeStyle = edge;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(vpx, horizon);
      g.lineTo(vpx - roadHalf * 0.94, H);
      g.moveTo(vpx, horizon);
      g.lineTo(vpx + roadHalf * 0.94, H);
      g.stroke();

      // centre dashes
      g.fillStyle = "rgba(255,200,120,0.85)";
      const dz = 2.4;
      const dphase = (z * 1.333) % dz;
      for (let j = 0; j < 24; j++) {
        const z1 = 1 + j * dz - dphase;
        const z2 = z1 + dz * 0.45;
        if (z2 < 0.7) continue;
        const a1 = Math.max(z1, 0.7);
        const y1 = horizon + depth / a1;
        const y2 = horizon + depth / z2;
        const w1 = (roadHalf * 0.022) / a1;
        const w2 = (roadHalf * 0.022) / z2;
        g.beginPath();
        g.moveTo(vpx - w1, y1);
        g.lineTo(vpx + w1, y1);
        g.lineTo(vpx + w2, y2);
        g.lineTo(vpx - w2, y2);
        g.closePath();
        g.fill();
      }

      // tail-lamp light pooling on the road under the car
      if (car.lamp > 0.01 && car.s > 0) {
        g.globalCompositeOperation = "lighter";
        for (const side of [-1, 1]) {
          const lx = car.x + side * 148 * car.s;
          const rad = 70 * car.s;
          const pool = g.createRadialGradient(lx, car.y + 6 * car.s, 0, lx, car.y + 6 * car.s, rad * 1.6);
          pool.addColorStop(0, `rgba(255,40,30,${0.3 * car.lamp})`);
          pool.addColorStop(1, "rgba(255,40,30,0)");
          g.fillStyle = pool;
          g.beginPath();
          g.ellipse(lx, car.y + 6 * car.s, rad * 0.9, rad * 1.6, 0, 0, Math.PI * 2);
          g.fill();
        }
        g.globalCompositeOperation = "source-over";
      }
    },
  };
}

export type Dusk = ReturnType<typeof createDusk>;
