# Smooth Page

[![NPM Version](https://img.shields.io/npm/v/@n2ptune/smooth-page.svg)](https://www.npmjs.com/package/@n2ptune/smooth-page)
[![NPM Downloads](https://img.shields.io/npm/dm/@n2ptune/smooth-page.svg)](https://www.npmjs.com/package/@n2ptune/smooth-page)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@n2ptune/smooth-page.svg)](https://bundlephobia.com/package/@n2ptune/smooth-page)
[![License](https://img.shields.io/npm/l/@n2ptune/smooth-page.svg)](https://github.com/n2ptune/smooth-page/blob/main/LICENSE)
[![Build Status](https://github.com/n2ptune/smooth-page/actions/workflows/ci.yml/badge.svg)](https://github.com/n2ptune/smooth-page/actions)

A lightweight, customizable, and smooth full-page scroll JavaScript/TypeScript library with advanced animation presets. Built with TypeScript for better developer experience and type safety.

## Demo
Check out the live demo: [https://n2ptune.github.io/smooth-page/](https://n2ptune.github.io/smooth-page/)

## Installation

### npm
```bash
npm install @n2ptune/smooth-page
```

### CDN
```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://unpkg.com/@n2ptune/smooth-page/dist/smooth-page.css">

<!-- Script -->
<script src="https://unpkg.com/@n2ptune/smooth-page/dist/smooth-page.umd.js"></script>
```

## Usage

### npm (Bundlers)
If you are using a bundler like Vite, Webpack, or Rollup:

```javascript
import SmoothPage from '@n2ptune/smooth-page';
import '@n2ptune/smooth-page/css';

const sp = new SmoothPage('#smooth-page', {
  animation: 'zoom',
  scrollingSpeed: 700
});
```

### CDN (Browser)
If you are including the library directly via a `<script>` tag:

```html
<link rel="stylesheet" href="https://unpkg.com/@n2ptune/smooth-page/dist/smooth-page.css">

<div id="smooth-page">
  <section class="sp-section"><h1>Section 1</h1></section>
  <section class="sp-section">
    <div class="sp-slides">
      <div class="sp-slide"><h1>Slide 1</h1></div>
      <div class="sp-slide"><h1>Slide 2</h1></div>
    </div>
  </section>
</div>

<script src="https://unpkg.com/@n2ptune/smooth-page/dist/smooth-page.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const sp = new SmoothPage('#smooth-page', {
      animation: 'slide-up',
      navigation: true
    });
  });
</script>
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `scrollingSpeed` | `number` | `700` | Speed of the transition animation in milliseconds. |
| `easing` | `string` | `'cubic-bezier(0.645, 0.045, 0.355, 1)'` | CSS transition timing function. |
| `animation` | `string` | `'default'` | Animation preset: `default`, `zoom`, `slide-up`, `parallax`. |
| `navigation` | `boolean` | `true` | Whether to show the side dot navigation. |
| `arrows` | `boolean` | `true` | Whether to show side arrows for horizontal slides. |
| `onLeave` | `function` | `null` | Callback fired before leaving a section. `(index: number, nextIndex: number) => void` |
| `afterLoad` | `function` | `null` | Callback fired after a section is loaded. `(index: number) => void` |
| `onSlideLeave` | `function` | `null` | Callback fired before leaving a horizontal slide. `(sectionIdx: number, slideIdx: number, nextSlideIdx: number) => void` |
| `afterSlideLoad` | `function` | `null` | Callback fired after a horizontal slide is loaded. `(sectionIdx: number, slideIdx: number) => void` |

## Methods

| Method | Description |
| --- | --- |
| `moveTo(index)` | Scrolls the page to the specified section index. |
| `next()` | Scrolls to the next section. |
| `prev()` | Scrolls to the previous section. |
| `moveToSlide(sectionIndex, slideIndex)` | Scrolls to a specific slide within a section. |
| `moveSlideRight(sectionIndex)` | Scrolls to the next slide in the specified section. |
| `moveSlideLeft(sectionIndex)` | Scrolls to the previous slide in the specified section. |
| `setOptions(options)` | Updates the library options dynamically. |

## Customization

You can easily customize the appearance of navigation dots and arrows using CSS variables. Override them in your global CSS:

```css
:root {
  --sp-nav-color: rgba(0, 0, 0, 0.2);
  --sp-nav-active-color: #ff0000;
  --sp-nav-size: 12px;
  --sp-arrow-bg: rgba(0, 0, 0, 0.5);
  --sp-arrow-size: 60px;
}
```

### CSS Variables List

| Variable | Default | Description |
| --- | --- | --- |
| `--sp-nav-color` | `rgba(255, 255, 255, 0.3)` | Navigation dot color |
| `--sp-nav-active-color` | `#fff` | Active navigation dot color |
| `--sp-nav-size` | `10px` | Navigation dot size |
| `--sp-nav-active-scale` | `1.8` | Scale of the active dot |
| `--sp-arrow-bg` | `rgba(255, 255, 255, 0.15)` | Control arrow background |
| `--sp-arrow-hover-bg` | `rgba(255, 255, 255, 0.3)` | Control arrow hover background |
| `--sp-arrow-size` | `50px` | Control arrow button size |
| `--sp-arrow-color` | `#fff` | Control arrow icon color |

## License
MIT License
