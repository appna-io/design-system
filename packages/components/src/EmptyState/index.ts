/**
 * EmptyState — canonical compound assembly. Same `Object.assign` pattern used by Card / Accordion
 * / Drawer / Modal / Menu / Tabs. The root component (`EmptyStateRoot`) is exposed publicly as
 * `EmptyState`, and the five subparts hang off the namespace as `EmptyState.Icon`,
 * `EmptyState.Illustration`, `EmptyState.Title`, `EmptyState.Description`, `EmptyState.Actions`.
 *
 * The root file (`./EmptyState.tsx`) also stamps each subpart with an internal `SUBPART_TAG`
 * symbol so the root can detect compound-children mode and skip the prop-driven shortcut
 * rendering. That stamping must happen at module load (this file is the load point) — so all
 * subparts MUST be imported before the `Object.assign` runs. Don't refactor to lazy imports.
 */
import { EmptyStateRoot } from './EmptyState';
import { EmptyStateActions } from './EmptyStateActions';
import { EmptyStateDescription } from './EmptyStateDescription';
import { EmptyStateIcon } from './EmptyStateIcon';
import { EmptyStateIllustration } from './EmptyStateIllustration';
import { EmptyStateTitle } from './EmptyStateTitle';

export const EmptyState = Object.assign(EmptyStateRoot, {
  Icon: EmptyStateIcon,
  Illustration: EmptyStateIllustration,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});

export type {
  EmptyStateActionShortcut,
  EmptyStateActionsProps,
  EmptyStateAlign,
  EmptyStateContextValue,
  EmptyStateDescriptionProps,
  EmptyStateIconProps,
  EmptyStateIllustrationProps,
  EmptyStateProps,
  EmptyStateSize,
  EmptyStateTitleProps,
  EmptyStateVariant,
} from './EmptyState.types';
