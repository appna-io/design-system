import { Div, Textarea } from '@apx-ui/ds';

export default function AutoResize() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="w-full max-w-md">
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="auto-grow">Grows with content (min 2, max 8 rows)</label>
        <Textarea
          id="auto-grow"
          autoResize
          minRows={2}
          maxRows={8}
          defaultValue={'Try typing here.\nThe textarea will grow as you add lines…'}
        />
      </Div>
      <Div display="flex" flexDirection="column" gap="1.5" className="text-sm text-fg">
        <label htmlFor="auto-off">Fixed (autoResize off)</label>
        <Textarea
          id="auto-off"
          autoResize={false}
          rows={3}
          defaultValue="This one stays at exactly 3 rows."
        />
      </Div>
    </Div>
  );
}