'use client';

import { useState } from 'react';
import { Div } from '@apx-ui/ds';

export default function ActLikeButton() {
  const [count, setCount] = useState(0);

  return (
    <Div display="flex" flexDirection="column" gap={8} alignItems="flex-start">
      <Div
        actLike="button"
        type="button"
        onClick={() => setCount((c) => c + 1)}
        px={12}
        py={6}
        bg="primary.main"
        fg="primary.contrast"
        radius="md"
        cursor="pointer"
        border="none"
        fontSize={14}
        fontWeight={500}
        onHover="bg-primary-700"
        onFocusVisible="ring-2 ring-primary-500 ring-offset-2 outline-none"
        onActive="scale-[0.98]"
      >
        Clicked {count} times
      </Div>
      <Div fontSize={12} fg="fg.muted">
        Rendered as a real <code>&lt;button&gt;</code> element — keyboard activation, focus ring,
        and native click semantics work for free.
      </Div>
    </Div>
  );
}