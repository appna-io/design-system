import { Button, Toolbar } from '@apx-ui/ds';

export default function ApplyTooltips() {
  return (
    <Toolbar
      variant="bordered"
      applyTooltips
      aria-label="Icon toolbar"
    >
      <Button variant="ghost" aria-label="Bold">
        <strong>B</strong>
      </Button>
      <Button variant="ghost" aria-label="Italic">
        <em>I</em>
      </Button>
      <Button variant="ghost" aria-label="Underline">
        <u>U</u>
      </Button>
      <Toolbar.Separator />
      <Button variant="ghost" aria-label="Insert link">
        🔗
      </Button>
      <Button variant="ghost" aria-label="Insert image">
        🖼
      </Button>
      <Button variant="ghost" aria-label="Insert code block">
        {'</>'}
      </Button>
    </Toolbar>
  );
}
