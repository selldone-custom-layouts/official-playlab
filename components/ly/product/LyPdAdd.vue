<!--
  The product page's add box (pages-product.js .pd-add): "Add to
  bag", then − n + in its place, for the page's chosen variant. The count is
  the bag's own line through kalio-basket's queue (quick taps are never
  lost); "+" takes the focus when the box appears. Without a chosen option:
  "Choose an option" (inactive); sold out: "Sold out".
-->
<template>
  <button v-if="!q" :aria-disabled="blocked ? 'true' : undefined" :class="['pl-btn', 'primary', 'pl-add', 'add', { '-off': blocked }]" type="button" @click.prevent.stop="more">
    <ly-icon v-if="!blocked" name="bag" /><span>{{ shownLabel }}</span>
  </button>
  <div v-else :aria-label="t('ly.add.inBag', '{name} in bag', { name: product.title })" class="pl-qb qb" role="group">
    <button :aria-label="t('ly.add.less', 'Remove one {name}', { name: product.title })" class="pl-btn quiet" type="button" @click.prevent.stop="less"><ly-icon name="minus" /></button>
    <span class="pl-qb-n"><strong aria-live="polite" class="qn">{{ q }}</strong><span>{{ t("pl.add.inBag", "In bag") }}</span></span>
    <button
      ref="plus"
      :aria-disabled="full ? 'true' : undefined"
      :aria-label="t('ly.add.more', 'Add one more {name}', { name: product.title })"
      :title="full ? t('ly.add.noMore', 'No more in stock') : undefined"
      class="pl-btn primary"
      type="button"
      @click.prevent.stop="more"
    >
      <ly-icon name="plus" />
    </button>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import { addVariant, basketLine, pendingLine, pendingLineFor, shownCount, stepTo } from "../../kalio/kalio-basket";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyPdAdd",
  components: { LyIcon },
  props: {
    product: { type: Object, required: true },
    /** The page's chosen variant (null for a product without options). */
    variant: { type: Object, default: null },
    /** The product has options but none is chosen yet. */
    needsChoice: { type: Boolean, default: false },
  },
  computed: {
    line() {
      const p = this.product;
      if (!p) return null;
      if (this.variant) return basketLine(this, p, { id: this.variant.id }) || pendingLineFor(p, this.variant.id);
      if (this.needsChoice) return null;
      return basketLine(this, p) || pendingLine(p);
    },
    q() {
      return shownCount(this.product, this.line);
    },
    stock() {
      const n = this.variant ? this.variant.quantity : this.product.quantity;
      return Number.isFinite(Number(n)) ? Number(n) : 0;
    },
    soldOut() {
      return !(this.stock > 0);
    },
    full() {
      return !this.soldOut && this.q >= this.stock;
    },
    blocked() {
      return this.soldOut || this.full || this.needsChoice;
    },
    shownLabel() {
      if (this.soldOut) return t("pl.add.out", "Out of stock");
      if (this.needsChoice) return t("ly.pd.chooseFirst", "Choose an option");
      return t("ly.add.add", "Add to bag");
    },
  },
  watch: {
    q(now, before) {
      if (before === 0 && now > 0 && this.hadFocus) this.$nextTick(() => this.$refs.plus?.focus({ preventScroll: true }));
    },
  },
  methods: {
    t,
    more(e) {
      if (this.blocked) return;
      this.hadFocus = !!e?.currentTarget && document.activeElement === e.currentTarget;
      if (!this.q || !this.line) return addVariant(this, this.product, this.variant);
      stepTo(this, this.product, this.line, this.q + 1);
    },
    less() {
      if (this.q > 0 && this.line) stepTo(this, this.product, this.line, this.q - 1);
    },
  },
};
</script>
