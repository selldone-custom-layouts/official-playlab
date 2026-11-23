<!--
  Shop by age (the design's .lab-levels): every age the shop's toys name in their own specification, youngest
  first, as links that open every toy with that age picked. The rows are always full: with an odd number of ages
  an "All ages" link closes the last row. A shop whose toys name no age shows nothing.
-->
<template>
  <section v-if="ages.length" aria-labelledby="pl-ages-h" class="pl-levels">
    <div class="pl-wrap">
      <h2 id="pl-ages-h">{{ t("pl.home.byAge", "Shop by age") }}</h2>
      <div :style="{ '--pl-cols': cols }">
        <router-link v-for="a in ages" :key="a.age" :to="ageTo(a.age)"><span>{{ a.age }}</span><ly-icon cls="pl-fwd" name="chev" /></router-link>
        <router-link v-if="ages.length % 2" :to="allTo"><span>{{ t("pl.home.allAges", "All ages") }}</span><ly-icon cls="pl-fwd" name="chev" /></router-link>
      </div>
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";
import LyIcon from "../../LyIcon.vue";
import { agesOf } from "../pl";

export default {
  name: "PlAges",
  components: { LyIcon },
  mixins: [plHome],
  computed: {
    ages() {
      return this.ready ? agesOf(this.ly.products) : [];
    },
    /* four to a row (the design); more ages in two even rows */
    cols() {
      const n = this.ages.length + (this.ages.length % 2);
      return n <= 4 ? n : Math.ceil(n / 2);
    },
  },
  methods: {
    ageTo(age) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { age } };
    },
  },
};
</script>
