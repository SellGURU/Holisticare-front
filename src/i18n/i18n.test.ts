import i18next from 'i18next';
import ICU from 'i18next-icu';
import { describe, expect, it, vi } from 'vitest';

import {
  PSEUDO_LOCALE,
  createI18nInstance,
  enabledUiLocales,
  resolveEnabledUiLocale,
  uiLocaleFallbackChain,
} from './index';
import { createMissingKeyTelemetry } from './missingKeyTelemetry';

describe('UI locale foundation', () => {
  it('falls back by canonical locale, language, then English', () => {
    expect(uiLocaleFallbackChain('fr_CA')).toEqual(['fr-CA', 'fr', 'en']);
    expect(uiLocaleFallbackChain('zh-Hans-CN')).toEqual([
      'zh-Hans-CN',
      'zh-Hans',
      'zh',
      'en',
    ]);
    expect(resolveEnabledUiLocale('fr-CA', ['en', 'fr'])).toBe('fr');
    expect(resolveEnabledUiLocale('not_a_locale', ['en', 'fr'])).toBe('en');
  });

  it('excludes the pseudo locale from production', () => {
    expect(enabledUiLocales(true)).toEqual(['en']);
    expect(enabledUiLocales(false)).toContain(PSEUDO_LOCALE);
  });

  it('never renders a missing raw key', () => {
    const instance = createI18nInstance(true);
    expect(instance.t('not.a.real.key')).toBe('Content unavailable');
  });

  it('supports all Arabic ICU plural categories in an isolated fixture', async () => {
    const instance = i18next.createInstance();
    await instance.use(ICU).init({
      lng: 'ar',
      resources: {
        ar: {
          translation: {
            count:
              '{count, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}',
          },
        },
      },
    });

    expect(instance.t('count', { count: 0 })).toBe('zero');
    expect(instance.t('count', { count: 1 })).toBe('one');
    expect(instance.t('count', { count: 2 })).toBe('two');
    expect(instance.t('count', { count: 3 })).toBe('few');
    expect(instance.t('count', { count: 11 })).toBe('many');
    expect(instance.t('count', { count: 100 })).toBe('other');
  });
});

describe('missing-key telemetry', () => {
  it('deduplicates keys, bounds rate, and emits no raw key or values', () => {
    const reporter = vi.fn();
    const telemetry = createMissingKeyTelemetry(reporter, () => 1);

    telemetry('en', 'common', 'secret.key');
    telemetry('en', 'common', 'secret.key');
    for (let index = 0; index < 20; index += 1) {
      telemetry('en', 'common', `missing.${index}`);
    }

    expect(reporter).toHaveBeenCalledTimes(10);
    expect(reporter.mock.calls[0]?.[0]).toEqual({
      locale: 'en',
      namespace: 'common',
      keyHash: expect.any(String),
    });
    expect(JSON.stringify(reporter.mock.calls)).not.toContain('secret.key');
  });
});
