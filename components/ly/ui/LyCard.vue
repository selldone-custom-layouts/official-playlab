<!--
  Play Lab's product card (the approved design's shared/app.js labCard(), play-lab.css .lab-card), used on every
  page: the photo in a fixed light box (contain), Save and Quick view in its top corner; the toy's suggested age and
  SKU (from its own specification and record), the name in condensed capitals (two lines, then an ellipsis), the
  rating only when the toy has real ratings, two spec lines (shown in the list view), then the price (the struck
  price only while a discount window is open) and the Add to bag control that turns into − n In bag + in place
  (LyAdd). `cls="pl-wide"` draws the list card (photo beside the words).
-->
<template>
  <article :class="['pl-card', cls]" :style="delay != null ? { '--d': delay + 'ms' } : null">
    <div class="pl-card-media">
      <router-link :to="to" aria-hidden="true" class="pl-media" tabindex="-1">
        <img
          :loading="eager ? 'eager' : 'lazy'"
          :src="img"
          :srcset="srcset"
          alt=""
          decoding="async"
          draggable="false"
          height="640"
          sizes="(max-width: 620px) 45vw, 280px"
          width="640"
          @error="dropSrcset"
        />
      </router-link>
      <span v-if="pv.off > 0" :aria-label="t('ly.card.offAria', '{off} percent off', { off: pv.off })" class="pl-off"><span dir="ltr">−{{ pv.off }}%</span></span>
      <div class="pl-card-tools">
        <button
          :aria-label="t('pl.card.save', 'Save {name}', { name: product.title })"
          :aria-pressed="isSaved ? 'true' : 'false'"
          :title="t('pl.card.saveT', 'Save')"
          class="pl-ibtn"
          type="button"
          @click.prevent.stop="toggleSave()"
        >
          <ly-icon name="heart" />
        </button>
        <button :aria-label="t('ly.card.quick', 'Quick view: {name}', { name: product.title })" :title="t('pl.card.quickT', 'Quick view')" aria-controls="qv" class="pl-ibtn" type="button" @click="quick($event)">
          <ly-icon name="grid" />
        </button>
      </div>
    </div>
    <div class="pl-card-data">
      <div v-if="age || sku" class="pl-card-tag">
        <span v-if="age">{{ age }}</span><span v-if="sku" dir="ltr">{{ sku }}</span>
      </div>
      <h3 class="pl-card-t">
        <router-link :to="to">{{ product.title }}</router-link>
      </h3>
      <p v-if="rated" class="pl-rating">
        <ly-icon name="star" /><strong>{{ rate }}</strong><span>({{ product.rate_count }})</span>
      </p>
      <dl v-if="specs.length" class="pl-card-specs">
        <div v-for="[k, v] in specs" :key="k">
          <dt>{{ k }}</dt>
          <dd>{{ v }}</dd>
        </div>
      </dl>
      <div class="pl-card-buy">
        <span class="pl-price"
          ><span class="money">{{ fmt(pv.now) }}</span><template v-if="pv.was">{{ " " }}<del class="money">{{ fmt(pv.was) }}</del></template></span
        >
        <ly-add :product="product" />
      </div>
    </div>
  </article>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import LyAdd from "../LyAdd.vue";
import BuyMixin from "../../bakini/bakini-buy";
import { money, openQuick, priceView, productImage, productTo } from "../ly";
import { ageOf, cardSpecs, skuOf } from "../playlab/pl";
import { dropSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyCard",
  components: { LyIcon, LyAdd },
  mixins: [BuyMixin],
  props: {
    product: { type: Object, required: true },
    noCat: Boolean,
    eager: Boolean,
    cls: { type: [String, Array, Object], default: "" },
    delay: { type: Number, default: null },
  },
  computed: {
    pv() {
      void currentCurrency();
      return priceView(this.shop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product);
    },
    srcset() {
      return productSrcset(this.product);
    },
    age() {
      return ageOf(this.product);
    },
    sku() {
      return skuOf(this.product);
    },
    specs() {
      return cardSpecs(this.product, 2);
    },
    rated() {
      return Number(this.product.rate_count) > 0 && Number(this.product.rate) > 0;
    },
    rate() {
      return Number(this.product.rate || 0).toFixed(1);
    },
  },
  methods: {
    t,
    fmt: money,
    dropSrcset,
    quick(e) {
      openQuick(this.product, e.currentTarget);
    },
  },
};
</script>
