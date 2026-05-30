import { Avatar, Div, type AvatarShape } from '@apx-ui/ds';

const SHAPES: readonly AvatarShape[] = ['circle', 'rounded', 'square'];

export default function Shapes() {
  return (
    <Div display="flex" alignItems="center" gap="6">
      {SHAPES.map((shape) => (
        <Avatar key={shape} shape={shape} name="Ada Lovelace" color="primary" size="lg" label={shape} />
      ))}
    </Div>
  );
}
