import { Sparkles } from 'lucide-react';

import { Button, Toaster, toast } from 'apx-ds';

export default function CustomIcon() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
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
      </div>
      <Toaster />
    </div>
  );
}
