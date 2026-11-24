<!--
  Play Lab's page not found (the approved design's routes['404']): inside the Layout, with the header and footer.
  The breadcrumb and "Page not found", then the design's empty panel: "This page wandered off", why, a search of
  the catalogue and "Back to <shop>"; then four toys to try instead (the shop's best sellers in stock, one
  department after another).
-->
<template>
  <div class="ly ly-404 pl-shell pl-page">
    <div class="pl-wrap">
      <nav :aria-label="t('ly.pt.crumbs', 'Breadcrumb')" class="pl-crumbs">
        <router-link :to="{ path: '/' }">{{ t("ly.pt.home", "Home") }}</router-link><ly-icon cls="pl-fwd" name="chev" /><span aria-current="page">{{ t("ly.nf.title", "Page not found") }}</span>
      </nav>
      <div class="pl-page-title">
        <h1>{{ t("ly.nf.title", "Page not found") }}</h1>
      </div>
      <section aria-labelledby="nf-h" class="pl-panel pl-empty">
        <span class="pl-empty-ic"><ly-icon name="sparkle" /></span>
        <h2 id="nf-h">{{ t("ly.nf.h", "This page wandered off") }}</h2>
        <p>{{ t("ly.nf.p", "Explore the toy shop or go back to the homepage.") }}</p>
        <form class="pl-retry" role="search" @submit.prevent="go">
          <label class="sr-only" for="nfq">{{ t("ly.nf.search", "Search toys") }}</label>
          <input id="nfq" v-model="q" :placeholder="placeholder" autocomplete="off" enterkeyhint="search" type="search" />
          <button class="pl-btn quiet" type="submit"><ly-icon name="search" />{{ t("ly.nf.go", "Search") }}</button>
        </form>
        <router-link :to="{ path: '/' }" class="pl-btn primary"><bdi>{{ t("pl.nf.back", "Back to {shop}", { shop: shopName }) }}</bdi></router-link>
      </section>
      <section v-if="picks.length" aria-labelledby="nft-h" class="pl-home-section">
        <div class="pl-section-top">
          <h2 id="nft-h">{{ t("ly.nf.tryH", "A few toys to try instead") }}</h2>
        </div>
        <div v-pl-fit="{ max: 4 }" class="pl-grid">
          <ly-card v-for="p in picks" :key="p.id" :product="p" />
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LyIcon from "../../../components/ly/LyIcon.vue";
import LyArt from "../../../components/ly/LyArt.vue";
import LyCard from "../../../components/ly/ui/LyCard.vue";
import { vPlFit } from "../../../components/ly/playlab/pl-fit";
import { bySells, catTitle, ly, loadDm, mixed } from "../../../components/ly/ly";
import { catalogueRoute, dealsRoute } from "../../../components/kalio/kalio-catalog";
import { t } from "../../../components/kalio/i18n/kalio-i18n";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { LyIcon, LyArt, LyCard },
  directives: { plFit: vPlFit },
  data: () => ({ q: "", ly }),
  computed: {
    /* Six best sellers in stock, one collection after another. */
    picks(): any[] {
      return mixed(bySells(this.ly.products.filter((x: any) => x.quantity > 0))).slice(0, 4);
    },
    /* "Search croissants, tarts…" from the shop's own collections. */
    placeholder(): string {
      const names = this.ly.cats.slice(0, 2).map((c: any) => catTitle(c).toLowerCase());
      return names.length ? t("ly.nf.ph", "Search {names}…", { names: names.join(", ") }) : t("ly.nf.search", "Search the bakery");
    },
    shopName(): string {
      const n = (this as any).$store.getters.getShop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    dealsTo(): any {
      return dealsRoute();
    },
  },
  created() {
    loadDm();
    (this as any).setPageTitle?.(t("ly.nf.title", "Page not found"));
  },
  methods: {
    t,
    go() {
      const text = this.q.trim();
      const r = (window as any).$storefront.routes;
      this.$router.push(text ? { name: r.SHOP_PAGE, query: { search: text } } : catalogueRoute({}));
    },
  },
});
</script>
