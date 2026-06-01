'use client';

import { useSlotClass } from '../helpers/useSlotClass';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../../Button/Button';
import { Input } from '../../Input/Input';
import {
  Popover,
  type PopoverPlacement,
} from '../../Popover';
import {
  schedulerQuickPopoverFieldRowRecipe,
  schedulerQuickPopoverFooterRecipe,
  schedulerQuickPopoverHeaderRecipe,
  schedulerQuickPopoverRecipe,
  schedulerQuickPopoverTabsRecipe,
} from '../Scheduler.recipe';
import type { NewEventDraft } from '../Scheduler.types';
import { useSchedulerContext } from '../SchedulerContext';
import { formatDayMonth, formatTime } from '../helpers/formatTime';

export interface SchedulerQuickPopoverProps {
  /** Override the default placement preference. */
  placement?: PopoverPlacement;
}

/**
 * Quick-create popover modeled on Google Calendar's "Add title" affordance. Composes the
 * existing `<Popover>` primitive — no new overlay engine.
 *
 * Two modes:
 *  - `mode="create"` — render the create-event form with title + time + tabs + "More
 *    options" / "Save".
 *  - `mode="view"`   — render a read-only summary with "Edit" / "Delete" actions.
 *
 * `<Popover>` is rendered as a virtual-anchored overlay: we don't have a clickable trigger
 * to attach to; instead we anchor the popover to a synthetic element whose
 * `getBoundingClientRect` returns the `anchorRect` from `useScheduler.openQuickPopover`.
 */
export function SchedulerQuickPopover(props: SchedulerQuickPopoverProps) {
  const { placement = 'bottom-start' } = props;
  const ctx = useSchedulerContext();
  const { state, t, locale, timeFormat } = ctx;
  const { popover } = state;

  const [draft, setDraft] = useState<NewEventDraft | null>(popover.draft);

  // Sync incoming popover prop changes (open / draft replacement) into local edit buffer.
  useEffect(() => {
    if (popover.open) setDraft(popover.draft);
  }, [popover.open, popover.draft]);

  const containerClasses = useSlotClass(
    'scheduler.quickPopover',
    schedulerQuickPopoverRecipe,
    {},
  );
  const headerClasses = useSlotClass(
    'scheduler.quickPopover.header',
    schedulerQuickPopoverHeaderRecipe,
    {},
  );
  const tabsClasses = useSlotClass(
    'scheduler.quickPopover.tabs',
    schedulerQuickPopoverTabsRecipe,
    {},
  );
  const fieldRowClasses = useSlotClass(
    'scheduler.quickPopover.fieldRow',
    schedulerQuickPopoverFieldRowRecipe,
    {},
  );
  const footerClasses = useSlotClass(
    'scheduler.quickPopover.footer',
    schedulerQuickPopoverFooterRecipe,
    {},
  );

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (popover.open && popover.mode === 'create') {
      // Slight delay so focus runs after the popover finishes mounting.
      const id = setTimeout(() => titleInputRef.current?.focus(), 20);
      return () => clearTimeout(id);
    }
    return;
  }, [popover.open, popover.mode]);

  const dateLine = useMemo(() => {
    if (!draft) return '';
    return `${formatDayMonth(draft.start, locale)} · ${formatTime(
      draft.start,
      locale,
      timeFormat,
    )} – ${formatTime(draft.end, locale, timeFormat)}`;
  }, [draft, locale, timeFormat]);

  const update = (patch: Partial<NewEventDraft>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  const handleSave = async () => {
    if (!draft) return;
    const payload: NewEventDraft = {
      ...draft,
      title: draft.title?.trim() || t.untitledEvent,
    };
    await ctx.createEvent(payload);
    ctx.closeQuickPopover();
  };

  return (
    <Popover
      open={popover.open}
      onOpenChange={(o) => (o ? null : ctx.closeQuickPopover())}
      modal={false}
    >
      {/* Virtual anchor — we need a real DOM node, but rendered with zero size at the
          anchor rect's centre. This piggybacks on Popover's positioning engine without
          requiring a custom "virtual element" API. */}
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          style={{
            position: 'fixed',
            top: popover.anchorRect?.top ?? 0,
            left: popover.anchorRect?.left ?? 0,
            width: popover.anchorRect?.width ?? 1,
            height: popover.anchorRect?.height ?? 1,
            pointerEvents: 'none',
            opacity: 0,
          }}
        />
      </Popover.Trigger>
      <Popover.Content placement={placement} size="md" variant="solid">
        <div className={containerClasses}>
          <div className={headerClasses}>
            <Input
              ref={titleInputRef}
              value={draft?.title ?? ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder={t.addTitle}
              aria-label={t.addTitle}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              variant="ghost"
              size="sm"
              aria-label={t.cancel}
              onClick={ctx.closeQuickPopover}
            >
              <X size={16} />
            </Button>
          </div>

          {popover.mode === 'create' && (
            <div className={tabsClasses} role="tablist" aria-label="Event type">
              <Button variant="ghost" size="sm" aria-pressed>
                {t.event}
              </Button>
              <Button variant="ghost" size="sm" aria-pressed={false}>
                {t.task}
              </Button>
              <Button variant="ghost" size="sm" aria-pressed={false}>
                {t.appointmentSchedule}
              </Button>
            </div>
          )}

          <div className={fieldRowClasses}>{dateLine}</div>

          {popover.mode === 'create' && (
            <>
              <div className={fieldRowClasses}>{t.doesNotRepeat}</div>
              <div className={fieldRowClasses}>{t.timeZone}</div>
              <div className={fieldRowClasses}>
                <Input
                  placeholder={t.addGuests}
                  aria-label={t.addGuests}
                  variant="ghost"
                  size="md"
                  style={{ flex: 1 }}
                  onChange={(e) =>
                    update(
                      e.target.value
                        ? { attendees: [{ email: e.target.value }] }
                        : { attendees: [] },
                    )
                  }
                />
              </div>
              <div className={fieldRowClasses}>
                <Input
                  placeholder={t.addLocation}
                  aria-label={t.addLocation}
                  variant="ghost"
                  size="md"
                  style={{ flex: 1 }}
                  value={draft?.location ?? ''}
                  onChange={(e) => update({ location: e.target.value })}
                />
              </div>
              <div className={fieldRowClasses}>
                <Input
                  placeholder={t.addDescription}
                  aria-label={t.addDescription}
                  variant="ghost"
                  size="md"
                  style={{ flex: 1 }}
                  value={draft?.description ?? ''}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </div>
            </>
          )}

          <div className={footerClasses}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (draft) ctx.openEventModal(draft, popover.mode === 'view' ? 'edit' : 'create');
                ctx.closeQuickPopover();
              }}
            >
              {t.moreOptions}
            </Button>
            <Button variant="solid" color="primary" size="sm" onClick={handleSave}>
              {t.save}
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}

SchedulerQuickPopover.displayName = 'Scheduler.QuickPopover';