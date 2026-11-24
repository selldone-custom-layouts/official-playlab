<!--
  Contact (Play Lab: the design's contact.html): the title band ("Contact <shop>"), then two panels. The shop's
  panel: its name, where an order's questions go ("Find your orders"), and only what the shop has — Visit (the
  address and the pickup words), Call or write, Hours (the open line and the open days) and, with a location, a
  real map (LyMap). Beside it "Send us a message" (name, email, message, "Send message", "Or call …"), sent with
  Selldone's own contact call; missing fields are named under each field before sending. When the shop has
  written its own "Contact us" page, its text shows above the form. Last, "Before you write" with links to the
  answers.
-->
<template>
  <div class="ly ly-contact">
    <ly-pt :crumbs="[{ label: t('ly.rd.contact', 'Contact') }]" :lead="lede" :title="t('ly.rd.contactT', 'Contact {shop}', { shop: name })" art="cupcake" art2="cookie" />

    <section aria-labelledby="ct-h" class="sec-s ct-main pl-ct">
      <div class="wrap pl-ct-g">
        <!-- the shop's panel (the design's contact.html, left): its name, where an order's questions go, and only what it has -->
        <aside :aria-label="t('ly.rd.waysAria', 'Ways to reach {shop}', { shop: name })" class="pl-ct-shop">
          <h2 class="co-h"><bdi>{{ name }}</bdi></h2>
          <p class="co-p">{{ t("pl.ct.orderHelp", "For questions about an order, open the order and use its message panel.") }}</p>
          <div class="pl-ct-acts">
            <router-link :to="ordersTo" class="pl-btn primary">{{ t("pl.ct.findOrders", "Find your orders") }}</router-link>
          </div>
          <dl v-if="f.address || f.phone || f.email || open || f.days.length" class="pl-ct-facts">
            <div v-if="f.address">
              <dt><ly-icon name="pin" />{{ t("ly.rd.visit", "Visit") }}</dt>
              <dd>
                <bdi>{{ street }}</bdi><br /><bdi>{{ cityLine }}</bdi>
                <span v-if="f.pickupNote" class="ci-s">{{ f.pickupNote }}</span>
              </dd>
            </div>
            <div v-if="f.phone || f.email">
              <dt><ly-icon name="message" />{{ f.phone && f.email ? t("ly.rd.callWrite", "Call or write") : f.phone ? t("ly.rd.call", "Call") : t("ly.rd.write", "Write") }}</dt>
              <dd>
                <a v-if="f.phone" :href="tel" dir="ltr">{{ f.phone }}</a><br v-if="f.phone && f.email" /><a v-if="f.email" :href="'mailto:' + f.email">{{ f.email }}</a>
              </dd>
            </div>
            <div v-if="open || f.days.length">
              <dt><ly-icon name="clock" />{{ t("ly.rd.hours", "Hours") }}</dt>
              <dd>
                <span v-if="open">{{ open }}</span>
                <ul v-if="f.days.length" :aria-label="t('ly.rd.openDays', 'Open days')" class="days">
                  <li v-for="d in f.days" :key="d">{{ dayShort(d) }}</li>
                </ul>
              </dd>
            </div>
          </dl>
          <div v-if="f.location" class="ct-map">
            <div class="ct-mbox"><ly-map :line="street" :location="f.location" :title="name" /></div>
          </div>
        </aside>

        <!-- the message (the design's contact.html, right), sent with Selldone's own contact call -->
        <form class="ct-f" novalidate @submit.prevent="send">
          <h2 id="ct-h" class="co-h">{{ t("pl.ct.sendH", "Send us a message") }}</h2>
          <div v-if="own" class="art-body ly-own" v-html="ownHtml"></div>
          <template v-if="!sent">
            <div class="g2">
              <div :class="['fld', { bad: !!errs.name }]">
                <label class="fl" for="ct-n">{{ t("ly.rd.fName", "Name") }}</label>
                <input id="ct-n" v-model.trim="form.name" autocomplete="name" class="inp" name="name" />
                <span class="err">{{ errs.name }}</span>
              </div>
              <div :class="['fld', { bad: !!errs.email }]">
                <label class="fl" for="ct-e">{{ t("ly.rd.fEmail", "Email") }}</label>
                <input id="ct-e" v-model.trim="form.email" autocomplete="email" class="inp" name="email" type="email" />
                <span class="err">{{ errs.email }}</span>
              </div>
            </div>
            <div :class="['fld', { bad: !!errs.message }]">
              <label class="fl" for="ct-m">{{ t("ly.rd.fMessage", "Message") }}</label>
              <textarea id="ct-m" v-model="form.message" :placeholder="t('ly.rd.fMessagePh', 'A question about an order, an allergen, a larger order for a group…')" class="inp" name="message" rows="6"></textarea>
              <span class="err">{{ errs.message }}</span>
            </div>
            <p v-if="failed" class="ly-fail" role="alert"><ly-icon name="info" />{{ failed }}</p>
            <div class="ct-a">
              <button :aria-disabled="busy ? 'true' : undefined" class="btn" type="submit">{{ t("pl.ct.send", "Send message") }}<ly-icon cls="flip-rtl" name="send" /></button>
              <p v-if="f.phone" class="ct-n">
                {{ t("ly.rd.orCall", "Or call") }} <a :href="tel" dir="ltr">{{ f.phone }}</a>
              </p>
            </div>
          </template>
          <div v-else class="ct-ok" role="status">
            <span class="em-ic sm"><ly-icon name="check" /></span>
            <div>
              <b>{{ t("ly.rd.sentT", "Message sent") }}</b>
              <p>{{ t("ly.rd.sentP", "The bakery replies at the email you gave.") }}</p>
              <button class="qlink" type="button" @click="sent = false">{{ t("ly.rd.another", "Send another message") }}</button>
            </div>
          </div>
        </form>
      </div>
    </section>

    <section aria-labelledby="cf-h" class="sec-s ct-faq">
      <div class="wrap">
        <div class="cf">
          <div>
            <p class="eyebrow">{{ t("ly.rd.before", "Before you write") }}</p>
            <h2 id="cf-h" class="h3x">{{ t("ly.rd.answered", "Most questions are answered here") }}</h2>
          </div>
          <ul class="cf-l">
            <li v-for="q in topics" :key="q">
              <router-link :to="faqTo" class="cf-a"
                ><span>{{ q }}</span><ly-icon cls="flip-rtl" name="arrow"
              /></router-link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import LyIcon from "@app-storefront/components/ly/LyIcon.vue";
import LyArt from "@app-storefront/components/ly/LyArt.vue";
import LyPt from "@app-storefront/components/ly/ui/LyPt.vue";
import LyMap from "@app-storefront/components/ly/read/LyMap.vue";
import { openLine as openWords, shopFacts } from "@app-storefront/components/ly/ly";
import { cityLine, ownText, shopName, shopProfile, streetOf } from "@app-storefront/components/ly/read/rd";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialContactUs",
  components: { LyIcon, LyArt, LyPt, LyMap },
  inject: ["$shop"],

  data: () => ({
    profile: null as any,
    form: { name: "", email: "", message: "" },
    errs: { name: "", email: "", message: "" } as Record<string, string>,
    busy: false,
    sent: false,
    failed: "",
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    f() {
      return shopFacts(this.shop);
    },
    name() {
      return shopName(this.shop);
    },
    street() {
      return streetOf(this.f);
    },
    cityLine() {
      return [cityLine(this.f), this.f.country].filter(Boolean).join(", ");
    },
    open() {
      return openWords(this.f);
    },
    tel() {
      return "tel:" + String(this.f.phone || "").replace(/[^\d+]/g, "");
    },
    capNote() {
      return this.f.pickupNote ? this.f.pickupNote.split(".")[0] : "";
    },
    lede() {
      return t("ly.rd.ctLede", "Come to the counter, call, or write — the bakery answers every message.");
    },
    topics() {
      const f = this.f;
      const out: string[] = [];
      if (f.courier) out.push(f.courier.windows.length ? t("ly.rd.qWindows", "Delivery windows") : t("ly.rd.qDelivery", "Delivery"));
      else if (f.shipping) out.push(t("ly.rd.qShipping", "Shipping"));
      if (f.pickup) out.push(t("ly.rd.qPickup", "Pickup at the counter"));
      out.push(f.gateway?.cod ? t("ly.rd.qCod", "Cash on delivery") : t("ly.rd.qPay", "Payment"));
      out.push(t("ly.rd.qAllergens", "Allergens"));
      return out;
    },
    ordersTo() {
      return { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
  },

  created() {
    this.setPageTitle?.(t("ly.rd.contact", "Contact"));
    shopProfile(this.$shop.name, "contact-us").then((p) => (this.profile = p));
    const u = this.USER?.();
    if (u) {
      this.form.name = u.name || "";
      this.form.email = u.email || "";
    }
  },

  methods: {
    t,
    /* "Mon", in the page's language (Selldone keeps the days in English). */
    dayShort(day: string) {
      const i = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
      if (i < 0) return day.slice(0, 3);
      try {
        return new Date(Date.UTC(2023, 0, 1 + i)).toLocaleDateString(document.documentElement.lang || "en", { weekday: "short", timeZone: "UTC" });
      } catch {
        return day.slice(0, 3);
      }
    },
    check() {
      const f = this.form;
      this.errs = {
        name: f.name.length > 1 ? "" : t("ly.rd.errName", "Add your name"),
        email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) ? "" : t("ly.rd.errEmail", "Add a valid email address"),
        message: f.message.trim().length > 3 ? "" : t("ly.rd.errMessage", "Write a message"),
      };
      const first = ["name", "email", "message"].find((k) => this.errs[k]);
      if (first) (this.$el.querySelector(`[name="${first}"]`) as HTMLElement | null)?.focus();
      return !first;
    },
    send() {
      if (this.busy) return;
      this.failed = "";
      if (!this.check()) return;
      this.busy = true;
      window.axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.$shop.name), {
          name: this.form.name,
          email: this.form.email,
          phone: this.USER?.()?.phone || null,
          message: this.form.message.trim(),
          category: "Contact",
          url: window.location.href,
        })
        .then(({ data }: any) => {
          if (data?.error) {
            this.failed = t("ly.rd.failed", "That did not go through. Please try again.");
            return;
          }
          this.form.message = "";
          this.sent = true;
        })
        .catch(() => (this.failed = t("ly.rd.failedLater", "That did not go through. Please try again in a moment.")))
        .finally(() => (this.busy = false));
    },
  },
};
</script>
