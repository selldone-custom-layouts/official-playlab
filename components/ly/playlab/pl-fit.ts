/*
 * v-pl-fit: a card grid's column count from its own width and its number of cards, so a row never ends with one
 * card alone (the owner, 24 Nov 2026: four toys at tablet width wrapped 3 + 1).
 *
 *   <div v-pl-fit="{ max: 4 }" class="pl-grid">…</div>      (null: the grid keeps its CSS columns, as List view does)
 *
 * The count is the most cards of `min` px (default 200) that fit, between `minCols` (default 2, the design's phone
 * grid) and `max`; when that leaves one card on the last row, one column fewer is taken if it does not, else one
 * more if the cards stay at least 82% of `min`. The result is written as --pl-fit and data-cols (style/ly/pl.css).
 * It follows the grid's width (ResizeObserver) and its cards (each update).
 */
import type { Directive } from "vue";

type FitOptions = { max?: number; min?: number; minCols?: number } | null | undefined;

const orphan = (n: number, c: number) => n > c && n % c === 1;

export function fitColumns(width: number, gap: number, n: number, o: { max?: number; min?: number; minCols?: number }): number {
  const max = o.max ?? 4;
  const min = o.min ?? 200;
  const floor = Math.min(o.minCols ?? 2, max);
  let c = Math.max(floor, Math.min(max, Math.floor((width + gap) / (min + gap))));
  if (orphan(n, c)) {
    if (c - 1 >= floor && !orphan(n, c - 1)) c -= 1;
    else if (c + 1 <= max && (width + gap) / (c + 1) - gap >= min * 0.82 && !orphan(n, c + 1)) c += 1;
  }
  return c;
}

type FitEl = HTMLElement & { __plFit?: { opts: FitOptions; ro?: ResizeObserver; run: () => void } };

function apply(el: FitEl) {
  const st = el.__plFit;
  if (!st) return;
  const o = st.opts;
  if (!o) {
    el.style.removeProperty("--pl-fit");
    delete el.dataset.cols;
    return;
  }
  const width = el.clientWidth;
  if (!width) return;
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
  const c = fitColumns(width, gap, el.children.length, o);
  el.style.setProperty("--pl-fit", String(c));
  el.dataset.cols = String(c);
}

export const vPlFit: Directive<FitEl, FitOptions> = {
  mounted(el, binding) {
    el.__plFit = { opts: binding.value, run: () => apply(el) };
    if (typeof ResizeObserver !== "undefined") {
      el.__plFit.ro = new ResizeObserver(() => apply(el));
      el.__plFit.ro.observe(el);
    }
    apply(el);
  },
  updated(el, binding) {
    if (!el.__plFit) return;
    el.__plFit.opts = binding.value;
    apply(el);
  },
  unmounted(el) {
    el.__plFit?.ro?.disconnect();
    delete el.__plFit;
  },
};
