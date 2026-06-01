import { Div, Slider, Typography } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="w-72">
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          sm
        </Typography>
        <Slider aria-label="Small" size="sm" defaultValue={40} />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          md (default)
        </Typography>
        <Slider aria-label="Medium" size="md" defaultValue={60} />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          lg
        </Typography>
        <Slider aria-label="Large" size="lg" defaultValue={80} />
      </Div>
    </Div>
  );
}