---
name: Warm Minimalism
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#54433b'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#87736a'
  outline-variant: '#dac2b7'
  surface-tint: '#934a22'
  primary: '#904820'
  on-primary: '#ffffff'
  primary-container: '#af6036'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb692'
  secondary: '#825422'
  on-secondary: '#ffffff'
  secondary-container: '#fdc083'
  on-secondary-container: '#784c1a'
  tertiary: '#615b55'
  on-tertiary: '#ffffff'
  tertiary-container: '#7b736d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcb'
  primary-fixed-dim: '#ffb692'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#75330c'
  secondary-fixed: '#ffdcbd'
  secondary-fixed-dim: '#f7bb7e'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#663d0b'
  tertiary-fixed: '#ebe1da'
  tertiary-fixed-dim: '#cec5be'
  on-tertiary-fixed: '#1f1b17'
  on-tertiary-fixed-variant: '#4c4641'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system blends the structural efficiency of Scandinavian design with the warm, earthy aesthetic of Japanese interiors. The brand personality is serene, dependable, and deeply inviting. It targets a sophisticated audience looking for curated living spaces through a rental platform that feels more like an editorial experience than a utility.

The visual style is a **Modern Corporate** hybrid with **Tactile** influences. It utilizes heavy whitespace to provide breathing room, balanced by rich, saturated accents that prevent the interface from feeling cold. The goal is to evoke a "home-first" emotional response—security, warmth, and curated taste.

## Colors

The palette is anchored in a rich **Terracotta (Primary)** used for high-impact actions and key brand moments. **Warm Sand (Secondary)** provides a soft, saturated alternative for secondary actions and highlighted containers. **Deep Oak (Tertiary)** is reserved for primary text and structural lines to maintain high legibility and professional contrast.

The background system avoids pure white, opting for a **Bone-tinted Neutral** to reduce eye strain and enhance the tactile, paper-like quality of the UI. Functional colors (success, error) should be muted to match the desaturated nature of the brand, using sage greens and burnt reds respectively.

## Typography

The typography system uses **Manrope** as the primary driver for its geometric yet friendly proportions, ensuring the platform feels modern and accessible. Headlines use tighter letter-spacing and heavier weights to create a strong visual anchor for rental listings.

**Hanken Grotesk** is introduced for labels and small utility text to provide a technical, sharp contrast to the softer body text. This distinction helps users quickly scan metadata such as pricing, square footage, and availability. Use a "Display" tier for hero sections to maximize the editorial feel of the platform.

## Layout & Spacing

The design system employs a **Fluid Grid** model based on a 12-column structure for desktop and a 4-column structure for mobile. A strict 8px base unit (the "rhythm") governs all padding and margins to ensure mathematical harmony.

Layouts should prioritize large "hero" containers that span the full width of the grid, separated by generous vertical padding (80px-120px) to distinguish between different content sections like "Featured Listings" and "Category Browsing." On mobile, gutters shrink to 16px to maximize screen real estate for high-quality property imagery.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. Instead of harsh drop shadows, the system uses "Soft Glows"—low-opacity (10-15%) shadows tinted with the primary terracotta or deep oak colors. This creates an organic depth that feels like a physical object resting on a surface.

Cards and interactive containers use a subtle 1px border in a slightly darker neutral shade to maintain definition without the weight of a heavy outline. When elements are "lifted" (on hover), the shadow expands slightly and the background color shifts to a warmer tint.

## Shapes

The shape language is **Rounded**, reflecting the soft edges found in Japandi furniture. Standard UI components like buttons and input fields use a 0.5rem (8px) corner radius. For large content containers and product cards, the radius increases to 1rem (16px) to emphasize a "contained" and safe feeling. 

Pill-shaped elements (Radius: 100px) are used exclusively for badges, tags, and chips to provide a distinct visual contrast to the more structured rectangular forms of the grid.

## Components

### Buttons
Primary buttons are solid Terracotta with white text, featuring a subtle 2px bottom "weight" shadow. Secondary buttons use the Warm Sand background with Deep Oak text for a softer secondary hierarchy.

### Input Fields
Inputs feature a thick bottom border (2px) instead of a full box when used in minimal forms, or a full neutral-filled container for complex search bars. Labels always sit above the input in Hanken Grotesk.

### Cards
Rental cards are the centerpiece. They use a 16px border radius, a white or very light neutral background, and a "hover-lift" state. Images within cards should have a subtle inner-glow to feel integrated.

### Chips & Badges
Used for property features (e.g., "3 Bed", "Pet Friendly"). These should use a low-saturation version of the Secondary color with a darker text label to ensure they don't distract from the primary CTA.

### Lists
Navigation and property lists utilize generous line-height and horizontal separators in a very faint #E5E0D8 to maintain a clean, organized flow.