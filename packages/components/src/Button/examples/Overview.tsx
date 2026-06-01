import { ArrowRight, Mail } from 'lucide-react';
import { Button, Div, Typography } from '@apx-ui/ds';

/**
 * Quick review of Button's variant × color × icon axes — primary CTA, secondary outline,
 * ghost utility, and a labeled icon action.
 */
export default function Overview() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="6">
      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Button color="primary">Save changes</Button>
        <Typography variant="caption" color="fg.muted">
          Solid primary
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Button variant="outline" color="secondary">
          Cancel
        </Button>
        <Typography variant="caption" color="fg.muted">
          Outline secondary
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Button variant="ghost" color="neutral" size="sm">
          Show more
        </Button>
        <Typography variant="caption" color="fg.muted">
          Ghost utility
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="2">
        <Button leftIcon={<Mail />} rightIcon={<ArrowRight />}>
          Email report
        </Button>
        <Typography variant="caption" color="fg.muted">
          With icons
        </Typography>
      </Div>
    </Div>
  );
}