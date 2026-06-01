import { Button, Div } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Button disabled>Disabled primary</Button>
      <Button disabled color="danger">
        Disabled danger
      </Button>
      <Button disabled loading>
        Disabled + loading
      </Button>
    </Div>
  );
}