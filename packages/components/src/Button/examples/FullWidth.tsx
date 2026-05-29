import { Button } from '@apx-ui/ds';

export default function FullWidth() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Button fullWidth>Full-width primary</Button>
      <Button fullWidth color="neutral">
        Full-width neutral
      </Button>
      <Button fullWidth={{ base: true, md: false }}>Full-width on mobile, auto on md+</Button>
    </div>
  );
}
