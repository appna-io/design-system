import { Sparkles } from 'lucide-react';

import { Button, Div, Toaster, toast } from '@apx-ui/ds';

export default function CustomIcon() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Div display="flex" flexWrap="wrap" gap="2">
        <Button
          onClick={() =>
            toast('Magic happened', {
              icon: <Sparkles />,
            })
          }
        >
          Custom icon
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success('Saved without icon', {
              icon: false,
            })
          }
        >
          No icon
        </Button>
      </Div>
      <Toaster />
    </Div>
  );
}