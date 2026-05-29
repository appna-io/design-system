import { Avatar } from 'apx-ds';

export default function Fallback() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Ada Lovelace" />
        <span className="text-xs text-fg-muted">initials</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar
          src="https://example.invalid/missing.png"
          name="Bren Park"
          delayMs={0}
        />
        <span className="text-xs text-fg-muted">broken image → initials</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar />
        <span className="text-xs text-fg-muted">no name → icon</span>
      </div>
    </div>
  );
}
