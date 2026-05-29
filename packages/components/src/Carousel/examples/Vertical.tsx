import { Carousel } from '@apx-ui/ds';

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
          <div className="flex h-24 flex-col justify-center rounded-md border border-border bg-bg-default px-4">
            <div className="text-sm font-semibold">{u.title}</div>
            <div className="text-xs text-fg-muted">{u.body}</div>
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
