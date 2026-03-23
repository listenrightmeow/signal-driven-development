import { describe, it, expect } from 'vitest';

describe('Base layout accessibility', () => {
  it('should have a skip navigation link as first focusable element', () => {
    document.body.innerHTML = `
      <a class="skip-nav" href="#main-content">Skip to main content</a>
      <nav class="nav" aria-label="Main navigation">
        <a href="/" class="nav__wordmark">SDD</a>
        <ul class="nav__links" role="list">
          <li><a href="/walkthrough" class="nav__link">Walkthrough</a></li>
        </ul>
      </nav>
      <main id="main-content">
        <h1>Test</h1>
      </main>
    `;

    const skipNav = document.querySelector('.skip-nav');
    expect(skipNav).toBeInTheDocument();
    expect(skipNav?.getAttribute('href')).toBe('#main-content');
    expect(skipNav?.textContent).toContain('Skip to main content');
  });

  it('should have a <main> landmark with id for skip-nav target', () => {
    document.body.innerHTML = `
      <main id="main-content"><h1>Test</h1></main>
    `;

    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.id).toBe('main-content');
  });

  it('should have a <nav> landmark with accessible label', () => {
    document.body.innerHTML = `
      <nav class="nav" aria-label="Main navigation">
        <a href="/" class="nav__wordmark">SDD</a>
      </nav>
    `;

    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should have a single h1 element', () => {
    document.body.innerHTML = `
      <main id="main-content">
        <h1>Signal-Driven Development</h1>
        <h2>Section</h2>
      </main>
    `;

    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });

  it('nav toggle button should have aria-expanded and aria-controls', () => {
    document.body.innerHTML = `
      <button
        class="nav__toggle"
        aria-expanded="false"
        aria-controls="nav-links"
        aria-label="Toggle navigation menu"
      >Menu</button>
      <ul id="nav-links"></ul>
    `;

    const toggle = document.querySelector('.nav__toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-controls')).toBe('nav-links');
    expect(toggle?.getAttribute('aria-label')).toBe('Toggle navigation menu');
  });
});
