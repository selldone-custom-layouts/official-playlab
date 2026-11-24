<!--
  Saved toys (the design's wishlist.html), inside the account: the toys the visitor saved with a card's heart,
  as Play Lab's own cards (LyCard: photo, age, name, price, Add to bag), eight at a time with "Show more".
  Saving belongs to a signed-in account (Selldone's wishlist): a guest is asked to sign in, and an account
  with nothing saved is sent to the toys. The list is Selldone's (products, only_in_wishlist).
-->
<template>
  <div class="pl-saved">
    <div class="pl-saved-hd">
      <h2 class="co-h">{{ t("account.section.saved", "Saved") }}</h2>
      <p v-if="user && total" class="co-p">{{ t("pl.saved.count", { one: "{n} saved toy", other: "{n} saved toys" }, { n: total }) }}</p>
    </div>

    <ly-empty
      v-if="!user"
      :text="t('pl.saved.signP', 'Tap the heart on a toy to keep it here. Saved toys stay with your account.')"
      :title="t('pl.saved.signT', 'Sign in to see your saved toys')"
      cls="boxed"
      icon="heart"
    >
      <template #acts>
        <button class="btn" type="button" @click="signIn">{{ t("ly.acc.signIn", "Sign in") }}</button>
        <router-link :to="shopTo" class="btn quiet">{{ t("pl.saved.explore", "Explore toys") }}</router-link>
      </template>
    </ly-empty>

    <div v-else-if="!loaded" :aria-label="t('pl.saved.loading', 'Loading your saved toys')" class="pl-grid pl-saved-grid" role="status">
      <div v-for="i in 4" :key="i" aria-hidden="true" class="pl-card pl-skel"><div class="pl-media"></div><div class="pl-card-data"><span class="sk-l"></span><span class="sk-l s"></span></div></div>
    </div>

    <ly-empty
      v-else-if="!products.length"
      :text="t('pl.saved.emptyP', 'Tap the heart on any toy to keep it here for later.')"
      :title="t('pl.saved.emptyT', 'No saved toys yet')"
      cls="boxed"
      icon="heart"
    >
      <template #acts>
        <router-link :to="shopTo" class="btn">{{ t("pl.saved.explore", "Explore toys") }}</router-link>
      </template>
    </ly-empty>

    <template v-else>
      <div :class="['pl-grid', 'pl-saved-grid', { dim: busy }]">
        <ly-card v-for="p in products" :key="p.id" :product="p" />
      </div>
      <div v-if="products.length < total" class="pl-saved-more">
        <button :aria-disabled="busy ? 'true' : undefined" class="pl-btn quiet" type="button" @click="busy || fetch(products.length)">{{ t("pl.saved.more", "Show more") }}</button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { t } from "../../../components/kalio/i18n/kalio-i18n";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import LyCard from "../../../components/ly/ui/LyCard.vue";
import LyEmpty from "../../../components/ly/ui/LyEmpty.vue";
import { catalogueRoute } from "../../../components/kalio/kalio-catalog";

const PAGE = 8;

export default {
  name: "StorefrontPageUserWishlist",
  components: { LyCard, LyEmpty },
  inject: ["$shop"],
  data: () => ({
    products: [] as any[],
    total: 0,
    busy: false,
    loaded: false,
  }),
  computed: {
    user() {
      return this.USER();
    },
    shopTo() {
      return catalogueRoute({});
    },
  },
  watch: {
    user(u) {
      if (u && !this.loaded) this.fetch(0);
    },
  },
  created() {
    this.setPageTitle(t("account.section.saved", "Saved"));
    if (this.user) this.fetch(0);
  },
  methods: {
    t,
    signIn() {
      EventBus.$emit("need-login", true);
    },
    fetch(offset: number) {
      if (!this.user) return;
      this.busy = true;
      const take = ({ products, total }: any) => {
        const list = Array.isArray(products) ? products : [];
        this.products = offset ? [...this.products, ...list.filter((p: any) => !this.products.some((x: any) => x.id === p.id))] : list;
        this.total = Number(total) || this.products.length;
      };
      window.$storefront.products
        .optimize(60)
        .list("*", offset, PAGE, { dir: "*", only_in_wishlist: true, products_only: true, with_total: true })
        .cache(take)
        .then(take)
        .catch(() => {
          if (!offset) this.products = [];
        })
        .then(() => {
          this.busy = false;
          this.loaded = true;
        });
    },
  },
};
</script>
