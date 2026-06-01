import { Accordion, Typography } from '@apx-ui/ds';

export default function Nested() {
  return (
    <Accordion type="single" defaultValue="outer-one">
      <Accordion.Item value="outer-one">
        <Accordion.Trigger>Outer section one (has a nested accordion)</Accordion.Trigger>
        <Accordion.Content>
          <Typography variant="bodySmall" color="fg.muted" sx={{ mb: 3 }}>
            Each accordion owns its own state — inner clicks do not affect the outer.
          </Typography>
          <Accordion type="multiple" variant="soft" size="sm">
            <Accordion.Item value="inner-a">
              <Accordion.Trigger>Inner A</Accordion.Trigger>
              <Accordion.Content>
                The nested accordion uses <code>type=&quot;multiple&quot;</code> so inner items
                toggle independently of each other.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="inner-b">
              <Accordion.Trigger>Inner B</Accordion.Trigger>
              <Accordion.Content>
                Keyboard nav inside the inner accordion stays scoped to its own siblings.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="inner-c">
              <Accordion.Trigger>Inner C</Accordion.Trigger>
              <Accordion.Content>Open me too — multiple mode allows it.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="outer-two">
        <Accordion.Trigger>Outer section two</Accordion.Trigger>
        <Accordion.Content>Plain content here.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}