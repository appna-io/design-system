/**
 * `templates/_kit` — layer 2 of #5: shared by templates, not general enough for `@apx-ui/ds`.
 *
 * The test for whether something belongs here rather than in the DS is whether it is *about being
 * a template*. A mockup frame is: it exists to show a fictional product on a marketing page, which
 * is not a thing a real application ever needs. A `Section` or a `Reveal` is not — those are
 * general layout and motion, and they belong in the DS (Designer owns that half).
 *
 * The rule for adding to this folder is the same one that produced it: **a second template has to
 * want it**. Everything here was written locally in a real template first and moved when a second
 * one needed it. Nothing here was designed in advance against a hypothetical.
 */
export * from './mockups';
