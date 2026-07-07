---
name: Modern Japandi Rental System
colors:
  surface: '#fff8f5'
  surface-dim: '#e1d8d4'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ed'
  surface-container: '#f5ece7'
  surface-container-high: '#efe6e2'
  surface-container-highest: '#e9e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#52443d'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#85746c'
  outline-variant: '#d7c2ba'
  surface-tint: '#875135'
  primary: '#875135'
  on-primary: '#ffffff'
  primary-container: '#c68667'
  on-primary-container: '#4c220a'
  inverse-primary: '#feb694'
  secondary: '#645d53'
  on-secondary: '#ffffff'
  secondary-container: '#e8ded1'
  on-secondary-container: '#686257'
  tertiary: '#5f5e5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#969591'
  on-tertiary-container: '#2e2e2b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#feb694'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#6b3a20'
  secondary-fixed: '#ebe1d4'
  secondary-fixed-dim: '#cfc5b9'
  on-secondary-fixed: '#1f1b13'
  on-secondary-fixed-variant: '#4c463c'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#fff8f5'
  on-background: '#1e1b18'
  surface-variant: '#e9e1dc'
typography:
  display-lg:
    fontFamily: DM Serif Display
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Serif Display
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
  headline-md:
    fontFamily: DM Serif Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-sm:
    fontFamily: DM Serif Display
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is rooted in the "Modern Japandi" aesthetic—a fusion of Japanese minimalism and Scandinavian functionality. It targets a demographic that values intentional living, premium quality, and the flexibility of the circular economy. The UI must feel like a high-end interior design magazine: spacious, calm, and impeccably organized.

The primary emotional response should be **serenity and trust**. By utilizing high-contrast editorial typography alongside warm, tactile neutrals, the interface bridges the gap between a digital marketplace and a physical home environment. The style is **Corporate Minimalist with Tactile influences**, ensuring that while the platform is professional enough for vendors and admins, it remains cozy and inviting for customers.

**Key visual pillars:**
- **Intentional Whitespace:** Generous breathing room to highlight product craftsmanship.
- **Warmth over Clinicality:** Replacing pure whites with creams and pure blacks with deep charcoals.
- **Refinement:** Thin lines, subtle transitions, and high-quality photography are the primary drivers of the visual narrative.

## Colors

The palette is inspired by natural materials: clay, sand, linen, and charcoal.

- **Primary (Clay/Terracotta):** Used sparingly for primary actions, calls-to-be-inspired, and brand-defining accents. It conveys warmth and groundedness.
- **Secondary (Sand):** A transitional shade for secondary buttons, borders, and subtle background shifts.
- **Surface (Cream/Linen):** The foundation of the UI. Avoid pure #FFFFFF; use the tertiary cream to reduce eye strain and enhance the "homely" feel.
- **Ink (Charcoal):** Used for all primary text and iconography. This provides high legibility without the harshness of pure black.
- **Status Tones:** Success (Sage) and Error (Muted Rust) are desaturated to maintain harmony with the organic palette.

## Typography

This design system uses a pairing of **DM Serif Display** (or Newsreader/Playfair) for headlines and **Manrope** for functional text.

- **Headlines:** Should be set with tight letter-spacing. They are the "hero" elements that establish the premium quality of the furniture.
- **Body:** Manrope is chosen for its modern, geometric clarity which balances the traditional feel of the serif headlines.
- **Labels:** Used for metadata, category tags, and vendor dashboard stats. These should often be uppercase with increased tracking to create a sense of organized structure.
- **Mobile Scaling:** For mobile, `display-lg` should scale down to `32px` to ensure text does not break awkwardly on narrow viewports.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid with fixed maximums**.

- **Desktop (12-column):** 1280px max-width container. Gutters are kept wide (24px) to emphasize the airy, Japandi aesthetic.
- **Tablet (8-column):** Content reflows with margins reducing to 24px.
- **Mobile (4-column):** Vertical stacking is mandatory. Margins reduce to 16px.
- **Rhythm:** Use a base-8 spacing scale. For marketing sections (Customer role), use `lg` and `xl` spacing to create an editorial feel. For data-dense views (Vendor/Admin), use `sm` and `md` to optimize information density.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**.

1.  **Level 0 (Base):** The main background color (#F9F6F1).
2.  **Level 1 (Cards):** Surface color (#FFFFFF) with an extremely soft, diffused shadow.
    - *Shadow Profile:* `0px 4px 20px rgba(45, 41, 38, 0.04)`.
3.  **Level 2 (Interactive/Floating):** Used for active dropdowns or modals.
    - *Shadow Profile:* `0px 12px 32px rgba(45, 41, 38, 0.08)`.
4.  **Outlines:** Use low-contrast borders (`#E8DED1`) for input fields and static containers to maintain a flat, modern profile without over-reliance on shadows.

## Shapes

The design system utilizes **Rounded** corners to mirror the organic forms found in modern furniture.

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px). This provides a friendly, approachable feel.
- **Large Elements (Cards, Featured Hero Images):** 1rem (16px) or 1.5rem (24px).
- **Vendor/Admin Dashboard Elements:** Maintain 8px roundedness for consistency, but allow for 0px (Sharp) on data table headers to signify a more "industrial" and precise environment.

## Components

### Buttons
- **Primary:** Solid Clay (#C68667) with white text. 8px radius. Use for "Book Now" or "Save Changes."
- **Secondary:** Outlined with Clay or Sand. High whitespace inside the button.
- **Ghost:** No background, underline on hover. Used for "Learn More" or navigation.

### Inputs & Selection
- **Form Fields:** Light cream background with a subtle sand border. On focus, the border transitions to Clay.
- **Checkboxes/Radios:** Softly rounded squares/circles using the Primary color for the active state.

### Cards
- **Product Card:** Image-first layout. The title is in DM Serif Display (headline-sm). Pricing and availability are in Manrope (label-lg). Soft shadows on hover to indicate interactivity.
- **Admin Stats Card:** Flat background (Sand) with no shadow. Large Manrope numerals for data.

### Lists & Navigation
- **Header:** Transparent or semi-opaque cream. Minimalist icons (2px stroke weight).
- **Vendor Lists:** High-density rows with alternating subtle background tints for readability.

### Chips & Tags
- **Status Tags:** Rounded-pill shape. Low-saturation backgrounds with high-contrast text (e.g., desaturated green background with dark green text for "Available").