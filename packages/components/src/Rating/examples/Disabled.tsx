import { Rating } from 'apx-ds';

export default function Disabled() {
  return <Rating defaultValue={3} disabled ariaLabel="Disabled rating" />;
}
