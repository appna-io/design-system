import { Div, Spinner, Typography } from '@apx-ui/ds';

export default function EmptyState() {
  return (
    <Div
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="4"
      className="rounded-xl border border-dashed border-border px-4 py-12"
    >
      <Spinner variant="ring" size={64} color="primary" label="Loading reports" labelPlacement="bottom" />
      <Typography variant="bodySmall" color="fg.muted">
        Spinner sized at 64px works as the EmptyState graphic for a loading slot.
      </Typography>
    </Div>
  );
}