import { describe, expect, it } from 'vitest';

import {
  generateFlowAr,
  generateFlowEn,
  generateFlowEs,
  generateFlowFa,
  generateFlowFr,
} from './portalNamespaces/generateFlow';
import {
  libraryAr,
  libraryEn,
  libraryEs,
  libraryFa,
  libraryFr,
} from './portalNamespaces/library';
import { assertKeyParity } from './portalNamespaces/parity';
import {
  reportChromeAr,
  reportChromeEn,
  reportChromeEs,
  reportChromeFa,
  reportChromeFr,
} from './portalNamespaces/reportChrome';
import {
  shareAr,
  shareEn,
  shareEs,
  shareFa,
  shareFr,
} from './portalNamespaces/share';
import {
  uploadAr,
  uploadEn,
  uploadEs,
  uploadFa,
  uploadFr,
} from './portalNamespaces/upload';
import { createI18nInstance, textDirection } from './index';

describe('portal namespace key parity', () => {
  it('share keys match across en es fr ar fa', () => {
    assertKeyParity(
      {
        en: shareEn,
        es: shareEs,
        fr: shareFr,
        ar: shareAr,
        fa: shareFa,
      },
      'share',
    );
  });

  it('reportChrome keys match across locales', () => {
    assertKeyParity(
      {
        en: reportChromeEn,
        es: reportChromeEs,
        fr: reportChromeFr,
        ar: reportChromeAr,
        fa: reportChromeFa,
      },
      'reportChrome',
    );
  });

  it('generateFlow keys match across locales', () => {
    assertKeyParity(
      {
        en: generateFlowEn,
        es: generateFlowEs,
        fr: generateFlowFr,
        ar: generateFlowAr,
        fa: generateFlowFa,
      },
      'generateFlow',
    );
  });

  it('upload keys match across locales', () => {
    assertKeyParity(
      {
        en: uploadEn,
        es: uploadEs,
        fr: uploadFr,
        ar: uploadAr,
        fa: uploadFa,
      },
      'upload',
    );
  });

  it('library keys match across locales', () => {
    assertKeyParity(
      {
        en: libraryEn,
        es: libraryEs,
        fr: libraryFr,
        ar: libraryAr,
        fa: libraryFa,
      },
      'library',
    );
  });
});

describe('share namespace runtime', () => {
  it('resolves Persian share strings and rtl', async () => {
    const instance = createI18nInstance(true);
    await instance.changeLanguage('fa');
    expect(instance.t('share:title')).toBe('اشتراک‌گذاری گزارش');
    expect(instance.t('share:sharingOff')).toContain('اشتراک خاموش');
    expect(textDirection('fa')).toBe('rtl');
  });

  it('resolves Spanish share strings', async () => {
    const instance = createI18nInstance(true);
    await instance.changeLanguage('es');
    expect(instance.t('share:copyLink')).toBe('Copiar enlace');
  });
});
