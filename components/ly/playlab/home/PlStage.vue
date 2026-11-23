<!--
  The stage (the design's labHome() hero, play-lab.css .lab-stage): the skin's "hero" photo to the frame's edges on
  the stage's near-black of the palette's hue, a giant italic condensed line, one sentence and two buttons: the lead
  department (live) and every toy. On a phone the photo sits on top and the words under it. Without the photo the
  stage keeps its colour (the words never sit on an empty box).
-->
<template>
  <section aria-labelledby="pl-stage-h" class="pl-stage">
    <div class="pl-stage-photo">
      <img v-if="photo" :alt="t('pl.home.stageAlt', 'A child racing a toy car outdoors')" :src="photo" decoding="async" fetchpriority="high" />
    </div>
    <div class="pl-wrap pl-stage-inner">
      <div class="pl-stage-copy">
        <h1 id="pl-stage-h">
          <span>{{ t("pl.home.stageH1", "Play") }}</span> <span>{{ t("pl.home.stageH2", "in motion.") }}</span>
        </h1>
        <p>{{ t("pl.home.stageP", "Go from the starting line to the workbench with toys for racing, building and taking things outside.") }}</p>
        <div>
          <router-link v-if="lead" :to="catTo(lead)" class="pl-btn primary"><bdi>{{ t("pl.home.shopDept", "Shop {name}", { name: catTitle(lead) }) }}</bdi></router-link>
          <router-link :to="allTo" class="pl-btn quiet">{{ t("pl.home.allGear", "All toys") }}</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";
import { slotPhoto } from "../../ly-photos";

export default {
  name: "PlStage",
  mixins: [plHome],
  computed: {
    photo() {
      return slotPhoto("hero");
    },
  },
};
</script>
