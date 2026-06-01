/**
 * Canonical **compound component** pattern for apx-ds. The root component is wrapped with
 * `Object.assign` so subparts are reachable via dot syntax (`<Card.Header>`, `<Card.Body>`, …).
 *
 * Every future compound primitive (Tabs.List/Trigger/Panel, Accordion.Item/Header/Content,
 * Modal.Trigger/Content/Close, Drawer.Trigger/Content/Close, …) **copies this file's shape**:
 *
 *   1. Import the root component (`CardRoot` here) under a private name.
 *   2. Import every subpart under its kebab-cased file name.
 *   3. `Object.assign` the root with the subparts under the dot-name they should expose.
 *   4. Re-export the merged value as the canonical public name (`Card`).
 *   5. Re-export every prop/type so consumers can type their props without reaching into the folder.
 *
 * Don't deviate without a written reason — keeping all compound components on one assembly
 * shape makes the renderer's per-subpart docs, the test-suite imports, and the bundler's
 * tree-shaking story uniform.
 */
import { CardRoot } from './Card';
import { CardBody } from './CardBody';
import { CardDivider } from './CardDivider';
import { CardFooter } from './CardFooter';
import { CardHeader } from './CardHeader';
import { CardMedia } from './CardMedia';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Media: CardMedia,
  Divider: CardDivider,
});

export type {
  CardBodyProps,
  CardColor,
  CardDividerProps,
  CardFooterAlign,
  CardFooterProps,
  CardHeaderIconColor,
  CardHeaderIconVariant,
  CardHeaderProps,
  CardMediaProps,
  CardOrientation,
  CardProps,
  CardShape,
  CardSize,
  CardVariant,
} from './Card.types';