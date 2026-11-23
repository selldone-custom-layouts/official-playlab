/*
 * Play Lab's colour tokens (the approved design's shared/style.css and play-lab.css, Toychi Layout Mockups):
 * every neutral of the page comes from the chosen palette's hue in OKLCH, with the design's own lightness and
 * chroma steps, in light and in dark (dark is Play Lab's default). A preset palette keeps the design's chroma and
 * lightness factors (1 and .5); a Custom colour scales them from its own chroma and lightness, as the design's
 * appearance.js does.
 *
 * The values are written as hex (gamut-mapped), never oklch(), so the contrast checks read them; paintFamily()
 * (ly-family.ts) writes them on <html> as --pl-* and maps the base's --ly-* neutrals onto them, so Selldone's own
 * parts (checkout, account, dialogs) wear the same family. The action colour (--ly-act, its hover, its words) stays
 * the theme switcher's, which guarantees white words on it.
 */

const toRgb = (hex: string): number[] => [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16));
const toHex = (rgb: number[]): string => "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
const lin = (v: number): number => ((v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));

function oklch(hex: string): [number, number, number] {
  const [r, g, b] = toRgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.sqrt(A * A + B * B), Math.atan2(B, A)];
}
function toLin(L: number, C: number, h: number): number[] {
  const A = C * Math.cos(h);
  const B = C * Math.sin(h);
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
  const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
  const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = (v: number[]) => v.every((x) => x >= -1e-5 && x <= 1 + 1e-5);
const enc = (v: number) => {
  v = Math.min(1, Math.max(0, v));
  return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
};
/** oklch(L C h) as hex, the chroma reduced until it is inside sRGB. */
function at(L: number, C: number, h: number): string {
  L = Math.min(1, Math.max(0, L));
  let c = C;
  if (!inGamut(toLin(L, c, h))) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(toLin(L, mid, h))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  return toHex(toLin(L, c, h).map(enc));
}

export type PlTokens = Record<string, string>;
const cache: Record<string, { light: PlTokens; dark: PlTokens }> = {};

/** The design's tokens for one seed. `preset`: a palette of the list (the design's fixed factors). */
export function plTokens(seed: string, preset: boolean): { light: PlTokens; dark: PlTokens } {
  const key = seed + (preset ? "p" : "c");
  if (cache[key]) return cache[key];
  const [L0, C0, h] = oklch(seed);
  const cf = preset ? 1 : Math.min(1, C0 / 0.17);
  const lf = preset ? 0.5 : Math.min(1, Math.max(0, L0));
  const k = (L: number, C: number) => at(L, C * cf, h);
  const light: PlTokens = {
    surface: k(0.995, 0.003),
    paper: k(0.97 + 0.018 * lf, 0.009),
    wash: k(0.959, 0.02),
    tint: k(0.925, 0.035),
    line: k(0.886, 0.02),
    ink: k(0.235, 0.035),
    muted: k(0.45, 0.035),
    accent: k(0.44, 0.16),
    ring: k(0.51, 0.17),
    media: k(0.956, 0.019),
    "stage-base": k(0.145, 0.03),
    "stage-ink": k(0.99, 0.006),
    "stage-line": k(0.76, 0.02),
    "stage-hover": k(0.27, 0.04),
  };
  const dark: PlTokens = {
    surface: k(0.205, 0.021),
    paper: k(0.144 + 0.05 * lf, 0.02),
    wash: k(0.24, 0.028),
    tint: k(0.3, 0.046),
    line: k(0.365, 0.036),
    ink: k(0.974, 0.011),
    muted: k(0.772, 0.028),
    accent: k(0.77, 0.14),
    ring: k(0.8, 0.145),
    media: k(0.87, 0.022),
    "stage-base": k(0.145, 0.03),
    "stage-ink": k(0.99, 0.006),
    "stage-line": k(0.76, 0.02),
    "stage-hover": k(0.27, 0.04),
  };
  return (cache[key] = { light, dark });
}

/** The base's --ly-* neutrals that follow Play Lab's tokens (the rest of the base's family is kept). */
export function lyFromPl(v: PlTokens, dark: boolean): Record<string, string> {
  return {
    bg: v.paper,
    band: v.wash,
    surface: v.surface,
    paper: v.surface,
    card: v.surface,
    "card-2": v.surface,
    tint2: v.tint,
    ink: v.ink,
    muted: v.muted,
    line: v.line,
    "line-2": v.line,
    "hdr-bg": v.surface,
    "hdr-ink": v.ink,
    "hdr-line": v.line,
    art: v.tint,
    "seg-bg": v.wash,
    field: v.surface,
  };
}
