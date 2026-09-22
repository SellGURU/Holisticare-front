import { describe, expect, it } from 'vitest';
import { wrapHeroTitleWithBrand } from './reportDisclaimerSanitize';

describe('wrapHeroTitleWithBrand', () => {
  it('moves Health Optimization into the branded Protocol span', () => {
    const html = `
      <header>
        <h1 class="text-4xl text-white drop-shadow-lg">Health Optimization <br><span class="clinic-hero-protocol text-transparent bg-clip-text bg-gradient-to-r from-brand-teal via-teal-200 to-white">Protocol</span></h1>
      </header>
    `;
    const out = wrapHeroTitleWithBrand(html);
    expect(out).toContain(
      'clinic-hero-protocol text-transparent bg-clip-text bg-gradient-to-r from-brand-teal via-teal-200 to-white">Health Optimization',
    );
    expect(out).toContain('text-transparent');
    expect(out).not.toMatch(/<h1[^>]*>Health Optimization <br><span/);
  });
});
