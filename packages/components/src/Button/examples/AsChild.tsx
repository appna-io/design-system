import { ExternalLink } from 'lucide-react';
import { Button, Div } from '@apx-ui/ds';

export default function AsChild() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Button asChild rightIcon={<ExternalLink />}>
        <a href="https://example.com" target="_blank" rel="noreferrer">
          Open docs
        </a>
      </Button>
      <Button asChild color="neutral">
        <a href="#top">Back to top</a>
      </Button>
    </Div>
  );
}