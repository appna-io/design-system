import type { ReactNode } from 'react';
import { Div, Typography } from '@apx-ui/ds';

/**
 * The chrome a mockup sits in — a window, a browser, or a labelled panel.
 *
 * ## What the evidence actually said
 *
 * #5 proposed eight mockups (`BrowserFrame`, `PhoneFrame`, `DashboardMock`, `ChatMock`,
 * `EditorMock`, `ChartMock`, `CalendarMock`, `GalleryMock`) designed against zero templates that
 * needed them. Three real ones now exist — `cadence-ops/HeroPreview`, and `halyard`'s code and
 * terminal blocks — and putting them side by side says something different and much smaller:
 *
 * **The frame is the reusable part. The content is not.**
 *
 * The two Halyard mocks were byte-for-byte identical outside their bodies: same border, same
 * `bg-bg-subtle`, same title bar, same scrollable region with the same three accessibility
 * attributes. `HeroPreview`, meanwhile, has **no frame at all** — it is a `Card` full of dashboard
 * content — and lifting it would have produced a `DashboardMock` that no second template wanted in
 * that exact shape.
 *
 * So the kit ships one frame with three chrome variants, plus the two content mocks that genuinely
 * repeat. A template that needs a *new kind of content* writes it locally and it moves here when a
 * second template wants it — which is the same rule that produced this file.
 *
 * ## Why the scroll region lives here
 *
 * A mockup body scrolls horizontally, and a scrollable region that cannot take focus is
 * unreachable by keyboard — WCAG 2.1.1. Both Halyard mocks got `tabIndex={0}` + `role="region"` +
 * a label right, and a third one written by someone else would have got it wrong. Owning it in the
 * frame means a new mock cannot ship without it.
 *
 * Built from DS primitives and palette roles only — never an image. A screenshot does not re-skin
 * with the theme, which makes the one element that is supposed to *be* the product the one element
 * that ignores the brand.
 */
export type MockFrameChrome = 'window' | 'browser' | 'panel' | 'none';

export interface MockFrameProps {
  children: ReactNode;
  /**
   * Which chrome to draw. `window` is the three traffic-light dots, `browser` adds a URL pill,
   * `panel` is a single accent dot beside a label, `none` is a bare bordered box.
   * @default 'panel'
   */
  chrome?: MockFrameChrome;
  /** Title-bar text. A filename, a shell name, or the page title. */
  label?: string;
  /** `browser` chrome only — the URL shown in the pill. */
  url?: string;
  /**
   * Make the body a focusable, labelled scroll region. Required for anything that can overflow
   * horizontally (code, transcripts, wide tables); pointless for content that reflows.
   * @default false
   */
  scrollable?: boolean;
  /** Accessible name for the scroll region. Falls back to `label`. Ignored unless `scrollable`. */
  ariaLabel?: string;
  /** Extra classes on the body. */
  bodyClassName?: string;
  className?: string;
}

/** The traffic lights. Palette roles, so they grey down correctly in either mode. */
function WindowDots() {
  return (
    <Div aria-hidden className="flex gap-1.5">
      <Div className="h-2.5 w-2.5 rounded-full bg-border-strong" />
      <Div className="h-2.5 w-2.5 rounded-full bg-border-default" />
      <Div className="h-2.5 w-2.5 rounded-full bg-border-subtle" />
    </Div>
  );
}

export function MockFrame({
  children,
  chrome = 'panel',
  label,
  url,
  scrollable = false,
  ariaLabel,
  bodyClassName,
  className,
}: MockFrameProps) {
  const hasBar = chrome !== 'none' && (chrome !== 'panel' || Boolean(label));

  return (
    <Div
      className={`overflow-hidden rounded-md border border-border-subtle bg-bg-subtle ${className ?? ''}`}
    >
      {hasBar && (
        <Div className="flex items-center gap-2 border-b border-border-subtle px-4 py-2.5">
          {chrome === 'panel' ? (
            <Div aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
          ) : (
            <WindowDots />
          )}

          {chrome === 'browser' && url && (
            // The URL pill is decorative chrome, not a link. Rendering it as an `<a>` would put a
            // fake destination in the tab order of every page that shows a mockup.
            <Div
              aria-hidden
              className="ms-2 flex-1 truncate rounded-full bg-bg px-3 py-1 text-center"
            >
              <Typography as="span" variant="caption" color="fg.subtle" fontFamily="display">
                {url}
              </Typography>
            </Div>
          )}

          {label && (
            <Typography
              as="span"
              variant="bodySmall"
              weight={chrome === 'panel' ? 'medium' : undefined}
              color={chrome === 'panel' ? 'fg.muted' : 'fg.subtle'}
              fontFamily="display"
              className={chrome === 'browser' ? 'hidden sm:inline' : 'ms-1'}
            >
              {label}
            </Typography>
          )}
        </Div>
      )}

      <Div
        {...(scrollable
          ? {
              tabIndex: 0,
              role: 'region' as const,
              'aria-label': ariaLabel ?? label ?? 'Scrollable content',
            }
          : {})}
        className={`${scrollable ? 'overflow-x-auto focus-visible:outline-2 focus-visible:outline-[-2px] focus-visible:outline-focus' : ''} ${bodyClassName ?? ''}`}
      >
        {children}
      </Div>
    </Div>
  );
}
