'use client';

import { forwardRef, useControllableState, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

import { Popover } from '../Popover';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';

import {
  detectFormat,
  formatColor,
  hsvaToRgba,
  parseColor,
  rgbaEquals,
  rgbaToHsva,
  type HSVA,
} from './_shared/color';
import { AlphaSlider } from './AlphaSlider';
import { ColorPickerContext, type ColorPickerContextValue } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';
import type { ColorPickerProps } from './ColorPicker.types';
import { ContrastChip } from './ContrastChip';
import { EyedropperButton } from './EyedropperButton';
import { HexInput } from './HexInput';
import { HslInput } from './HslInput';
import { HueSlider } from './HueSlider';
import { PresetsGrid } from './PresetsGrid';
import { RgbInput } from './RgbInput';
import { SaturationSquare } from './SaturationSquare';
import { useColorPickerTranslations } from './i18n/useColorPickerTranslations';

type Tab = 'hex' | 'rgb' | 'hsl';

/**
 * The full `<ColorPicker />`. Saturation/lightness square + hue slider + alpha (optional) +
 * tabbed hex/rgb/hsl input + presets + eyedropper + contrast chip — all packed inside a
 * `<Popover>` whose trigger morphs through three shapes (`swatch` / `button` / `input`).
 *
 * **State model.** The component is controlled-or-uncontrolled at the *string* layer (matches
 * what consumers persist). Internally it keeps an HSVA tuple as the live working state — that
 * tuple drives every subpart through `ColorPickerContext`. When external `value` updates land,
 * we re-parse to HSVA *only if* the parsed RGBA differs from the current HSVA-derived RGBA;
 * this prevents an infinite controlled loop (e.g. consumer mirrors our emitted string verbatim
 * → we'd re-parse → tiny float drift → re-emit, etc.).
 *
 * **Format preservation.** `format="auto"` (default) detects the incoming format and re-emits
 * in the same shape. Forcing `format="hex" | "rgb" | "hsl"` overrides that and always emits in
 * the named format.
 */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  props,
  ref,
) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    format: formatProp = 'auto',
    enableAlpha = false,
    presets,
    presetsOnly = false,
    closeOnSelect = false,
    enableEyedropper = false,
    enableContrastCheck = false,
    contrastAgainst = '#FFFFFF',
    triggerVariant = 'swatch',
    size = 'md',
    label,
    description,
    helperText,
    error,
    hideLabel = false,
    required = false,
    disabled = false,
    readOnly = false,
    name,
    id: providedId,
    ariaLabel,
    translations,
    className,
    style,
    sx,
    ...rest
  } = props;

  // Stable initial value — `defaultValue ?? '#000000'` exactly once. Without this fallback an
  // uncontrolled picker with no initial value would crash `parseColor` on first render (well,
  // `parseColor` defaults to black, but the round-trip would lose intent).
  const initialValue = useMemo(
    () => valueProp ?? defaultValue ?? '#000000',
    // We only want this on first mount; intentionally not depending on props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [committedValue, setCommittedValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: initialValue,
    onChange: undefined,
  });
  const externalValue = committedValue ?? initialValue;

  const [hsva, setHsva] = useState<HSVA>(() => rgbaToHsva(parseColor(initialValue)));

  // Sync external value → internal HSVA, but only when the parsed RGBA actually differs.
  // Comparing in RGBA (the stable I/O representation) avoids the HSVA-loses-hue-on-greyscale
  // edge case from causing spurious updates.
  useEffect(() => {
    const parsed = parseColor(externalValue);
    const current = hsvaToRgba(hsva);
    if (!rgbaEquals(parsed, current)) {
      const nextHsva = rgbaToHsva(parsed);
      if (nextHsva.s === 0) nextHsva.h = hsva.h;
      if (!enableAlpha) nextHsva.a = 1;
      setHsva(nextHsva);
    }
    // We deliberately depend on externalValue + enableAlpha only; depending on `hsva` would
    // re-run on every internal commit and risk an oscillation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue, enableAlpha]);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(() => {
    const detected = detectFormat(externalValue);
    if (detected === 'rgb' || detected === 'hsl' || detected === 'hex') return detected;
    return 'hex';
  });

  const t = useColorPickerTranslations(translations);

  const invalid = error != null && error !== false && error !== '';
  const a11y = useFormFieldA11y({ id: providedId, invalid, required, componentName: 'ColorPicker' });
  const reactId = useId();

  const labelId = label != null ? `${a11y.id}-label` : undefined;
  const descriptionId = description != null ? `${a11y.id}-desc` : undefined;
  const helperId = helperText != null && !invalid ? `${a11y.id}-helper` : undefined;
  const errorId = invalid ? `${a11y.id}-error` : undefined;
  const describedByIds =
    [descriptionId, helperId, errorId].filter((s): s is string => Boolean(s)).join(' ') ||
    undefined;

  const resolveFormat = useCallback(
    (sourceText: string): 'hex' | 'rgb' | 'hsl' => {
      if (formatProp === 'auto') return detectFormat(sourceText);
      return formatProp as 'hex' | 'rgb' | 'hsl';
    },
    [formatProp],
  );

  const commitHsva = useCallback<ColorPickerContextValue['commitHsva']>(
    (next, source) => {
      const normalized: HSVA = enableAlpha ? next : { ...next, a: 1 };
      setHsva(normalized);
      const rgba = hsvaToRgba(normalized);
      const fmt = resolveFormat(externalValue);
      const out = formatColor(rgba, fmt);
      setCommittedValue(out);
      onChange?.(out, { format: fmt, source });
    },
    [enableAlpha, resolveFormat, externalValue, setCommittedValue, onChange],
  );

  const ctxValue = useMemo<ColorPickerContextValue>(
    () => ({
      hsva,
      enableAlpha,
      size,
      t,
      commitHsva,
      disabled,
      readOnly,
    }),
    [hsva, enableAlpha, size, t, commitHsva, disabled, readOnly],
  );

  // ── Recipe class strings ───────────────────────────────────────────────────────────────────
  const { className: wrapperCls, style: wrapperStyle } = useThemedClasses({
    recipe: colorPickerRecipes.wrapper,
    componentName: 'ColorPicker',
    slot: 'wrapper',
    props: { className, sx, style },
  });
  const { className: labelCls } = useThemedClasses({
    recipe: colorPickerRecipes.label,
    componentName: 'ColorPicker',
    slot: 'label',
    props: { hidden: hideLabel, disabled },
  });
  const { className: descriptionCls } = useThemedClasses({
    recipe: colorPickerRecipes.description,
    componentName: 'ColorPicker',
    slot: 'description',
    props: {},
  });
  const { className: helperCls } = useThemedClasses({
    recipe: colorPickerRecipes.helperText,
    componentName: 'ColorPicker',
    slot: 'helperText',
    props: { invalid },
  });
  const { className: triggerCls } = useThemedClasses({
    recipe: colorPickerRecipes.trigger,
    componentName: 'ColorPicker',
    slot: 'trigger',
    props: { triggerVariant, size, disabled: disabled || readOnly },
  });
  const { className: chipCls } = useThemedClasses({
    recipe: colorPickerRecipes.triggerSwatch,
    componentName: 'ColorPicker',
    slot: 'triggerSwatch',
    props: { size },
  });
  const { className: tabsCls } = useThemedClasses({
    recipe: colorPickerRecipes.formatTabs,
    componentName: 'ColorPicker',
    slot: 'formatTabs',
    props: {},
  });
  const { className: tabCls } = useThemedClasses({
    recipe: colorPickerRecipes.formatTab,
    componentName: 'ColorPicker',
    slot: 'formatTab',
    props: {},
  });
  const { className: pickerSurfaceCls } = useThemedClasses({
    recipe: colorPickerRecipes.pickerSurface,
    componentName: 'ColorPicker',
    slot: 'pickerSurface',
    props: {},
  });
  const { className: inputRowCls } = useThemedClasses({
    recipe: colorPickerRecipes.inputRow,
    componentName: 'ColorPicker',
    slot: 'inputRow',
    props: {},
  });

  const chipStyle: CSSProperties = {
    backgroundImage: `linear-gradient(${externalValue}, ${externalValue}), repeating-conic-gradient(var(--sds-palette-background-subtle) 0% 25%, transparent 0% 50%)`,
    backgroundSize: '100% 100%, 8px 8px',
  };

  const handlePresetPick = useCallback(
    (value: string) => {
      if (closeOnSelect) setOpen(false);
      // commitHsva already fired inside PresetsGrid; we just close the popover here.
      void value;
    },
    [closeOnSelect],
  );

  const triggerInteractive = !disabled && !readOnly;

  const triggerContent = useMemo(() => {
    if (triggerVariant === 'swatch') {
      return <span aria-hidden="true" className={chipCls} style={chipStyle} />;
    }
    if (triggerVariant === 'button') {
      return (
        <>
          <span aria-hidden="true" className={chipCls} style={chipStyle} />
          <span className="text-sm">{t.trigger}</span>
        </>
      );
    }
    // triggerVariant === 'input' — render the swatch + the value as plain text. (The picker
    // itself opens on click; for a fully-editable inline text variant, consumers use
    // `<ColorInput>` standalone.)
    return (
      <>
        <span aria-hidden="true" className={chipCls} style={chipStyle} />
        <span className="font-mono text-xs">{externalValue}</span>
      </>
    );
  }, [triggerVariant, chipCls, chipStyle, t.trigger, externalValue]);

  const triggerAccessibleName = useMemo(() => {
    if (label != null && labelId) return undefined;
    if (ariaLabel) return ariaLabel;
    if (triggerVariant === 'swatch') return `${t.trigger}: ${externalValue}`;
    return undefined;
  }, [label, labelId, ariaLabel, triggerVariant, t.trigger, externalValue]);

  return (
    <ColorPickerContext.Provider value={ctxValue}>
      <div ref={ref} className={wrapperCls} style={wrapperStyle ?? undefined} {...rest}>
        {label != null ? (
          <label htmlFor={a11y.id} id={labelId} className={labelCls}>
            {label}
            {required ? (
              <span aria-hidden="true" className="ms-0.5 text-danger">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        {description != null ? (
          <span id={descriptionId} className={descriptionCls}>
            {description}
          </span>
        ) : null}

        <Popover open={open} onOpenChange={(next) => triggerInteractive && setOpen(next)}>
          <Popover.Trigger asChild>
            <button
              type="button"
              id={a11y.id}
              className={triggerCls}
              disabled={disabled}
              aria-disabled={disabled || readOnly || undefined}
              aria-readonly={readOnly || undefined}
              aria-invalid={a11y['aria-invalid']}
              aria-required={a11y['aria-required']}
              aria-describedby={describedByIds}
              aria-label={triggerAccessibleName}
              aria-labelledby={label != null ? labelId : undefined}
              data-invalid={invalid || undefined}
              data-trigger-variant={triggerVariant}
            >
              {triggerContent}
            </button>
          </Popover.Trigger>

          <Popover.Content
            className={pickerSurfaceCls}
            placement="bottom-start"
            variant="solid"
          >
            {presetsOnly ? (
              presets && presets.length > 0 ? (
                <PresetsGrid presets={presets} onPick={handlePresetPick} />
              ) : null
            ) : (
              <div className="flex flex-col gap-3">
                <SaturationSquare />
                <HueSlider />
                {enableAlpha ? <AlphaSlider /> : null}

                <div className={tabsCls} role="tablist" aria-label="Format">
                  {(['hex', 'rgb', 'hsl'] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={tab === id}
                      data-active={tab === id || undefined}
                      className={tabCls}
                      onClick={() => setTab(id)}
                    >
                      {id === 'hex' ? t.formatHex : id === 'rgb' ? t.formatRgb : t.formatHsl}
                    </button>
                  ))}
                </div>

                <div className={inputRowCls} role="tabpanel">
                  {tab === 'hex' ? <HexInput /> : null}
                  {tab === 'rgb' ? <RgbInput /> : null}
                  {tab === 'hsl' ? <HslInput /> : null}
                </div>

                {presets && presets.length > 0 ? (
                  <PresetsGrid presets={presets} onPick={handlePresetPick} />
                ) : null}

                <div className="flex items-center justify-between gap-2">
                  {enableContrastCheck ? <ContrastChip against={contrastAgainst} /> : <span />}
                  {enableEyedropper ? <EyedropperButton /> : null}
                </div>
              </div>
            )}
          </Popover.Content>
        </Popover>

        {name ? (
          <input
            id={`${reactId}-hidden`}
            type="hidden"
            name={name}
            value={externalValue}
            {...(required ? { required: true } : {})}
          />
        ) : null}

        {invalid ? (
          <span id={errorId} className={helperCls} role="alert">
            {error}
          </span>
        ) : helperText != null ? (
          <span id={helperId} className={helperCls}>
            {helperText}
          </span>
        ) : null}
      </div>
    </ColorPickerContext.Provider>
  );
}, 'ColorPicker');
