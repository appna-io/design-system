import { Accordion, Div, Typography } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Div key={size}>
          <Typography variant="bodySmall" weight="medium" color="fg.muted" sx={{ mb: 2 }}>
            size=<code>{size}</code>
          </Typography>
          <Accordion type="single" size={size} defaultValue="one">
            <Accordion.Item value="one">
              <Accordion.Trigger>{`Size ${size} — trigger`}</Accordion.Trigger>
              <Accordion.Content>{`Body content rendered at size ${size}.`}</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="two">
              <Accordion.Trigger>Another row</Accordion.Trigger>
              <Accordion.Content>Same size, same rhythm.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Div>
      ))}
    </Div>
  );
}