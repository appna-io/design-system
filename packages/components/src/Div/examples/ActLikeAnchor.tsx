import { Div } from 'apx-ds';

export default function ActLikeAnchor() {
  return (
    <Div display="flex" flexDirection="column" gap={8} alignItems="flex-start">
      <Div
        actLike="a"
        href="https://example.com"
        target="_blank"
        rel="noreferrer"
        px={12}
        py={6}
        bg="bg.paper"
        fg="primary.main"
        radius="md"
        textDecoration="none"
        border="1px solid"
        borderColor="border.subtle"
        onHover="bg-primary-50 border-primary-300"
        onFocusVisible="ring-2 ring-primary-500 ring-offset-2 outline-none"
      >
        Open documentation &rarr;
      </Div>
      <Div fontSize={12} fg="fg.muted">
        Rendered as a real <code>&lt;a&gt;</code> with <code>href</code>, <code>target</code>, and{' '}
        <code>rel</code> passed through natively.
      </Div>
    </Div>
  );
}
