/**
 * Original vector drawings of a wide, low 1980s flat-twelve berlinetta, in three
 * elevations. Coordinates are in "car units" (1 unit ≈ 4.5 mm). Every drawing exists
 * twice: a render (fills) and a sketch (the same outlines, stroke only) so the page can
 * pencil the car in first and paint it second.
 *
 *  side  viewBox -12 0 1024 290 · nose at x≈1000, tail at x≈3, ground y=270
 *  rear  viewBox -240 0 480 290 · centred on x=0, ground y=270
 *  top   viewBox -20 -250 1040 500 · nose pointing +x, centred on y=0
 */

/* ------------------------------------------------------------------ side */

export const SIDE = {
  body:
    "M997,191 C1001,181 1000,171 991,164 C958,150 812,114 668,92 C640,76 602,42 562,24 C530,13 470,13 438,20 C380,26 300,52 220,66 C150,77 70,84 18,88 C10,88.5 6,92 6,98 L4,148 C4,165 7,175 12,181 L22,225 C24,231 28,234 36,234 L167,234 A86,86 0 1 1 323,234 L739,234 A82,82 0 1 1 889,234 L972,236 C985,236 991,231 993,224 Z",
  dlo: "M646,97 C622,76 594,47 567,31 C540,24 482,23 449,28 C437,46 423,67 411,91 C488,93 584,95 646,97 Z",
  divider: "M476,27 L466,92",
  doorF: "M654,101 C668,142 690,190 706,232",
  doorR: "M452,95 L447,232",
  recess: "M594,118 L348,118 C342,118 340,121 340,127 L340,214 C340,219 343,222 348,222 L640,222 Z",
  bumperF: "M997,183 L897,188.5 L897,195.5 L995.5,190.5 Z",
  bumperR: "M5,170 L161,176 L161,183 L5,177 Z",
  marker: "M952,171 L978,172.5 L978,178.5 L952,177 Z",
  reflector: "M18,159 L44,160 L44,165.5 L18,164.5 Z",
  mirror:
    "M628,80 C628,73 633,69 641,69 L664,69 C670,69 673,73 673,79 L673,84 C673,89 669,92 663,92 L638,92 C632,92 628,88 628,84 Z",
  stalk: "M645,92 L650,99 L657,99 L653,92 Z",
  rocker: "M323,224 L739,226 L739,234 L323,234 Z",
  shoulder: "M968,160 C900,142 760,112 668,100 L452,98 C330,98 170,100 18,102",
  glassStreak: "M556,24 L592,24 L548,96 L510,96 Z",
  // raised pop-up headlamp pod, drawn behind the body so it hides when lowered
  pod: "M906,141 L917,117 L950,117 C952.5,117 954,118.5 954,121 L954,158 L906,158 Z",
  bezel: "M948,119 L954,119 L954,139 L948,139 Z",
};

/** The five side strakes: horizontal fins whose front ends follow the slanted door line. */
export const FINS = Array.from({ length: 5 }, (_, k) => {
  const yt = 127.6 + 18.9 * k;
  const yb = yt + 9.3;
  const xt = 594 + 0.444 * (yt - 118);
  const xb = 594 + 0.444 * (yb - 118);
  const r = (yb - yt) / 2;
  const f = (n: number) => n.toFixed(1);
  return `M${f(348)},${f(yt)} L${f(xt)},${f(yt)} L${f(xb)},${f(yb)} L${f(348)},${f(yb)} A${f(r)},${f(r)} 0 0 1 ${f(348)},${f(yt)} Z`;
});

const WHEELS_SIDE = [
  { cx: 245, cy: 196, k: 1 },
  { cx: 814, cy: 200, k: 0.946 },
];

/** The side elevation's paint. `flank` drops the glass, mirror and lamp pod for the three-quarter view. */
function SideParts({ flank = false }: { flank?: boolean }) {
  return (
    <>
      <g clipPath="url(#clip-wells)" fill="#0A0A0B">
        <circle cx={245} cy={197} r={88} />
        <circle cx={814} cy={200} r={84} />
      </g>
      {WHEELS_SIDE.map((w) => (
        <g key={w.cx} className={flank ? undefined : "c-wheel"} data-cx={w.cx} data-cy={w.cy}>
          <use href="#wheel" transform={`translate(${w.cx} ${w.cy}) scale(${w.k})`} />
        </g>
      ))}

      {flank ? null : (
        <g className="c-popup">
          <path d={SIDE.pod} fill="#C9161C" stroke="#7A0910" strokeWidth={1.4} />
          <path d="M917,117 L950,117" stroke="#F7705C" strokeWidth={2} />
          <path d={SIDE.bezel} fill="#1C1C1F" />
        </g>
      )}

      <path d={SIDE.body} fill="url(#g-body-side)" />
      <path d={SIDE.rocker} fill="#000" opacity={0.28} />
      <path d={SIDE.shoulder} fill="none" stroke="url(#g-spec)" strokeWidth={2.2} strokeLinecap="round" />

      {flank ? null : (
        <>
          <path d={SIDE.dlo} fill="url(#g-glass)" />
          <path d={SIDE.glassStreak} fill="#fff" opacity={0.1} clipPath="url(#clip-dlo)" />
          <path d={SIDE.divider} stroke="#16181B" strokeWidth={4} strokeLinecap="round" />
        </>
      )}

      <g fill="none" stroke="#5E060B" strokeOpacity={0.6} strokeWidth={1.6} strokeLinecap="round">
        <path d={SIDE.doorF} />
        <path d={SIDE.doorR} />
      </g>

      <path d={SIDE.recess} fill="#120507" />
      {FINS.map((d) => (
        <path key={d} d={d} fill="url(#g-fin)" />
      ))}

      <path d={SIDE.bumperF} fill="#151517" />
      <path d={SIDE.bumperR} fill="#151517" />
      <path d={SIDE.marker} fill="#F5A41F" />
      <path d={SIDE.reflector} fill="#8C0C12" />
      {flank ? null : (
        <>
          <path d={SIDE.stalk} fill="#1B1B1D" />
          <path d={SIDE.mirror} fill="url(#g-body-side)" stroke="#7A0910" strokeWidth={1} />
        </>
      )}
    </>
  );
}

export function SideCar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="-12 0 1024 290"
      width={1024}
      height={290}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <g className="c-root">
        <ellipse className="c-shadow" cx={505} cy={271} rx={500} ry={11} fill="url(#g-shadow)" />
        <SideParts />
        <path className="c-dim" d={SIDE.body} fill="#000" opacity={0} />
        <g className="c-flare" opacity={0}>
          <path d="M953,120 L1240,94 L1240,178 L953,140 Z" fill="url(#g-beam)" />
          <circle cx={955} cy={129} r={26} fill="url(#g-flare)" />
        </g>
      </g>
    </svg>
  );
}

/** Stroke-only twin of SideCar. Returned as a <g> so it can live inside other drawings. */
export function SideSketchGroup({
  spin = false,
  filter,
  ghost = false,
}: {
  spin?: boolean;
  filter?: string;
  ghost?: boolean;
}) {
  return (
    <g className={ghost ? "sk-group sk-ghost" : "sk-group"} filter={filter ? `url(#${filter})` : undefined}>
      <path className="sk" d={SIDE.body} />
      <path className="sk" d={SIDE.dlo} />
      <path className="sk" d={SIDE.divider} />
      <path className="sk" d={SIDE.doorF} />
      <path className="sk" d={SIDE.doorR} />
      <path className="sk" d={SIDE.recess} />
      {FINS.map((d) => (
        <path key={d} className="sk" d={d} />
      ))}
      <path className="sk" d={SIDE.bumperF} />
      <path className="sk" d={SIDE.bumperR} />
      <path className="sk" d={SIDE.mirror} />
      {WHEELS_SIDE.map((w) => (
        <g key={w.cx} className={spin ? "c-wheel" : undefined} data-cx={w.cx} data-cy={w.cy}>
          <g transform={`translate(${w.cx} ${w.cy}) scale(${w.k})`}>
            <circle className="sk" r={74} />
            <circle className="sk" r={50} />
            <circle className="sk" r={15} />
            {[0, 72, 144, 216, 288].map((a) => (
              <path key={a} className="sk" d="M-8,-13 L-16,-46 M8,-13 L16,-46" transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
}

export function SideSketch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="-12 0 1024 290"
      width={1024}
      height={290}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <SideSketchGroup spin filter="f-pencil-car" />
      <SideSketchGroup spin filter="f-pencil-car-b" ghost />
    </svg>
  );
}

/* ------------------------------------------------------------------ rear */

export const REAR = {
  body:
    "M-108,14 L108,14 C114,14 118,17 120,21 L194,80 C203,83 208,88 211,96 C219,118 223,140 222,164 C221,188 217,203 212,212 L150,214 C147,214 146,216 146,219 L146,236 C146,239 143,241 140,241 L-140,241 C-143,241 -146,239 -146,236 L-146,219 C-146,216 -147,214 -150,214 L-212,212 C-217,203 -221,188 -222,164 C-223,140 -219,118 -211,96 C-208,88 -203,83 -194,80 L-120,21 C-118,17 -114,14 -108,14 Z",
  window:
    "M-100,24 L100,24 C104,24 106,26 107,29 L117,74 C118,77 116,78 113,78 L-113,78 C-116,78 -118,77 -117,74 L-107,29 C-106,26 -104,24 -100,24 Z",
  deck: "M-113,78 L113,78 L198,83 C203,84 206,88 205,92 L-205,92 C-206,88 -203,84 -198,83 Z",
  valance: "M-146,220 L146,220 L146,236 C146,239 143,241 140,241 L-140,241 C-143,241 -146,239 -146,236 Z",
  mirrorR: "M197,94 L224,89 C231,88 236,92 236,99 L236,106 C236,111 232,114 227,114 L201,114 Z",
  mirrorL: "M-197,94 L-224,89 C-231,88 -236,92 -236,99 L-236,106 C-236,111 -232,114 -227,114 L-201,114 Z",
  rim: "M-211,96 C-208,88 -203,83 -194,80 L-120,21 C-118,17 -114,14 -108,14 L108,14 C114,14 118,17 120,21 L194,80 C203,83 208,88 211,96",
};

const SLATS = [109, 115.5, 122, 128.5, 135, 141.5, 148];
const PIPES = [-126, -104, 104, 126];

function RearLamps() {
  return (
    <>
      <g className="c-lamps">
        <rect x={-187} y={106} width={78} height={48} rx={4} fill="#4A080C" />
        <rect x={109} y={106} width={78} height={48} rx={4} fill="#4A080C" />
        <rect className="c-lamp-on" x={-187} y={106} width={78} height={48} rx={4} fill="url(#g-lamp)" opacity={0} />
        <rect className="c-lamp-on" x={109} y={106} width={78} height={48} rx={4} fill="url(#g-lamp)" opacity={0} />
        <rect x={-106} y={106} width={16} height={48} rx={3} fill="#34373C" />
        <rect x={90} y={106} width={16} height={48} rx={3} fill="#34373C" />
      </g>
      <g fill="#141416">
        {SLATS.map((y) => (
          <rect key={y} x={-192} y={y} width={384} height={3.4} />
        ))}
      </g>
      <g className="c-glow" opacity={0}>
        <rect x={-198} y={98} width={100} height={64} rx={18} fill="#FF2A1A" filter="url(#f-glow)" />
        <rect x={98} y={98} width={100} height={64} rx={18} fill="#FF2A1A" filter="url(#f-glow)" />
      </g>
    </>
  );
}

function PlateText() {
  return (
    <text
      x={0}
      y={186.8}
      textAnchor="middle"
      fontFamily="var(--font-saira-condensed), 'Arial Narrow', sans-serif"
      fontWeight={700}
      fontSize={17}
      letterSpacing={2}
      fill="#1C1C1E"
    >
      TR·1984
    </text>
  );
}

export function RearCar({ className, night = false }: { className?: string; night?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="-240 0 480 290"
      width={480}
      height={290}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <g className="c-root">
        <ellipse className="c-shadow" cx={0} cy={271} rx={238} ry={10} fill="url(#g-shadow)" />
        <rect x={-217} y={196} width={68} height={74} rx={11} fill="#121213" />
        <rect x={149} y={196} width={68} height={74} rx={11} fill="#121213" />
        <path
          d="M-206,204 V264 M-194,204 V264 M-182,204 V264 M-170,204 V264 M-158,204 V264 M160,204 V264 M172,204 V264 M184,204 V264 M196,204 V264 M208,204 V264"
          stroke="#1F1F22"
          strokeWidth={2}
        />
        <path d={REAR.mirrorR} fill="url(#g-body-rear)" stroke="#6E0910" strokeWidth={1} />
        <path d={REAR.mirrorL} fill="url(#g-body-rear)" stroke="#6E0910" strokeWidth={1} />

        <path d={REAR.body} fill="url(#g-body-rear)" />
        <path d={REAR.body} fill="url(#g-hips)" />
        <path d={REAR.window} fill="url(#g-glass)" />
        <path d={REAR.deck} fill="#F0503F" opacity={0.85} />
        <rect x={-192} y={102} width={384} height={56} rx={7} fill="#0C0C0E" />

        {night ? null : <RearLamps />}

        <rect x={-58} y={166} width={116} height={30} rx={4} fill="#860B11" />
        <rect x={-53} y={170} width={106} height={22} rx={2.5} fill="#EDEDEB" />
        <PlateText />
        <path d={REAR.valance} fill="#111113" />
        {PIPES.map((x) => (
          <g key={x}>
            <circle cx={x} cy={230} r={7.5} fill="#55585D" />
            <circle cx={x} cy={230} r={4.8} fill="#060607" />
          </g>
        ))}

        <path className="c-dim" d={REAR.body} fill={night ? "#07040C" : "#000"} opacity={night ? 0.72 : 0} />
        {night ? (
          <>
            <path d={REAR.rim} fill="none" stroke="#FFB27C" strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
            <RearLamps />
            <rect x={-40} y={162} width={80} height={6} rx={3} fill="#FFF3DA" opacity={0.55} filter="url(#f-glow)" />
          </>
        ) : null}
      </g>
    </svg>
  );
}

export function RearSketch({ className }: { className?: string }) {
  const outline = (
    <>
      <path className="sk" d={REAR.body} />
      <path className="sk" d={REAR.window} />
      <path className="sk" d="M-205,92 L205,92" />
      <rect className="sk" x={-192} y={102} width={384} height={56} rx={7} />
      <rect className="sk" x={-187} y={106} width={78} height={48} rx={4} />
      <rect className="sk" x={109} y={106} width={78} height={48} rx={4} />
      <path className="sk" d="M-192,122 H192 M-192,135 H192" />
      <rect className="sk" x={-53} y={170} width={106} height={22} rx={2.5} />
      <path className="sk" d={REAR.valance} />
      {PIPES.map((x) => (
        <circle key={x} className="sk" cx={x} cy={230} r={7.5} />
      ))}
      <rect className="sk" x={-217} y={196} width={68} height={74} rx={11} />
      <rect className="sk" x={149} y={196} width={68} height={74} rx={11} />
      <path className="sk" d={REAR.mirrorR} />
      <path className="sk" d={REAR.mirrorL} />
    </>
  );
  return (
    <svg
      className={className}
      viewBox="-240 0 480 290"
      width={480}
      height={290}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <g className="rk-cons">
        <path className="sk" d="M-330,270 H330" />
        <path className="sk" d="M0,-6 V286" />
        <path className="sk" d="M-262,160 H262" />
        <path className="sk" d="M-262,92 H262" />
      </g>
      <g className="rk-main" filter="url(#f-pencil-rear)">
        {outline}
      </g>
      <g className="rk-ghost sk-ghost" filter="url(#f-pencil-rear-b)">
        {outline}
      </g>
      <g className="rk-swoosh" filter="url(#f-pencil-rear)">
        {[1, -1].map((m) => (
          <g key={m} transform={`scale(${m} 1)`}>
            <path className="sk" d="M-214,262 C-250,262 -294,254 -324,236 C-342,224 -338,205 -318,210" />
            <path className="sk" d="M-220,240 C-252,236 -284,222 -302,203" />
            <path className="sk" d="M-206,268 C-262,272 -330,268 -374,252" />
            <path className="sk" d="M-228,222 C-246,216 -262,206 -270,194" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ three-quarter rear */

/**
 * The turn's middle key: the car seen from behind-right at 45°. Placed by projecting
 * the 3D shape (u = 0.7071 · (length + width), height unchanged): the side elevation
 * becomes the near flank, the rear elevation's lower half becomes the tail, and the
 * cabin is drawn where it really sits, with the near flying buttress crossing in front
 * of the recessed rear window.
 *  viewBox -180 0 1060 290 · far tail corner at u≈-157, nose at u≈864, ground v=270
 */
const TQ = {
  upper:
    "M-145,92 C-138,90 -130,89 -122,88 C-100,86 -20,76 45,66 C100,57 170,32 225,20 C260,15 300,13.5 340,13.5 C400,13.5 450,15 481,22 C516,40 559,74 585,92 L624,94 L624,98 L168,100 L132,100 L132,92 Z",
  recess:
    "M-122,88 C-100,86 -20,76 45,66 C100,57 170,32 225,20 L395,20 C360,30 300,52 267,66 C235,73 190,82 148,88 Z",
  backlight: "M238,24 L380,24 C352,33 296,54 267,66 C250,70 235,73 221.6,75.9 Z",
  dlo: "M570,97 C548,77 514,49 487,31 C460,28 425,27 402,28 L402,91 C450,93 520,95 570,97 Z",
  buttress: "M148,88 C190,82 235,73 267,66 C300,52 360,30 395,20",
  mirror:
    "M604,80 C604,73 608,69 614,69 L630,69 C635,69 637,73 637,79 L637,84 C637,89 634,92 629,92 L611,92 C606,92 604,88 604,84 Z",
};

/** Rear elevation below the deck: the tail panel, lamps lit. No tyres: the flank and the far wheel supply them. */
function RearTail() {
  return (
    <>
      <path d={REAR.body} fill="url(#g-body-rear)" />
      <path d={REAR.body} fill="url(#g-hips)" />
      <path d={REAR.body} fill="#000" opacity={0.16} />
      <rect x={-192} y={102} width={384} height={56} rx={7} fill="#0C0C0E" />
      <rect x={-187} y={106} width={78} height={48} rx={4} fill="url(#g-lamp)" />
      <rect x={109} y={106} width={78} height={48} rx={4} fill="url(#g-lamp)" />
      <rect x={-106} y={106} width={16} height={48} rx={3} fill="#34373C" />
      <rect x={90} y={106} width={16} height={48} rx={3} fill="#34373C" />
      <g fill="#141416">
        {SLATS.map((y) => (
          <rect key={y} x={-192} y={y} width={384} height={3.4} />
        ))}
      </g>
      <g opacity={0.85}>
        <rect x={-198} y={98} width={100} height={64} rx={18} fill="#FF2A1A" filter="url(#f-glow)" />
        <rect x={98} y={98} width={100} height={64} rx={18} fill="#FF2A1A" filter="url(#f-glow)" />
      </g>
      <rect x={-58} y={166} width={116} height={30} rx={4} fill="#860B11" />
      <rect x={-53} y={170} width={106} height={22} rx={2.5} fill="#EDEDEB" />
      <PlateText />
      <path d={REAR.valance} fill="#111113" />
      {PIPES.map((x) => (
        <g key={x}>
          <circle cx={x} cy={230} r={7.5} fill="#55585D" />
          <circle cx={x} cy={230} r={4.8} fill="#060607" />
        </g>
      ))}
    </>
  );
}

export function ThreeQuarterCar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="-180 0 1060 290"
      width={1060}
      height={290}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <g className="c-root">
        <ellipse className="c-shadow" cx={352} cy={271} rx={540} ry={13} fill="url(#g-shadow)" />
        {/* far wheels and the near rear tread, glimpsed under the body */}
        <rect x={-36} y={200} width={148} height={70} rx={12} fill="#121213" />
        <rect x={392} y={200} width={112} height={70} rx={12} fill="#121213" />
        <rect x={246} y={200} width={34} height={70} rx={9} fill="#18181A" />
        <g transform="translate(149 0) scale(0.7071 1)" clipPath="url(#clip-flank)">
          <SideParts flank />
        </g>
        <path d={TQ.upper} fill="url(#g-body-side)" />
        <path d={TQ.recess} fill="#7E0A10" opacity={0.5} />
        <path d={TQ.backlight} fill="url(#g-glass)" />
        <path d={TQ.dlo} fill="url(#g-glass)" />
        <path d="M432,27 L432,92" stroke="#16181B" strokeWidth={3} strokeLinecap="round" />
        <path d={TQ.buttress} fill="none" stroke="url(#g-spec)" strokeWidth={2} strokeLinecap="round" />
        <path d={TQ.mirror} fill="url(#g-body-side)" stroke="#7A0910" strokeWidth={1} />
        <g transform="scale(0.7071 1)" clipPath="url(#clip-tail)">
          <RearTail />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ plan */

const TOP = {
  body:
    "M4,0 L4,-172 C4,-188 12,-196 28,-200 C60,-210 110,-219 170,-220 L320,-220 C370,-220 400,-216 430,-211 C470,-205 520,-202 600,-202 L720,-204 C800,-206 860,-206 910,-200 C950,-194 975,-180 990,-156 C1000,-136 1004,-100 1004,-60 L1004,60 C1004,100 1000,136 990,156 C975,180 950,194 910,200 C860,206 800,206 720,204 L600,202 C520,202 470,205 430,211 C400,216 370,220 320,220 L170,220 C110,219 60,210 28,200 C12,196 4,188 4,172 Z",
  deck: "M428,-120 L18,-168 C11,-169 8,-162 8,-152 L8,152 C8,162 11,169 18,168 L428,120 Z",
  windscreen: "M660,-170 C676,-100 676,100 660,170 L562,130 C568,60 568,-60 562,-130 Z",
  roof: "M562,-130 C568,-60 568,60 562,130 L446,126 C441,60 441,-60 446,-126 Z",
  backlight: "M446,-126 C441,-60 441,60 446,126 L428,120 C424,60 424,-60 428,-120 Z",
  lid: "M700,-148 L940,-148 C956,-148 966,-138 966,-122 L966,122 C966,138 956,148 940,148 L700,148 C690,148 686,142 686,134 L686,-134 C686,-142 690,-148 700,-148 Z",
  intakeL: "M338,-219 C430,-213 520,-205 604,-203 L604,-196 C520,-198 430,-206 342,-211 Z",
  intakeR: "M338,219 C430,213 520,205 604,203 L604,196 C520,198 430,206 342,211 Z",
  mirrorL: "M630,-200 L642,-226 C644,-230 648,-232 653,-232 L667,-232 C671,-232 673,-229 671,-225 L658,-200 Z",
  mirrorR: "M630,200 L642,226 C644,230 648,232 653,232 L667,232 C671,232 673,229 671,225 L658,200 Z",
};

const LOUVRES = Array.from({ length: 17 }, (_, i) => 66 + i * 20);

export function TopCar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="-20 -250 1040 500"
      width={1040}
      height={500}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <g className="c-root">
        <rect x={-4} y={-226} width={1016} height={452} rx={110} fill="#000" opacity={0.3} filter="url(#f-softshadow)" />
        <rect x={182} y={-227} width={126} height={18} rx={6} fill="#111" />
        <rect x={182} y={209} width={126} height={18} rx={6} fill="#111" />
        <rect x={752} y={-212} width={124} height={14} rx={6} fill="#111" />
        <rect x={752} y={198} width={124} height={14} rx={6} fill="#111" />
        <path d={TOP.mirrorL} fill="url(#g-body-top)" stroke="#6E0910" strokeWidth={1.4} />
        <path d={TOP.mirrorR} fill="url(#g-body-top)" stroke="#6E0910" strokeWidth={1.4} />

        <path d={TOP.body} fill="url(#g-body-top)" />
        <path d={TOP.deck} fill="#A50F17" opacity={0.6} />
        <g fill="#170709">
          {LOUVRES.map((x) => (
            <rect key={x} x={x} y={-90} width={7} height={180} rx={3.5} />
          ))}
        </g>
        <path d="M446,-126 L18,-180 M446,126 L18,180" stroke="#7A0910" strokeWidth={3} fill="none" />
        <path d={TOP.windscreen} fill="url(#g-glass-top)" />
        <path d={TOP.roof} fill="url(#g-roof-top)" />
        <path d={TOP.backlight} fill="#14171B" />
        <path d={TOP.lid} fill="none" stroke="#7A0910" strokeWidth={2.5} />
        <rect x={874} y={-190} width={76} height={60} rx={8} fill="none" stroke="#7A0910" strokeWidth={2.5} />
        <rect x={874} y={130} width={76} height={60} rx={8} fill="none" stroke="#7A0910" strokeWidth={2.5} />
        <path d={TOP.intakeL} fill="#1A0507" />
        <path d={TOP.intakeR} fill="#1A0507" />
      </g>
    </svg>
  );
}
