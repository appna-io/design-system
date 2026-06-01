import { Checkbox, Div, Typography } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Checkbox invalid description="This field is required." required>
        Accept the terms of service
      </Checkbox>
      <Typography variant="caption" color="danger" className="ms-6">
        You must accept before continuing.
      </Typography>
    </Div>
  );
}