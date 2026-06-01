import { Accordion, Div, Typography } from '@apx-ui/ds';
import type { AccordionColor } from '@apx-ui/ds';

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
    <Div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {COLORS.map((color) => (
        <Div key={color}>
          <Typography variant="bodySmall" weight="medium" color="fg.muted" sx={{ mb: 2 }}>
            color=<code>{color}</code> (variant=<code>soft</code>)
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}