/**
 * Builds the stroke-drawn name: a drop-cap T whose stem is the red line left over
 * from the wipe, then ESTA on the first line and ROSSA hanging off the stem below.
 * Letterforms are squared, extended and monoline — drawn here, not taken from any font.
 */

const NS = "http://www.w3.org/2000/svg";

export type Stroke = { el: SVGGeometryElement; len: number };

export type WordLayout = {
  h: number;
  sw: number;
  lw: number;
  gap: number;
  xT: number;
  xStem: number;
  yCap: number;
  x2: number;
  y2: number;
  cross: Stroke[];
  letters: Stroke[];
};

/**
 * Centre-line paths inside a letter box. `hs` is half the stroke: free ends run out by
 * it so every terminal lands on the box edge, and the R leg runs past the baseline
 * where the line clip squares it off.
 */
function letter(ch: string, x0: number, y0: number, x1: number, y1: number, r: number, hs: number): string {
  const ym = (y0 + y1) / 2;
  const w = x1 - x0;
  const h = y1 - y0;
  switch (ch) {
    case "E":
      return `M${x1 + hs},${y0} H${x0 + r} A${r},${r} 0 0 0 ${x0},${y0 + r} V${y1 - r} A${r},${r} 0 0 0 ${x0 + r},${y1} H${x1 + hs} M${x0},${ym} H${x1 - w * 0.1}`;
    case "S":
      return `M${x1 + hs},${y0} H${x0 + r} A${r},${r} 0 0 0 ${x0},${y0 + r} V${ym - r} A${r},${r} 0 0 0 ${x0 + r},${ym} H${x1 - r} A${r},${r} 0 0 1 ${x1},${ym + r} V${y1 - r} A${r},${r} 0 0 1 ${x1 - r},${y1} H${x0 - hs}`;
    case "T":
      return `M${x0 - hs},${y0} H${x1 + hs} M${(x0 + x1) / 2},${y0} V${y1 + hs}`;
    case "A":
      return `M${x0},${y1 + hs} V${y0 + r} A${r},${r} 0 0 1 ${x0 + r},${y0} H${x1 - r} A${r},${r} 0 0 1 ${x1},${y0 + r} V${y1 + hs} M${x0},${ym + h * 0.06} H${x1}`;
    case "R":
      return `M${x0},${y1 + hs} V${y0} H${x1 - r} A${r},${r} 0 0 1 ${x1},${y0 + r} V${ym - r} A${r},${r} 0 0 1 ${x1 - r},${ym} H${x0} M${x0 + w * 0.5},${ym} L${x1 + hs * 0.7},${y1 + hs * 1.8}`;
    case "O":
      return `M${x0 + r},${y0} H${x1 - r} A${r},${r} 0 0 1 ${x1},${y0 + r} V${y1 - r} A${r},${r} 0 0 1 ${x1 - r},${y1} H${x0 + r} A${r},${r} 0 0 1 ${x0},${y1 - r} V${y0 + r} A${r},${r} 0 0 1 ${x0 + r},${y0} Z`;
    default:
      return "";
  }
}

function addPath(svg: SVGSVGElement, d: string, sw: number, cls: string): Stroke {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d);
  p.setAttribute("class", cls);
  p.setAttribute("stroke-width", sw.toFixed(2));
  svg.appendChild(p);
  const len = p.getTotalLength();
  p.style.strokeDasharray = `${len} ${len}`;
  p.style.strokeDashoffset = `${len}`;
  return { el: p, len };
}

export function buildWordmark(svg: SVGSVGElement, W: number, H: number, portrait: boolean): WordLayout {
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const margin = portrait ? W * 0.07 : W * 0.075;
  const kw = portrait ? 1.02 : 1.16; // letter width / cap height
  const kg = portrait ? 0.24 : 0.3; // gap / cap height
  const ksw = 0.17; // stroke / cap height
  // line 2 is the widest run: it starts right of the stem and carries five letters
  const totalK = kw / 2 + ksw / 2 + kg + 5 * kw + 4 * kg;
  const h = Math.min((W - margin * 2) / totalK, H * (portrait ? 0.1 : 0.165));
  const sw = h * ksw;
  const lw = h * kw;
  const gap = h * kg;
  const r = h * 0.2;

  const xT = margin;
  const xStem = xT + lw / 2;
  const yCap = portrait ? H * 0.27 : H * 0.235;
  const x2 = xStem + sw / 2 + gap;
  const y2 = yCap + h * 1.42;

  const box = (x: number, y: number) => [x + sw / 2, y + sw / 2, x + lw - sw / 2, y + h - sw / 2] as const;

  const yBar = yCap + sw / 2;
  const cross = [
    addPath(svg, `M${xStem},${yBar} H${xT}`, sw, "wm wm-cross"),
    addPath(svg, `M${xStem},${yBar} H${xT + lw}`, sw, "wm wm-cross"),
  ];

  const defs = document.createElementNS(NS, "defs");
  svg.appendChild(defs);
  const lineClip = (id: string, y: number) => {
    const cp = document.createElementNS(NS, "clipPath");
    cp.setAttribute("id", id);
    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", y.toFixed(2));
    rect.setAttribute("width", String(W));
    rect.setAttribute("height", h.toFixed(2));
    cp.appendChild(rect);
    defs.appendChild(cp);
  };
  lineClip("wm-l1", yCap);
  lineClip("wm-l2", y2);

  const letters: Stroke[] = [];
  "ESTA".split("").forEach((ch, i) => {
    const [x0, y0, x1, y1] = box(xT + lw + gap + i * (lw + gap), yCap);
    const s = addPath(svg, letter(ch, x0, y0, x1, y1, Math.max(0, r - sw / 2), sw / 2), sw, "wm");
    s.el.setAttribute("clip-path", "url(#wm-l1)");
    letters.push(s);
  });
  "ROSSA".split("").forEach((ch, i) => {
    const [x0, y0, x1, y1] = box(x2 + i * (lw + gap), y2);
    const s = addPath(svg, letter(ch, x0, y0, x1, y1, Math.max(0, r - sw / 2), sw / 2), sw, "wm");
    s.el.setAttribute("clip-path", "url(#wm-l2)");
    letters.push(s);
  });

  return { h, sw, lw, gap, xT, xStem, yCap, x2, y2, cross, letters };
}
