# Design direction: Facade

Development notes for whoever edits the look next. Not served (the `docs/` folder is blocked from the web).

Chosen on 25 November 2026 through the impeccable skill's redesign process (`.claude/skills/impeccable`), with taste (`.claude/skills/design-taste-frontend`) and Emil Kowalski's design-engineering rules (`.claude/skills/emil-*`) as the quality bar. The alternatives offered were "Strata plan" (drafting-paper linework) and "Polished corporate" (the category standard).

## Direction contract

- **Thesis:** the page is an apartment building seen from the street. It refuses the category default: a dark glowing hero, floating stat chips and rows of equal cards.
- **Own world:** solid logo blue `#094BC1` owns whole regions, never as a gradient. White and concrete `#ECEEF1` make up the ground. Logo green `#00544E` is one band per page, and dark ink `#0B1322` is used for the footer. Archivo, a variable typeface with a width axis, is set semi-condensed for display (`font-stretch: 82%`) and expanded for lot labels. Corners are square (2px), divisions are hairline rules, and photographs run edge to edge. Roles are listed like a lobby directory, with lot numbers.
- **Story:** strata agency principals see trained offshore strata staff and the work they do (real task list, real figures, real client quotes). They believe it from the SCA presidents' testimonials and the 5-to-21-staff growth story. Their action is to book a discovery call, or to try the calculator first.
- **First viewport:** on the left, a blue panel with the h1, subtitle, "Book a discovery call" (white button) and the trust line. On the right, a full-height building photo, with a working calculator sentence along its base: managers × admin hours = hours a year.
- **Signature motion:** the building is revealed floor by floor on load (blue storeys slide away, bottom to top) while the headline rises. On the role directory, the photo beside the board shows the role you point at. Nothing else moves on scroll except card reveals, the count-up and the "How it works" line on inner pages.
- **Files:** `assets/css/facade.css` holds the world, loaded after `assets/css/site.css`, which keeps the base layout. The homepage markup is in `frontend/pages/home.php` and the motion is in `plugins/gsap-motion/motion.js`.

## Stand-in photographs (replace with your own when ready)

All are from Unsplash under the Unsplash Licence: free for commercial use, no permission or credit required. Unsplash+ photos were excluded.

| File in `assets/media/stock/` | Used for | Unsplash photo |
|---|---|---|
| `hero-tower.webp` | Homepage hero building | https://unsplash.com/photos/PJugdpA1JBo |
| `balcony-rows.webp` | Figures plaque band | https://unsplash.com/photos/WCmeYmM3jW4 |
| `team-collab.webp` | "From first call to a working team" (stand-in people, not Strata Staff employees) | https://unsplash.com/photos/jxUuXxUFfp4 |
| `sydney-harbour.webp` | Australia panel | https://unsplash.com/photos/kg8UTY_dTjU |
| `vancouver-harbour.webp` | Canada panel | https://unsplash.com/photos/2VJ6TCI8uJo |

`team-collab.webp` shows people who are not Strata Staff employees. Replace it with a photo of the Marisol office team before launch. The hero photo can be changed in the admin under **Logo & settings → Hero building photo**.
