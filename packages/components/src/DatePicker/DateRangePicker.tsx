'use client';

import { forwardRef } from '@apx-ui/engine';
import { Calendar as CalendarIcon, X as ClearIcon } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import { Calendar } from '../Calendar/Calendar';
import {
  datePickerApplyBarRecipe,
  datePickerPopoverContentRecipe,
  datePickerPresetItemRecipe,
  datePickerPresetListRecipe,
  datePickerTriggerRecipe,
} from '../Calendar/Calendar.recipe';
import { formatIsoDate } from '../Calendar/helpers/dateMath';
import { formatDate, parseDateFormat } from '../Calendar/helpers/parseDateFormat';
import { useSlotClass as useCalendarSlotClass } from '../Calendar/helpers/useSlotClass';
import type { DateRange } from '../Calendar/Calendar.types';
import { Input } from '../Input/Input';
import { Popover } from '../Popover';

import type { DateRangePickerPreset, DateRangePickerProps } from './DatePicker.types';

const DEFAULT_FORMAT = 'MM/dd/yyyy';
const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * Two-month range picker. Same composition as `<DatePicker>` (Input + Popover + Calendar)
 * but with `mode="range"`, two visible months, two synchronised typed inputs, and an
 * optional preset rail.
 *
 * The picker commits both endpoints in a single `onChange` call — consumers receive
 * `{ start, end }` (both `null` while the popover is open mid-selection). The hidden form
 * field carries `YYYY-MM-DD,YYYY-MM-DD` so range filters can hydrate from URL or POST.
 */
function DateRangePickerImpl(
  props: DateRangePickerProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    format = DEFAULT_FORMAT,
    parse,
    placeholder,
    inputProps,
    showTriggerIcon = true,
    clearable = true,
    min,
    max,
    isDateDisabled,
    locale = 'en-US',
    weekStartsOn,
    numberOfMonths = 2,
    showWeekNumbers,
    presets,
    separator = '–',
    variant = 'solid',
    size = 'md',
    color = 'primary',
    name,
    required,
    disabled,
    invalid,
    readOnly,
    translations,
    open: openProp,
    defaultOpen,
    onOpenChange,
    closeOnSelect = true,
    'aria-label': ariaLabel,
    className,
    style,
    footer,
  } = props;

  /* ---------------- value (controlled/uncontrolled) ----------------------- */

  const isValueControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<DateRange>(defaultValue ?? EMPTY_RANGE);
  const value = isValueControlled ? valueProp ?? EMPTY_RANGE : internalValue;

  const setValue = useCallback(
    (next: DateRange) => {
      if (!isValueControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isValueControlled, onChange],
  );

  /* ---------------- open (controlled/uncontrolled) ------------------------ */

  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen ?? false);
  const open = isOpenControlled ? openProp ?? false : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  /* ---------------- typed mirrors ---------------------------------------- */

  const [startText, setStartText] = useState<string>(() =>
    value.start ? formatDate(value.start, format, locale) : '',
  );
  const [endText, setEndText] = useState<string>(() =>
    value.end ? formatDate(value.end, format, locale) : '',
  );

  useEffect(() => {
    setStartText(value.start ? formatDate(value.start, format, locale) : '');
    setEndText(value.end ? formatDate(value.end, format, locale) : '');
  }, [value, format, locale]);

  const parseInput = useCallback(
    (raw: string): Date | null => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      if (parse) return parse(trimmed);
      return parseDateFormat(trimmed, format, locale);
    },
    [parse, format, locale],
  );

  const commitTypedRange = useCallback(() => {
    const parsedStart = parseInput(startText);
    const parsedEnd = parseInput(endText);
    if (parsedStart && parsedEnd) {
      if (parsedStart.getTime() > parsedEnd.getTime()) {
        setValue({ start: parsedEnd, end: parsedStart });
      } else {
        setValue({ start: parsedStart, end: parsedEnd });
      }
    } else if (parsedStart || parsedEnd) {
      // Revert — never hold a half-parsed range.
      setStartText(value.start ? formatDate(value.start, format, locale) : '');
      setEndText(value.end ? formatDate(value.end, format, locale) : '');
    }
  }, [parseInput, startText, endText, setValue, value, format, locale]);

  /* ---------------- calendar selection ----------------------------------- */

  const handleCalendarChange = useCallback(
    (next: unknown) => {
      if (next && typeof next === 'object' && 'start' in next && 'end' in next) {
        const range = next as DateRange;
        setValue(range);
        if (closeOnSelect && range.start && range.end) {
          setOpen(false);
        }
      }
    },
    [setValue, closeOnSelect, setOpen],
  );

  const handlePresetClick = useCallback(
    (preset: DateRangePickerPreset) => {
      const next = preset.range();
      setValue(next);
      if (closeOnSelect) setOpen(false);
    },
    [setValue, closeOnSelect, setOpen],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setValue(EMPTY_RANGE);
    },
    [setValue],
  );

  /* ---------------- accessibility ---------------------------------------- */

  const reactId = useId();
  const dialogId = `daterangepicker-${reactId}`;

  /* ---------------- recipes ---------------------------------------------- */

  const triggerClass = useCalendarSlotClass('datepicker.trigger', datePickerTriggerRecipe, {
    size,
  });
  const popoverContentClass = useCalendarSlotClass(
    'datepicker.popover',
    datePickerPopoverContentRecipe,
    { withPresets: Boolean(presets && presets.length > 0) },
  );
  const presetListClass = useCalendarSlotClass(
    'datepicker.presetList',
    datePickerPresetListRecipe,
    {},
  );
  const presetItemClass = useCalendarSlotClass(
    'datepicker.presetItem',
    datePickerPresetItemRecipe,
    {},
  );
  const applyBarClass = useCalendarSlotClass(
    'datepicker.applyBar',
    datePickerApplyBarRecipe,
    {},
  );

  const hasValue = Boolean(value.start || value.end);
  const triggerIcon = useMemo(() => {
    if (hasValue && clearable) {
      return (
        <button
          type="button"
          onClick={handleClear}
          className={triggerClass}
          aria-label="Clear"
          tabIndex={-1}
        >
          <ClearIcon aria-hidden size={iconSize(size)} />
        </button>
      );
    }
    if (showTriggerIcon) {
      return (
        <Popover.Trigger asChild>
          <button
            type="button"
            className={triggerClass}
            aria-label="Open calendar"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={dialogId}
            disabled={disabled || readOnly}
            tabIndex={-1}
          >
            <CalendarIcon aria-hidden size={iconSize(size)} />
          </button>
        </Popover.Trigger>
      );
    }
    return null;
  }, [
    hasValue,
    clearable,
    showTriggerIcon,
    triggerClass,
    handleClear,
    size,
    open,
    dialogId,
    disabled,
    readOnly,
  ]);

  return (
    <div
      ref={ref}
      className={['inline-flex flex-col gap-1', className].filter(Boolean).join(' ')}
      style={style}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <div className="inline-flex items-center gap-1">
            <Input
              {...(inputProps ?? {})}
              value={startText}
              onChange={(e) => setStartText(e.target.value)}
              onBlur={commitTypedRange}
              placeholder={placeholder ?? format}
              size={size}
              variant={mapVariantToInput(variant)}
              color={color}
              disabled={disabled}
              invalid={invalid}
              readOnly={readOnly}
              required={required}
              aria-label={ariaLabel ?? 'Start date'}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={dialogId}
            />
            <span aria-hidden className="text-fg-muted px-1">
              {separator}
            </span>
            <Input
              {...(inputProps ?? {})}
              value={endText}
              onChange={(e) => setEndText(e.target.value)}
              onBlur={commitTypedRange}
              placeholder={placeholder ?? format}
              size={size}
              variant={mapVariantToInput(variant)}
              color={color}
              disabled={disabled}
              invalid={invalid}
              readOnly={readOnly}
              aria-label="End date"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={dialogId}
              rightIcon={triggerIcon}
            />
          </div>
        </Popover.Trigger>

        <Popover.Content
          id={dialogId}
          role="dialog"
          aria-label={ariaLabel ?? 'Calendar'}
          className={popoverContentClass + ' p-0'}
        >
          {presets && presets.length > 0 ? (
            <div className={presetListClass} role="list">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  role="listitem"
                  className={presetItemClass}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col">
            <Calendar
              mode="range"
              value={value}
              onChange={handleCalendarChange}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              locale={locale}
              weekStartsOn={weekStartsOn}
              numberOfMonths={numberOfMonths}
              showWeekNumbers={showWeekNumbers}
              translations={translations}
              variant={variant}
              size={size}
              color={color}
            />
            {footer ? <div className={applyBarClass}>{footer}</div> : null}
          </div>
        </Popover.Content>
      </Popover>

      {name ? (
        <input
          type="hidden"
          name={name}
          value={
            value.start && value.end
              ? `${formatIsoDate(value.start)},${formatIsoDate(value.end)}`
              : ''
          }
          required={required}
        />
      ) : null}
    </div>
  );
}

DateRangePickerImpl.displayName = 'DateRangePicker';

function iconSize(size: 'sm' | 'md' | 'lg'): number {
  if (size === 'sm') return 14;
  if (size === 'lg') return 18;
  return 16;
}

function mapVariantToInput(
  variant: 'solid' | 'outline' | 'soft' | 'minimal',
): 'solid' | 'outline' | 'ghost' {
  if (variant === 'minimal') return 'ghost';
  if (variant === 'soft') return 'outline';
  return variant;
}

export const DateRangePicker = forwardRef(DateRangePickerImpl);
