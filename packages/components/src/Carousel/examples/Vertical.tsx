import { Carousel, Div, Typography } from '@apx-ui/ds';

const updates = [
  { title: 'Build #482', body: 'All checks passing on main.' },
  { title: 'Build #481', body: 'Renderer prerender succeeded.' },
  { title: 'Build #480', body: 'Bundle size held under budget.' },
  { title: 'Build #479', body: 'Toast a11y test added.' },
];

export default function Vertical() {
  return (
    <Carousel ariaLabel="Recent builds" orientation="vertical" gap={2} showIndicators="never">
      {updates.map((u) => (
        <Carousel.Slide key={u.title}>
          <Div display="flex" flexDirection="column" justifyContent="center" className="h-24 rounded-md border border-border bg-bg-default px-4">
            <Typography variant="bodySmall" weight="semibold">
              {u.title}
            </Typography>
            <Typography variant="caption" color="fg.muted">
              {u.body}
            </Typography>
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}