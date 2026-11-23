# Play Lab Toy Store — release notes

**Play Lab Toy Store** (package `play-lab-toy-store`) is a Layout of the Selldone shop **toychi** (xapi `toychi-KX4iQgu0`), built for **playlab.selldone.shop**. It is a skin of the Layout base (see [`BASE.md`](BASE.md)): everything that makes it this Layout is `skins/playlab/skin.json` and `skins/playlab/photos/`; the code, the flows and the checks are the base's.

## Setup

| Area | What is set |
| --- | --- |
| Repo | `playlab-layout`, branch `main`; remote `upstream` (selldone/storefront, fetch only, push disabled); `origin` = `selldone-custom-layouts/official-playlab` once published (`scripts/publish-github.sh`) |
| Names | `manifest.json` and `selldone-layout.json` from the skin (`package` is permanent after the first upload; the `description` must be right on the FIRST upload, Selldone keeps it) |
| Dev server | port **9177**, shop `toychi-KX4iQgu0` (`.env`); `npm run serve` (launch entry `playlab-layout`) |
| Skin | Deep teal, Forest, Cobalt, Berry (brand `deep-teal`), Barlow Condensed over DM Sans, radius 10 / 6 px, basket word "bag" |
| Layout id | (after the first upload) |

## Home

1. **hero** (split): The shop's name and line on the left; the counter photo bleeding to the right edge of the frame, a framed inset across the seam with the best seller, the three most-ordered collections set large on the photo's dark corner (from Pralino).
2. **collections** (cards): The same four as a 2 × 2 grid of cards, the photo on top inside the card (Domino).
3. **journal** (photo, tint band): The four newest posts beside a tall photo with the big word 'Journal' (from Pralino; best last).

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
