## My Rcarre Design Theme

This document captures the shared light/dark theme that should be used across both `main_frontend` and `admin_frontend`. The implementation is based on Tailwind CSS with **class-based dark mode** (`darkMode: 'class'`) and a small React `ThemeProvider` that toggles a `dark` class on the root `html` element.

The goal is to keep both frontends visually consistent and make future tweaks easy by changing tokens here and in the Tailwind config only.

---

## Color System

### Brand Colors

- **Primary**
  - **Token**: `primary`
  - **Hex**: `#E9E8FF` (from rgb(233,232,255))
  - **Usage**: Soft brand surfaces (chips, subtle cards, highlights).
  - **Tailwind**:
    - `bg-primary` – primary surface
    - `text-primary-on-light` – text/icon color on primary surfaces in light theme
    - `text-primary-on-dark` – text/icon color on primary surfaces in dark theme
- **Secondary**
  - **Token**: `secondary`
  - **Hex**: `#BF60B5` (from rgb(191,96,181))
  - **Usage**: Main accent color (contained buttons, active states, important links).
  - **Tailwind**:
    - `bg-secondary` – accent background (e.g. primary buttons)
    - `text-secondary-on-light` – text/icon color on secondary in light theme
    - `text-secondary-on-dark` – text/icon color on secondary in dark theme

### Palette (Purple / Pink)

Colores de la paleta para fondos, acentos y variantes con opacidad:

| Token | Hex | Uso |
|-------|-----|-----|
| `dark_purple` | `#040225` | Fondo muy oscuro, gradientes |
| `dark_purple_semitransparent` | `#040226` | Overlays, fondos con transparencia |
| `dark_purple_transparent` | `#040225` | Mismo que dark_purple con opacidad vía utilidades |
| `black_purple` | `#28164e` | Fondos oscuros, superficies |
| `black_purple_semitransparent` | `#28164e` | Overlays (usar con opacidad si hace falta) |
| `purple` | `#462671` | Púrpura principal |
| `purple_70` / `purple_50` | `#462671` | Mismo hex; opacidad con Tailwind: `bg-purple/70`, `bg-purple/50` |
| `light_purple` | `#73389d` | Púrpura claro, acentos |
| `light_purple_70` / `light_purple_50` | `#73389d` | Mismo hex; usar `bg-light-purple/70`, `bg-light-purple/50` |
| `pink` | `#bf30b5` | Rosa/magenta de acento |
| `pink_70` / `pink_50` | `#bf30b5` | Mismo hex; usar `bg-pink/70`, `bg-pink/50` |

**Tailwind (main_frontend y admin_frontend):**

- `bg-dark-purple`, `text-dark-purple`, `border-dark-purple`
- `bg-dark-purple-semitransparent`, `bg-dark-purple-transparent`
- `bg-black-purple`, `bg-black-purple-semitransparent`
- `bg-purple`, `text-purple`, `border-purple` (tema: `#462671`); opacidad: `bg-purple/70`, `bg-purple/50`
- `bg-light-purple`, `text-light-purple`; opacidad: `bg-light-purple/70`, `bg-light-purple/50`
- `bg-pink`, `text-pink`; opacidad: `bg-pink/70`, `bg-pink/50`

---

### Contrast on Brand

The design tool defines separate contrast colors per theme. In code we approximate that with named tokens:

- **Primary contrast (light)**: `#FFFFFF` → `text-primary-on-light`
- **Secondary contrast (light)**: `#FFFFFF` → `text-secondary-on-light`
- **Primary contrast (dark)**: `#000000` (87% opacity in design) → `text-primary-on-dark`
- **Secondary contrast (dark)**: `#000000` (87% opacity in design) → `text-secondary-on-dark`

### Background & Surface

Light theme:

- **App background**
  - **Token**: `background`
  - **Hex**: `#F4F4F7`
  - **Tailwind**: `bg-background`
- **Surface (cards, panels, navbar)**
  - **Token**: `surface`
  - **Hex**: `#FFFFFF`
  - **Tailwind**: `bg-surface`
- **Borders**
  - **Token**: `border`
  - **Hex**: `#E5E7EB`
  - **Tailwind**: `border-border`

Dark theme:

- **App background**
  - **Token**: `background.dark`
  - **Hex**: `#121212`
  - **Tailwind**: `dark:bg-background-dark`
- **Surface**
  - **Token**: `surface.dark`
  - **Hex**: `#1E1E22`
  - **Tailwind**: `dark:bg-surface-dark`
- **Borders**
  - **Token**: `border.dark`
  - **Hex**: `#2D2D33`
  - **Tailwind**: `dark:border-border-dark`

### Text Colors

- **Primary text**
  - **Tokens**: `textPrimary`, `textPrimary.dark`
  - **Hex (light)**: `#111827`
  - **Hex (dark)**: `#F9FAFB`
  - **Tailwind**:
    - `text-textPrimary`
    - `dark:text-textPrimary-dark`
- **Secondary text**
  - **Tokens**: `textSecondary`, `textSecondary.dark`
  - **Hex (light)**: `#4B5563`
  - **Hex (dark)**: `#9CA3AF`
  - **Tailwind**:
    - `text-textSecondary`
    - `dark:text-textSecondary-dark`

### Common Utility Examples

- Page background: `className="bg-background dark:bg-background-dark text-textPrimary dark:text-textPrimary-dark"`
- Card / panel: `className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg"`
- Primary button:
  - Contained: `className="bg-secondary text-secondary-on-light dark:text-secondary-on-dark rounded-lg hover:opacity-90"`
  - Subtle: `className="bg-primary text-primary-on-light dark:text-primary-on-dark rounded-lg"`

---

## Shape & Radius

From the `Settings` screenshot:

- **Global border radius**: `8px`
  - Used for cards, buttons, inputs, popovers, tooltips.
  - Implemented in Tailwind as:
    - `theme.extend.borderRadius.lg = '8px'`
  - Preferred utilities:
    - Use `rounded-lg` for default rounded UI elements.
    - Reserve `rounded-full` only for pills/avatars.

---

## Typography

Based on the `Typography` screenshot:

- **Font families**
  - Primary stack:
    - `Roboto`, `Neue Montreal`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `sans-serif`
  - Tailwind:
    - `theme.extend.fontFamily.sans = ['Roboto', '\"Neue Montreal\"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '\"Segoe UI\"', 'sans-serif']`
  - Use `font-sans` on the app root so all text inherits this stack.

### Recommended Type Scale

These values are guidelines; use Tailwind utilities to approximate them:

| Variant    | Usage                             | Size / Line height | Tailwind example                        |
|-----------|------------------------------------|--------------------|-----------------------------------------|
| H1        | Page titles                        | 32 / 40            | `text-3xl md:text-4xl font-semibold`    |
| H2        | Section titles                     | 24 / 32            | `text-2xl font-semibold`                |
| H3        | Sub-section titles                 | 20 / 28            | `text-xl font-semibold`                 |
| H4–H6     | Smaller headings                   | 18 / 26, 16 / 24   | `text-lg font-semibold`, `text-base`    |
| Subtitle1 | Important supporting text          | 16 / 24            | `text-base text-textSecondary`          |
| Subtitle2 | Secondary supporting text          | 14 / 20            | `text-sm text-textSecondary`            |
| Body1     | Primary body copy                  | 16 / 24            | `text-base`                             |
| Body2     | Compact body copy, tables, labels  | 14 / 20            | `text-sm`                               |
| Button    | Buttons                            | 14 / 20            | `text-sm font-medium uppercase tracking-wide` (optional) |
| Caption   | Metadata, helper text              | 12 / 16            | `text-xs text-textSecondary`            |
| Overline  | Small all-caps labels              | 10–11 / 16         | `text-[11px] tracking-widest uppercase` |

---

## Component Defaults

These settings summarize how the design tool was configured and how they map into implementation:

- **Buttons**
  - Default variant: **Contained**
  - Default style:
    - Background: `bg-secondary`
    - Text: `text-secondary-on-light dark:text-secondary-on-dark`
    - Radius: `rounded-lg`
    - Elevation: use a subtle shadow or border only; keep elevation low for a flat, modern look.
- **Inputs**
  - Default variant: **Outlined**
  - Style:
    - Background: `bg-surface dark:bg-surface-dark`
    - Border: `border border-border dark:border-border-dark rounded-lg`
    - Focus: `focus:ring-2 focus:ring-secondary focus:border-secondary`
- **Popovers / Menus / Tooltips**
  - Background: `bg-surface dark:bg-surface-dark`
  - Border: `border border-border dark:border-border-dark`
  - Radius: `rounded-lg`

---

## Implementation Notes

- Tailwind is configured with `darkMode: 'class'`.
- A shared `ThemeProvider` in each frontend:
  - Keeps `theme` as `'light' | 'dark'`.
  - Persists the selection in `localStorage`.
  - Applies or removes the `dark` class on `document.documentElement`.
- Typical usage:
  - Wrap the React tree with `<ThemeProvider>`.
  - Use `const { theme, toggleTheme } = useTheme();` inside components.
  - Use semantic token utilities (e.g. `bg-background`, `bg-surface`, `text-textPrimary`) instead of raw Tailwind gray/indigo classes whenever possible.

