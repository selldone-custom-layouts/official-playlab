/*
 * Play Lab's helpers over the live catalogue (ly.ts): a toy's suggested age, its short specs for the list cards,
 * the ages a shop sells (Shop by age, the age filter), departments with products, the guides. Nothing names a
 * product, department, age or price: every value comes from the shop's own products and their specification, so a
 * shop with other departments, no ages or no guides gets its own sections (or none).
 */
import { catTitle, inCat, ly, specGroups } from "../ly";

declare const window: any;

/** A spec key that names an age ("Suggested Age", "Age", "Age range", "Ages"). */
export const AGE_KEY = /(^|\s)ages?(\s|$)|age\s*range/i;

/** The toy's suggested age, from its own specification ("8–12 years"), or "". */
export function ageOf(p: any): string {
  for (const g of specGroups(p)) for (const [k, v] of g.rows) if (AGE_KEY.test(k)) return v;
  return "";
}

/** The age's months, for ordering ("6–12 months" < "3–4 years" < "13+ years"). */
export function ageMonths(value: string): number {
  const n = Number(String(value).match(/\d+/)?.[0] ?? 9999);
  return /year|yr/i.test(value) ? n * 12 : n;
}

/** Every age the shop sells, youngest first, each with its products. */
export function agesOf(list: any[] = ly.products): { age: string; count: number }[] {
  const m = new Map<string, number>();
  for (const p of list) {
    const a = ageOf(p);
    if (a) m.set(a, (m.get(a) || 0) + 1);
  }
  return [...m.entries()].map(([age, count]) => ({ age, count })).sort((a, b) => ageMonths(a.age) - ageMonths(b.age));
}

/** The first n spec rows of a toy, its age left out (the list cards' two lines). */
export function cardSpecs(p: any, n = 2): [string, string][] {
  const out: [string, string][] = [];
  for (const g of specGroups(p))
    for (const r of g.rows) {
      if (AGE_KEY.test(r[0])) continue;
      out.push(r);
      if (out.length >= n) return out;
    }
  return out;
}

/** The first n spec rows of a toy (the product page's facts). */
export function facts(p: any, n = 3): [string, string][] {
  return specGroups(p)
    .flatMap((g) => g.rows)
    .slice(0, n);
}

/** Departments that have products now, in the shop's order. */
export function liveCats(): any[] {
  return ly.cats.filter((c) => inCat(c.id).length);
}

/** A department's products, most viewed and sold first, then the shop's order. */
export function topOf(catId: number, n = 4, skip: number[] = []): any[] {
  return inCat(catId)
    .filter((p) => !skip.includes(p.id) && p.quantity > 0)
    .sort((a, b) => (b.sells || 0) - (a.sells || 0) || (b.views || 0) - (a.views || 0) || a.id - b.id)
    .slice(0, n);
}

/** The department's own first words, short ("Cars, Trains & Vehicles" stays whole; used as a title). */
export function catName(c: any): string {
  return catTitle(c);
}

/** The shop's SKU of a toy, when it has one. */
export function skuOf(p: any): string {
  return String(p?.sku || "").trim();
}

export function productsRoute(query: Record<string, any> = {}) {
  return { name: window.$storefront.routes.SHOP_PAGE, query };
}
