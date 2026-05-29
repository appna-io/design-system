import fs from 'node:fs/promises';
import path from 'node:path';

import { TopBar } from '../../components/chrome/TopBar';
import { Mdx } from '../../components/docs/Mdx';
import { contentDir } from '../../lib/paths';

export const metadata = {
  title: 'Theming · apx-ds',
};

export default async function ThemingPage() {
  const source = await fs.readFile(path.join(contentDir(), 'theming.mdx'), 'utf8');
  return (
    <>
      <TopBar title="Theming" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-10">
        <article className="renderer-prose">
          <Mdx source={source} />
        </article>
      </main>
    </>
  );
}
