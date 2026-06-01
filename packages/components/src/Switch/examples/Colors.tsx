import { Div, Switch, type SwitchColor } from '@apx-ui/ds';

const COLORS: readonly SwitchColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      {COLORS.map((color) => (
        <Switch key={color} color={color} defaultChecked>
          {color.charAt(0).toUpperCase() + color.slice(1)}
        </Switch>
      ))}
    </Div>
  );
}