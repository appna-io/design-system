import { Accordion } from 'apx-ds';

export default function Basic() {
  return (
    <Accordion type="single" defaultValue="benefits">
      <Accordion.Item value="benefits">
        <Accordion.Trigger>What does apx-ds give me?</Accordion.Trigger>
        <Accordion.Content>
          A token-driven design system with theming, an a11y-first component layer, and
          shared infrastructure for variants, motion, and overrides.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="bundles">
        <Accordion.Trigger>How is the bundle size?</Accordion.Trigger>
        <Accordion.Content>
          Each primitive lands under a strict budget and tree-shakes per component. The
          umbrella package re-exports everything but only what you import ships.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="theming">
        <Accordion.Trigger>Can I rebrand it?</Accordion.Trigger>
        <Accordion.Content>
          Yes. Define a theme once, override component defaults + per-slot classNames in one
          place, and every consumer of the DS picks up the look.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
