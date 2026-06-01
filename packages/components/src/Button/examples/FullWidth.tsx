import { Button, Div } from '@apx-ui/ds';

export default function FullWidth() {
  return (
    <Div display="flex" className="w-full max-w-md" flexDirection="column" gap="3">
      <Button fullWidth>Full-width primary</Button>
      <Button fullWidth color="neutral">
        Full-width neutral
      </Button>
      <Button fullWidth={{ base: true, md: false }}>Full-width on mobile, auto on md+</Button>
    </Div>
  );
}