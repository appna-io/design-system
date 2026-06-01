import { Div, Slider, Typography } from '@apx-ui/ds';

export default function ValueLabel() {
  return (
    <Div display="flex" flexDirection="column" gap="8" className="w-72 pt-10">
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          showValueLabel = always
        </Typography>
        <Slider aria-label="Always" defaultValue={30} showValueLabel="always" />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          showValueLabel = hover
        </Typography>
        <Slider aria-label="Hover" defaultValue={55} showValueLabel="hover" />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          showValueLabel = focus
        </Typography>
        <Slider aria-label="Focus" defaultValue={80} showValueLabel="focus" />
      </Div>
    </Div>
  );
}