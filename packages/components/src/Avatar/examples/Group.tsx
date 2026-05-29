import { Avatar, AvatarGroup } from '@apx-ui/ds';

export default function Group() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          max=4 with overflow
        </span>
        <AvatarGroup max={4}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Bren Park" />
          <Avatar name="Cleo Singh" />
          <Avatar name="Dax Lin" />
          <Avatar name="Eli Tan" />
          <Avatar name="Fae Romero" />
          <Avatar name="Gigi Khan" />
        </AvatarGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          Soft variant, larger spacing, lg size
        </span>
        <AvatarGroup max={3} variant="soft" size="lg" spacing={-3}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Bren Park" />
          <Avatar name="Cleo Singh" />
          <Avatar name="Dax Lin" />
          <Avatar name="Eli Tan" />
        </AvatarGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          No overlap (positive spacing)
        </span>
        <AvatarGroup spacing={2}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Bren Park" />
          <Avatar name="Cleo Singh" />
        </AvatarGroup>
      </div>
    </div>
  );
}
