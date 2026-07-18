import { Div, Image, Typography } from '@apx-ui/ds';

export default function RadiusAndShadow() {
  return (
    <Div className="grid grid-cols-3 gap-6 items-start">
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">radius=md</Typography>
        <Image
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop&q=80"
          alt="Specialist portrait"
          aspectRatio="1/1"
          radius="md"
        />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">radius=xl · shadow=lg</Typography>
        <Image
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop&q=80"
          alt="Specialist portrait, elevated"
          aspectRatio="1/1"
          radius="xl"
          shadow="lg"
        />
      </Div>
      <Div className="space-y-2">
        <Typography variant="caption" color="fg.muted">radius=full</Typography>
        <Image
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop&q=80"
          alt="Specialist portrait, circular"
          aspectRatio="1/1"
          radius="full"
        />
      </Div>
    </Div>
  );
}
