<!--
  Play Lab's footer (the approved design's shared/app.js labFooter(), play-lab.css .lab-footer-*):
  "Need a hand?" with three service links (track an order, help and FAQ, contact), then the shop's departments
  (live, the shop's order) and the shop tools, the wordmark at the end; then the Theme row (the owner's rule of
  10 November 2026: palettes, a custom colour and Light / Dark, in a row of its own above the legal row; the kit's
  ThemeSwitcherRow, only on the showcase shops); then the legal row: the copyright, Terms, Privacy, Selldone's
  cookie settings, the shop's social links and a small "made with" credit. A shop with custom footer code keeps
  Selldone's footer (StorefrontLayout).
-->
<template>
  <div class="ly ly-ftrwrap pl-shell">
    <footer class="pl-footer">
      <div class="pl-wrap pl-footer-service">
        <div>
          <h2>{{ t("pl.ftr.hand", "Need a hand?") }}</h2>
          <p><bdi>{{ t("pl.ftr.handP", "Find answers, check your orders or contact {name}.", { name: shopName }) }}</bdi></p>
        </div>
        <nav :aria-label="t('pl.ftr.support', 'Customer support')">
          <router-link :to="ordersTo"><ly-icon name="box" />{{ t("pl.ftr.track", "Track an order") }}</router-link>
          <router-link :to="faqTo"><ly-icon name="search" />{{ t("pl.ftr.help", "Help and FAQ") }}</router-link>
          <router-link :to="{ name: r.SHOP_CONTACT_US }"><ly-icon name="message" />{{ t("pl.ftr.contact", "Contact us") }}</router-link>
        </nav>
      </div>

      <div class="pl-wrap pl-footer-main">
        <nav v-if="cats.length" :aria-label="t('pl.hdr.departments', 'Departments')">
          <h2>{{ t("pl.hdr.departments", "Departments") }}</h2>
          <div>
            <router-link v-for="c in cats" :key="c.id" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </div>
        </nav>
        <nav :aria-label="t('pl.ftr.tools', 'Shop tools')">
          <h2>{{ t("pl.ftr.tools", "Shop tools") }}</h2>
          <div>
            <router-link :to="{ name: r.SHOP_PAGE }">{{ t("pl.ftr.all", "All toys") }}</router-link>
            <router-link :to="{ name: r.COMPARISON_PAGE }">{{ t("pl.hdr.compareToys", "Compare toys") }}</router-link>
            <router-link :to="{ name: r.USER_FAVORITES_PAGE }">{{ t("pl.hdr.saved", "Saved toys") }}</router-link>
            <router-link :to="blogTo">{{ t("pl.hdr.playGuides", "Play guides") }}</router-link>
            <router-link :to="{ name: r.SHOP_PROFILE_PAGE_ABOUT_US }"><bdi>{{ t("pl.ftr.about", "About {name}", { name: shopName }) }}</bdi></router-link>
          </div>
        </nav>
        <div class="pl-footer-brand"><ly-logo /></div>
      </div>

      <!-- The theme switcher (the owner, 10 November 2026: in the footer on
           every Layout), only on the Layout's showcase shops. -->
      <div v-if="theme.enabled" class="dts-row pl-theme-row">
        <div class="pl-wrap dts-in"><theme-switcher-row /></div>
      </div>

      <div class="pl-wrap pl-legal">
        <span>© {{ year }} <bdi>{{ shopName }}</bdi></span>
        <nav :aria-label="t('ly.ftr.legal', 'Legal')">
          <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("ly.ftr.terms", "Terms") }}</router-link>
          <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("ly.ftr.privacy", "Privacy") }}</router-link>
          <s-footer-section-gdpr class="ly-gdpr"></s-footer-section-gdpr>
          <s-storefront-social-buttons class="ly-social"></s-storefront-social-buttons>
          <s-footer-section-selldone class="ly-made"></s-footer-section-selldone>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import LyLogo from "../LyLogo.vue";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import { themeState } from "../../theme-switcher/theme-switcher";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { catTitle, catTo, loadDm, ly } from "../ly";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyFooter",
  components: { LyIcon, LyLogo, ThemeSwitcherRow, SStorefrontSocialButtons, SFooterSectionGdpr, SFooterSectionSelldone },
  data: () => ({ theme: themeState, ly }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    r() {
      return window.$storefront.routes;
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    year() {
      return new Date().getFullYear();
    },
    cats() {
      return this.ly.cats;
    },
    blogTo() {
      return journalRoute();
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
  },
  created() {
    loadDm();
  },
  methods: { t, catTitle, catTo },
};
</script>
