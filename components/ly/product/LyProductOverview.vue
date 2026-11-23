<!--
  Play Lab's product top (the approved design's pages.js productView(), commerce.css .product-top, play-lab.css):
  the gallery (the photo in a fixed light box, one row of thumbnails: Selldone's own photos of the product) beside
  the side column: the brand or department as the eyebrow, the name in condensed capitals, the reviews' honest
  count, the opening of the product's own article, three facts from its specification; then the buy panel (the
  action colour's edge on top): the price (the struck price only while a discount window is open), the stock, the
  options (only when the product has real variants: tiles with their own photo or colour, the chosen one ringed
  inside, no tick), "Add to bag" (then − n In bag + in place) beside Save, "View bag" once it is in the bag,
  Compare toy and the SKU.

  On a phone, once the Add box has scrolled away, a buy bar at the foot (price and the same control).

  Every behaviour is Selldone's SProductOverview (through Kalio's): the chosen variant, the store, the basket line.
  A product that needs more than a count (a service, a valuation form, extra pricing, a subscription) keeps
  Selldone's own buy section here.
-->
<template>
  <section :aria-label="$product.title" class="pd pl-shell pl-pd">
    <div class="pl-wrap pl-product-top">
      <div class="pl-gallery">
        <div class="pl-media pl-main-photo">
          <span v-if="pv.off > 0" :aria-label="t('ly.card.offAria', '{off} percent off', { off: pv.off })" class="pl-off"><span dir="ltr">−{{ pv.off }}%</span></span>
          <img v-if="photo" :key="photo.src" :alt="photo.alt" :src="photo.src" decoding="async" height="640" loading="eager" width="640" />
        </div>
        <div v-if="photos.length > 1" :aria-label="t('ly.pd.photos', 'Photos')" class="pl-thumbs" role="group">
          <button
            v-for="(ph, i) in photos"
            :key="ph.src"
            :aria-label="t('ly.pd.photoN', 'Photo {n} of {total}', { n: i + 1, total: photos.length })"
            :aria-pressed="i === at ? 'true' : 'false'"
            type="button"
            @click="at = i"
          >
            <img :src="ph.thumb" alt="" loading="eager" />
          </button>
        </div>
      </div>

      <div class="pl-product-side">
        <div class="pl-product-intro">
          <router-link v-if="eyebrow" :to="eyebrowTo" class="pl-eyebrow"><bdi>{{ eyebrow }}</bdi></router-link>
          <h1>{{ $product.title }}</h1>
          <p class="pl-rating-line">
            <template v-if="rated"><ly-icon name="star" /><strong>{{ rate }}</strong></template>
            <a href="#tabs" @click.prevent="goReviews">{{ reviewsWord }}</a>
          </p>
          <p v-if="intro" class="pl-intro-p">{{ intro }}</p>
          <dl v-if="facts.length" class="pl-facts">
            <div v-for="[k, v] in facts" :key="k">
              <dt>{{ k }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
        </div>

        <aside :aria-label="t('pl.pd.buy', 'Buy')" class="pl-panel pl-purchase">
          <div v-if="isSubscription" class="opts ly-sd-sub">
            <s-subscription-price-select
              v-model="selected_subscription_price"
              :disabled="!$product.quantity"
              :subscription-prices="subscription_prices"
              return-object
            ></s-subscription-price-select>
          </div>
          <template v-else>
            <p class="pl-price pl-pd-price">
              <span class="money">{{ money(pv.now) }}</span><template v-if="pv.was">{{ " " }}<del class="money">{{ money(pv.was) }}</del></template>
            </p>
            <p v-if="pv.save > 0" class="pl-save">{{ t("ly.pd.save", "Save {amount} · {off}%", { amount: money(pv.save), off: pv.off }) }}</p>
            <p v-if="dealEndsAt" class="pl-stock ly-pd-deal"><ly-icon name="clock" />{{ t("ly.pd.dealEnds", "Deal ends in") }}{{ " " }}<bakini-deal-clock :end="dealEndsAt" mode="bare" /></p>
          </template>
          <s-product-section-tax></s-product-section-tax>

          <p :class="['pl-stock', { out: stock <= 0 }]">
            <ly-icon :name="stock > 0 ? 'check' : 'close'" /><template v-if="stock <= 0">{{ t("pl.add.out", "Out of stock") }}</template
            ><template v-else-if="stock <= 5">{{ t("ly.card.onlyLeftCap", "Only {n} left", { n: stock }) }}</template
            ><template v-else>{{ t("pl.pd.inStock", "In stock") }}</template>
          </p>
          <p v-if="!has_original_warranty" class="pl-small">{{ $t("product_info.fake") }}</p>

          <!-- Options: only for a product that really has them. -->
          <div v-if="tiles.length" class="opts pl-opts">
            <p class="opts-l">
              {{ dimWord }}<span v-if="currentLabel" class="opts-v">{{ currentLabel }}</span>
            </p>
            <div :aria-label="dimWord" class="opts-g" role="radiogroup">
              <button
                v-for="tl in tiles"
                :key="tl.v.id"
                :aria-checked="current_variant && current_variant.id === tl.v.id ? 'true' : 'false'"
                :class="['opt', { '-out': !(tl.v.quantity > 0) }]"
                role="radio"
                type="button"
                @click="current_variant = tl.v"
              >
                <span v-if="tl.img || tl.swatch" class="opt-ph"><img v-if="tl.img" :src="tl.img" alt="" loading="eager" /><i v-else :style="{ background: tl.swatch }" aria-hidden="true" class="ly-opt-sw"></i></span>
                <span class="opt-n">{{ tl.label }}</span>
                <small v-if="tl.price !== null" class="opt-p money">{{ money(tl.price) }}</small>
              </button>
            </div>
          </div>
          <div v-else-if="product_variants.length" class="opts ly-sd-variants">
            <s-product-section-variants
              v-model:current-variant="current_variant"
              v-model:filter="filter"
              v-model:selection-values="selection_values"
            ></s-product-section-variants>
          </div>

          <div class="ly-sd-more">
            <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
            <s-product-section-valuation
              v-if="preferences && preferences.valuation"
              :correspondingBasketItem="corresponding_basket_item"
              :current-variant="current_variant"
              :preferences="preferences"
            ></s-product-section-valuation>
            <s-product-section-extra-pricings
              :current-variant="current_variant"
              :preferences="preferences"
              :quantity="corresponding_basket_item?.count"
              :selected-vendor-product="selected_vendor_product"
              @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
            ></s-product-section-extra-pricings>
          </div>

          <div id="pd-acts" ref="add" class="pl-purchase-main">
            <div class="pd-add">
              <ly-pd-add v-if="simple" :needs-choice="needsChoice" :product="$product" :variant="current_variant" />
              <s-product-section-buy-button
                v-else
                ref="buy_section"
                :can-buy="canBuy"
                :current-variant="current_variant"
                :hss-sticky-but-button="hssStickyButButton"
                :preferences="preferences"
                :quick-buy-mode="quickBuyMode"
                :selected-subscription-price="selected_subscription_price"
                :selected-vendor-product="selected_vendor_product"
                class="ly-sd-buy"
              ></s-product-section-buy-button>
            </div>
            <button
              :aria-label="t('pl.pd.saveToy', 'Save toy')"
              :aria-pressed="isSaved ? 'true' : 'false'"
              :title="t('pl.card.saveT', 'Save')"
              class="pl-ibtn"
              type="button"
              @click="toggleSave"
            >
              <ly-icon name="heart" />
            </button>
          </div>
          <button v-if="inBag" class="pl-more" type="button" @click="openBag">{{ t("pl.pd.viewBag", "In your bag · View bag") }}</button>
          <button class="pl-more cmpb" type="button" @click="compareNow"><ly-icon name="swap" />{{ comparing ? t("pl.pd.viewCompare", "View comparison") : t("pl.pd.compare", "Compare toy") }}</button>
          <span v-if="$product.sku" class="pl-small" dir="ltr">{{ t("pl.pd.sku", "SKU {sku}", { sku: $product.sku }) }}</span>
        </aside>
      </div>
    </div>

    <!-- The phone's buy bar, once the Add box has scrolled away. -->
    <teleport to="body">
      <div class="ly ly-layers pl-shell">
        <div :aria-hidden="barOn ? undefined : 'true'" :class="['buybar', 'pl-mobile-buy', { on: barOn }]">
          <div class="pl-wrap bb-in">
            <span class="pl-price"
              ><span class="money">{{ money(pv.now) }}</span><template v-if="pv.was">{{ " " }}<del class="money">{{ money(pv.was) }}</del></template></span
            >
            <div class="bb-a">
              <ly-pd-add v-if="simple" :needs-choice="needsChoice" :product="$product" :variant="current_variant" />
              <button v-else class="pl-btn primary" type="button" @click="toAdd">{{ t("ly.add.add", "Add to bag") }}</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script>
import KalioProductOverview from "../../kalio/product/KalioProductOverview.vue";
import BakiniDealClock from "../../bakini/BakiniDealClock.vue";
import LyIcon from "../LyIcon.vue";
import LyIcLine from "../ui/LyIcLine.vue";
import LyPdAdd from "./LyPdAdd.vue";
import { catOf, catTitle, catTo, ly, money, priceView, unitOf } from "../ly";
import { deliveryLines, galleryOf, isEnglish, plural } from "./pd";
import { colourName, dealEnd, moneyOf, saved, swatchBg, toggleSaved, variantDimension } from "../../bakini/bakini";
import { facts as factsOf } from "../playlab/pl";
import { basketLine } from "../../kalio/kalio-basket";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { currentCurrency } from "../../region-switcher/region";
import { fitInCircle } from "../../bakini/fit-in-circle";
import { fitOnResize } from "../ly-fit";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyProductOverview",
  extends: KalioProductOverview,
  components: { BakiniDealClock, LyIcon, LyIcLine, LyPdAdd },
  emits: ["reviews"],

  data() {
    return { at: 0, barOn: false, ly };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    cat() {
      return this.$product?.category || catOf(this.$product?.category_id);
    },
    catName() {
      return catTitle(this.cat);
    },
    unit() {
      return unitOf(this.$product);
    },
    pv() {
      void this.currency;
      return priceView(this.shop || this.$shop, this.$product, this.current_variant);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    photos() {
      return galleryOf(this.$product, this.current_variant);
    },
    photo() {
      return this.photos[Math.min(this.at, this.photos.length - 1)] || null;
    },
    stock() {
      const n = this.current_variant ? this.current_variant.quantity : this.$product.quantity;
      return Number(n) || 0;
    },
    stockLine() {
      const n = this.stock;
      if (isEnglish()) return t("ly.pd.inStockUnits", "In stock · {n} {units} ready", { n, units: plural(this.unit, n) });
      return t("ly.pd.inStockN", "In stock · {n} ready", { n });
    },
    reviewsWord() {
      const n = Number(this.$product.rate_count) || 0;
      return n ? t("ly.pd.reviewsN", { one: "{n} review", other: "{n} reviews" }, { n }) : t("ly.pd.noReviews", "No reviews yet");
    },
    lines() {
      return deliveryLines(this.shop || this.$shop);
    },
    enabledVariants() {
      return this.product_variants.filter((v) => v.enable !== false && v.enable !== 0);
    },
    dimension() {
      return variantDimension(this.enabledVariants);
    },
    dimWord() {
      const k = this.dimension?.key;
      if (k === "color") return t("ly.pd.colour", "Colour");
      const w = this.dimension?.word || t("ly.pd.option", "Option");
      return w.charAt(0).toUpperCase() + w.slice(1);
    },
    /* One dimension: a tile per variant with its own photo and price. */
    tiles() {
      const d = this.dimension;
      if (!d || d.key === "mixed") return [];
      return this.enabledVariants.map((v) => {
        const own = v.pricing && v.price != null;
        return {
          v,
          img: v.image ? window.CDN.GET_SHOP_IMAGE_PATH(v.image, 128) : d.key === "color" ? null : window.CDN.GET_SHOP_IMAGE_PATH(this.$product.icon, 128),
          swatch: d.key === "color" ? swatchBg(v.color) : null,
          label: d.key === "color" ? colourName(v.color) || t("ly.pd.colour", "Colour") : v[d.key],
          price: own ? moneyOf(this.shop, this.$product, v, this.currency).now : null,
        };
      });
    },
    currentLabel() {
      const x = this.tiles.find((y) => this.current_variant && y.v.id === this.current_variant.id);
      return x ? x.label : "";
    },
    needsChoice() {
      return this.product_variants.length > 0 && !this.current_variant;
    },
    /* A plain product: the add box; anything Selldone's own button knows
       more about keeps that button. */
    simple() {
      const p = this.$product;
      if (!p || this.isSubscription) return false;
      if ((p.type || "PHYSICAL") !== "PHYSICAL") return false;
      if (this.preferences && (this.preferences.valuation || this.preferences.service)) return false;
      if (p.valuation || (p.extra_pricings && p.extra_pricings.length)) return false;
      return true;
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
    /* The brand when the product has one, else its department (the design's eyebrow). */
    eyebrow() {
      const b = this.$product?.brand;
      return (b && String(b.title || b.name || b).trim()) || this.catName;
    },
    eyebrowTo() {
      const b = this.$product?.brand;
      const name = b && String(b.title || b.name || b).trim();
      if (name && typeof b === "string") return { name: window.$storefront.routes.SHOP_PAGE, query: { brand: name } };
      return this.cat ? catTo(this.cat) : { name: window.$storefront.routes.SHOP_PAGE };
    },
    rated() {
      return Number(this.$product.rate_count) > 0 && Number(this.$product.rate) > 0;
    },
    rate() {
      return Number(this.$product.rate || 0).toFixed(1);
    },
    /* The opening of the product's own article (plain text, its first paragraph). */
    intro() {
      const body = this.$product?.article_pack?.article?.body || "";
      const first = String(body).split(/<\/p>|<br\s*\/?>|\n\s*\n/i).map((x) => x.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()).find((x) => x.length > 0) || "";
      return first.length > 420 ? first.slice(0, 400).replace(/\s+\S*$/, "") + "…" : first;
    },
    facts() {
      return factsOf(this.$product, 3);
    },
    isSaved() {
      return saved[this.$product?.id] ?? !!this.$product?.wishlist;
    },
    inBag() {
      const line = this.current_variant ? basketLine(this, this.$product, { id: this.current_variant.id }) : basketLine(this, this.$product);
      return !!(line && line.count > 0);
    },
  },

  watch: {
    "$product.id"() {
      this.at = 0;
    },
    "current_variant.id"() {
      this.at = 0;
    },
    "pv.off"() {
      this.$nextTick(() => fitInCircle(this.$refs.off));
    },
  },

  mounted() {
    this.unfit = fitOnResize(() => fitInCircle(this.$refs.off));
    document.documentElement.classList.add("ly-buybar");
    this.$nextTick(() => fitInCircle(this.$refs.off));
    document.fonts?.ready?.then(() => fitInCircle(this.$refs.off));
    if (typeof IntersectionObserver !== "undefined" && this.$refs.add) {
      this.io = new IntersectionObserver(
        (entries) => {
          const e = entries[entries.length - 1];
          this.barOn = !!e && !e.isIntersecting;
        },
        /* the box counts as "in view" while it is anywhere below the top of the window, so the bar
           shows only once it has scrolled away above, and hides again on the way back up */
        { threshold: 0, rootMargin: "0px 0px 100000px 0px" },
      );
      this.io.observe(this.$refs.add);
    }
  },

  beforeUnmount() {
    this.unfit?.();
    document.documentElement.classList.remove("ly-buybar");
    this.io?.disconnect();
  },

  methods: {
    t,
    money,
    catTo,
    goReviews() {
      this.$emit("reviews");
    },
    toggleSave() {
      toggleSaved(this, this.$product);
    },
    openBag() {
      EventBus.$emit("ly:open-bag");
    },
    /* Add this pastry to Selldone's comparison and open the Layout's compare
       page: what the shopper already compares, else this with two of its own
       collection's best sellers. */
    compareNow() {
      if (!this.comparing) this.addToProductComparison(this.$product, this.current_variant, true);
      const stored = (this.$store.getters.getProductsComparison || []).map((p) => ({ p: p.id, v: p.variant?.id || null }));
      let refs = stored.filter((r) => r.p !== this.$product.id);
      refs.unshift({ p: this.$product.id, v: this.current_variant?.id || null });
      if (refs.length < 2) {
        const mates = this.ly.products
          .filter((p) => p.category_id === this.$product.category_id && p.id !== this.$product.id)
          .sort((a, b) => (b.sells || 0) - (a.sells || 0))
          .slice(0, 2);
        refs = refs.concat(mates.map((p) => ({ p: p.id, v: null })));
      }
      const list = refs
        .slice(0, 4)
        .map((r) => `p${r.p}${r.v ? `v${r.v}` : ""}`)
        .join("_");
      this.$router.push({ name: window.$storefront.routes.COMPARISON_PAGE, query: { list } });
    },
    toAdd() {
      this.$refs.add?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>
