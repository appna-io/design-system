import { Accordion, Div, Typography } from '@apx-ui/ds';

export default function LongContent() {
  return (
    <Accordion type="single" defaultValue="prose">
      <Accordion.Item value="prose">
        <Accordion.Trigger>Long-form prose, lists, and inline code</Accordion.Trigger>
        <Accordion.Content>
          <Div className="space-y-3">
            <Typography variant="body">
              Accordion content can be any React node. The CSS-grid auto-height trick measures
              nothing — content can include images that load asynchronously, lists that paginate,
              or async data that streams in, and the transition handles it for free.
            </Typography>
            <Div as="ul" className="ms-5 list-disc space-y-1 text-sm">
              <Typography as="li">Bullet one — pure markup, no measurement.</Typography>
              <Typography as="li">Bullet two — also fine when nested.</Typography>
              <Typography as="li">
                Bullet three — even with <code>inline code</code> mixed in.
              </Typography>
            </Div>
            <Typography variant="bodySmall" color="fg.muted">
              Try resizing the viewport while this is open — the content reflows and the wrapper
              follows along without re-mounting the body.
            </Typography>
          </Div>
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