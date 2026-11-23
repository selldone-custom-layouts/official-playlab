<!--
  One guide (the design's .lab-guide): the post's date as the eyebrow, its title in condensed capitals, its own
  line (when it has one), "Get the guide" and its own cover in a light box, the whole card one link.
-->
<template>
  <article class="pl-guide">
    <router-link :to="postRoute(post)">
      <div>
        <span v-if="post.created_at" class="pl-eyebrow"><time :datetime="post.created_at">{{ fmtDate(post.created_at) }}</time></span>
        <h3>{{ post.title }}</h3>
        <p v-if="line">{{ line }}</p>
        <span class="pl-more">{{ t("pl.home.getGuide", "Get the guide") }}<ly-icon cls="pl-fwd" name="arrow" /></span>
      </div>
      <span class="pl-post-cover"><img v-if="cover" :src="cover" alt="" loading="lazy" /><ly-icon v-else name="doc" /></span>
    </router-link>
  </article>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import { fmtDate } from "../ly";
import { postRoute } from "../../kalio/pages/kalio-journal";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "PlGuide",
  components: { LyIcon },
  props: { post: { type: Object, required: true } },
  computed: {
    cover() {
      return this.post.image ? window.CDN.GET_SHOP_IMAGE_PATH(this.post.image, null) : null;
    },
    line() {
      return String(this.post.description || this.post.subtitle || "").trim();
    },
  },
  methods: { t, fmtDate, postRoute },
};
</script>
