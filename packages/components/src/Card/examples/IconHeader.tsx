import { Gauge, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { Card } from '@apx-ui/ds';

/**
 * Icon-led "feature card" layout. `<Card.Header icon=…>` renders an opinionated icon tile **above**
 * the title row — the canonical landing-page pattern. The Card owns tile sizing, color tint, and
 * the icon → title → body vertical rhythm, so consumers don't hand-roll a wrapper `<div>`.
 *
 * `iconColor` accepts any palette role (`primary` / `success` / `warning` / `info` / `danger` /
 * `secondary` / `neutral`); `iconVariant` switches between the default `soft` tile, a `solid` tile
 * (saturated bg + contrast fg), and an `outline` tile (transparent + bordered).
 */
export default function IconHeader() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card variant="outline" size="lg" hoverable>
        <Card.Header
          icon={<Sparkles size={22} />}
          iconColor="primary"
          title="Composable everything"
        />
        <Card.Body className="text-sm text-fg-muted">
          Every surface is built from the same primitives — swap, theme, or extend any piece
          without forking the library.
        </Card.Body>
      </Card>

      <Card variant="outline" size="lg" hoverable>
        <Card.Header
          icon={<Gauge size={22} />}
          iconColor="success"
          title="Fast where it matters"
        />
        <Card.Body className="text-sm text-fg-muted">
          Virtualized lists, debounced queries, and tree-shakeable bundles. Performance budgets
          baked into every component.
        </Card.Body>
      </Card>

      <Card variant="outline" size="lg" hoverable>
        <Card.Header
          icon={<ShieldCheck size={22} />}
          iconColor="info"
          title="Accessible by default"
        />
        <Card.Body className="text-sm text-fg-muted">
          Keyboard, screen-reader, RTL, reduced-motion — covered upfront. Ship to global teams
          without an a11y backlog.
        </Card.Body>
      </Card>

      <Card variant="outline" size="lg" hoverable>
        <Card.Header
          icon={<Workflow size={22} />}
          iconColor="warning"
          iconVariant="solid"
          title="Themeable, not skinned"
        />
        <Card.Body className="text-sm text-fg-muted">
          Tokens flow from a single source of truth. Light/dark + four identity variants, all with
          the same component contract.
        </Card.Body>
      </Card>
    </div>
  );
}