import fs from 'node:fs/promises';
import path from 'node:path';

import { TopBar } from '../../components/chrome/TopBar';
import { Mdx } from '../../components/docs/Mdx';
import { contentDir } from '../../lib/paths';

export const metadata = {
  title: 'Getting started · apx-ds',
};

export default async function GettingStartedPage() {
  const source = await fs.readFile(path.join(contentDir(), 'getting-started.mdx'), 'utf8');
  return (
    <>
      <TopBar title="Getting started" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-10">
        <article className="renderer-prose">
          <Mdx source={source} />
        </article>
      </main>
    </>
  );
}