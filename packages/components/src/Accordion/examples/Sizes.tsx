import { Accordion } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <div className="flex flex-col gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <p className="mb-2 text-sm font-medium text-fg-muted">
            size=<code>{size}</code>
          </p>
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
        </div>
      ))}
    </div>
  );
}
