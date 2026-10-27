import { clamp, mulberry32, sstep } from "./math";

/**
 * Tyre smoke for the burnout. Every particle is a pure function of simulated time τ,
 * so scrolling backwards un-billows the cloud exactly. Real time only adds a slow drift.
 */

type Particle = {
  t0: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  buoy: number;
  r0: number;
  grow: number;
  life: number;
  rot: number;
  spin: number;
  wob: number;
  alpha: number;
  sprite: number;
};

function makeSprite(seed: number, shade: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const rnd = mulberry32(seed);
  for (let i = 0; i < 16; i++) {
    const x = 64 + (rnd() - 0.5) * 46;
    const y = 64 + (rnd() - 0.5) * 46;
    const r = 20 + rnd() * 36;
    const a = 0.16 + rnd() * 0.22;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const s = shade + Math.round((rnd() - 0.5) * 18);
    grd.addColorStop(0, `rgba(${s},${s},${s + 4},${a})`);
    grd.addColorStop(0.55, `rgba(${s},${s},${s + 4},${a * 0.55})`);
    grd.addColorStop(1, `rgba(${s},${s},${s + 4},0)`);
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

export const SMOKE_DURATION = 4.4; // seconds of simulated time across the scene

export function createSmoke(canvas: HTMLCanvasElement, count: number) {
  const ctx = canvas.getContext("2d")!;
  const sprites = [makeSprite(11, 196), makeSprite(23, 214), makeSprite(37, 176), makeSprite(41, 228)];
  const rnd = mulberry32(1984);
  const parts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const k = i / count; // later particles are bigger and faster: they are the ones that fill the screen
    // spawn across the tyre's contact patch and vary size per puff, so young puffs never stack into rings
    parts.push({
      t0: k * SMOKE_DURATION * 0.92 + rnd() * 0.05,
      ox: (rnd() - 0.5) * 1.2,
      oy: (rnd() - 0.5) * 0.5,
      vx: 140 + rnd() * 260 + k * 220,
      vy: 18 + rnd() * 70,
      buoy: 6 + rnd() * 22,
      r0: (26 + k * 60) * (0.6 + rnd() * 0.8),
      grow: (70 + rnd() * 120 + k * 260) * (0.6 + rnd() * 0.8),
      life: 2.6 + rnd() * 1.8,
      rot: rnd() * Math.PI * 2,
      spin: (rnd() - 0.5) * 0.6,
      wob: rnd() * 10,
      alpha: 0.55 + rnd() * 0.45,
      sprite: Math.floor(rnd() * sprites.length),
    });
  }

  let W = 0;
  let H = 0;
  let dpr = 1;
  let dirty = false;

  return {
    resize(w: number, h: number) {
      W = w;
      H = h;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      dirty = true;
    },
    clear() {
      if (!dirty) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dirty = false;
    },
    /** τ: simulated seconds · ex/ey: tyre contact point · fade: global opacity · scale: viewport factor · wheelR: tyre radius in px */
    render(tau: number, time: number, ex: number, ey: number, fade: number, scale: number, wheelR: number) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dirty = true;
      if (fade <= 0.001) return;
      for (const p of parts) {
        const age = tau - p.t0;
        if (age <= 0 || age > p.life) continue;
        const k = age / p.life;
        const drift = Math.sin(time * 0.7 + p.wob) * 10 * k;
        const x = ex + p.ox * wheelR - ((p.vx * (1 - Math.exp(-age * 0.85))) / 0.85) * scale + drift;
        const y = ey + p.oy * wheelR - (p.vy * age + p.buoy * age * age) * scale + Math.cos(time * 0.5 + p.wob) * 6 * k;
        const size = (p.r0 + p.grow * age) * scale;
        const a = p.alpha * sstep(clamp(k / 0.07)) * (1 - sstep(clamp((k - 0.6) / 0.4))) * fade;
        if (a < 0.004 || x + size < -40 || y + size < -40 || x - size > W + 40 || y - size > H + 40) continue;
        const ang = p.rot + p.spin * age;
        const c = Math.cos(ang) * dpr;
        const s = Math.sin(ang) * dpr;
        ctx.setTransform(c, s, -s, c, x * dpr, y * dpr);
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[p.sprite], -size / 2, -size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    },
  };
}

export type Smoke = ReturnType<typeof createSmoke>;
