import { Div, Slider, Typography } from '@apx-ui/ds';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="5" className="w-72">
      {COLORS.map((color) => (
        <Div key={color}>
          <Typography variant="caption" color="fg.muted" className="mb-2">
            {color}
          </Typography>
          <Slider aria-label={color} color={color} defaultValue={60} />
        </Div>
      ))}
    </Div>
  );
}