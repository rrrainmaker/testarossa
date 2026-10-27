// the story's own verbs, each jumping to its beat on the timeline
const CHAPTERS = [
  { label: "Drawn", u: 0.6 },
  { label: "Driven", u: 5.45 },
  { label: "Named", u: 12.35 },
];

/** Five tapering bars: the side strakes, used as the site's mark. */
export function StrakesMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 26 15" aria-hidden="true" focusable="false">
      {[0, 3.1, 6.2, 9.3, 12.4].map((y, i) => (
        <rect key={y} x={i * 1.6} y={y} width={26 - i * 1.6} height={1.9} rx={0.6} fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * Rendered twice: the real header, and a white copy (inert) that the engine clips to
 * whatever red is underneath, so the bar reads on paper and on Rosso at the same time.
 */
function Bar({ light }: { light?: boolean }) {
  const Tag = light ? "div" : "header";
  return (
    <Tag
      className={`nav ${light ? "nav--light" : "nav--dark"} fixed inset-x-0 top-0 flex h-16 items-center gap-6 px-4 sm:px-8 lg:px-12`}
      aria-hidden={light || undefined}
    >
      <a
        className="inline-flex items-center gap-3 font-wide text-[12px] tracking-[.22em] uppercase no-underline min-[400px]:tracking-[.34em]"
        href="#top"
        data-jump="0"
        aria-label="Testarossa, back to the first line"
        tabIndex={light ? -1 : undefined}
      >
        <StrakesMark className="brand-mark h-3.5 w-6" />
        <span>Testarossa</span>
      </a>
      <nav className="ml-auto hidden gap-[clamp(18px,2.6vw,40px)] md:flex" aria-label="Chapters">
        {CHAPTERS.map((c) => (
          <a key={c.label} className="nav-link" href="#top" data-jump={c.u} tabIndex={light ? -1 : undefined}>
            {c.label}
          </a>
        ))}
      </nav>
      <a className="pill ml-auto md:ml-0" href="#specs" tabIndex={light ? -1 : undefined}>
        Spec sheet
      </a>
    </Tag>
  );
}

export function Header() {
  return (
    <>
      <Bar />
      <Bar light />
    </>
  );
}
