"use client";

import { useEffect, useRef } from "react";
import { startEngine } from "@/lib/engine";
import { RearCar, RearSketch, SideCar, SideSketch, ThreeQuarterCar, TopCar } from "./cars";

const TICKER = ["Testarossa", "4.9 L flat-twelve", "390 CV", "0–100 km/h 5.8 s", "290 km/h", "1984"];

const NUMS = [
  { v: "12", unit: "cyl" },
  { v: "390", unit: "CV" },
  { v: "290", unit: "km/h" },
];

const CAPS = [
  { a: 2.95, b: 4.45, t: "Lamps behind louvres", d: "A full-width grille, with the tail-lamps glowing through the slats." },
  { a: 4.85, b: 6.35, t: "Mid-mounted flat-twelve", d: "4.9 litres and 48 valves, right behind the seats." },
  { a: 9.55, b: 10.75, t: "1,976 mm across the hips", d: "Radiators moved to the flanks. The strakes feed them air." },
  {
    a: 12.45,
    b: 13.3,
    t: "Testa rossa: “red head”",
    d: "Named for the red-painted cam covers on its flat-twelve.",
    name: true,
  },
];

function Captions({ light = false }: { light?: boolean }) {
  return (
    <div className={`layer l-caps ${light ? "l-caps--light" : "l-caps--dark"}`} aria-hidden={light || undefined}>
      {CAPS.map((c) => (
        <p key={c.t} className={`cap${c.name ? " cap--name" : ""}`} data-in={c.a} data-out={c.b}>
          <b>{c.t}</b>
          {c.d}
        </p>
      ))}
    </div>
  );
}

const PALM_B = [
  "M-22,-452 C-70,-488 -150,-482 -214,-430 C-150,-458 -88,-458 -20,-440 Z",
  "M-22,-452 C-86,-470 -168,-436 -228,-356 C-160,-414 -96,-436 -22,-440 Z",
  "M-22,-452 C-58,-442 -104,-394 -118,-324 C-90,-388 -58,-418 -22,-440 Z",
  "M-22,-452 C24,-494 104,-500 168,-452 C102,-472 40,-468 -20,-440 Z",
  "M-22,-452 C44,-474 128,-446 184,-372 C120,-426 54,-446 -20,-440 Z",
  "M-22,-452 C8,-446 52,-404 68,-340 C40,-398 10,-424 -22,-440 Z",
  "M-22,-454 C-34,-494 -64,-520 -102,-528 C-74,-502 -54,-478 -28,-448 Z",
  "M-22,-454 C-6,-490 18,-512 50,-520 C30,-494 12,-472 -16,-448 Z",
];

/** The right-hand palm: leans the other way, with its own fronds. */
function PalmB({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="-260 -540 520 550" aria-hidden="true" focusable="false">
      <g fill="#0A0611">
        <path d="M14,10 C10,-150 -6,-320 -28,-454 L-16,-456 C6,-320 22,-150 38,10 Z" />
        {PALM_B.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

function Palm({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="-260 -470 520 480" aria-hidden="true" focusable="false">
      <g fill="#0A0611">
        <path d="M-12,10 C-10,-140 6,-300 22,-428 L33,-426 C20,-300 8,-140 12,10 Z" />
        {[
          "M28,-430 C70,-470 150,-468 214,-410 C150,-440 90,-440 28,-420 Z",
          "M28,-430 C90,-452 170,-420 222,-344 C160,-400 96,-418 28,-420 Z",
          "M28,-430 C60,-420 110,-370 128,-300 C96,-366 62,-396 26,-418 Z",
          "M28,-430 C-14,-470 -96,-470 -162,-414 C-96,-442 -36,-442 26,-420 Z",
          "M28,-430 C-36,-450 -118,-414 -170,-340 C-108,-398 -44,-418 26,-420 Z",
          "M28,-430 C-6,-420 -56,-372 -76,-304 C-42,-368 -8,-396 28,-418 Z",
          "M28,-432 C30,-470 54,-500 92,-512 C66,-486 50,-462 34,-428 Z",
        ].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

export function Story() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return startEngine(node);
  }, []);

  return (
    <section ref={ref} className="story" data-story aria-label="The Testarossa, drawn by scroll">
      <div className="stage" data-stage>
        <div className="layer l-grid" aria-hidden="true" />

        <svg className="layer l-track" aria-hidden="true" focusable="false">
          <g filter="url(#f-pencil-track-b)">
            <path className="track-ghost" />
          </g>
          <g filter="url(#f-pencil-track)">
            <path className="track-main" />
          </g>
          <circle className="track-tip" r={3} />
        </svg>
        <div className="car l-pathcar" aria-hidden="true">
          <SideSketch />
        </div>

        <div className="l-intro absolute top-[calc(64px+clamp(20px,8vh,96px))] left-4 max-w-[calc(100vw-32px)] sm:left-8 lg:left-12">
          <h1 className="m-0 mb-[.55em] font-wide text-[clamp(26px,3.4vw,3.5rem)] leading-none tracking-[.06em] text-ink uppercase">
            Testarossa
          </h1>
          <p className="m-0 mb-7 max-w-[34ch] text-[clamp(16px,1.3vw,20px)] leading-normal text-ink-2">
            Twelve cylinders laid flat and a body drawn wide. Scroll, and watch it come off the page.
          </p>
          <p className="cue m-0 inline-flex items-center gap-3.5 font-wide text-[10px] tracking-[.24em] text-ink uppercase" aria-hidden="true">
            Scroll to draw
          </p>
        </div>

        <div className="l-titleblock" aria-hidden="true">
          <span>Testarossa</span>
          <span>1984</span>
          <span>Elevazione laterale</span>
          <span>Matita</span>
        </div>

        <div className="layer l-nums" aria-hidden="true">
          {NUMS.map((n) => (
            <div key={n.v} className="num">
              <span className="num-v">
                {n.v}
                <span className="num-u">{n.unit}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="layer l-band" aria-hidden="true">
          <div className="ticker">
            <div className="ticker-track">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="ticker-group">
                  {TICKER.map((item) => (
                    <span key={item} className="ticker-item">
                      {item}
                      <i />
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="l-gshadow" aria-hidden="true" />
        <div className="l-puff" aria-hidden="true" />

        <div className="car l-rear" aria-hidden="true">
          <div className="rear-render">
            <RearCar />
          </div>
          <div className="rear-sketch">
            <RearSketch />
          </div>
        </div>

        <div className="car l-tq" aria-hidden="true">
          <ThreeQuarterCar />
        </div>

        <div className="layer l-panel" aria-hidden="true">
          <div className="lane" />
        </div>
        <svg className="layer l-dims" aria-hidden="true" focusable="false">
          <path className="dim-w" />
          <path className="dim-l" />
          <text className="dim-w-t" textAnchor="middle">
            1 976
          </text>
          <text className="dim-l-t" textAnchor="middle">
            4 485
          </text>
        </svg>
        <div className="car l-top" aria-hidden="true">
          <TopCar />
        </div>

        <svg className="layer l-word" aria-hidden="true" focusable="false" />

        <div className="car l-side" aria-hidden="true">
          <SideCar />
        </div>

        <canvas className="layer l-smoke" aria-hidden="true" />
        <div className="layer l-fog" aria-hidden="true" />

        <div className="layer l-dusk">
          <canvas className="dusk-canvas" aria-hidden="true" />
          <Palm className="palm palm-l" />
          <PalmB className="palm palm-r" />
          <div className="car l-night" aria-hidden="true">
            <RearCar night />
          </div>
          <div className="finale absolute inset-x-0 top-[calc(64px+3vh)] px-4 text-center text-white">
            <h2 className="finale-title m-0 mb-[18px] pl-[.3em] font-wide text-[clamp(24px,6vw,6rem)] leading-none font-normal tracking-[.3em] uppercase">
              Testarossa
            </h2>
            <p className="m-0 mb-7 font-cond text-[clamp(13px,1.15vw,17px)] font-semibold tracking-[.28em] text-[#FFE2D4]/80 uppercase">
              1984 — 1991 · 7,177 built
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                className="inline-flex min-h-11 items-center rounded-full bg-rosso px-[22px] font-wide text-[10px] tracking-[.22em] text-white uppercase no-underline transition-colors duration-300 hover:bg-white hover:text-rosso-deep"
                href="#specs"
              >
                Read the spec sheet
              </a>
              <a
                className="inline-flex min-h-11 items-center rounded-full border border-white/55 px-[22px] font-wide text-[10px] tracking-[.22em] text-white uppercase no-underline transition-colors duration-300 hover:border-white hover:bg-white/10"
                href="#top"
                data-jump="0"
              >
                Draw it again
              </a>
            </div>
          </div>
        </div>

        <Captions />
        <Captions light />
      </div>
    </section>
  );
}
