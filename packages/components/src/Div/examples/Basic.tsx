import { Div } from 'apx-ds';

export default function Basic() {
  return (
    <Div p={4} bg="primary.50" radius="md" fg="primary.contrast">
      A token-aware `&lt;Div /&gt;` with padding, background, radius, and foreground color all
      driven by shorthand props that resolve into a single inline style.
    </Div>
  );
}
