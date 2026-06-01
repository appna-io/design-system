// Ambient declaration for the example registry's static imports.
//
// The generated `src/generated/exampleRegistry.ts` references files under
// `@apx-ui/components/src/<Component>/examples/<Example>.tsx`. Those files live in a
// sibling workspace package and are resolved at runtime by the webpack alias in
// `next.config.mjs`. We deliberately do NOT add a tsconfig `paths` entry for them — that
// would make `tsc` typecheck the example sources from the renderer too, even though they
// are already typechecked as part of `@apx-ui/components`. This wildcard module tells
// TypeScript: "any such import resolves to a default React component, treat the file as
// opaque." It keeps the renderer's typecheck fast and scoped to renderer-owned code.
declare module '@apx-ui/components/src/*' {
  import type { ComponentType } from 'react';
  const Component: ComponentType;
  export default Component;
}