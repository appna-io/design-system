import path from 'node:path';

/**
 * Resolve the workspace root from the renderer app's CWD (which is `apps/renderer` during
 * `next dev` / `next build`). All file-system reads in the renderer go through this helper so
 * the paths stay portable across machines and CI.
 */
export function workspaceRoot(): string {
  return path.resolve(process.cwd(), '../..');
}

export function componentsSrcDir(): string {
  return path.join(workspaceRoot(), 'packages/components/src');
}

export function contentDir(): string {
  return path.join(process.cwd(), 'src/content');
}
