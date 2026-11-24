# Play Lab Toy Store — release notes

**Play Lab Toy Store** (package `play-lab-toy-store`) is a Layout of the Selldone shop **toychi** (xapi `toychi-KX4iQgu0`), built for **playlab.selldone.shop**. It is a skin of the Layout base (see [`BASE.md`](BASE.md)): everything that makes it this Layout is `skins/playlab/skin.json` and `skins/playlab/photos/`; the code, the flows and the checks are the base's.

## Setup

| Area | What is set |
| --- | --- |
| Repo | `playlab-layout`, branch `main`; remote `upstream` (selldone/storefront, fetch only, push disabled); `origin` = `selldone-custom-layouts/official-playlab` once published (`scripts/publish-github.sh`) |
| Names | `manifest.json` and `selldone-layout.json` from the skin (`package` is permanent after the first upload; the `description` must be right on the FIRST upload, Selldone keeps it) |
| Dev server | port **9177**, shop `toychi-KX4iQgu0` (`.env`); `npm run serve` (launch entry `playlab-layout`) |
| Skin | Deep teal, Forest, Cobalt, Berry (brand `deep-teal`), Barlow Condensed over DM Sans, radius 10 / 6 px, basket word "bag" |
| Layout id | **52** |

## Home

The approved Play Lab design (Toychi Layout Mockups, `play-lab/`), every part from the shop's live data
(`components/ly/playlab/home/`, picks in `pl-home.ts`: departments ranked by pieces sold, the shop's order on a tie):

1. **pl-stage**: the `hero` photo on the stage's near-black of the palette's hue, the giant italic line, the lead department and All toys.
2. **pl-depts**: Departments, a button for each department with products, then All toys.
3. **pl-track**: the lead department's two most-sold toys as wide list cards ("<department> lineup").
4. **pl-challenges**: Pick a challenge, the next three departments with their own image and description.
5. **pl-workbench**: the `workbench` photo beside the tinted panel ("What will it do?") with the middle department's button.
6. **pl-gear**: four toys of the next department.
7. **pl-ages**: Shop by age, every age the toys' own specification names (Suggested Age and the like), youngest first, in even rows.
8. **pl-matchup**: the lineup's two toys side by side with Compare these toys.
9. **pl-guides**: the four newest blog posts as guide cards.

## What Play Lab replaces in the base

| Part | Where |
| --- | --- |
| Colours | `components/ly/playlab/pl-tokens.ts` (the design's OKLCH steps from the palette's hue, as hex) written by `ly-family.ts` as `--pl-*`, the base's neutrals mapped onto them |
| Look | `style/ly/pl.css` (loaded last) |
| Header, departments panel, footer | `components/ly/shell/LyHeader.vue`, `LyFooter.vue` |
| Card and add control | `components/ly/ui/LyCard.vue`, `LyAdd.vue`, `product/LyPdAdd.vue` |
| Catalogue (all toys, department, search, deals, `?age=`) | `components/ly/shop/LyListing.vue` |
| Product page | `components/ly/product/LyProductOverview.vue`, `LyProductTabs.vue`, `pages/product/StorefrontPageProduct.vue` |
| Guides, About, 404 | `pages/blog/list/`, `pages/official/about-us/`, `pages/errors/404/` |
| Sign-in page and sheet | `pages/login/StorefrontPageLogin.vue` (a Play Lab panel that opens the sheet), `components/kalio/shell/KalioSignIn.vue` (Play Lab's logo) |
| Saved toys, address book | `pages/user/wishlist/StorefrontPageUserWishlist.vue` (Play Lab cards; a guest is asked to sign in), `pages/user/addresses/StorefrontUserAddresses.vue` (no request for a guest) |
| Compare, FAQ, the account's guest overview | `components/ly/compare/LyCompare.vue` (the design's side panel beside the table), `pages/faq/StorefrontPageFaq.vue` (one stack), `components/kalio/account/KalioAccountHome.vue` and `KalioAccountShell.vue` (a guest's overview, the design's rail) |
| Three checkout steps, pickup only with a pickup point | `components/ly/buy/ly-cart.ts` (`pr_steps`: Details folded into Delivery, as Storybook; the bag's ways), `components/ly/ly.ts` (`deliveryWays`: the Rino rule) |
| Bag drawer, bag, checkout, order, account, compare, read pages | the base's pages in the design's panels, frame and plain-case headings (`style/ly/pl.css`); the checkout says why no delivery way shows before an address (`pages/basket/cart/StorefrontPageBasketCart.vue`) |
| Words | `skins/playlab/skin.json` words.en / words.ar (the base's bakery words for a toy shop, Play Lab's own words in Arabic) |
| Loading screen | `scripts/loading/config.json` → `scripts/loading/out/loading.json` (`test-loading.cjs` TOTAL 0) |

## Photos

| Slot | File | Size | In the build |
| --- | --- | --- | --- |
| hero | `skins/playlab/photos/hero.webp` | 1500 × 1000 | yes |
| workbench | `skins/playlab/photos/workbench.webp` | 1320 × 990 | yes |
| feature | `skins/playlab/photos/feature.webp` | 1500 × 1000 | yes |
| each collection | `skins/playlab/photos/col-<slug of its title>.webp` | 900 × 1200 | 0 file(s); a collection without one shows its best sellers on a plate |

## A guide opened directly

A guide's address opened fresh (`/blog/<slug>-<blog id>`) draws Play Lab's article page in a real browser: the route is `blog/:slug-:blog_id` → `StorefrontPageBlogsView` (checked on the live domain with a normal Chrome's client hints: route `ShopBlogPageSlug`, the article and Play Lab's footer drawn). Selldone serves its own server-rendered blog page (jQuery and Bootstrap, no Layout) to headless browsers and bots: a request whose user agent or `sec-ch-ua` says `HeadlessChrome` gets it. Playwright is headless, so a check that opens a guide directly must send a normal `sec-ch-ua` (for example `"Chromium";v="130", "Google Chrome";v="130"`) to see the Layout; the same happens on every Layout of the shop (Storybook included). Inside the shop, a guide is always Play Lab's page. The blog id is the post's `parent_id` (the shop-blog), not the article id.

## Checks

<!-- CHECKS:START -->
**1.0.5 on the live domain (playlab.selldone.shop, 24 Nov 2026), through new-shop-kits/pw-lock.sh:** fast-checks, 221 jobs at 1440, 1024 and 390 px (and 1920–3840 where the check asks), dark and light, Deep teal, Forest, Cobalt, Berry and the custom colours, English and forced Arabic — ring 0, card-edge 0, corner 0, circle 0, contrast 0 (424 states), cart 0, currency 0 (USD, AED, DKK, SAR), box 0, i18n 0, text-col 0, shape 0, underline 0, variant 0: **TOTAL 0** (1.0.0 started at 22 610).

**Guest checkout walk** (`scripts/checkout-walk.mjs`, 1440 and 390, guest checkout and cash on delivery on): add from a card, the bag drawer, the checkout, the delivery sheet (before an address it says why no way shows), the address sheet with the map (pin placed, address filled and saved), the courier way, Place order → Selldone's payment window (total matches the button) → its ✕, the bag emptied. **WALK OK**; no order placed.

**Every release:** the production-bundle check (release step 5b) OK; 275 files; server verify extracting false, error null, shop.js and shop.css match. Not machine-checked: the order page and its messages (no order exists; drawn locally from a made-up order answered inside the test browser only).
<!-- CHECKS:END -->

## Releases

| Version | Date | Layout | Deploy | What |
| --- | --- | --- | --- | --- |
| 1.0.0 | 2026-11-24 | 52 | 808 | First release of the approved Play Lab design on the base: Play Lab tokens (dark by default), header with the departments panel, footer with the Theme row as named pills, nine home sections from live data, the catalogue (lead panel, rail, List / Grid, filters sheet from the real specification, ?age=, deals with good finds under a live amount, designed no-results), card and add control, product page with detail sheet, guides, About, 404; toy words over the base's bakery words (English and Arabic). Release 01M85C8HB6ZMF1R265JK6ZKYMK, server copy verified (extracting false, error null, js and css match); 272 files. Not pinned yet. |
| 1.0.1 | 2026-11-24 | 52 | 811 | The design's panels on the bag, checkout steps, order, account and sheets; FAQ in one panel and in toy words; contact without an empty map box; fixes from the first live checks (GDPR link contrast, photos on the light box, region pill at tablet width, one link shape when focused, the stage photo under its words). |
| 1.0.2 | 2026-11-24 | 52 | 813 | One shape language (round wordmark dot, photo feature and guides lead in separate rounded boxes, no square tabs band); guides without an empty cover; Shop this post as a panel. |
| 1.0.3 | 2026-11-24 | 52 | 815 | Every base page on the design's frame with plain-case panel headings; bag lines and compare rows in one panel; numbered checkout steps and the dotted order timeline; the checkout says why no delivery way shows before an address; contact as the design's two panels; terms in one panel; saved toys as Play Lab cards; a sign-in page and sheet with Play Lab's logo; the address book asks a guest to sign in; plain-case buttons in the address sheet and the payment window; the last bakery words rewritten. |
| 1.0.4 | 2026-11-24 | 52 | 816 | Saved toys and the address book open for a guest and ask to sign in (no redirect to the home); the guide's shop box in the panel's colours in light mode; compare label cells on the panel colour; the order's share button in plain case. |
| 1.0.5 | 2026-11-24 | 52 | 817 | Contact's Before you write heading keeps the band's ink in light mode (panel headings no longer carry an id's weight); the address book's own lead. |
| 1.0.6 | 2026-11-24 | 52 | 818 | The design's three checkout steps (Bag › Delivery › Payment; Details folded into Delivery, as Storybook); compare as the design's side panel (how many, only the differences, share, clear all, similar toys) beside one table panel; FAQ as the design's single stack; the account's guest overview and the design's rail (Overview, Orders, Addresses, Saved toys); pickup only with a pickup point (the Rino rule), so the bag and product page no longer offer it on Toychi. |
| 1.0.7 | 2026-11-24 | 52 | — | The empty bag drawer as the design's panel (icon circle, "Explore toys" to the catalogue; no bakery drawing or "Today's selection"); the similar toys' photos on the skin's inner radius. |
