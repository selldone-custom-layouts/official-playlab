<!--
  FAQ (Play Lab: the design's faq.html): the title band ("Help and FAQ", a line, and the sample label while the
  shop has no FAQ of its own), then one panel: the questions in a stack, each a details row with the chevron (the
  first open), a topic's name as an eyebrow when there are several, and under them "Still wondering?" with the
  way to the contact page.

  The questions are the shop's own (Selldone's FAQ, its first tag as the topic) when it has some; until then sample
  questions about ordering, delivery, the way to pay and ages, built from the shop's facts and labelled as a sample.
-->
<template>
  <div class="ly ly-faq">
    <ly-pt :crumbs="[{ label: t('ly.rd.faq', 'FAQ') }]" :lead="t('ly.rd.faqLead', 'Delivery windows, pickup, the way to pay and ordering single pieces.')" :title="t('ly.rd.faqT', 'Questions & answers')" cls="compact">
      <ly-sample-tag v-if="!own && !busy" :text="t('ly.rd.faqSample', 'Sample questions — the shop has not written its FAQ yet')" />
    </ly-pt>
    <section :aria-label="t('ly.rd.questionsAria', 'Questions')" class="sec-s">
      <div class="wrap">
        <div class="pl-faq">
          <template v-if="!busy">
            <section v-for="(g, i) in groups" :id="'fq' + i" :key="g.name" :aria-labelledby="groups.length > 1 ? 'fqh' + i : undefined" class="pl-fq">
              <h2 v-if="groups.length > 1" :id="'fqh' + i" class="eyebrow pl-fq-h">{{ g.name }}</h2>
              <details v-for="(q, j) in g.items" :key="q.key" :open="i === 0 && j === 0" class="pl-qa">
                <summary>{{ q.q }}</summary>
                <div v-if="q.html" class="art-body ly-qa-a" v-html="q.a"></div>
                <p v-else>{{ q.a }}</p>
              </details>
            </section>
            <p class="pl-faq-more">
              <b>{{ t("ly.rd.stillWondering", "Still wondering?") }}</b>
              <router-link :to="{ name: contactRoute }" class="qlink">{{ t("ly.rd.contactT", "Contact {shop}", { shop: name }) }}<ly-icon cls="flip-rtl" name="arrow" /></router-link>
            </p>
          </template>
          <div v-else :aria-label="t('ly.rd.loadingFaq', 'Loading the questions')" class="ly-od-load" role="status">
            <span v-for="n in 3" :key="n" class="ly-od-sk -row"></span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import LyIcon from "@app-storefront/components/ly/LyIcon.vue";
import LyPt from "@app-storefront/components/ly/ui/LyPt.vue";
import LySampleTag from "@app-storefront/components/ly/ui/LySampleTag.vue";
import { guestCheckout, money, openLine as openWords, shopFacts } from "@app-storefront/components/ly/ly";
import { sampleFaq, shopName } from "@app-storefront/components/ly/read/rd";
import { withRetry } from "@app-storefront/components/bakini/bakini";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageFaq",
  components: { LyIcon, LyPt, LySampleTag },
  props: { shop: { type: Object } },

  data: () => ({ faqs: [] as any[], busy: true }),

  computed: {
    theShop() {
      return this.$store.getters.getShop || this.shop;
    },
    f() {
      return shopFacts(this.theShop);
    },
    name() {
      return shopName(this.theShop);
    },
    open() {
      return openWords(this.f);
    },
    own() {
      return this.faqs.length > 0;
    },
    /* The shop's questions (its first tag is the topic), else the sample. */
    items() {
      if (this.own)
        return this.faqs.map((x: any) => ({
          key: "f" + x.id,
          group: (x.tags && x.tags[0]) || t("ly.rd.general", "General"),
          q: x.question,
          a: x.answer || "",
          html: /<[a-z][\s\S]*>/i.test(String(x.answer || "")),
          icon: "chat",
        }));
      const icons = ["bag", "bike", "cash", "info"];
      const sample = sampleFaq(this.theShop, this.f, (n: number) => money(n, true), guestCheckout(this.theShop));
      const names = [...new Set(sample.map((x) => x.group))];
      return sample.map((x, i) => ({ key: "s" + i, group: x.group, q: x.q, a: x.a, html: false, icon: icons[names.indexOf(x.group)] || "info" }));
    },
    groups() {
      const out: { name: string; icon: string; items: any[] }[] = [];
      for (const x of this.items) {
        let g = out.find((y) => y.name === x.group);
        if (!g) out.push((g = { name: x.group, icon: x.icon, items: [] }));
        g.items.push(x);
      }
      return out;
    },
    contactRoute() {
      return window.$storefront.routes.SHOP_CONTACT_US;
    },
  },

  created() {
    this.setPageTitle?.(t("ly.rd.faq", "FAQ"));
    withRetry(() => window.axios.get(window.XAPI.GET_FAQ(this.theShop.name), { params: { offset: 0, limit: 50 } }))
      .then(({ data }: any) => (this.faqs = data?.faqs || []))
      .catch(() => (this.faqs = []))
      .finally(() => (this.busy = false));
  },

  methods: {
    t,
    jump(i: number) {
      const el = document.getElementById("fq" + i);
      el?.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "start" });
      (el?.querySelector("summary") as HTMLElement | null)?.focus({ preventScroll: true });
    },
  },
};
</script>
