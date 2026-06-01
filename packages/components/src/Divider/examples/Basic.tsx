import { Divider, Div, Typography } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div className="space-y-4">
      <Typography variant="bodySmall">Above the rule.</Typography>
      <Divider />
      <Typography variant="bodySmall">Below the rule.</Typography>
    </Div>
  );
}