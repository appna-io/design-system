import { Accordion, Div, Typography } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      {(['solid', 'outline', 'soft', 'ghost'] as const).map((variant) => (
        <Div key={variant}>
          <Typography variant="bodySmall" weight="medium" color="fg.muted" sx={{ mb: 2 }}>
            variant=<code>{variant}</code>
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}