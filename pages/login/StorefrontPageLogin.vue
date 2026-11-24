<!--
  The sign-in page (/welcome; the design's login.html): the page title, then one panel with the shop's
  wordmark, why to sign in and "Sign in", which opens the Layout's sign-in sheet (KalioSignIn: the shop's
  own ways in, the email code; Selldone does the signing in). The sheet opens by itself on arrival.
  A signed-in visitor goes on to the profile, as Selldone's page did.
-->
<template>
  <div class="ly ly-login">
    <ly-pt :crumbs="[{ label: t('ly.lg.title', 'Sign in') }]" :title="t('ly.lg.title', 'Sign in')" cls="compact" />
    <section :aria-label="t('ly.lg.title', 'Sign in')" class="sec-s">
      <div class="wrap">
        <div :aria-busy="busy_user ? 'true' : undefined" class="pl-login pl-shell">
          <ly-logo :to="null" />
          <p>{{ t("ly.lg.why", "Sign in to see your orders and saved addresses.") }}</p>
          <div class="pl-login-acts">
            <button :aria-disabled="busy_user || user ? 'true' : undefined" class="pl-btn primary" type="button" @click="open">{{ t("ly.lg.title", "Sign in") }}</button>
            <router-link :to="{ path: '/' }" class="pl-btn quiet">{{ t("ly.lg.backShop", "Back to the shop") }}</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { StorefrontRoutesName } from "@selldone/core-js/enums/route/StorefrontRoutesName.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import LyPt from "../../components/ly/ui/LyPt.vue";
import LyLogo from "../../components/ly/LyLogo.vue";
import { t } from "../../components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageLogin",
  components: { LyPt, LyLogo },

  computed: {
    user() {
      return this.USER();
    },
    busy_user() {
      return this.$store.getters.getBusyUser;
    },
  },
  watch: {
    user(user) {
      if (user) this.$router.push({ name: StorefrontRoutesName.USER_PROFILE_PAGE });
    },
    busy_user(busy) {
      if (!busy && !this.user && !this.opened) this.open();
    },
  },
  data: () => ({ opened: false }),
  created() {
    if (this.user) this.$router.push({ name: StorefrontRoutesName.USER_PROFILE_PAGE });
  },
  mounted() {
    if (!this.user && !this.busy_user) this.open();
  },
  methods: {
    t,
    open() {
      if (this.user || this.busy_user) return;
      this.opened = true;
      EventBus.$emit("need-login", true);
    },
  },
};
</script>
