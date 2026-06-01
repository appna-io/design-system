import { Div, Textarea } from '@apx-ui/ds';

export default function ResizeModes() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="w-full max-w-md">
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="resize-none">resize=&quot;none&quot; — no manual grip</label>
        <Textarea id="resize-none" resize="none" autoResize={false} rows={3} />
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="resize-vertical">resize=&quot;vertical&quot; (default)</label>
        <Textarea id="resize-vertical" resize="vertical" autoResize={false} rows={3} />
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="resize-horizontal">resize=&quot;horizontal&quot;</label>
        <Textarea id="resize-horizontal" resize="horizontal" autoResize={false} rows={3} />
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="resize-both">resize=&quot;both&quot;</label>
        <Textarea id="resize-both" resize="both" autoResize={false} rows={3} />
      </Div>
    </Div>
  );
}