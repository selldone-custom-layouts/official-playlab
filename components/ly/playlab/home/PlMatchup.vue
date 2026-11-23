<!--
  The comparison teaser (the design's .lab-matchup, "Choose your ride."): the lineup's two toys side by side with a
  button that opens them on the compare page.
-->
<template>
  <section v-if="lineup.length > 1" aria-labelledby="pl-mu-h" class="pl-wrap pl-home-section pl-matchup">
    <div>
      <p class="pl-eyebrow">{{ t("pl.home.muEyebrow", "Product comparison") }}</p>
      <h2 id="pl-mu-h">{{ t("pl.home.muH", "Choose your pick.") }}</h2>
      <p>{{ t("pl.home.muP", "Compare type, materials and suggested ages before you choose.") }}</p>
      <router-link :to="compareTo(lineup)" class="pl-btn primary">{{ t("pl.home.muBtn", "Compare these toys") }}</router-link>
    </div>
    <div class="pl-matchup-photos">
      <router-link v-for="p in lineup" :key="p.id" :to="productTo(p)">
        <span class="pl-media"><img :src="img(p)" alt="" loading="lazy" /></span>
        <strong>{{ p.title }}</strong>
      </router-link>
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";

export default {
  name: "PlMatchup",
  mixins: [plHome],
};
</script>
