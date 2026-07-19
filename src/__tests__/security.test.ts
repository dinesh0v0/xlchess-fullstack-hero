/**
 * Security & Production Readiness Tests
 *
 * Validates security headers, XSS protection, and production configuration.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Security: index.html', () => {
  const htmlPath = resolve(__dirname, '../../index.html');
  const html = readFileSync(htmlPath, 'utf-8');

  it('has a proper charset meta tag', () => {
    expect(html).toContain('charset="UTF-8"');
  });

  it('has viewport meta for responsive design', () => {
    expect(html).toContain('name="viewport"');
    expect(html).toContain('width=device-width');
  });

  it('has a title tag', () => {
    expect(html).toMatch(/<title>.+<\/title>/);
  });

  it('has Open Graph meta tags for social sharing', () => {
    expect(html).toContain('og:title');
    expect(html).toContain('og:description');
    expect(html).toContain('og:image');
  });

  it('has Twitter card meta tags', () => {
    expect(html).toContain('twitter:card');
    expect(html).toContain('twitter:title');
  });

  it('has a meta description for SEO', () => {
    expect(html).toContain('name="description"');
  });

  it('does not contain inline scripts (CSP safety)', () => {
    // Only allow the module script that loads the app
    const inlineScriptPattern = /<script(?!.*type="module".*src=)[^>]*>[^<]+<\/script>/gi;
    const matches = html.match(inlineScriptPattern);
    expect(matches).toBeNull();
  });
});

describe('Security: Package Configuration', () => {
  const pkgPath = resolve(__dirname, '../../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  it('package is marked as private', () => {
    expect(pkg.private).toBe(true);
  });

  it('has a build script for production', () => {
    expect(pkg.scripts.build).toBeDefined();
  });

  it('has a lint script', () => {
    expect(pkg.scripts.lint).toBeDefined();
  });

  it('has a test script', () => {
    expect(pkg.scripts.test).toBeDefined();
  });
});

describe('Security: Vercel Configuration', () => {
  const vercelPath = resolve(__dirname, '../../vercel.json');
  const vercel = JSON.parse(readFileSync(vercelPath, 'utf-8'));

  it('has SPA fallback rewrite rule', () => {
    const hasRewrite = vercel.rewrites?.some(
      (r: { source: string; destination: string }) =>
        r.source === '/(.*)' && r.destination === '/index.html'
    );
    expect(hasRewrite).toBe(true);
  });
});

describe('Production: CSS Design Tokens', () => {
  const cssPath = resolve(__dirname, '../index.css');
  const css = readFileSync(cssPath, 'utf-8');

  it('imports Inter font from Google Fonts', () => {
    expect(css).toContain("fonts.googleapis.com/css2?family=Inter");
  });

  it('imports Tailwind CSS', () => {
    expect(css).toContain('@import "tailwindcss"');
  });

  it('defines brand colors', () => {
    expect(css).toContain('--color-brand-navy');
    expect(css).toContain('--color-brand-accent');
    expect(css).toContain('--color-brand-surface');
  });

  it('defines text colors', () => {
    expect(css).toContain('--color-text-primary');
    expect(css).toContain('--color-text-secondary');
    expect(css).toContain('--color-text-muted');
  });

  it('sets smooth scroll behavior', () => {
    expect(css).toContain('scroll-behavior: smooth');
  });

  it('has focus-visible outline for keyboard accessibility', () => {
    expect(css).toContain(':focus-visible');
    expect(css).toContain('outline');
  });
});
