<!--
  Play guides (the design's .lab-guides-home / .lab-guide): the four newest posts of the shop's blog, each with
  its date as the eyebrow, its title in condensed capitals, its own line, "Get the guide" and its own cover in a
  light box. A shop without posts shows nothing.
-->
<template>
  <section v-if="posts.length" aria-labelledby="pl-guides-h" class="pl-home-section pl-guides-home">
    <div class="pl-wrap">
      <div class="pl-section-top">
        <h2 id="pl-guides-h">{{ t("pl.home.guides", "Play guides") }}</h2>
        <router-link :to="blogTo" class="pl-more">{{ t("pl.home.allGuides", "All guides") }}<ly-icon cls="pl-fwd" name="arrow" /></router-link>
      </div>
      <div class="pl-guide-list">
        <pl-guide v-for="b in posts" :key="b.id" :post="b" />
      </div>
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";
import LyIcon from "../../LyIcon.vue";
import PlGuide from "../PlGuide.vue";
import { journalPage, journalRoute } from "../../../kalio/pages/kalio-journal";

export default {
  name: "PlGuides",
  components: { LyIcon, PlGuide },
  mixins: [plHome],
  data: () => ({ posts: [] }),
  computed: {
    blogTo() {
      return journalRoute();
    },
  },
  mounted() {
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => {
        const list = (articles || []).slice().sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
        this.posts = list.slice(0, 4);
      })
      .catch(() => (this.posts = []));
  },
};
</script>
