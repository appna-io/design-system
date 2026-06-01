import { Div, Stepper, Typography } from '@apx-ui/ds';

const STEPS = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
];

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Div key={size} display="flex" flexDirection="column" gap="2">
          <Typography variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {size}
          </Typography>
          <Stepper active={1} steps={STEPS} size={size} />
        </Div>
      ))}
    </Div>
  );
}