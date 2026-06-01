import { Button, Div, Toolbar, Typography } from '@apx-ui/ds';

export default function Floating() {
  return (
    <Div className="rounded-lg border border-border bg-bg-paper p-6">
      <Typography variant="bodySmall" color="fg.muted" className="mb-6">
        Selected 3 items. A contextual action bar appears for batch operations — a common
        pattern in admin tables and file managers.
      </Typography>

      <Toolbar variant="floating" aria-label="Selection actions">
        <Button variant="ghost" aria-label="Edit">
          ✏️
        </Button>
        <Button variant="ghost" aria-label="Duplicate">
          📋
        </Button>
        <Toolbar.Separator />
        <Button variant="ghost" color="danger" aria-label="Delete">
          🗑
        </Button>
        <Toolbar.Spacer />
        <Button variant="solid" color="primary">
          Apply to selection
        </Button>
      </Toolbar>
    </Div>
  );
}