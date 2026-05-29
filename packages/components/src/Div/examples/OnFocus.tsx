import { Div } from '@apx-ui/ds';

export default function OnFocus() {
  return (
    <Div display="flex" flexDirection="column" gap={8} alignItems="flex-start">
      <Div
        actLike="button"
        type="button"
        px={12}
        py={6}
        bg="bg.paper"
        fg="fg.default"
        radius="md"
        border="1px solid"
        borderColor="border.subtle"
        cursor="pointer"
        onFocusVisible="ring-2 ring-primary-500 ring-offset-2 outline-none"
      >
        Tab to me — keyboard focus ring only
      </Div>
      <Div fontSize={12} fg="fg.muted">
        <code>onFocusVisible</code> applies the ring on keyboard focus only — clicking with the
        mouse doesn&apos;t trigger it (a11y-correct default).
      </Div>
    </Div>
  );
}
