import { Accordion } from 'apx-ds';

export default function Variants() {
  return (
    <div className="flex flex-col gap-6">
      {(['solid', 'outline', 'soft', 'ghost'] as const).map((variant) => (
        <div key={variant}>
          <p className="mb-2 text-sm font-medium text-fg-muted">
            variant=<code>{variant}</code>
          </p>
          <Accordion type="single" variant={variant} defaultValue="one">
            <Accordion.Item value="one">
              <Accordion.Trigger>First item</Accordion.Trigger>
              <Accordion.Content>The {variant} variant in action.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="two">
              <Accordion.Trigger>Second item</Accordion.Trigger>
              <Accordion.Content>Stacked under the first.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
