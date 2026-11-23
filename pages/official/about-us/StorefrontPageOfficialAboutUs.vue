<!--
  Play Lab's About (the approved design's routes.about, .about-split): the page title, then one panel with the
  skin's "feature" photo (without it, the shop's own toys on a light plate) beside the story: "Our story", a
  headline, the story and "Explore the collection".

  The story is the shop's own About page (Selldone dashboard › Shop › Profile) when it has written one; until then
  a short sample built only from the shop's facts (its name and departments), with the visible label "Sample text —
  the shop has not written this page yet". Never invented history, awards, names or counts.
-->
<template>
  <div class="ly ly-about pl-shell pl-page">
    <ly-pt :crumbs="[{ label: t('ly.rd.about', 'About') }]" :title="t('ly.rd.aboutT', 'About {shop}', { shop: name })" />
    <div class="pl-wrap">
      <div class="pl-panel pl-about-split">
        <div class="pl-feature-picture">
          <img v-if="photo" :alt="t('pl.about.photoAlt', 'Children playing together outdoors')" :src="photo" decoding="async" />
          <ly-cuts v-else-if="spread.length" :products="spread" kind="spread" />
        </div>
        <article class="pl-about-copy">
          <span class="pl-eyebrow">{{ t("pl.about.eyebrow", "Our story") }}</span>
          <h2>{{ own ? t("ly.rd.aboutT", "About {shop}", { shop: name }) : t("pl.about.h", "Make time for play.") }}</h2>
          <ly-sample-tag v-if="!own" />
          <div v-if="own" class="pl-prose ly-own" v-html="ownHtml"></div>
          <template v-else>
            <p>{{ aboutP1 }}</p>
            <p>{{ t("pl.about.p2", "The catalog makes it easy to see the details before choosing, from suggested ages to what comes in each set.") }}</p>
          </template>
          <router-link :to="shopTo" class="pl-btn primary">{{ t("pl.about.cta", "Explore the collection") }}</router-link>
        </article>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import LyIcon from "@app-storefront/components/ly/LyIcon.vue";
import LyArt from "@app-storefront/components/ly/LyArt.vue";
import LyCuts from "@app-storefront/components/ly/LyCuts.vue";
import LyPhoto from "@app-storefront/components/ly/LyPhoto.vue";
import LyPt from "@app-storefront/components/ly/ui/LyPt.vue";
import LyIcLine from "@app-storefront/components/ly/ui/LyIcLine.vue";
import LySampleTag from "@app-storefront/components/ly/ui/LySampleTag.vue";
import { bySells, catTitle, catTo, ly, inCat, loadDm, mixed, openLine as openWords, productImage, shopFacts, unitOf } from "@app-storefront/components/ly/ly";
import { collectionPhoto, slotPhoto } from "@app-storefront/components/ly/ly-photos";
import { numberWord } from "@app-storefront/components/ly/product/pd";
import { listWords, ownText, paySentence, shopName, shopProfile, shortAddress } from "@app-storefront/components/ly/read/rd";
import { catalogueRoute } from "@app-storefront/components/kalio/kalio-catalog";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialAboutUs",
  components: { LyIcon, LyArt, LyCuts, LyPhoto, LyPt, LyIcLine, LySampleTag },
  inject: ["$shop"],

  data: () => ({ ly, profile: null as any }),

  computed: {
    photo() {
      return slotPhoto("feature");
    },
    /* {shop} and its departments, from the shop's own data */
    aboutP1() {
      const names = this.ly.cats.slice(0, 4).map((c: any) => catTitle(c).toLowerCase());
      const list = names.length ? listWords(names) : "";
      return list ? t("pl.about.p1", "{shop} brings together toys for different ages, interests and places to play. Explore {names}.", { shop: this.name, names: list }) : t("pl.about.p1b", "{shop} brings together toys for different ages, interests and places to play.", { shop: this.name });
    },
    shop() {
      return this.$store.getters.getShop;
    },
    f() {
      return shopFacts(this.shop);
    },
    name() {
      return shopName(this.shop);
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
    bandLead() {
      const at = shortAddress(this.f);
      return at ? t("ly.rd.aboutLead", "A pâtisserie counter at {place}.", { place: at }) : "";
    },
    units() {
      return [...new Set(this.ly.cats.map((c: any) => unitOf(this.ly.products.find((p: any) => p.category_id === c.id) || {}).toLowerCase()).filter(Boolean))] as string[];
    },
    collectionsWords() {
      return listWords(this.ly.cats.map((c: any) => catTitle(c).toLowerCase()));
    },
    storyP1() {
      const where = this.f.address;
      const lead = where ? t("ly.rd.storyAt", "{shop} is a bakery counter at {address}.", { shop: this.name, address: where }) : t("ly.rd.storyIs", "{shop} is a bakery counter.", { shop: this.name });
      const small = this.units[0] ? t("ly.rd.storySmall", ", so an order can be a single {unit} or a small table of favourites", { unit: this.units[0] }) : "";
      const hold = this.collectionsWords ? t("ly.rd.storyCase", "Its collections — {names} — are sold as individual pieces{small}.", { names: this.collectionsWords, small }) : "";
      return [lead, hold].filter(Boolean).join(" ");
    },
    storyP2() {
      const f = this.f;
      const open = f.hours ? (f.everyDay ? t("ly.rd.openEveryFrom", "The counter is open every day from {hours}.", { hours: f.hours }) : t("ly.rd.openFrom", "The counter is open {hours}.", { hours: f.hours })) : "";
      const kinds: string[] = [];
      if (f.courier) kinds.push(f.courier.distance ? t("ly.rd.byCourierKm", "travel with the {name} within {km} km", { name: f.courier.title, km: f.courier.distance }) : t("ly.rd.byCourier", "travel with the {name}", { name: f.courier.title }));
      if (f.shipping) kinds.push(t("ly.rd.byShipping", "ship further away"));
      if (f.pickup) kinds.push(t("ly.rd.byPickup", "wait at the counter for pickup"));
      const how = kinds.length ? t("ly.rd.ordersHow", "Orders {kinds}", { kinds: listWords(kinds) }) : "";
      const pay = f.gateway?.cod ? t("ly.rd.paidCod", ", and they are paid in cash on delivery.") : how ? "." : "";
      return [open, how ? how + pay : ""].filter(Boolean).join(" ");
    },
    /* The counter's lines: where, when, how it is paid. */
    lines() {
      const f = this.f;
      const out: any[] = [];
      if (f.address) out.push({ key: "pin", icon: "pin", title: f.address, text: f.pickupNote });
      const open = openWords(f);
      if (open) out.push({ key: "clock", icon: "clock", title: open, text: f.everyDay ? t("ly.rd.monSun", "Monday to Sunday") : "" });
      if (f.gateway) out.push({ key: "cash", icon: "cash", title: f.gateway.name, text: f.gateway.cod ? t("ly.rd.nothingOnline", "Nothing is charged online") : f.gateway.description || paySentence(f) });
      return out;
    },
    spread() {
      return mixed(bySells(this.ly.products)).slice(0, 5);
    },
    counterText() {
      return this.f.pickupNote || [shortAddress(this.f), openWords(this.f)].filter(Boolean).join(". ") || t("ly.rd.counterP", "Every piece is baked and packed at the counter.");
    },
    /* The collection with the most sold pieces, in its photo. */
    photoCat() {
      const cats = this.ly.cats.slice();
      const sold = (c: any) => inCat(c.id).reduce((n: number, p: any) => n + (Number(p.sells) || 0), 0);
      return cats.sort((a: any, b: any) => sold(b) - sold(a))[0] || null;
    },
    oneByOne() {
      const u = this.units;
      if (u.length >= 3) return t("ly.rd.oneByOneP3", "One {a}, one {b}, one {c} — every pastry is its own piece, with its own price.", { a: u[0], b: u[1], c: u[2] });
      return t("ly.rd.oneByOneP", "Every pastry is its own piece, with its own price.");
    },
    tableText() {
      const u = this.units;
      const tail = t("ly.rd.tableTail", "Each piece is chosen on its own, and the bag shows the full price, the saving and the total before checkout.");
      if (u.length >= 3) return `${t("ly.rd.tableMix", "Mix a {a} with a {b}, and add a {c} for later.", { a: u[0], b: u[1], c: u[2] })} ${tail}`;
      return tail;
    },
    collage() {
      return mixed(bySells(this.ly.products)).slice(0, 6);
    },
    shopTo() {
      return catalogueRoute({});
    },
    contactTo() {
      return { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : this.contactTo;
    },
  },

  created() {
    loadDm();
    this.setPageTitle?.(t("ly.rd.aboutT", "About {shop}", { shop: shopName(this.$store.getters.getShop) }));
    shopProfile(this.$shop.name, "about-us").then((p) => (this.profile = p));
  },

  methods: { t, catTo, catTitle, productImage, bySells, inCat, numberWord, colPhoto: collectionPhoto },
};
</script>
