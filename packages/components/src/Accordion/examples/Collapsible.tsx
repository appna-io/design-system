import { Accordion, Div, Typography } from '@apx-ui/ds';

export default function Collapsible() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mb: 2 }}>
          <code>collapsible</code> = <code>true</code> (default) — click an open item to close it.
        </Typography>
        <Accordion type="single" defaultValue="one" collapsible>
          <Accordion.Item value="one">
            <Accordion.Trigger>I close when re-clicked</Accordion.Trigger>
            <Accordion.Content>
              Try it: click the trigger again and this section collapses.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="two">
            <Accordion.Trigger>So do I</Accordion.Trigger>
            <Accordion.Content>Each item independently respects collapsible.</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </Div>
      <Div>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mb: 2 }}>
          <code>collapsible</code> = <code>false</code> — one item must stay open.
        </Typography>
        <Accordion type="single" defaultValue="one" collapsible={false}>
          <Accordion.Item value="one">
            <Accordion.Trigger>I stay open on re-click</Accordion.Trigger>
            <Accordion.Content>Clicking me again does nothing — by design.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="two">
            <Accordion.Trigger>Click me to swap</Accordion.Trigger>
            <Accordion.Content>Switching items still works — only re-closing is blocked.</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </Div>
    </Div>
  );
}