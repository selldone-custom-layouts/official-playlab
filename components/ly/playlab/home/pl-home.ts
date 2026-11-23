/*
 * Play Lab's home picks, shared by every section (components/ly/playlab/home/*.vue) so no two sections show the
 * same department: the departments with products, ranked by pieces sold (ties keep the shop's order), then
 *   lead       the lineup (two wide cards), the stage's button and the comparison;
 *   missions   the next three (Pick a challenge);
 *   work       the middle mission (the photo feature's department);
 *   gear       the next one after the missions (a row of cards).
 * A shop with fewer departments reuses what it has; a section with nothing to show hides itself.
 */
import { bySells, catTitle, catTo, inCat, ly, money, priceView, productImage, productTo } from "../../ly";
import { catalogueRoute } from "../../../kalio/kalio-catalog";
import { currentCurrency } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

declare const window: any;

export default {
  props: {
    variant: { type: String, default: "" },
    band: { type: Boolean, default: false },
  },
  data: () => ({ ly }),
  computed: {
    shop(this: any) {
      return this.$store.getters.getShop;
    },
    currency(this: any) {
      return currentCurrency();
    },
    shopName(this: any) {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    ready(this: any) {
      return this.ly.ready && this.ly.catsReady;
    },
    ranked(this: any): any[] {
      return this.ly.cats
        .map((c: any, i: number) => {
          const ps = inCat(c.id);
          return { c, i, n: ps.filter((p: any) => p.quantity > 0).length, sold: ps.reduce((s: number, p: any) => s + (p.sells || 0), 0) };
        })
        .filter((x: any) => x.n)
        .sort((a: any, b: any) => b.sold - a.sold || a.i - b.i)
        .map((x: any) => x.c);
    },
    lead(this: any) {
      return this.ranked[0] || null;
    },
    missions(this: any): any[] {
      const r = this.ranked;
      const out = r.slice(1, 4);
      return out.length >= 3 ? out : r.slice(0, 3);
    },
    work(this: any) {
      return this.missions[1] || this.missions[0] || this.lead;
    },
    gear(this: any) {
      const r = this.ranked;
      return r[4] || r[r.length - 1] || null;
    },
    /* The lineup: the lead department's two most-sold toys in stock, the higher price first on a tie. */
    lineup(this: any): any[] {
      if (!this.lead) return [];
      return bySells(inCat(this.lead.id).filter((p: any) => p.quantity > 0))
        .sort((a: any, b: any) => (b.sells || 0) - (a.sells || 0) || this.pv(b).now - this.pv(a).now)
        .slice(0, 2);
    },
    allTo(this: any) {
      return catalogueRoute({});
    },
  },
  methods: {
    t,
    money,
    catTitle,
    catTo,
    productTo,
    pv(this: any, p: any) {
      void this.currency;
      return priceView(this.shop, p);
    },
    img(p: any, size: number | null = null) {
      return productImage(p, size);
    },
    /* A department's toys in stock, most sold first, then the higher price (the bigger toys), skipping some. */
    picks(this: any, c: any, n: number, skip: any[] = []) {
      if (!c) return [];
      const ids = new Set(skip.map((p: any) => p.id));
      return inCat(c.id)
        .filter((p: any) => p.quantity > 0 && !ids.has(p.id))
        .sort((a: any, b: any) => (b.sells || 0) - (a.sells || 0) || this.pv(b).now - this.pv(a).now || a.id - b.id)
        .slice(0, n);
    },
    compareTo(this: any, list: any[]) {
      return { name: window.$storefront.routes.COMPARISON_PAGE, query: { list: list.map((p: any) => "p" + p.id).join("_") } };
    },
  },
};
