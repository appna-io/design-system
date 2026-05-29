import { Avatar, type AvatarShape } from 'apx-ds';

const SHAPES: readonly AvatarShape[] = ['circle', 'rounded', 'square'];

export default function Shapes() {
  return (
    <div className="flex items-center gap-6">
      {SHAPES.map((shape) => (
        <div key={shape} className="flex flex-col items-center gap-2">
          <Avatar shape={shape} name="Ada Lovelace" color="primary" size="lg" />
          <span className="text-xs text-fg-muted">{shape}</span>
        </div>
      ))}
    </div>
  );
}
