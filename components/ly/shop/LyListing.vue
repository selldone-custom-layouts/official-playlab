<!--
  Play Lab's catalogue: all toys, a department, a search and the deals (the approved design's shared/listing.js
  labCatalog(), play-lab.css .lab-catalog*). From the live catalogue (ly.ts, one read):

  - the breadcrumb and the lead panel (the action colour's edge on its start side): the title and a line, and the
    catalogue's own search;
  - the departments rail (All toys and every department, this one marked; a sideways strip on a phone);
  - the toolbar: the count, List / Grid (list by default: wide cards with two spec lines; grid: five to a row),
    Filters (a side sheet: price from / to with the currency fixed in the box, On offer, then every spec group of
    these toys' own specification, the age youngest first) and Sort;
  - the active filters as chips with Clear all; the cards, 24 at a time with "Show more toys"; a change dims the
    cards in place with "Updating results…", then the new ones fade up (no motion when the visitor asks for less);
  - a search with no match: the design's no-results panel (search again, the first departments, all toys);
  - deals with no offer running: "No offers right now" and "Good finds under <amount>", the amount and the toys
    from the shop's own prices.

  ?age=<value> (Shop by age) starts with that age picked; ?price=lo-hi and ?brand= as in the base. Nothing names a
  product, department or price: another shop gets its own.
-->
<template>
  <div :data-view="view" class="ly ly-listing pl-shell pl-catalog">
    <div class="pl-wrap">
      <nav :aria-label="t('ly.pt.crumbs', 'Breadcrumb')" class="pl-crumbs">
        <router-link :to="{ path: '/' }">{{ t("ly.pt.home", "Home") }}</router-link>
        <template v-if="kind === 'category'">
          <ly-icon cls="pl-fwd" name="chev" /><router-link :to="allTo">{{ t("pl.ls.all", "All toys") }}</router-link>
        </template>
        <ly-icon cls="pl-fwd" name="chev" /><span aria-current="page"><bdi>{{ title }}</bdi></span>
      </nav>

      <header class="pl-catalog-lead">
        <div>
          <h1><bdi>{{ title }}</bdi></h1>
          <p v-if="lead">{{ lead }}</p>
        </div>
        <form class="pl-catalog-search" role="search" @submit.prevent="submitSearch">
          <label for="pl-cq">{{ t("pl.ls.searchLabel", "Search the catalog") }}</label>
          <div>
            <input id="pl-cq" :placeholder="searchPh" :value="q" autocomplete="off" enterkeyhint="search" type="search" @input="q = $event.target.value" />
            <button class="pl-btn primary" type="submit"><ly-icon name="search" />{{ t("ly.ls.searchBtn", "Search") }}</button>
          </div>
        </form>
      </header>

      <!-- A search with no match (the design's no-results.html) -->
      <section v-if="kind === 'search' && ready && !base.length" class="pl-panel pl-empty pl-no-results">
        <span class="pl-empty-ic"><ly-icon name="search" /></span>
        <h2>{{ t("pl.ls.noneFor", "No toys found for “{q}”", { q: search }) }}</h2>
        <p>{{ t("pl.ls.noneForP", "Check the spelling, try a shorter word, or start from a department.") }}</p>
        <form class="pl-retry" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="pl-rq">{{ t("pl.ls.again", "Search again") }}</label>
          <input id="pl-rq" :value="q" enterkeyhint="search" type="search" @input="q = $event.target.value" />
          <button class="pl-btn primary" type="submit"><ly-icon name="search" />{{ t("ly.ls.searchBtn", "Search") }}</button>
        </form>
        <nav :aria-label="t('pl.ls.popularDepts', 'Popular departments')" class="pl-rail">
          <router-link v-for="c in ly.cats.slice(0, 6)" :key="c.id" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
        </nav>
        <router-link :to="allTo" class="pl-more">{{ t("pl.ls.seeAll", "See all toys") }}<ly-icon cls="pl-fwd" name="arrow" /></router-link>
      </section>

      <!-- Deals with no offer running: good finds from the shop's own prices -->
      <template v-else-if="kind === 'deals' && ready && !base.length">
        <section class="pl-panel pl-deals-empty">
          <span class="pl-empty-ic"><ly-icon name="sparkle" /></span>
          <div>
            <h2>{{ t("pl.ls.noDeals", "No offers right now") }}</h2>
            <p v-if="under">{{ t("pl.ls.noDealsP", "New offers appear here first. Until then, these toys are all {amount} or less.", { amount: money(under.cap, true) }) }}</p>
            <p v-else>{{ t("pl.ls.noDealsP0", "New offers appear here first.") }}</p>
          </div>
          <router-link :to="allTo" class="pl-btn quiet">{{ t("pl.ls.browseAll", "Browse all toys") }}</router-link>
        </section>
        <section v-if="under" class="pl-home-section">
          <div class="pl-section-top">
            <h2>{{ t("pl.ls.under", "Good finds under {amount}", { amount: money(under.cap, true) }) }}</h2>
            <router-link :to="allTo" class="pl-more">{{ t("pl.ls.seeAll", "See all toys") }}<ly-icon cls="pl-fwd" name="arrow" /></router-link>
          </div>
          <div v-pl-fit="{ max: 4 }" class="pl-grid">
            <ly-card v-for="p in under.list" :key="p.id" :product="p" />
          </div>
        </section>
      </template>

      <section v-else :aria-label="title" class="pl-catalog-main">
        <nav :aria-label="t('pl.hdr.departments', 'Departments')" class="pl-results-nav">
          <strong>{{ t("pl.hdr.departments", "Departments") }}</strong>
          <div ref="rail">
            <router-link :class="{ selected: kind !== 'category' }" :to="allTo">{{ t("pl.ls.all", "All toys") }}</router-link>
            <router-link v-for="c in ly.cats" :key="c.id" :aria-current="cat && c.id === cat.id ? 'page' : undefined" :class="{ selected: cat && c.id === cat.id }" :to="catTo(c)"
              ><bdi>{{ catTitle(c) }}</bdi></router-link
            >
          </div>
        </nav>

        <div class="pl-toolbar">
          <span role="status">{{ t("pl.ls.count", { one: "{n} toy", other: "{n} toys" }, { n: list.length }) }}</span>
          <div>
            <div :aria-label="t('pl.ls.view', 'Product view')" class="pl-view-switch" role="group">
              <button :aria-pressed="view === 'list' ? 'true' : 'false'" type="button" @click="setView('list')">{{ t("pl.ls.list", "List") }}</button>
              <button :aria-pressed="view === 'grid' ? 'true' : 'false'" type="button" @click="setView('grid')">{{ t("pl.ls.grid", "Grid") }}</button>
            </div>
            <button :aria-controls="fpId" :aria-expanded="layer.open === fpId ? 'true' : 'false'" class="pl-btn quiet fbtn pl-filter-open" type="button" @click="toggleLayer(fpId, $event.currentTarget)">
              <ly-icon name="sliders" />{{ t("pl.ls.filters", "Filters") }}<span v-if="active.length" class="pl-filter-count">{{ active.length }}</span>
            </button>
            <label class="pl-sort">
              <span>{{ t("pl.ls.sort", "Sort") }}</span>
              <span class="pl-select">
                <select :aria-label="t('pl.ls.sortAria', 'Sort toys')" :value="sort" @change="setSort($event.target.value)">
                  <option v-for="s in sorts" :key="s[0]" :value="s[0]">{{ s[1] }}</option>
                </select>
                <ly-icon name="down" />
              </span>
            </label>
          </div>
        </div>

        <div v-if="active.length" class="pl-active-filters">
          <span class="sr-only">{{ t("pl.ls.activeFilters", "Active filters:") }}</span>
          <button v-for="a in active" :key="a.id" :aria-label="t('ly.ls.removeFilter', 'Remove filter {name}', { name: a.label })" class="pl-filter-chip" type="button" @click="a.clear()">
            <bdi>{{ a.label }}</bdi><ly-icon name="close" />
          </button>
          <button class="pl-filter-clear" type="button" @click="reset">{{ t("ly.ls.clearAll", "Clear all") }}</button>
        </div>

        <p :class="['upd', { on: busy }]" aria-live="polite"><span aria-hidden="true" class="spin"></span>{{ t("ly.ls.updating", "Updating results…") }}</p>
        <div v-if="!ready" :class="['pl-grid', { 'pl-list-grid': view === 'list' }]">
          <div v-for="i in 6" :key="i" aria-hidden="true" class="pl-card pl-skel"><div class="pl-media"></div><div class="pl-card-data"><span class="sk-l"></span><span class="sk-l s"></span></div></div>
        </div>
        <div v-else-if="shown.length" ref="grid" v-pl-fit="view === 'list' ? null : { max: 5 }" :class="['pl-grid', { 'pl-list-grid': view === 'list', dim: busy }]" :data-n="shown.length">
          <ly-card
            v-for="(p, i) in shown.slice(0, limit)"
            :key="p.id + ':' + drawn"
            :cls="[view === 'list' ? 'pl-wide' : '', animate ? 'fu' : '']"
            :delay="animate ? Math.min(i, 12) * 25 : null"
            :product="p"
          />
        </div>
        <div v-if="ready && shown.length > limit" class="pl-show-more">
          <button class="pl-btn quiet" type="button" @click="limit += 24">{{ t("pl.ls.showMore", "Show more toys") }}</button>
        </div>
        <section v-if="ready && !shown.length" class="pl-panel pl-empty">
          <span class="pl-empty-ic"><ly-icon name="search" /></span>
          <h2>{{ t("pl.ls.noneT", "No toys found") }}</h2>
          <p>{{ t("pl.ls.noneP", "Try a different search or clear filters to see more toys.") }}</p>
          <button class="pl-btn primary" type="button" @click="reset">{{ t("ly.ls.clearFilters", "Clear filters") }}</button>
        </section>

        <!-- Search: guides from the blog -->
        <div v-if="kind === 'search' && postHits.length" class="pl-sr-posts">
          <h2>{{ t("pl.ls.fromGuides", "From the play guides") }}</h2>
          <ul>
            <li v-for="b in postHits" :key="b.id">
              <router-link :to="postRoute(b)"
                ><span class="pl-sr-th"><img v-if="b.image" :src="postImg(b)" alt="" loading="lazy" /></span
                ><span class="pl-sr-tx"><time v-if="b.created_at" :datetime="b.created_at">{{ fmtDate(b.created_at) }}</time><b>{{ b.title }}</b></span><ly-icon cls="pl-fwd" name="chev"
              /></router-link>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- The filters: a side sheet from the end (the design's filters-open catalog-controls), over the page. -->
    <teleport to="body">
      <div :dir="rtl ? 'rtl' : 'ltr'" class="ly ly-fpw pl-shell">
        <aside :id="fpId" :aria-label="t('pl.ls.filters', 'Filters')" :class="['panel', 'pl-filters', { open: layer.open === fpId }]">
          <div class="pl-filter-title">
            <h2>{{ t("pl.ls.filters", "Filters") }}</h2>
            <button class="pl-link-btn" type="button" @click="reset">{{ t("pl.ls.clear", "Clear") }}</button>
            <button :aria-label="t('ly.ls.closeFilters', 'Close filters')" class="pl-ibtn" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </div>
          <div class="pl-filter-body">
            <fieldset v-if="hi > lo" class="pl-price-filter">
              <legend>{{ t("ly.ls.price", "Price") }}<span class="sr-only"> ({{ currency }})</span></legend>
              <div>
                <label
                  >{{ t("pl.ls.min", "Min") }}
                  <span class="pl-price-input"
                    ><span aria-hidden="true" class="pl-price-cur">{{ sign }}</span
                    ><input :aria-label="t('ly.ls.minPrice', 'Minimum price')" :max="hi" :min="lo" :placeholder="String(lo)" :value="min > lo ? min : ''" inputmode="numeric" type="number" @change="boxMin($event.target.value)"
                  /></span>
                </label>
                <label
                  >{{ t("pl.ls.max", "Max") }}
                  <span class="pl-price-input"
                    ><span aria-hidden="true" class="pl-price-cur">{{ sign }}</span
                    ><input :aria-label="t('ly.ls.maxPrice', 'Maximum price')" :max="hi" :min="lo" :placeholder="String(hi)" :value="max < hi ? max : ''" inputmode="numeric" type="number" @change="boxMax($event.target.value)"
                  /></span>
                </label>
              </div>
            </fieldset>
            <div v-if="anyOffer" class="pl-offer-row">
              <span id="pl-offer-l">{{ t("ly.ls.onOffer", "On offer") }}</span>
              <button :aria-checked="offer ? 'true' : 'false'" aria-labelledby="pl-offer-l" class="switch" role="switch" type="button" @click="setOffer(!offer)"><span></span></button>
            </div>
            <details v-for="(fc, gi) in facets" :key="fc.key" :open="gi < 1 || !!(f[fc.key] && f[fc.key].length)" class="pl-facet">
              <summary>
                <span><bdi>{{ fc.key }}</bdi></span><ly-icon cls="chev" name="down" />
              </summary>
              <div class="pl-filter-choices">
                <template v-for="(v, i) in fc.values" :key="v">
                  <label v-if="!fc.long || i < 6 || moreOpen[fc.key]"
                    ><input :checked="picked(fc.key, v)" type="checkbox" @change="toggle(fc.key, v)" /><span><bdi>{{ v }}</bdi></span></label
                  >
                </template>
                <button v-if="fc.long && fc.values.length > 6" :aria-expanded="moreOpen[fc.key] ? 'true' : 'false'" class="pl-link-btn" type="button" @click="moreOpen = { ...moreOpen, [fc.key]: !moreOpen[fc.key] }">
                  {{ moreOpen[fc.key] ? t("ly.ls.fewer", "Show fewer") : t("ly.ls.more", "Show {n} more", { n: fc.values.length - 6 }) }}
                </button>
              </div>
            </details>
          </div>
          <div class="pl-filter-foot">
            <button class="pl-btn primary" type="button" @click="closeLayer()">{{ t("ly.ls.showResults", "Show results") }}</button>
          </div>
        </aside>
      </div>
    </teleport>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import LyCard from "../ui/LyCard.vue";
import { vPlFit } from "../playlab/pl-fit";
import { catOf, catTitle, catTo, closeLayer, ly, fmtDate, inCat, layer, loadDm, money, priceView, productTo, specGroups, specValue, toggleLayer } from "../ly";
import { AGE_KEY, ageMonths } from "../playlab/pl";
import { journalPage, postRoute } from "../../kalio/pages/kalio-journal";
import { currentCurrency, isRtl, regionState, signOf } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

/* A spec key whose every value reads like a paragraph is a note, not a filter. */
const NOTE = 80;
/* A group with a value this long shows six values, then "Show N more". */
const LONG = 30;
/* The round amounts "Good finds under …" may use, smallest first. */
const CAPS = [10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 500, 750, 1000, 2000, 5000];

export default {
  name: "LyListing",
  components: { LyIcon, LyCard },
  directives: { plFit: vPlFit },
  props: {
    categoryName: { type: String, default: null },
    search: { type: String, default: "" },
    deals: Boolean,
    initialSort: { type: String, default: "" },
  },
  /* fetched: the page's search-engine data (StorefrontSeo.updateProducts). */
  emits: ["fetched"],

  data: () => ({
    ly,
    layer,
    region: regionState,
    q: "",
    sort: "featured",
    f: {},
    offer: false,
    min: 0,
    max: 0,
    busy: false,
    animate: false,
    drawn: 0,
    snapshot: null,
    moreOpen: {},
    posts: [],
    limit: 24,
    view: "list",
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    sign() {
      return signOf(this.currency) || this.currency;
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    ready() {
      return this.ly.ready;
    },
    id() {
      return this.kind === "category" ? "cat" : this.kind === "search" ? "sr" : this.kind === "deals" ? "dl" : "all";
    },
    fpId() {
      return "fp-" + this.id;
    },
    kind() {
      if (this.categoryName) return "category";
      if (this.search) return "search";
      if (this.deals) return "deals";
      return "all";
    },
    cat() {
      return this.ly.cats.find((c) => c.name === this.categoryName) || null;
    },
    allTo() {
      return { name: window.$storefront.routes.SHOP_PAGE };
    },
    /* The products this page starts from. */
    base() {
      const all = this.ly.products;
      if (this.kind === "category") return this.cat ? inCat(this.cat.id) : all.filter((p) => String(p.category_id) === String(this.categoryName));
      if (this.kind === "search") return this.matches(this.search);
      if (this.kind === "deals") return all.filter((p) => this.pv(p).save > 0);
      /* ?brand= (a Brands menu, a brand link): only that brand */
      if (this.brandQ) return all.filter((p) => String(p.brand || "").trim() === this.brandQ);
      return all;
    },
    brandQ() {
      return this.kind === "all" ? String(this.$route?.query?.brand || "").trim() : "";
    },
    title() {
      if (this.kind === "category") return catTitle(this.cat) || "";
      if (this.kind === "search") return t("pl.ls.searchT", "Search results");
      if (this.kind === "deals") return t("ly.ls.deals", "Deals");
      if (this.brandQ) return this.brandQ;
      return t("pl.ls.all", "All toys");
    },
    lead() {
      if (this.kind === "category") return this.cat?.description || t("pl.ls.catLead", "Find a toy for their next adventure.");
      if (this.kind === "search") return this.base.length || !this.ready ? t("ly.ls.resultsFor", "Results for “{q}”", { q: this.search }) : t("pl.ls.noResultsFor", "No results for “{q}”", { q: this.search });
      if (this.kind === "deals") return this.base.length || !this.ready ? t("pl.ls.dealsLead", "Explore current offers from {shop}.", { shop: this.shopName }) : t("pl.ls.dealsNone", "There are no offers running right now.");
      return t("pl.ls.allLead", "Search the catalog or jump straight to a department.");
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    prices() {
      return this.base.map((p) => this.pv(p).now);
    },
    lo() {
      return this.prices.length ? Math.floor(Math.min(...this.prices)) : 0;
    },
    hi() {
      return this.prices.length ? Math.ceil(Math.max(...this.prices)) : 0;
    },
    anyOffer() {
      return this.base.some((p) => this.pv(p).save > 0);
    },
    /* Every spec key of these toys (the design's facets): keys with several values first; an age key youngest
       first; a paragraph-like note is left out. */
    facets() {
      const map = new Map();
      for (const p of this.base) {
        for (const g of specGroups(p)) {
          for (const [k, v] of g.rows) {
            if (!map.has(k)) map.set(k, new Set());
            map.get(k).add(String(v));
          }
        }
      }
      return [...map.entries()]
        .map(([key, set]) => {
          const age = AGE_KEY.test(key);
          const values = [...set].sort((a, b) => (age ? ageMonths(a) - ageMonths(b) : 0) || a.localeCompare(b, undefined, { numeric: true }));
          return { key, age, values, long: values.length > 8 || values.some((v) => v.length > LONG), note: values.every((v) => v.length > NOTE) };
        })
        .filter((x) => !x.note && x.values.length > 1)
        .sort((a, b) => (b.age ? 1 : 0) - (a.age ? 1 : 0));
    },
    sorts() {
      const s = [
        ["featured", t("ly.ls.sFeatured", "Featured")],
        ["best", t("ly.ls.sBest", "Best sellers")],
        ["review", t("ly.ls.sReview", "Customer review")],
        ["low", t("pl.ls.sLow", "Price, low to high")],
        ["high", t("pl.ls.sHigh", "Price, high to low")],
        ["name", t("pl.ls.sName", "Name, A to Z")],
        ["new", t("ly.ls.sNew", "Newest")],
      ];
      if (this.kind === "deals") return [["saving", t("ly.ls.sSaving", "Biggest saving")], ...s.filter((x) => x[0] !== "featured" && x[0] !== "review")];
      if (this.kind === "search") return [["match", t("pl.ls.sMatch", "Best match")], ...s.filter((x) => x[0] !== "featured")];
      return s;
    },
    list() {
      const l = this.base.filter((p) => {
        const now = this.pv(p).now;
        if (this.hi > this.lo && (now < this.min - 0.001 || now > this.max + 0.001)) return false;
        if (this.offer && !(this.pv(p).save > 0)) return false;
        for (const k of Object.keys(this.f)) if (this.f[k].length && !this.f[k].includes(String(specValue(p, k)))) return false;
        return true;
      });
      return this.sorted(l);
    },
    shown() {
      return this.snapshot || this.list;
    },
    active() {
      const out = [];
      for (const k of Object.keys(this.f)) for (const v of this.f[k]) out.push({ id: k + ":" + v, label: v, clear: () => this.toggle(k, v) });
      if (this.offer) out.push({ id: "offer", label: t("ly.ls.onOffer", "On offer"), clear: () => this.setOffer(false) });
      if (this.hi > this.lo && this.min > this.lo) out.push({ id: "min", label: t("pl.ls.from", "From {amount}", { amount: money(this.min, true) }), clear: () => this.boxMin("") });
      if (this.hi > this.lo && this.max < this.hi) out.push({ id: "max", label: t("pl.ls.upTo", "Up to {amount}", { amount: money(this.max, true) }), clear: () => this.boxMax("") });
      return out;
    },
    /* "Good finds under <amount>" (deals without an offer): the smallest round amount that holds eight toys in
       stock (or every toy of a small shop), the cheapest first. */
    under() {
      void this.currency;
      const stock = this.ly.products.filter((p) => p.quantity > 0).sort((a, b) => this.pv(a).now - this.pv(b).now);
      if (!stock.length) return null;
      const want = Math.min(8, stock.length);
      const nth = this.pv(stock[want - 1]).now;
      const cap = CAPS.find((c) => c >= nth) || Math.ceil(nth / 1000) * 1000;
      const list = stock.filter((p) => this.pv(p).now <= cap).slice(0, 8);
      return list.length ? { cap, list } : null;
    },
    searchPh() {
      const words = [...new Set(this.ly.products.flatMap((p) => String(p.title || "").split(/\s+/).slice(-1)).filter((w) => w.length > 3))].slice(0, 3);
      return words.length ? t("pl.ls.searchPh", "Try {examples}", { examples: words.join(", ") }) : t("pl.ls.searchPh0", "Search the catalog");
    },
    /* Posts whose title or line has every word. */
    postHits() {
      const words = String(this.search || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      return this.posts.filter((b) => words.every((w) => (String(b.title || "") + " " + String(b.description || "")).toLowerCase().includes(w))).slice(0, 3);
    },
  },

  watch: {
    base: {
      handler(list) {
        this.resetRange();
        this.applyAge();
        this.snapshot = null;
        if (this.ready && (this.kind !== "category" || this.cat)) this.$emit("fetched", { parent: this.cat || null, products: list });
      },
      immediate: true,
    },
    search: {
      handler(v) {
        this.q = v || "";
      },
      immediate: true,
    },
    categoryName() {
      this.f = {};
      this.offer = false;
      this.animate = false;
      this.moreOpen = {};
      this.limit = 24;
    },
  },

  created() {
    loadDm();
    this.sort =
      this.kind === "deals" ? "saving" : this.kind === "search" ? "match" : { most_sales: "best", newest: "new", cheapest: "low", most_expensive: "high" }[this.initialSort] || "featured";
    let v = String(this.$route?.query?.view || "");
    if (!v)
      try {
        v = localStorage.getItem("pl-view") || "";
      } catch {
        v = "";
      }
    this.view = v === "grid" ? "grid" : "list";
  },

  mounted() {
    if (this.kind === "search")
      journalPage({ page: 1, limit: 30 })
        .then(({ articles }) => (this.posts = articles || []))
        .catch(() => (this.posts = []));
    /* the department rail starts with this department in view (a sideways strip on a phone) */
    this.$nextTick(() => {
      const rail = this.$refs.rail;
      const chip = rail?.querySelector(".selected");
      if (rail && chip && rail.scrollWidth > rail.clientWidth) rail.scrollLeft += chip.offsetLeft - rail.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2;
    });
  },

  beforeUnmount() {
    clearTimeout(this.timer);
    if (this.layer.open === this.fpId) closeLayer(true);
  },

  methods: {
    t,
    money,
    catTitle,
    catTo,
    productTo,
    postRoute,
    fmtDate,
    toggleLayer,
    closeLayer,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    postImg(b) {
      return b.image ? window.CDN.GET_SHOP_IMAGE_PATH(b.image, null) : null;
    },
    matches(q) {
      const words = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      return this.ly.products
        .map((p) => {
          const title = String(p.title || "").toLowerCase();
          const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
          let s = 0;
          for (const w of words) {
            if (title.includes(w)) s += 3;
            else if (hay.includes(w)) s += 1;
            else return { p, s: 0 };
          }
          return { p, s };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .map((x) => x.p);
    },
    sorted(l) {
      const out = [...l];
      const key = this.sort;
      if (key === "best") return out.sort((a, b) => (b.sells || 0) - (a.sells || 0) || a.id - b.id);
      if (key === "review") return out.sort((a, b) => (b.rate || 0) - (a.rate || 0) || (b.rate_count || 0) - (a.rate_count || 0));
      if (key === "low") return out.sort((a, b) => this.pv(a).now - this.pv(b).now || a.id - b.id);
      if (key === "high") return out.sort((a, b) => this.pv(b).now - this.pv(a).now || a.id - b.id);
      if (key === "name") return out.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
      if (key === "new") return out.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || b.id - a.id);
      if (key === "saving") return out.sort((a, b) => this.pv(b).save - this.pv(a).save || a.id - b.id);
      return out;
    },
    resetRange() {
      this.min = this.lo;
      this.max = this.hi;
      /* ?price=lo-hi (a price link) */
      const m = String(this.$route?.query?.price || "").match(/^([0-9]*)-([0-9]*)$/);
      if (m && this.hi > this.lo) {
        if (m[1]) this.min = Math.max(this.lo, Math.min(this.hi, Number(m[1])));
        if (m[2]) this.max = Math.min(this.hi, Math.max(this.min, Number(m[2])));
      }
    },
    /* ?age=<value> (Shop by age): that age picked under the toys' own age key. */
    applyAge() {
      const age = String(this.$route?.query?.age || "").trim();
      if (!age || !this.base.length) return;
      const fc = this.facets.find((x) => x.age && x.values.includes(age));
      if (fc && !(this.f[fc.key] || []).includes(age)) this.f = { ...this.f, [fc.key]: [age] };
    },
    setView(v) {
      this.view = v;
      try {
        localStorage.setItem("pl-view", v);
      } catch {
        /* private window: the view still changes */
      }
    },
    /* Dim, say "Updating results…", then draw the new list fading up. */
    update() {
      this.limit = 24;
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (still) {
        this.animate = false;
        this.snapshot = [...this.list];
        return;
      }
      this.busy = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.busy = false;
        this.animate = true;
        this.drawn++;
        this.snapshot = [...this.list];
      }, 300);
    },
    picked(k, v) {
      return !!(this.f[k] && this.f[k].includes(v));
    },
    toggle(k, v) {
      const cur = [...(this.f[k] || [])];
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(v);
      this.f = { ...this.f, [k]: cur };
      this.update();
    },
    setOffer(v) {
      this.offer = v;
      this.update();
    },
    setSort(s) {
      this.sort = s;
      this.update();
    },
    boxMin(v) {
      const n = parseFloat(v);
      this.min = isNaN(n) ? this.lo : Math.max(this.lo, Math.min(Math.round(n), this.max));
      this.update();
    },
    boxMax(v) {
      const n = parseFloat(v);
      this.max = isNaN(n) ? this.hi : Math.min(this.hi, Math.max(Math.round(n), this.min));
      this.update();
    },
    reset() {
      this.f = {};
      this.offer = false;
      this.min = this.lo;
      this.max = this.hi;
      this.update();
    },
    searchTo(q) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { search: q } };
    },
    submitSearch() {
      const q = this.q.trim();
      if (!q) return;
      this.$router.push(this.searchTo(q));
    },
  },
};
</script>
