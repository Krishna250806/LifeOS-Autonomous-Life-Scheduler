# LifeOS Design System

This document outlines the visual language and design tokens of LifeOS, created as a premium personal instrument.

---

## 1. Color Palette (Neutral Paper & Graphite)

LifeOS avoids typical "AI app" neon highlights. It relies on warm paper textures (light mode) and warm graphite/charcoal tones (dark mode) with a singular, restrained accent tone.

| Token | Light Mode (Paper) | Dark Mode (Graphite) | Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `#FAF9F6` (Warm Off-White) | `#181818` (Warm Charcoal) | Page background |
| `foreground` | `#1C1C1C` (Ink Black) | `#EAE8E4` (Warm Light Gray) | Body text |
| `border` | `#E2DDD5` (Warm Muted Gray) | `#2E2E2C` (Charcoal Gray) | Section grids and lines |
| `muted` | `#6E6A62` (Warm Slate Gray) | `#8E8C88` (Warm Medium Gray) | Chronological increments, secondary labels |
| `card` | `#F4F0E8` (Light Card Background) | `#202020` (Dark Card Background) | Focused task cards, panels |
| `accent` | `#AF4D37` (Terracotta) | `#E07A5F` (Muted Terracotta) | "Now" timeline marker, priority dots |
| `accent-blue` | `#2B4C7E` (Ink Blue) | `#4F7CAC` (Ink Blue Dark) | Focus State indicator, secondary accents |

---

## 2. Typography Scale

LifeOS uses a distinct typographical hierarchy to suggest the editorial feel of a premium catalog or custom planner.

- **Primary Heading (Serif):** `Fraunces` — elegant, warm, low-contrast serif with humanist characteristics.
- **Body & Controls (Sans):** `Geist` — clean, modern grotesk.
- **Data & Time (Mono):** `Geist Mono` — precise, monospaced digits resembling watch dials.

| Level | Size | Weight | Line Height | CSS / Tailwind | Used For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `h1` | `2.25rem` (36px) | `300` (Light) | `1.2` | `font-serif tracking-tight` | Header titles, Weekly Review metric scores |
| `h2` | `1.5rem` (24px) | `400` (Regular) | `1.3` | `font-serif` | Component section headers |
| `h3` | `1.125rem` (18px) | `500` (Medium) | `1.4` | `font-sans font-medium` | Card titles, block headings |
| `body` | `0.875rem` (14px) | `400` (Regular) | `1.5` | `font-sans text-sm` | Assistant responses, block descriptions |
| `meta` | `0.75rem` (12px) | `400` (Regular) | `1.4` | `font-mono text-xs` | Time stamps, stats, tags, coordinates |

---

## 3. Spacing Scale & Grid

Layout follows a strict, asymmetrical grid structure like a premium calendar.

- **Proportional Timeline Ruler:**
  - `1 hour` is visually represented as exactly `80 pixels`.
  - `30 minutes` is `40 pixels`.
  - `15 minutes` is `20 pixels`.
- **Containers:** Zero radius or minimal radius (`rounded-sm` or `4px` maximum) to mimic the sharp cuts of bookbinding and precision instrumentation.
- **Borders:** Thin `1px` lines running across axes (`border-r`, `border-b`) rather than double borders on closed boxes.

---

## 4. Motion & Shared Layouts

Re-planning is a tactile event.
- **Transition Curve:** `[0.16, 1, 0.3, 1]` (custom ease-out-expo) for responsive, snapping movements.
- **Shared Layouts:** Framer Motion’s `layoutId` ensures that when blocks expand or move between lists (e.g. from "Next" to "Now"), they slide dynamically rather than teleporting.
