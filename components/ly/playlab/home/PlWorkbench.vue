<!--
  The photo feature (the design's .lab-workbench): the skin's "workbench" photo beside a tinted panel with the
  department's name as the eyebrow, a giant italic line, one sentence and its button. Without the photo the panel
  takes the whole width.
-->
<template>
  <section v-if="work" aria-labelledby="pl-wb-h" :class="['pl-wrap', 'pl-home-section', 'pl-workbench', { 'no-photo': !photo }]">
    <div v-if="photo" class="pl-workbench-photo">
      <img :alt="t('pl.home.workAlt', 'Children building together at a workbench')" :src="photo" decoding="async" loading="lazy" />
    </div>
    <div class="pl-workbench-copy">
      <p class="pl-eyebrow"><bdi>{{ catTitle(work) }}</bdi></p>
      <h2 id="pl-wb-h">{{ t("pl.home.workH", "What will it do?") }}</h2>
      <p>{{ t("pl.home.workP", "Test a circuit, make a marble run or try to build the tallest thing on the table.") }}</p>
      <router-link :to="catTo(work)" class="pl-btn primary"><bdi>{{ t("pl.home.explore", "Explore {name}", { name: catTitle(work) }) }}</bdi></router-link>
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";
import { slotPhoto } from "../../ly-photos";

export default {
  name: "PlWorkbench",
  mixins: [plHome],
  computed: {
    photo() {
      return slotPhoto("workbench");
    },
  },
};
</script>
