import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createMessageBundle, I18nProvider } from '../../src/i18n';

const stepperBundle = createMessageBundle('stepper', {
  en: {
    previous: 'Previous',
    next: 'Next',
    stepOf: 'Step {current} of {total}',
  },
  he: {
    previous: 'הקודם',
    next: 'הבא',
    stepOf: 'שלב {current} מתוך {total}',
  },
  ar: {
    previous: 'السابق',
    next: 'التالي',
    stepOf: 'الخطوة {current} من {total}',
  },
});

describe('createMessageBundle — basic resolution', () => {
  it('returns English defaults when no provider is present', () => {
    let captured: string | undefined;
    function R() {
      const t = stepperBundle.useT();
      captured = t('previous');
      return null;
    }
    render(<R />);
    expect(captured).toBe('Previous');
  });

  it('uses the locale-specific bundle when the provider locale matches', () => {
    let captured: string | undefined;
    function R() {
      const t = stepperBundle.useT();
      captured = t('previous');
      return null;
    }
    render(
      <I18nProvider locale="he">
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('הקודם');
  });

  it('falls back to the language subtag when the full locale is not in the bundle', () => {
    let captured: string | undefined;
    function R() {
      const t = stepperBundle.useT();
      captured = t('previous');
      return null;
    }
    render(
      <I18nProvider locale="he-IL">
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('הקודם');
  });

  it('falls back to en when neither full locale nor subtag is present', () => {
    let captured: string | undefined;
    function R() {
      const t = stepperBundle.useT();
      captured = t('previous');
      return null;
    }
    render(
      <I18nProvider locale="fr-FR">
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('Previous');
  });

  it('interpolates parameters', () => {
    let captured: string | undefined;
    function R() {
      const t = stepperBundle.useT();
      captured = t('stepOf', { current: 2, total: 5 });
      return null;
    }
    render(
      <I18nProvider locale="en">
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('Step 2 of 5');
  });
});

describe('createMessageBundle — provider override precedence', () => {
  it('provider messages override the bundle entry', () => {
    let captured: string | undefined;
    function R() {
      const t = stepperBundle.useT();
      captured = t('previous');
      return null;
    }
    render(
      <I18nProvider locale="en" messages={{ stepper: { previous: 'OVERRIDE' } }}>
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('OVERRIDE');
  });

  it('provider messages support interpolation', () => {
    let captured: string | undefined;
    function R() {
      const t = stepperBundle.useT();
      captured = t('stepOf', { current: 9, total: 10 });
      return null;
    }
    render(
      <I18nProvider
        locale="en"
        messages={{ stepper: { stepOf: '{current}/{total}' } }}
      >
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('9/10');
  });
});

describe('createMessageBundle — useBundle', () => {
  it('returns the full bundle for the active locale', () => {
    let captured: Record<string, string> | undefined;
    function R() {
      captured = stepperBundle.useBundle();
      return null;
    }
    render(
      <I18nProvider locale="ar">
        <R />
      </I18nProvider>,
    );
    expect(captured).toEqual({
      previous: 'السابق',
      next: 'التالي',
      stepOf: 'الخطوة {current} من {total}',
    });
  });

  it('shallow-merges per-instance overrides on top', () => {
    let captured: Record<string, string> | undefined;
    function R() {
      captured = stepperBundle.useBundle({ next: 'Forward' });
      return null;
    }
    render(
      <I18nProvider locale="en">
        <R />
      </I18nProvider>,
    );
    expect(captured!.next).toBe('Forward');
    // un-overridden keys still come from the bundle.
    expect(captured!.previous).toBe('Previous');
  });
});

describe('createMessageBundle — missing keys', () => {
  it('returns the key under silentMissing=true', () => {
    const bundle = createMessageBundle('thing', {
      en: { real: 'Real' } as Record<'real' | 'fake', string>,
    });
    let captured: string | undefined;
    function R() {
      const t = bundle.useT();
      captured = t('fake');
      return null;
    }
    render(
      <I18nProvider locale="en" silentMissing>
        <R />
      </I18nProvider>,
    );
    expect(captured).toBe('fake');
  });

  it('throws under silentMissing=false', () => {
    const bundle = createMessageBundle('thing', {
      en: { real: 'Real' } as Record<'real' | 'fake', string>,
    });
    function R() {
      const t = bundle.useT();
      t('fake');
      return null;
    }
    expect(() =>
      render(
        <I18nProvider locale="en" silentMissing={false}>
          <R />
        </I18nProvider>,
      ),
    ).toThrow(/Missing translation key/);
  });
});
