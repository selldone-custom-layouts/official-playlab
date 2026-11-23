<!--
  Play Lab's detail sheet (the approved design's .detail-sheet): Specifications (the product's own spec groups,
  each a bordered card of key and value rows), Description (the product's own article, only when it has one) and
  Reviews. Reviews: with none yet, an honest "No reviews yet" and the shop's own rating criteria as chips, each
  "No score yet" — never stars or numbers; "Write the first review" asks a guest to sign in and opens Selldone's
  own review box for a signed-in shopper (only a buyer can rate). With reviews: Selldone's. Arrow keys move along
  the tabs.
-->
<template>
  <section id="tabs" :aria-label="t('ly.pd.details', 'Details')" class="pd-tabs pl-shell pl-wrap">
    <div class="pl-panel pl-detail-sheet">
      <div :aria-label="t('ly.pd.detailsAria', 'Product details')" class="pl-detail-buttons" role="tablist" @keydown="keys">
        <button
          v-for="tb in tabs"
          :id="'tb-' + tb.k"
          :key="tb.k"
          :aria-controls="'tp-' + tb.k"
          :aria-selected="cur === tb.k ? 'true' : 'false'"
          :tabindex="cur === tb.k ? 0 : -1"
          role="tab"
          type="button"
          @click="cur = tb.k"
        >
          {{ tb.label }}
        </button>
      </div>

      <div id="tp-info" :hidden="cur !== 'info'" aria-labelledby="tb-info" class="pl-spec-grid" role="tabpanel">
        <div v-for="(g, gi) in groups" :key="g.group + gi" class="pl-spec-group">
          <h3 v-if="g.group">{{ g.group }}</h3>
          <dl>
            <div v-for="r in g.rows" :key="r[0]">
              <dt>{{ r[0] }}</dt>
              <dd>{{ r[1] }}</dd>
            </div>
          </dl>
        </div>
        <p v-if="!groups.length" class="pl-muted-p">{{ t("pl.pd.noSpec", "The details of this toy are on its description.") }}</p>
      </div>

      <div v-if="articleBody" id="tp-desc" :hidden="cur !== 'desc'" aria-labelledby="tb-desc" class="pl-prose ly-pd-article" role="tabpanel" v-html="articleBody"></div>

      <div id="tp-rev" :hidden="cur !== 'rev'" aria-labelledby="tb-rev" role="tabpanel">
        <div v-if="!rated" class="pl-no-reviews">
          <p class="pl-nr-t">{{ t("ly.pd.noReviewsT", "No reviews yet") }}</p>
          <p class="pl-muted-p">{{ noReviewsText }}</p>
          <div v-if="criteria.length" class="pl-review-chips">
            <span v-for="c in criteria" :key="c"><bdi>{{ c }}</bdi> · {{ t("ly.pd.noScore", "No score yet") }}</span>
          </div>
          <button v-if="!writing" class="pl-btn quiet" type="button" @click="write">{{ user ? t("ly.pd.writeFirst", "Write the first review") : t("ly.pd.signInReview", "Sign in to write a review") }}</button>
        </div>
        <div v-if="rated || writing" class="ly-rv-sd"><kalio-reviews /></div>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import KalioReviews from "../../kalio/product/KalioReviews.vue";
import { percentOff } from "../../kalio/kalio-catalog";
import { prosOf, ratingNames, specGroups, specValue, unitOf } from "../ly";
import { numberWord } from "./pd";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyProductTabs",
  components: { LyIcon, KalioReviews },
  props: { product: { type: Object, required: true } },
  data: () => ({ cur: "info", writing: false }),
  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    rated() {
      return Number(this.product.rate_count) > 0;
    },
    criteria() {
      return ratingNames(this.product);
    },
    pros() {
      return prosOf(this.product).filter((x) => x[0] || x[1]);
    },
    groups() {
      return specGroups(this.product);
    },
    tabs() {
      const out = [{ k: "info", label: t("pl.pd.tabSpec", "Specifications") }];
      if (this.articleBody) out.push({ k: "desc", label: t("pl.pd.tabDesc", "Description") });
      out.push({ k: "rev", label: t("pl.pd.tabRev", "Reviews") });
      return out;
    },
    /* The lead: the finish, "Sold as one <unit>, and good with <pairing>",
       the saving. Words the product's own spec gives; nothing invented. */
    lead() {
      const p = this.product;
      const out = [];
      const finish = specValue(p, "Visual Finish") || specValue(p, "Surface");
      if (finish) out.push(finish.charAt(0).toUpperCase() + finish.slice(1).replace(/\.?$/, "."));
      const pairing = specValue(p, "Suggested Pairing");
      const unit = unitOf(p).toLowerCase();
      const off = percentOff(this.$store.getters.getShop, p);
      const sold = pairing ? t("ly.pd.soldPair", "Sold as one {unit}, and good with {pairing}.", { unit, pairing: pairing.toLowerCase() }) : t("ly.pd.sold", "Sold as one {unit}.", { unit });
      out.push(off > 0 ? `${sold} ${t("ly.pd.offIn", "{off}% off, already in the price.", { off })}` : sold);
      return out;
    },
    articleBody() {
      const body = this.product?.article_pack?.article?.body;
      return body && String(body).replace(/<[^>]*>/g, "").trim() ? body : null;
    },
    noReviewsText() {
      const n = this.criteria.length;
      if (!n) return t("ly.pd.noReviewsP0", "Be the first to review the {name}.", { name: this.product.title });
      return t("ly.pd.noReviewsP", "Be the first to review the {name}. Reviews are scored on the {n} points beside this note.", { name: this.product.title, n: numberWord(n).toLowerCase() });
    },
  },
  watch: {
    "product.id"() {
      this.cur = "info";
      this.writing = false;
    },
  },
  methods: {
    t,
    /* "No reviews yet" in the buy column opens the Reviews tab. */
    open(k) {
      this.cur = k;
      this.$nextTick(() => {
        document.getElementById("tabs")?.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "start" });
        document.getElementById("tb-" + k)?.focus({ preventScroll: true });
      });
    },
    keys(e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const ks = this.tabs.map((x) => x.k);
      const i = ks.indexOf(this.cur);
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
      const step = (e.key === "ArrowRight") !== rtl ? 1 : -1;
      this.cur = ks[(i + step + ks.length) % ks.length];
      this.$nextTick(() => document.getElementById("tb-" + this.cur)?.focus());
      e.preventDefault();
    },
    write() {
      if (!this.user) {
        EventBus.$emit("need-login", true);
        return;
      }
      this.writing = true;
    },
  },
};
</script>
