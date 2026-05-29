import { Accordion } from 'apx-ds';
import type { AccordionColor } from 'apx-ds';

const COLORS: readonly AccordionColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {COLORS.map((color) => (
        <div key={color}>
          <p className="mb-2 text-sm font-medium text-fg-muted">
            color=<code>{color}</code> (variant=<code>soft</code>)
          </p>
          <Accordion type="single" variant="soft" color={color} defaultValue="one">
            <Accordion.Item value="one">
              <Accordion.Trigger>Tinted with {color}</Accordion.Trigger>
              <Accordion.Content>The soft variant picks up the color-subtle background.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="two">
              <Accordion.Trigger>Second row</Accordion.Trigger>
              <Accordion.Content>Same tint, separated by the variant spacing.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
