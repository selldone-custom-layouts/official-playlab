<!--
  Play Lab's guides (the approved design's labBlog(), play-lab.css .lab-blog*): the breadcrumb; the lead panel
  ("Play guides", one line, a button to the newest guide, the skin's "feature" photo); then "Browse by activity"
  (All guides and the shop's own blog topics) beside every guide as a wide card (its date, title, its own line,
  "Get the guide", its own cover). Whatever posts the shop has, newest first; "More guides" reads the next page.
  A topic, tag, author or search narrows the list and says so. No posts: an honest empty card.
-->
<template>
  <div class="ly ly-journal pl-shell pl-blog">
    <div class="pl-wrap">
      <nav :aria-label="t('ly.pt.crumbs', 'Breadcrumb')" class="pl-crumbs">
        <router-link :to="{ path: '/' }">{{ t("ly.pt.home", "Home") }}</router-link><ly-icon cls="pl-fwd" name="chev" />
        <router-link v-if="filtered" :to="journalRoute()">{{ t("pl.blog.title", "Play guides") }}</router-link><span v-else aria-current="page">{{ t("pl.blog.title", "Play guides") }}</span>
        <template v-if="filtered"><ly-icon cls="pl-fwd" name="chev" /><span aria-current="page"><bdi>{{ heading }}</bdi></span></template>
      </nav>

      <header class="pl-blog-intro">
        <div>
          <h1><bdi>{{ filtered ? heading : t("pl.blog.title", "Play guides") }}</bdi></h1>
          <p>{{ filtered ? lede : t("pl.blog.lead", "Choose an activity, see what you’ll need and get started.") }}</p>
          <router-link v-if="!filtered && articles[0]" :to="postRoute(articles[0])" class="pl-btn primary">{{ t("pl.blog.start", "Start with the newest guide") }}</router-link>
        </div>
        <div class="pl-blog-photo">
          <img v-if="photo" :alt="t('pl.blog.photoAlt', 'Children playing outdoors')" :src="photo" decoding="async" />
        </div>
      </header>

      <div class="pl-blog-body">
        <nav :aria-label="t('pl.blog.filter', 'Filter guides')" class="pl-guide-filters">
          <h2>{{ t("pl.blog.browse", "Browse by activity") }}</h2>
          <router-link :aria-current="!current_category ? 'page' : undefined" :to="journalRoute()">{{ t("pl.home.allGuides", "All guides") }}</router-link>
          <router-link v-for="c in categories" :key="c.id" :aria-current="String(current_category) === String(c.id) ? 'page' : undefined" :to="journalRoute({ category: c.id })"
            ><bdi>{{ c.title || c.name }}</bdi></router-link
          >
        </nav>
        <div>
          <div v-if="articles.length" class="pl-guide-list">
            <pl-guide v-for="b in articles" :key="b.id" :post="b" />
          </div>
          <div v-else-if="busy" :aria-label="t('ly.rd.loading', 'Loading the journal')" class="pl-guide-list" role="status">
            <div v-for="n in 3" :key="n" class="pl-guide pl-skel" style="min-height: 150px"></div>
          </div>
          <section v-else class="pl-panel pl-empty">
            <span class="pl-empty-ic"><ly-icon :name="filtered ? 'search' : 'doc'" /></span>
            <h2>{{ filtered ? t("ly.rd.noMatchT", "No post matches this") : t("pl.blog.noneT", "No guides yet") }}</h2>
            <p>{{ filtered ? t("pl.blog.noneMatchP", "Try another activity, or see every guide.") : t("ly.rd.noPostsP", "The shop has not published any guides yet.") }}</p>
            <router-link v-if="filtered" :to="journalRoute()" class="pl-btn primary">{{ t("pl.home.allGuides", "All guides") }}</router-link>
            <router-link v-else :to="{ path: '/' }" class="pl-btn primary">{{ t("ly.rd.backShop", "Back to the shop") }}</router-link>
          </section>
          <div v-if="articles.length && articles.length < total" class="pl-show-more">
            <button :aria-disabled="busy ? 'true' : undefined" class="pl-btn quiet" type="button" @click="loadMore">{{ t("pl.blog.more", "More guides") }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import LyIcon from "@app-storefront/components/ly/LyIcon.vue";
import LyArt from "@app-storefront/components/ly/LyArt.vue";
import LyPost from "@app-storefront/components/ly/read/LyPost.vue";
import PlGuide from "@app-storefront/components/ly/playlab/PlGuide.vue";
import { slotPhoto } from "@app-storefront/components/ly/ly-photos";
import LyPt from "@app-storefront/components/ly/ui/LyPt.vue";
import LyEmpty from "@app-storefront/components/ly/ui/LyEmpty.vue";
import { fmtDate } from "@app-storefront/components/ly/ly";
import { dropSrcset, photoSrcset } from "@app-storefront/components/kalio/kalio-catalog";
import { journalExtra, journalPage, journalRoute, postRoute } from "@app-storefront/components/kalio/pages/kalio-journal";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

/* One featured story and a grid of three across: 1 + 12 on the first page. */
const FIRST = 13;

export default {
  name: "StorefrontPageBlogsList",
  components: { LyIcon, LyArt, LyPost, LyPt, LyEmpty, PlGuide },
  inject: ["$shop"],

  data: () => ({ articles: [] as any[], total: 0, busy: false, page: 1, categories: [] as any[], q: "" }),

  computed: {
    photo() {
      return slotPhoto("feature");
    },
    current_category() {
      return this.$route.query.category || null;
    },
    current_tag() {
      return this.$route.query.tags || null;
    },
    current_search() {
      return this.$route.query.search || "";
    },
    current_author() {
      return this.$route.params.author || null;
    },
    current_author_id() {
      return this.$route.params.author_id || null;
    },
    filtered() {
      return !!(this.current_category || this.current_tag || this.current_search || this.current_author_id);
    },
    category() {
      return this.categories.find((it: any) => String(it.id) === String(this.current_category)) || null;
    },
    shopName() {
      const n = String(this.$shop?.title || "");
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    heading() {
      if (!this.filtered) return t("ly.rd.jrTitle", "The {shop} journal", { shop: this.shopName });
      if (this.current_category) return this.category?.title || this.category?.name || t("ly.rd.topic", "Topic");
      if (this.current_author_id) return this.articles[0]?.user?.name || this.current_author || t("ly.rd.author", "Author");
      if (this.current_tag) return `#${this.current_tag}`;
      return t("ly.rd.searchFor", "“{q}”", { q: String(this.current_search) });
    },
    crumbs() {
      const j = { label: t("ly.rd.journal", "Journal") };
      return this.filtered ? [{ ...j, to: journalRoute() }, { label: this.heading }] : [j];
    },
    lede() {
      if (this.current_category) return this.category?.description || t("ly.rd.ledeTopic", "Every post on this topic, newest first.");
      if (this.filtered) return t("ly.rd.ledeMatch", "The posts that match, newest first.");
      return t("ly.rd.jrLede", "Guides to the collections, and plain answers about delivery, pickup and ordering for a group.");
    },
    feature() {
      return this.filtered ? null : this.articles[0] || null;
    },
    rest() {
      return this.feature ? this.articles.slice(1) : this.articles;
    },
  },

  watch: {
    "$route.fullPath"() {
      this.load();
    },
    current_search: {
      handler(v: any) {
        if (document.activeElement?.id !== "bl-q") this.q = String(v || "");
      },
      immediate: true,
    },
  },

  created() {
    this.setPageTitle?.(t("bakini.n.rd.journal", "Journal"));
    this.load();
    journalExtra()
      .then(({ categories }: any) => (this.categories = categories || []))
      .catch(() => {});
  },

  beforeUnmount() {
    clearTimeout(this.timer);
  },

  methods: {
    t,
    fmtDate,
    /* The search field writes Selldone's ?search= (a pause after typing). */
    searchSoon() {
      clearTimeout(this.timer);
      this.timer = setTimeout(this.search, 450);
    },
    search() {
      clearTimeout(this.timer);
      const v = this.q.trim();
      if (v === String(this.current_search || "")) return;
      this.$router.replace({ query: { ...this.$route.query, search: v || undefined } });
    },
    postRoute,
    journalRoute,
    dropSrcset,
    image(a: any) {
      return a?.image ? window.CDN.GET_SHOP_IMAGE_PATH(a.image, null) : null;
    },
    srcset(a: any) {
      return photoSrcset(this.image(a));
    },
    query(offsetPage: number, limit: number) {
      return {
        page: offsetPage,
        limit,
        category: this.current_category,
        author: this.current_author,
        author_id: this.current_author_id,
        tag: this.current_tag,
        search: this.current_search,
      };
    },
    load() {
      const asked = this.$route.fullPath;
      this.busy = true;
      this.page = 1;
      journalPage(this.query(1, FIRST))
        .then(({ articles, total }: any) => {
          if (asked !== this.$route.fullPath) return;
          this.articles = articles || [];
          this.total = total || this.articles.length;
        })
        .catch(() => {
          this.articles = [];
          this.total = 0;
        })
        .finally(() => (this.busy = false));
    },
    /* The next thirteen. */
    loadMore() {
      if (this.busy) return;
      this.busy = true;
      this.page = (this.page || 1) + 1;
      journalPage(this.query(this.page, FIRST))
        .then(({ articles }: any) => {
          const seen = new Set(this.articles.map((a: any) => a.id));
          const fresh = (articles || []).filter((a: any) => !seen.has(a.id));
          this.articles = this.articles.concat(fresh);
          if (!fresh.length) this.total = this.articles.length;
        })
        .catch(() => {})
        .finally(() => (this.busy = false));
    },
  },
};
</script>
