import { Button, Tooltip } from '@apx-ui/ds';

export default function LongContent() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tooltip
        content="This tooltip wraps over multiple lines once the content exceeds the size's max-width clamp. The clamp is `max-w-sm` for the default `md` size."
        size="md"
      >
        <Button variant="soft">Hover for long hint</Button>
      </Tooltip>
      <Tooltip
        content="Short tip"
        size="md"
      >
        <Button variant="soft">Short hint</Button>
      </Tooltip>
    </div>
  );
}
