import { Accordion } from 'apx-ds';

export default function Collapsible() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-fg-muted">
          <code>collapsible</code> = <code>true</code> (default) — click an open item to close it.
        </p>
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
      </div>
      <div>
        <p className="mb-2 text-sm text-fg-muted">
          <code>collapsible</code> = <code>false</code> — one item must stay open.
        </p>
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
      </div>
    </div>
  );
}
