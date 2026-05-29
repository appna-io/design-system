import { Textarea } from 'apx-ds';

export default function AutoResize() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="auto-grow">Grows with content (min 2, max 8 rows)</label>
        <Textarea
          id="auto-grow"
          autoResize
          minRows={2}
          maxRows={8}
          defaultValue={'Try typing here.\nThe textarea will grow as you add lines…'}
        />
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-fg">
        <label htmlFor="auto-off">Fixed (autoResize off)</label>
        <Textarea
          id="auto-off"
          autoResize={false}
          rows={3}
          defaultValue="This one stays at exactly 3 rows."
        />
      </div>
    </div>
  );
}
