import { Div, Image, Typography } from '@apx-ui/ds';

const RATIOS = ['16/9', '4/3', '1/1'] as const;

export default function AspectRatios() {
  return (
    <Div className="grid grid-cols-3 gap-4 items-start">
      {RATIOS.map((ratio) => (
        <Div key={ratio} className="space-y-2">
          <Typography variant="caption" color="fg.muted">{ratio}</Typography>
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=600&fit=crop&q=80"
            alt={`Team photo cropped to ${ratio}`}
            aspectRatio={ratio}
            radius="md"
          />
        </Div>
      ))}
    </Div>
  );
}
