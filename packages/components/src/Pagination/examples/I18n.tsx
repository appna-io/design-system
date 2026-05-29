import { useState } from 'react';
import { I18nProvider } from '@apx-ui/engine';
import {
  Pagination,
  arPaginationTranslations,
  enPaginationTranslations,
  hePaginationTranslations,
} from 'apx-ds';

const BUNDLES = {
  en: { locale: 'en', dir: 'ltr', messages: enPaginationTranslations, label: 'English' },
  he: { locale: 'he', dir: 'rtl', messages: hePaginationTranslations, label: 'עברית' },
  ar: { locale: 'ar', dir: 'rtl', messages: arPaginationTranslations, label: 'العربية' },
} as const;

type LocaleKey = keyof typeof BUNDLES;

export default function I18nExample() {
  const [locale, setLocale] = useState<LocaleKey>('en');
  const [pageIndex, setPageIndex] = useState(3);
  const bundle = BUNDLES[locale];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {(Object.keys(BUNDLES) as LocaleKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setLocale(key)}
            className={[
              'rounded-md px-3 py-1 text-sm transition-colors',
              locale === key
                ? 'bg-primary text-primary-contrast'
                : 'bg-bg-subtle text-fg-default hover:bg-bg-subtle/60',
            ].join(' ')}
          >
            {BUNDLES[key].label}
          </button>
        ))}
      </div>
      <I18nProvider
        locale={bundle.locale}
        messages={{ Pagination: bundle.messages }}
      >
        <div dir={bundle.dir}>
          <Pagination
            totalCount={120}
            pageSize={10}
            pageIndex={pageIndex}
            onChange={(next) => setPageIndex(next.pageIndex)}
            color="primary"
            variant="soft"
          />
        </div>
      </I18nProvider>
    </div>
  );
}
