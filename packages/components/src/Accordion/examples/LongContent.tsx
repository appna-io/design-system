import { Accordion } from '@apx-ui/ds';

export default function LongContent() {
  return (
    <Accordion type="single" defaultValue="prose">
      <Accordion.Item value="prose">
        <Accordion.Trigger>Long-form prose, lists, and inline code</Accordion.Trigger>
        <Accordion.Content>
          <div className="space-y-3">
            <p>
              Accordion content can be any React node. The CSS-grid auto-height trick measures
              nothing — content can include images that load asynchronously, lists that paginate,
              or async data that streams in, and the transition handles it for free.
            </p>
            <ul className="ms-5 list-disc space-y-1 text-sm">
              <li>Bullet one — pure markup, no measurement.</li>
              <li>Bullet two — also fine when nested.</li>
              <li>
                Bullet three — even with <code>inline code</code> mixed in.
              </li>
            </ul>
            <p className="text-sm text-fg-muted">
              Try resizing the viewport while this is open — the content reflows and the wrapper
              follows along without re-mounting the body.
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="code">
        <Accordion.Trigger>Code blocks inside content</Accordion.Trigger>
        <Accordion.Content>
          <pre className="overflow-x-auto rounded-md bg-bg-subtle p-3 text-xs">
            <code>{`const items = ['a', 'b', 'c'];\nitems.forEach((x) => console.log(x));`}</code>
          </pre>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
