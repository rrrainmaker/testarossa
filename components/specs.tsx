import { SideSketchGroup } from "./cars";

const SPECS = [
  ["Engine", "Flat-twelve, 48 valves"],
  ["Displacement", "4,943 cc"],
  ["Power", "390 CV at 6,300 rpm"],
  ["Torque", "490 Nm at 4,500 rpm"],
  ["Gearbox", "Five-speed manual, rear drive"],
  ["0–100 km/h", "5.8 s"],
  ["Top speed", "290 km/h"],
  ["Dry weight", "1,506 kg"],
  ["Built", "1984–1991 · 7,177 cars"],
] as const;

/** Horizontal dimension line with extension lines, slash ticks and a centred figure. */
function DimH({ x1, x2, y, label, from }: { x1: number; x2: number; y: number; label: string; from: number }) {
  return (
    <g>
      <path className="sk dim-ext" d={`M${x1},${from} V${y + 8} M${x2},${from} V${y + 8}`} />
      <path className="sk" d={`M${x1},${y} H${x2} M${x1 - 6},${y + 6} L${x1 + 6},${y - 6} M${x2 - 6},${y + 6} L${x2 + 6},${y - 6}`} />
      <text x={(x1 + x2) / 2} y={y - 10} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export function Specs() {
  return (
    <section
      id="specs"
      aria-labelledby="specs-title"
      className="relative bg-paper px-4 pt-[clamp(80px,14vh,160px)] pb-[clamp(72px,12vh,140px)] sm:px-8 lg:px-14"
    >
      <div className="mx-auto grid max-w-[1240px] items-center gap-x-[clamp(28px,5vw,80px)] gap-y-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-ink pb-5 lg:col-span-2">
          <h2 id="specs-title" className="m-0 font-wide text-[clamp(24px,3vw,44px)] leading-[1.1] tracking-[.1em] uppercase">
            Spec sheet
          </h2>
          <p className="m-0 max-w-[40ch] text-ink-2">Testarossa, 1984–1991. Figures for European-market cars.</p>
        </header>

        <figure className="m-0">
          <svg
            className="spec-drawing block h-auto w-full overflow-visible"
            viewBox="-60 -70 1160 450"
            role="img"
            aria-label="Side elevation with overall length 4,485 mm, wheelbase 2,550 mm and height 1,130 mm"
          >
            <SideSketchGroup filter="f-pencil-spec" />
            <SideSketchGroup filter="f-pencil-spec-b" ghost />
            <path className="sk dim-ext" d="M-40,270 H1060" />
            <DimH x1={245} x2={814} y={318} from={276} label="2 550" />
            <DimH x1={3} x2={1000} y={366} from={276} label="4 485" />
            <path className="sk dim-ext" d="M444,13 H1074 M1008,270 H1074" />
            <path className="sk" d="M1062,13 V270 M1056,19 L1068,7 M1056,276 L1068,264" />
            <text transform="translate(1088 142) rotate(-90)" textAnchor="middle">
              1 130
            </text>
          </svg>
          <figcaption className="mt-3.5 font-wide text-[10px] tracking-[.22em] text-ink-2 uppercase">
            Side elevation · millimetres
          </figcaption>
        </figure>

        <dl className="m-0">
          {SPECS.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[minmax(8.5rem,40%)_1fr] items-baseline gap-4 border-b border-ink/15 py-3"
            >
              <dt className="font-wide text-[10px] tracking-[.2em] text-ink-2 uppercase">{k}</dt>
              <dd className="m-0 font-cond text-[clamp(19px,1.7vw,25px)] leading-tight font-semibold text-ink tabular-nums">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
