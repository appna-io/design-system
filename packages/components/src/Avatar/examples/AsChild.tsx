import { Avatar } from '@apx-ui/ds';

export default function AsChild() {
  return (
    <div className="flex items-center gap-4">
      <Avatar asChild name="Ada Lovelace">
        <a href="#profile" className="no-underline">
          {''}
        </a>
      </Avatar>
      <Avatar asChild ring="primary" name="Bren Park">
        <a href="#profile" className="no-underline">
          {''}
        </a>
      </Avatar>
    </div>
  );
}
