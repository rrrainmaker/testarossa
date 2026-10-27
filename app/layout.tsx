import type { Metadata, Viewport } from "next";
import { Michroma, Saira, Saira_Condensed } from "next/font/google";
import "./globals.css";

// Michroma: an extended, squared face in the Italian technical lineage of the era.
const wide = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-michroma", display: "swap" });
const cond = Saira_Condensed({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-saira-condensed",
  display: "swap",
});
const body = Saira({ subsets: ["latin"], variable: "--font-saira", display: "swap" });

export const metadata: Metadata = {
  title: "Testarossa, drawn by scroll",
  description:
    "A fan-made scroll story about the 1984 Testarossa: a pencil line becomes a flat-twelve, a red ticker becomes its name, and it all ends on a dusk drive.",
};

export const viewport: Viewport = {
  themeColor: "#EEEFF0",
};

const CONTRACT = `<!--
THESIS: Continuity, not sections. Each scene grows out of the last: a pencil line becomes the car, the red band becomes a wipe, the wipe becomes the T of the name, and the name is lost in tyre smoke. It refuses the dealer-page stack of hero, cards and spec grid.
OWN-WORLD: Cool drafting-paper grey, Rosso red fields, graphite pencil strokes, extended squared type (Michroma), condensed numerals (Saira Condensed), original vector car art; a 1984 dusk coda.
STORY: See it drawn, painted, lit, turned and driven; learn the width, the flat-twelve and the meaning of the name; then read the spec sheet.
FIRST VIEWPORT: Drafting grid; a pencil hairpin drawn across the lower half with a sketched car on it; the name and one line top-left; a title block bottom-right; the spec-sheet pill top-right.
FORM: brief-pinned (user: remake the short's choreography for a Testarossa); no roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${wide.variable} ${cond.variable} ${body.variable}`}>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
