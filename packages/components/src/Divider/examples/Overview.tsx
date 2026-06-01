import { Button, Divider, Div, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Divider />` — horizontal rule, vertical toolbar separator,
 * and a labeled "OR" divider side by side.
 */
export default function Overview() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" color="fg.muted">
          Horizontal
        </Typography>
        <Divider />
      </Div>

      <Div display="flex" alignItems="center" gap="3" className="h-10">
        <Typography variant="caption" color="fg.muted">
          Vertical
        </Typography>
        <Button variant="ghost" size="sm">
          Cut
        </Button>
        <Button variant="ghost" size="sm">
          Copy
        </Button>
        <Divider orientation="vertical" />
        <Button variant="ghost" size="sm">
          Paste
        </Button>
      </Div>

      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" color="fg.muted">
          With label
        </Typography>
        <Divider>OR</Divider>
      </Div>
    </Div>
  );
}