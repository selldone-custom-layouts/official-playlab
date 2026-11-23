<!--
  Pick a challenge (the design's .lab-challenges / .lab-mission): three departments as wide tiles, the name in
  condensed capitals, the department's own description under it, its own image in a light box and an arrow.
-->
<template>
  <section v-if="missions.length" aria-labelledby="pl-ch-h" class="pl-home-section pl-challenges">
    <div class="pl-wrap">
      <div class="pl-section-top">
        <h2 id="pl-ch-h">{{ t("pl.home.challenge", "Pick a challenge") }}</h2>
      </div>
      <div class="pl-missions">
        <router-link v-for="c in missions" :key="c.id" :to="catTo(c)" class="pl-mission">
          <span class="pl-mission-copy"
            ><strong><bdi>{{ catTitle(c) }}</bdi></strong><span v-if="c.description"><bdi>{{ c.description }}</bdi></span></span
          >
          <span class="pl-mission-art"><img v-if="art(c)" :src="art(c)" alt="" loading="lazy" /></span>
          <ly-icon cls="pl-fwd" name="arrow" />
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";
import LyIcon from "../../LyIcon.vue";
import { catImage, inCat, productImage } from "../../ly";

export default {
  name: "PlChallenges",
  components: { LyIcon },
  mixins: [plHome],
  methods: {
    /* the department's own image, else its most-sold toy */
    art(c) {
      return catImage(c, null) || (this.picks(c, 1)[0] ? productImage(this.picks(c, 1)[0]) : null) || (inCat(c.id)[0] ? productImage(inCat(c.id)[0]) : null);
    },
  },
};
</script>
