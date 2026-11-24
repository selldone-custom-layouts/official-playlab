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

## Checks

<!-- CHECKS:START -->
(none yet)
<!-- CHECKS:END -->

## Releases

| Version | Date | Layout | Deploy | What |
| --- | --- | --- | --- | --- |
| 1.0.0 | 2026-11-24 | 52 | 808 | First release of the approved Play Lab design on the base: Play Lab tokens (dark by default), header with the departments panel, footer with the Theme row as named pills, nine home sections from live data, the catalogue (lead panel, rail, List / Grid, filters sheet from the real specification, ?age=, deals with good finds under a live amount, designed no-results), card and add control, product page with detail sheet, guides, About, 404; toy words over the base's bakery words (English and Arabic). Release 01M85C8HB6ZMF1R265JK6ZKYMK, server copy verified (extracting false, error null, js and css match); 272 files. Not pinned yet. |
