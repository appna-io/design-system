import { Avatar, Div } from '@apx-ui/ds';

export default function AsChild() {
  return (
    <Div display="flex" alignItems="center" gap="4">
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
    </Div>
  );
}