<!--
  The departments strip (the design's .lab-quick-departments): "Departments" and a button for every department
  with products (live, the shop's order), then All toys.
-->
<template>
  <section v-if="cats.length" aria-labelledby="pl-depts-h" class="pl-quick-departments">
    <div class="pl-wrap">
      <h2 id="pl-depts-h">{{ t("pl.hdr.departments", "Departments") }}</h2>
      <nav :aria-label="t('pl.hdr.departments', 'Departments')">
        <router-link v-for="c in cats" :key="c.id" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
        <router-link :to="allTo">{{ t("pl.ls.all", "All toys") }}</router-link>
      </nav>
    </div>
  </section>
</template>

<script>
import plHome from "./pl-home";

export default {
  name: "PlDepts",
  mixins: [plHome],
  computed: {
    cats() {
      return this.ly.cats.filter((c) => this.ranked.includes(c));
    },
  },
};
</script>
