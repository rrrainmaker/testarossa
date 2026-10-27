/**
 * Pencil: a low-amplitude wobble plus graphite grain cut into the stroke's alpha.
 * One filter per drawing (track, path car, rear sketch, spec sheet) because noise
 * frequency and wobble live in user units; the engine rescales them to screen pixels.
 * The "-b" twin uses other seeds for the second, lighter pass of the pencil.
 */
const PENCILS = ["track", "car", "rear", "spec"].flatMap((name) => [
  { id: `f-pencil-${name}`, seed: 3, grainSeed: 9 },
  { id: `f-pencil-${name}-b`, seed: 17, grainSeed: 29 },
]);

/**
 * Shared paint for every car drawing on the page: gradients, filters and the
 * five-spoke wheel. Kept in one off-screen <svg> so instances never clash on ids.
 */
export function SvgDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* Side elevation body: studio-lit flank with a crisp horizon reflection below the shoulder */}
        <linearGradient id="g-body-side" gradientUnits="userSpaceOnUse" x1="0" y1="12" x2="0" y2="238">
          <stop offset="0" stopColor="#F45C49" />
          <stop offset=".3" stopColor="#D91D1D" />
          <stop offset=".385" stopColor="#F2533F" />
          <stop offset=".425" stopColor="#A50D15" />
          <stop offset=".62" stopColor="#C6141B" />
          <stop offset=".86" stopColor="#960C13" />
          <stop offset="1" stopColor="#55050A" />
        </linearGradient>
        <linearGradient id="g-fin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8604E" />
          <stop offset=".5" stopColor="#C8151B" />
          <stop offset="1" stopColor="#77080F" />
        </linearGradient>
        <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#64707E" />
          <stop offset=".42" stopColor="#252B33" />
          <stop offset="1" stopColor="#0B0D10" />
        </linearGradient>
        <linearGradient id="g-spec" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".4" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="g-shadow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".5" />
          <stop offset=".55" stopColor="#000" stopOpacity=".2" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-flare" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset=".25" stopColor="#FFF6E2" stopOpacity=".75" />
          <stop offset="1" stopColor="#FFF1D6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF8E8" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFF8E8" stopOpacity="0" />
        </linearGradient>

        {/* Wheel */}
        <linearGradient id="g-spoke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F5F7" />
          <stop offset=".55" stopColor="#B6BAC0" />
          <stop offset="1" stopColor="#82878E" />
        </linearGradient>
        <radialGradient id="g-hub" cx=".38" cy=".34" r=".72">
          <stop offset="0" stopColor="#FBFBFC" />
          <stop offset="1" stopColor="#8B9097" />
        </radialGradient>
        <radialGradient id="g-disc" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#3C3E42" />
          <stop offset=".8" stopColor="#2A2B2F" />
          <stop offset="1" stopColor="#18191C" />
        </radialGradient>
        <linearGradient id="g-rimlip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8F9FA" />
          <stop offset="1" stopColor="#8A8F96" />
        </linearGradient>

        {/* Rear elevation */}
        <linearGradient id="g-body-rear" gradientUnits="userSpaceOnUse" x1="0" y1="14" x2="0" y2="241">
          <stop offset="0" stopColor="#F35746" />
          <stop offset=".24" stopColor="#D11A1B" />
          <stop offset=".33" stopColor="#F55B4A" />
          <stop offset=".4" stopColor="#AE0F19" />
          <stop offset=".6" stopColor="#C6151C" />
          <stop offset=".85" stopColor="#9B0D14" />
          <stop offset="1" stopColor="#57060B" />
        </linearGradient>
        <linearGradient id="g-hips" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2A0003" stopOpacity=".62" />
          <stop offset=".055" stopColor="#FF7D69" stopOpacity=".24" />
          <stop offset=".16" stopColor="#000" stopOpacity="0" />
          <stop offset=".84" stopColor="#000" stopOpacity="0" />
          <stop offset=".945" stopColor="#FF7D69" stopOpacity=".24" />
          <stop offset="1" stopColor="#2A0003" stopOpacity=".62" />
        </linearGradient>
        <linearGradient id="g-lamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF7556" />
          <stop offset=".5" stopColor="#FF2B19" />
          <stop offset="1" stopColor="#D4100C" />
        </linearGradient>

        {/* Plan view */}
        <linearGradient id="g-body-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#66060B" />
          <stop offset=".1" stopColor="#B3121A" />
          <stop offset=".3" stopColor="#D8211F" />
          <stop offset=".5" stopColor="#EC4232" />
          <stop offset=".7" stopColor="#D8211F" />
          <stop offset=".9" stopColor="#B3121A" />
          <stop offset="1" stopColor="#66060B" />
        </linearGradient>
        <linearGradient id="g-glass-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#13171D" />
          <stop offset=".6" stopColor="#2D3540" />
          <stop offset="1" stopColor="#56626F" />
        </linearGradient>
        <linearGradient id="g-roof-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B4131A" />
          <stop offset=".5" stopColor="#F25542" />
          <stop offset="1" stopColor="#B4131A" />
        </linearGradient>

        <filter id="f-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="f-softshadow" x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        {/* Directional blurs; the engine writes stdDeviation per frame */}
        <filter id="f-mblur" x="-40%" y="-10%" width="180%" height="120%">
          <feGaussianBlur id="f-mblur-b" stdDeviation="0 0" />
        </filter>
        <filter id="f-smear" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur id="f-smear-b" stdDeviation="0 0" />
        </filter>

        {PENCILS.map((f) => (
          <filter key={f.id} id={f.id} x="-4%" y="-8%" width="108%" height="116%" colorInterpolationFilters="sRGB">
            <feTurbulence className="pw" type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f.seed} result="wobble" />
            <feDisplacementMap
              className="pd"
              in="SourceGraphic"
              in2="wobble"
              scale="1.3"
              xChannelSelector="R"
              yChannelSelector="G"
              result="drawn"
            />
            <feTurbulence className="pg" type="fractalNoise" baseFrequency="1.7" numOctaves={1} seed={f.grainSeed} result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.05" result="tooth" />
            <feComposite in="drawn" in2="tooth" operator="in" />
          </filter>
        ))}

        {/* three-quarter view: the side elevation minus its cabin, the rear elevation below the deck */}
        <clipPath id="clip-flank">
          <path d="M-20,96 H660 V-20 H1040 V300 H-20 Z" />
        </clipPath>
        <clipPath id="clip-tail">
          <rect x="-240" y="88" width="480" height="210" />
        </clipPath>
        <clipPath id="clip-wells">
          <rect x="-20" y="0" width="1060" height="234" />
        </clipPath>
        <clipPath id="clip-dlo">
          <path d="M646,97 C622,76 594,47 567,31 C540,24 482,23 449,28 C437,46 423,67 411,91 C488,93 584,95 646,97 Z" />
        </clipPath>

        <g id="wheel">
          <circle r="74" fill="#141416" />
          <circle r="68" fill="none" stroke="#222226" strokeWidth="4" />
          <circle r="58.5" fill="none" stroke="#1A1A1D" strokeWidth="2" />
          <circle r="50" fill="#1C1D20" />
          <circle r="41" fill="url(#g-disc)" />
          <g fill="url(#g-spoke)" stroke="#767B82" strokeWidth=".8">
            <path d="M-8,-13 L8,-13 L16,-46 Q0,-49 -16,-46 Z" />
            <path d="M-8,-13 L8,-13 L16,-46 Q0,-49 -16,-46 Z" transform="rotate(72)" />
            <path d="M-8,-13 L8,-13 L16,-46 Q0,-49 -16,-46 Z" transform="rotate(144)" />
            <path d="M-8,-13 L8,-13 L16,-46 Q0,-49 -16,-46 Z" transform="rotate(216)" />
            <path d="M-8,-13 L8,-13 L16,-46 Q0,-49 -16,-46 Z" transform="rotate(288)" />
          </g>
          <circle r="15" fill="url(#g-hub)" />
          <path d="M0,-6 L5.7,-1.9 L3.5,4.9 L-3.5,4.9 L-5.7,-1.9 Z" fill="#2A2B2F" />
          <circle r="50" fill="none" stroke="url(#g-rimlip)" strokeWidth="5" />
        </g>
      </defs>
    </svg>
  );
}
