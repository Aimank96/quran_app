## Overview

This Quran Web Application uses **Tailwind CSS v4** as its primary styling framework, configured via the `@tailwindcss/vite` plugin for Vite-based builds. The project follows a utility-first CSS methodology with no custom component library or pre-built UI kit.

## Core Configuration

### Tailwind CSS v4 Setup
- **Version**: Tailwind CSS ^4.3.1 with `@tailwindcss/vite` plugin
- **Build Integration**: Configured in `vite.config.ts` via `tailwindcss()` plugin
- **Import Strategy**: Uses `@import "tailwindcss"` in `src/index.css` (v4 syntax)
- **No separate config file**: Tailwind v4 uses CSS-native configuration via `@theme` blocks instead of `tailwind.config.js`

### Custom Theme Tokens
Defined in `src/index.css`:
```css
@theme {
  --font-arabic: 'Amiri Quran', 'Noto Naskh Arabic', serif;
}
```
This creates a custom CSS variable `--font-arabic` used throughout components for Arabic text rendering.

### Typography
- **Arabic fonts**: Google Fonts import for `Amiri Quran` and `Noto Naskh Arabic` (weights 400, 700)
- **Applied via**: `className="font-arabic"` on elements containing Arabic script
- **Direction support**: RTL text uses `dir="rtl"` attribute alongside font styling

## Design System Patterns

### Color Palette (Tailwind defaults)
The application uses a consistent color scheme built on Tailwind's default palette:

| Purpose | Colors Used |
|---------|-------------|
| Primary/Brand | `emerald-600`, `emerald-700`, `emerald-800` |
| Accent/Highlight | `amber-100`, `amber-800` |
| Backgrounds | `stone-50`, `white`, `emerald-50/40` |
| Borders | `stone-200`, `stone-300` |
| Text primary | `gray-900`, `gray-800` |
| Text secondary | `gray-600`, `gray-500`, `gray-400` |
| Status badges | `blue-100/blue-700` (Meccan), `emerald-100/emerald-700` (Medinan) |
| Error states | `red-600` |

### Layout Architecture
- **Max-width container**: `max-w-5xl` applied consistently across pages and header
- **Centering**: `mx-auto` for horizontal centering
- **Padding**: `px-4` or `px-3` for page-level horizontal padding
- **Grid system**: Responsive grid (`grid gap-3 sm:grid-cols-2 lg:grid-cols-3`) for surah cards
- **Sticky header**: `sticky top-0 z-10` with backdrop blur

### Component Styling Conventions

All components use inline `className` props with Tailwind utilities. Key patterns:

1. **Cards**: `rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md`
2. **Buttons**: `rounded-full` or `rounded-lg` with hover transitions
3. **Inputs**: `rounded-lg border border-stone-300 bg-stone-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200`
4. **Badges**: Small rounded pills with background/text color pairs (e.g., `bg-emerald-100 text-emerald-700`)
5. **Transitions**: Consistent `transition` class on interactive elements

### Glassmorphism Effects
- Header and audio player bar use `bg-white/90` or `bg-white/95` with `backdrop-blur-sm`
- Creates semi-transparent overlay effect over content

### Responsive Strategy
- Mobile-first approach using Tailwind's breakpoint prefixes (`sm:`, `lg:`)
- Grid columns scale from 1 (mobile) to 2 (sm) to 3 (lg)
- Audio player adds bottom padding (`pb-28`) when active to prevent content overlap

## Global Styles

Minimal global CSS in `src/index.css`:
- Box-sizing reset: `*, *::before, *::after { box-sizing: border-box; }`
- Overflow prevention: `html, body { overflow-x: hidden; max-width: 100%; }`
- Margin/padding reset on root elements
- No custom CSS classes defined — all styling is utility-based

## Key Files

- `src/index.css` — Single CSS entry point with Tailwind import, theme tokens, and minimal resets
- `vite.config.ts` — Tailwind plugin registration
- `package.json` — Dependencies: `tailwindcss` and `@tailwindcss/vite`
- All `.tsx` components — Inline Tailwind utility classes (no CSS modules, no styled-components)

## Developer Guidelines

1. **Use only Tailwind utilities** — Do not create custom CSS classes or style blocks in components
2. **Follow the color palette** — Use emerald for primary actions, amber for transliteration/accent, stone for backgrounds/borders
3. **Apply `font-arabic`** to all Arabic text elements
4. **Use `dir="rtl"`** alongside Arabic font for proper text direction
5. **Maintain max-w-5xl container** consistency across pages
6. **Add transitions** to interactive elements (buttons, links, inputs)
7. **Use semantic color roles** — emerald for success/primary, blue for Meccan surahs, red for errors
8. **No CSS-in-JS libraries** — The project does not use styled-components, emotion, or similar
9. **No CSS modules** — All styling is via className with Tailwind utilities
10. **Responsive design** — Use Tailwind breakpoints for layout adjustments