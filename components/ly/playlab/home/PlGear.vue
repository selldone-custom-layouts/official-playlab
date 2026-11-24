<!--
  A row of cards (the design's .lab-gear, "Gear up for outside"): four toys of the next department, with a link to
  the whole department.
-->
<template>
  <section v-if="list.length" aria-labelledby="pl-gear-h" class="pl-wrap pl-home-section pl-gear">
    <div class="pl-section-top">
      <h2 id="pl-gear-h"><bdi>{{ catTitle(gear) }}</bdi></h2>
      <router-link :to="catTo(gear)" class="pl-more">{{ t("pl.home.seeAll", "See all") }}<ly-icon cls="pl-fwd" name="arrow" /></router-link>
    </div>
    <div v-pl-fit="{ max: 4 }" class="pl-grid pl-grid-4">
      <ly-card v-for="p in list" :key="p.id" :product="p" />
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";
import LyCard from "../../ui/LyCard.vue";
import { vPlFit } from "../pl-fit";
import LyIcon from "../../LyIcon.vue";

export default {
  name: "PlGear",
  components: { LyCard, LyIcon },
  directives: { plFit: vPlFit },
  mixins: [plHome],
  computed: {
    list() {
      return this.picks(this.gear, 4, this.lineup);
    },
  },
};
</script>
