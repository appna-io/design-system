import { Div, Image, Typography } from '@apx-ui/ds';

export default function FitContain() {
  return (
    <Div className="grid grid-cols-2 gap-4 items-start">
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">cover (default) — fills, crops</Typography>
        <Image
          src="https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=400&fit=crop&q=80"
          alt="Smart lock on a door, cropped to fill"
          aspectRatio="1/1"
          fit="cover"
          radius="md"
        />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">contain — letterboxes, never crops</Typography>
        <Image
          src="https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=400&fit=crop&q=80"
          alt="Smart lock on a door, letterboxed"
          aspectRatio="1/1"
          fit="contain"
          radius="md"
          className="bg-bg-subtle"
        />
      </Div>
    </Div>
  );
}
