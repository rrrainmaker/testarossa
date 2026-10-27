import { Header, StrakesMark } from "@/components/header";
import { Specs } from "@/components/specs";
import { Story } from "@/components/story";
import { SvgDefs } from "@/components/svg-defs";

export default function Page() {
  return (
    <>
      <SvgDefs />
      <a
        className="fixed -top-16 left-4 z-[100] rounded-full bg-ink px-4 py-2.5 font-wide text-[10px] tracking-[.2em] text-paper uppercase no-underline transition-[top] duration-200 ease-out-expo focus-visible:top-3"
        href="#specs"
      >
        Skip to the spec sheet
      </a>
      <div className="progress" data-progress aria-hidden="true" />
      <Header />
      <main id="top">
        <Story />
        <Specs />
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 bg-ink px-4 py-7 text-sm text-paper/75 sm:px-8 lg:px-14">
        <p className="m-0 flex max-w-[70ch] items-center gap-3.5">
          <StrakesMark className="h-[13px] w-[22px] flex-none text-rosso" />
          <span>
            A fan-made motion study. Not affiliated with or endorsed by Ferrari S.p.A. Every drawing on this page is
            original artwork.
          </span>
        </p>
        <a
          className="group inline-flex items-center gap-2.5 font-wide text-[10px] tracking-[.2em] text-white uppercase no-underline"
          href="#top"
          data-jump="0"
        >
          <span className="underline decoration-transparent underline-offset-[.5em] transition-colors group-hover:decoration-current">
            Back to the first line
          </span>
          <svg className="size-3" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
            <path d="M6 10.5V1.5M2 5.5l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </a>
      </footer>
    </>
  );
}
