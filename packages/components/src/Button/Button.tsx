'use client';

import { forwardRef, Slot, Slottable, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { motion } from 'motion/react';
import { type ReactNode } from 'react';

import { spinnerMotion } from './Button.motion';
import { buttonRecipe } from './Button.recipe';
import type { ButtonProps } from './Button.types';

function Spinner({ label }: { label?: string | undefined }) {
  return (
    <motion.span
      {...spinnerMotion}
      role="status"
      aria-label={label ?? 'Loading'}
      className="inline-block size-[1em] shrink-0 rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
    />
  );
}

/**
 * The reference `<Button />`. Touches every system in the DS — variants, sizes, colors,
 * polymorphism (`asChild`), icons, loading, disabled, theming, responsive props, animation, and
 * RTL — and is the canonical template every future component is copy-paste-modified from.
 *
 * Press feedback is CSS-only (`active:scale-[0.97]`) so consumers don't pay the Motion bundle
 * cost for the most common interaction. The loading spinner _does_ use Motion because a
 * keyframe-less spin is genuinely cheaper to express that way.
 *
 * @example
 *   <Button color="primary" leftIcon={<Mail />}>Send</Button>
 *   <Button asChild><a href="/docs">Docs</a></Button>
 *   <Button size={{ base: 'sm', md: 'lg' }} fullWidth={{ base: true, md: false }}>Submit</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant,
    size,
    color,
    fullWidth,
    iconOnly: iconOnlyProp,
    leftIcon,
    rightIcon,
    loading = false,
    loadingText,
    disabled = false,
    asChild = false,
    type,
    className,
    style,
    sx,
    children,
    'aria-label': ariaLabel,
    onClick,
    ...rest
  } = props;

  const hasChildren = children != null && children !== false && children !== '';
  const iconOnly = iconOnlyProp ?? (!hasChildren && Boolean(leftIcon ?? rightIcon));

  warn(
    !iconOnly || Boolean(ariaLabel),
    '<Button iconOnly> requires an `aria-label` so assistive tech has a name to announce.',
    'BUTTON_ICON_ONLY_LABEL',
  );

  const isInert = disabled || loading;

  const { className: themedClass, style: themedStyle } = useThemedClasses({
    recipe: buttonRecipe,
    componentName: 'Button',
    props: { variant, size, color, fullWidth, iconOnly, className, sx, style },
  });

  const labelNode: ReactNode = loading && loadingText ? loadingText : children;
  const showLeft = !loading && leftIcon;
  const showRight = !loading && rightIcon;

  const styleProp = themedStyle ?? undefined;

  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={themedClass}
        style={styleProp}
        data-disabled={isInert ? 'true' : undefined}
        aria-disabled={isInert || undefined}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        onClick={isInert ? preventInert : onClick}
        {...rest}
      >
        {loading ? <Spinner label={loadingText} /> : showLeft ? leftIcon : null}
        <Slottable>{labelNode}</Slottable>
        {showRight ? rightIcon : null}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={themedClass}
      style={styleProp}
      disabled={isInert}
      data-disabled={isInert ? 'true' : undefined}
      aria-disabled={isInert || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={isInert ? preventInert : onClick}
      {...rest}
    >
      <ButtonContent
        leftIcon={showLeft ? leftIcon : null}
        rightIcon={showRight ? rightIcon : null}
        spinner={loading ? <Spinner label={loadingText} /> : null}
      >
        {labelNode}
      </ButtonContent>
    </button>
  );
}, 'Button');

interface ButtonContentProps {
  leftIcon: ReactNode;
  rightIcon: ReactNode;
  spinner: ReactNode;
  children: ReactNode;
}

function ButtonContent({ leftIcon, rightIcon, spinner, children }: ButtonContentProps) {
  return (
    <>
      {spinner ?? leftIcon}
      {children}
      {rightIcon}
    </>
  );
}

function preventInert(event: React.MouseEvent<HTMLElement>): void {
  event.preventDefault();
  event.stopPropagation();
}