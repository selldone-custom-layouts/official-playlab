<!--
  The lineup (the design's .lab-track, "Race day lineup"): the lead department's two most-sold toys as wide list
  cards (photo beside the words, two spec lines, price and Add to bag), with a link to the whole department.
-->
<template>
  <section v-if="lineup.length" aria-labelledby="pl-track-h" class="pl-wrap pl-home-section pl-track">
    <div class="pl-section-top">
      <h2 id="pl-track-h"><bdi>{{ t("pl.home.lineup", "{name} lineup", { name: catTitle(lead) }) }}</bdi></h2>
      <router-link :to="catTo(lead)" class="pl-more">{{ t("pl.home.seeAll", "See all") }}<ly-icon cls="pl-fwd" name="arrow" /></router-link>
    </div>
    <div class="pl-grid pl-list-grid pl-home-track">
      <ly-card v-for="p in lineup" :key="p.id" cls="pl-wide" :product="p" />
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";
import LyCard from "../../ui/LyCard.vue";
import LyIcon from "../../LyIcon.vue";

export default {
  name: "PlTrack",
  components: { LyCard, LyIcon },
  mixins: [plHome],
};
</script>
