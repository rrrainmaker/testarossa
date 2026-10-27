export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Local 0..1 progress of `u` inside the window [a, b]. */
export const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a));
export const sstep = (t: number) => t * t * (3 - 2 * t);

export const ease = {
  in2: (t: number) => t * t,
  in3: (t: number) => t * t * t,
  out2: (t: number) => 1 - (1 - t) * (1 - t),
  out3: (t: number) => 1 - Math.pow(1 - t, 3),
  out4: (t: number) => 1 - Math.pow(1 - t, 4),
  inOut2: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inOut3: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

/** Small deterministic PRNG so smoke, stars and hills look the same on every visit. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
