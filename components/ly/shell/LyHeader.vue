<!--
  Play Lab's header (the approved design's shared/app.js labHeader(), play-lab.css .lab-mast / .lab-navigation):

  - the mast: the menu button (phones), the square glyph and the shop's live title in condensed capitals with the
    skin's sub line; a wide search (live suggestions from the catalogue while typing; Enter opens every result);
    saved toys, the account and the "Bag" button with its count.
  - the navigation row: "Departments" (opens the departments panel), the shop's departments in its own order (as
    many as fit on one line; the rest are in the panel), then Deals, Compare, Guides and the language & currency pill
    (EN · USD; the region-switcher kit's chips in a small panel).
  - phone (≤620px): menu, wordmark, account and bag on the first line, the search under it; the navigation row is
    the panel. The panel ("Explore <shop>") has Shop all toys and Deals, the departments with their own images (the
    first 6, "Show N more" past 8), then the guides, saved toys, compare, help, sign-in and the region row. No
    bottom tab bar.

  Every layer opens on a click and closes on a second click, Esc, a click outside or a page change (ly.ts layers);
  the panel, the bag and the sheet add the scrim. The panels are teleported to <body>. A shop with custom header
  code keeps Selldone's header (StorefrontLayout). Nothing names a department, product or price: all live.
-->
<template>
  <div v-if="!$store.getters.getIsNative" class="ly ly-hdrwrap pl-shell">
    <a class="skip" href="#main" @click.prevent="skip">{{ t("ly.hdr.skip", "Skip to content") }}</a>

    <header id="hdr" class="pl-header">
      <div class="pl-wrap pl-mast">
        <div class="pl-mast-start">
          <button
            :aria-expanded="is('menu') ? 'true' : 'false'"
            :aria-label="t('ly.hdr.menu', 'Menu')"
            aria-controls="menu"
            class="pl-ibtn pl-menu-btn menu-btn"
            type="button"
            @click="toggle('menu', $event)"
          >
            <ly-icon name="menu" />
          </button>
          <ly-logo />
        </div>

        <div ref="sbox" class="pl-search-box" @focusout="onBlur" @keydown.esc="sug = false">
          <form :class="['pl-search', { open: sug && !!query }]" role="search" @submit.prevent="submit()">
            <label class="sr-only" for="pl-q">{{ t("pl.hdr.searchLabel", "Search toys") }}</label>
            <input
              id="pl-q"
              ref="q"
              :aria-expanded="sug && !!query ? 'true' : 'false'"
              :placeholder="searchPlaceholder"
              :value="q"
              aria-autocomplete="list"
              aria-controls="pl-sug"
              autocomplete="off"
              enterkeyhint="search"
              role="combobox"
              type="search"
              @focus="sug = true"
              @input="onInput"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
            />
            <button :aria-label="t('ly.hdr.search', 'Search')" type="submit"><ly-icon name="search" /></button>
          </form>
          <div v-show="sug && !!query" id="pl-sug" class="pl-sug" role="listbox">
            <ul v-if="hits.length">
              <li v-for="(p, i) in hits" :key="p.id">
                <router-link :class="{ hl: i === cursor }" :to="productTo(p)" role="option" @click="done()">
                  <span class="pl-sug-ph"><img :src="thumb(p)" alt="" /></span>
                  <span class="pl-sug-tx"
                    ><b>{{ p.title }}</b><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi></small></span
                  >
                  <span class="money">{{ money(priceView(shop, p).now) }}</span>
                </router-link>
              </li>
            </ul>
            <p v-if="!hits.length" class="pl-sug-none">{{ t("pl.hdr.noMatch", "No toys match “{q}” yet. Press Enter to search everything.", { q: query }) }}</p>
            <router-link v-else :to="searchTo(query)" class="pl-sug-all" @click="done()">{{ t("ly.hdr.allFor", "See every result for “{q}”", { q: query }) }}<ly-icon name="arrow" /></router-link>
          </div>
        </div>

        <div class="pl-actions">
          <router-link :aria-label="t('pl.hdr.saved', 'Saved toys')" :title="t('pl.hdr.saved', 'Saved toys')" :to="savedTo" class="pl-ibtn pl-save"><ly-icon name="heart" /></router-link>
          <router-link :aria-label="t('ly.hdr.account', 'Account')" :title="t('ly.hdr.account', 'Account')" :to="accountTo" class="pl-ibtn acct"><ly-icon name="user" /></router-link>
          <button
            :aria-expanded="is('drawer') ? 'true' : 'false'"
            :aria-label="t('pl.hdr.bagAria', { one: 'Bag, {n} item', other: 'Bag, {n} items' }, { n: units })"
            aria-controls="drawer"
            class="pl-bag-btn bag-btn"
            type="button"
            @click="toggle('drawer', $event)"
          >
            <ly-icon name="bag" /><span class="pl-bag-word">{{ t("pl.hdr.bag", "Bag") }}</span><span v-if="units" class="pl-bag-count">{{ units > 99 ? "99+" : units }}</span>
          </button>
        </div>
      </div>

      <nav :aria-label="t('pl.hdr.shopNav', 'Shop')" class="pl-nav">
        <div class="pl-wrap pl-nav-in">
          <button :aria-expanded="is('menu') ? 'true' : 'false'" aria-controls="menu" class="pl-btn quiet pl-dept-btn" type="button" @click="toggle('menu', $event)">
            <ly-icon name="grid" />{{ t("pl.hdr.departments", "Departments") }}
          </button>
          <div ref="links" class="pl-nav-links">
            <router-link v-for="(c, i) in cats" :key="c.id" :aria-current="onCat(c) ? 'page' : undefined" :class="{ 'pl-off': i >= fit }" :tabindex="i >= fit ? -1 : undefined" :to="catTo(c)"
              ><bdi>{{ catTitle(c) }}</bdi></router-link
            >
          </div>
          <div class="pl-nav-end">
            <router-link :aria-current="onDeals ? 'page' : undefined" :to="dealsTo">{{ t("ly.hdr.deals", "Deals") }}</router-link>
            <router-link :aria-current="onCompare ? 'page' : undefined" :to="compareTo">{{ t("pl.hdr.compare", "Compare") }}</router-link>
            <router-link :aria-current="onJournal ? 'page' : undefined" :to="blogTo">{{ t("pl.hdr.guides", "Guides") }}</router-link>
            <button
              v-if="regionOn"
              :key="regionKey"
              :aria-expanded="is('rgp') ? 'true' : 'false'"
              :aria-label="t('ly.hdr.regionAria', 'Language and currency: {value}', { value: regionShort })"
              aria-controls="rgp"
              class="pl-region rs-pick__btn"
              type="button"
              @click="toggle('rgp', $event)"
            >
              <ly-icon name="globe" /><span dir="ltr">{{ regionShort }}</span>
            </button>
          </div>
        </div>
      </nav>
    </header>

    <teleport to="body">
      <div :dir="rtl ? 'rtl' : 'ltr'" class="ly ly-layers pl-shell">
        <!-- Language and currency (the region-switcher kit's chips; its class
             names stay on the pill, panel and sheet so its checks find them). -->
        <div v-if="regionOn" id="rgp" ref="rgp" :aria-label="t('region.title', 'Language & currency')" :class="['rgp', 'rs-pop', { open: is('rgp') }]" :style="rgpPos" role="dialog">
          <p class="dd-h">{{ regionTitle }}</p>
          <region-chips :key="regionKey" @picked="closeLayer()" />
          <p v-if="regionNote" class="rgp-note">{{ regionNote }}</p>
        </div>

        <!-- The departments panel (the design's menu.html), from the start side. -->
        <nav id="menu" :aria-label="t('pl.hdr.explore', 'Explore {name}', { name: shopName })" :class="['panel', 'menu', 'pl-menu', { open: is('menu') }]">
          <div class="pl-menu-hd">
            <h2><bdi>{{ t("pl.hdr.explore", "Explore {name}", { name: shopName }) }}</bdi></h2>
            <button :aria-label="t('ly.hdr.closeMenu', 'Close menu')" class="pl-ibtn" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </div>
          <div class="pl-menu-body">
            <div class="pl-menu-top">
              <router-link :to="allTo" class="pl-btn primary">{{ t("pl.hdr.allToys", "Shop all toys") }}</router-link>
              <router-link :to="dealsTo" class="pl-btn quiet">{{ t("ly.hdr.deals", "Deals") }}</router-link>
            </div>
            <ul class="pl-menu-cats">
              <li v-for="c in menuCats" :key="c.id">
                <router-link :to="catTo(c)">
                  <span class="pl-menu-ph"><img v-if="catImg(c)" :src="catImg(c)" alt="" loading="lazy" /></span><span class="pl-menu-name"><bdi>{{ catTitle(c) }}</bdi></span
                  ><ly-icon cls="pl-fwd" name="chev" />
                </router-link>
              </li>
            </ul>
            <button v-if="menuRest.length" :aria-expanded="moreOpen ? 'true' : 'false'" class="pl-btn quiet pl-menu-more" type="button" @click="moreOpen = !moreOpen">
              {{ moreOpen ? t("ly.hdr.fewer", "Show fewer") : t("ly.hdr.more", "Show {n} more", { n: menuRest.length }) }}
            </button>
            <div class="pl-menu-links">
              <router-link :to="blogTo">{{ t("pl.hdr.playGuides", "Play guides") }}</router-link>
              <router-link :to="savedTo">{{ t("pl.hdr.saved", "Saved toys") }}</router-link>
              <router-link :to="compareTo">{{ t("pl.hdr.compareToys", "Compare toys") }}</router-link>
              <router-link :to="faqTo">{{ t("pl.hdr.help", "Help and FAQ") }}</router-link>
              <router-link :to="accountTo">{{ signedIn ? t("ly.hdr.account", "Account") : t("pl.hdr.signIn", "Sign in") }}</router-link>
              <button v-if="regionOn" :key="regionKey" aria-controls="langsheet" class="pl-region rs-row" type="button" @click="openLayer('langsheet', $event.currentTarget)">
                <ly-icon name="globe" /><span dir="ltr">{{ regionShort }}</span>
              </button>
            </div>
          </div>
        </nav>

        <!-- The language & currency sheet (phone). -->
        <div v-if="regionOn" id="langsheet" :aria-label="t('region.title', 'Language & currency')" :class="['ly-sheet', 'rs-sheet', { open: is('langsheet') }]" aria-modal="true" role="dialog">
          <div class="pn-hd">
            <h2 class="pn-t">{{ t("region.title", "Language & currency") }}</h2>
            <button :aria-label="t('ly.hdr.close', 'Close')" class="ibtn x" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </div>
          <div class="sh-body">
            <region-chips :key="regionKey" />
            <p v-if="regionNote" class="rgp-note">{{ regionNote }}</p>
            <button class="btn block" type="button" @click="closeLayer()">{{ t("region.done", "Done") }}</button>
          </div>
        </div>

        <div :class="['scrim', { open: scrim }]" @click="closeLayer()"></div>
        <ly-bag-drawer />
      </div>
      <ly-quick-view />
    </teleport>
  </div>
</template>

<script>
import LyLogo from "../LyLogo.vue";
import LyIcon from "../LyIcon.vue";
import LyBagDrawer from "./LyBagDrawer.vue";
import LyQuickView from "../ui/LyQuickView.vue";
import RegionChips from "../../region-switcher/RegionChips.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { currencies, currentCurrency, currentLanguage, hasChoice, isRtl, regionState, showLanguages } from "../../region-switcher/region";
import {
  catImage,
  catOf,
  catTitle,
  catTo,
  closeLayer,
  closeOnRoute,
  ly,
  isModal,
  layer,
  loadDm,
  money,
  openLayer,
  priceView,
  productImage,
  productTo,
  toggleLayer,
  wireLayers,
} from "../ly";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyHeader",
  components: { LyLogo, LyIcon, LyBagDrawer, LyQuickView, RegionChips },
  props: {
    showSearch: { type: Boolean, default: true },
  },
  emits: ["search", "clear"],

  data: () => ({ q: "", cursor: -1, sug: false, moreOpen: false, fit: 99, rgpPos: {}, layer, ly, region: regionState }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    cats() {
      return this.ly.cats;
    },
    signedIn() {
      return !!this.$store.getters.getUser;
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    /* the Guides link stays lit on a post too */
    onJournal() {
      const r = window.$storefront?.routes || {};
      return [r.BLOGS_PAGE, r.SHOP_BLOG_PAGE, r.SHOP_BLOG_PAGE_SLUG].filter(Boolean).includes(this.$route?.name);
    },
    onDeals() {
      return !!this.$route?.query?.filter && /only_has_discount/.test(String(this.$route.query.filter)) && !this.$route?.params?.category_name;
    },
    onCompare() {
      return this.$route?.name === this.r.COMPARISON_PAGE;
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    scrim() {
      return !!this.layer.open && isModal(this.layer.open);
    },
    /* The region package reads its words when it draws. */
    regionKey() {
      return t("region.title", "Language & currency") + this.region.words;
    },
    regionOn() {
      void this.shop;
      return hasChoice();
    },
    regionShort() {
      void this.region.currency;
      void this.region.language;
      void this.shop;
      return `${currentLanguage().toUpperCase()} · ${currentCurrency()}`;
    },
    regionTitle() {
      void this.shop;
      return showLanguages() ? t("region.title", "Language & currency") : t("region.currency", "Currency");
    },
    regionNote() {
      void this.shop;
      if (currencies().length <= 1 && !showLanguages()) return "";
      return t("region.note", "Prices everywhere change at once: cards, filters, bag and checkout.");
    },
    /* The panel: the first 6 departments in the shop's order, "Show N more" past 8. */
    menuCats() {
      return this.cats.length <= 8 || this.moreOpen ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    /* No product count in the shop's own words (the owner's rule). */
    searchPlaceholder() {
      return t("pl.hdr.searchPh0", "Search toys, games and kits");
    },
    query() {
      return this.q.trim();
    },
    hits() {
      const q = this.query.toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/).filter(Boolean);
      const score = (p) => {
        const title = String(p.title || "").toLowerCase();
        const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
        let s = 0;
        for (const w of words) {
          if (title.includes(w)) s += 3;
          else if (hay.includes(w)) s += 1;
          else return 0;
        }
        return s;
      };
      return this.ly.products
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .slice(0, 6)
        .map((x) => x.p);
    },
    r() {
      return window.$storefront.routes;
    },
    dealsTo() {
      return dealsRoute();
    },
    allTo() {
      return { name: this.r.SHOP_PAGE };
    },
    blogTo() {
      return journalRoute();
    },
    compareTo() {
      return { name: this.r.COMPARISON_PAGE };
    },
    savedTo() {
      return { name: this.r.USER_FAVORITES_PAGE };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
  },

  watch: {
    "layer.open"(id) {
      if (id === "rgp") this.$nextTick(() => this.place());
      if (id !== "menu" && id !== "langsheet") this.moreOpen = false;
    },
    query() {
      this.cursor = -1;
    },
    cats() {
      this.$nextTick(() => this.measure());
    },
    $route() {
      this.done();
    },
  },

  created() {
    loadDm();
    wireLayers();
    closeOnRoute(this.$router);
  },

  mounted() {
    this.onResize = () => {
      if (this.layer.open === "rgp") this.place();
      this.measure();
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    document.fonts?.ready?.then(() => this.measure());
    this.$nextTick(() => this.measure());
    /* Any part of the page can open the bag. */
    this.openBag = () => openLayer("drawer");
    EventBus.$on("bakini:open-cart", this.openBag);
    EventBus.$on("ly:open-bag", this.openBag);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    EventBus.$off("bakini:open-cart", this.openBag);
    EventBus.$off("ly:open-bag", this.openBag);
  },

  methods: {
    t,
    money,
    priceView,
    catTitle,
    catTo,
    catOf,
    productTo,
    openLayer,
    closeLayer,
    is(id) {
      return this.layer.open === id;
    },
    toggle(id, e) {
      toggleLayer(id, e?.currentTarget || null);
    },
    onCat(c) {
      return String(this.$route?.params?.category_name || "") === String(c.name || "");
    },
    catImg(c) {
      return catImage(c, 128);
    },
    thumb(p) {
      return productImage(p, 128);
    },
    /* As many departments as fit on the row's one line; the rest stay in the panel. */
    measure() {
      if (!this.$refs.links) return;
      this.fit = 999;
      this.$nextTick(() => {
        const box = this.$refs.links;
        const kids = box ? [...box.children] : [];
        if (!kids.length) return;
        const top = kids[0].offsetTop;
        let n = kids.length;
        for (let i = 0; i < kids.length; i++)
          if (kids[i].offsetTop > top + 4) {
            n = i;
            break;
          }
        this.fit = n;
      });
    },
    /* Under the pill, its end edge on the pill's, never within 12px of an edge. */
    place() {
      const btn = document.querySelector('.pl-nav [aria-controls="rgp"]');
      const el = this.$refs.rgp;
      if (!btn || !el) return;
      const r = btn.getBoundingClientRect();
      const w = el.offsetWidth || 300;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w));
      this.rgpPos = { top: `${r.bottom + 8}px`, left: `${left}px` };
    },
    onInput(e) {
      this.q = e.target.value;
      this.sug = true;
    },
    onBlur(e) {
      if (!this.$refs.sbox?.contains(e.relatedTarget)) this.sug = false;
    },
    done() {
      this.sug = false;
      this.cursor = -1;
    },
    move(d) {
      const n = this.hits.length;
      if (!n) return;
      this.sug = true;
      this.cursor = (this.cursor + d + n) % n;
    },
    searchTo(q) {
      return { name: this.r.SHOP_PAGE, query: { search: q } };
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(productTo(this.hits[this.cursor]));
        this.done();
        return;
      }
      const text = this.query;
      this.done();
      this.$refs.q?.blur();
      if (!text) return this.$emit("clear");
      this.$emit("search", { search: text, search_type: null });
    },
    skip() {
      const m = document.getElementById("main") || document.querySelector("main");
      if (m) {
        m.setAttribute("tabindex", "-1");
        m.focus();
      }
    },
    catalogueRoute,
  },
};
</script>
