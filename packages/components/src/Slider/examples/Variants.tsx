import { Div, Slider, Typography } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="w-72">
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          solid (default)
        </Typography>
        <Slider aria-label="Solid" variant="solid" defaultValue={60} />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          outline
        </Typography>
        <Slider aria-label="Outline" variant="outline" defaultValue={60} />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          soft
        </Typography>
        <Slider aria-label="Soft" variant="soft" defaultValue={60} />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          minimal
        </Typography>
        <Slider aria-label="Minimal" variant="minimal" defaultValue={60} />
      </Div>
    </Div>
  );
}