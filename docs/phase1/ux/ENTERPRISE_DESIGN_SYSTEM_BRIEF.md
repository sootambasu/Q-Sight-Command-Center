# ENTERPRISE DESIGN SYSTEM BRIEF
**Project:** Q-Sight Command Center  
**Version:** v0.8.0-prototype  
**Auditor:** Enterprise Visual Design System Specialist  

## 1. Executive Summary
The current visual design of Q-Sight Command Center lacks the systematic rigor required for an enterprise application. While a basic dark theme exists via CSS variables, it is incomplete, semantically overloaded, and frequently bypassed by inline styles. A strict design token system must be implemented to ensure consistency, accessibility, and professional polish.

## 2. Current Token Inventory & Gaps
**Existing (but flawed):**
- Backgrounds: `--bg-darker`, `--bg-dark`, `--bg-panel`, `--bg-surface`
- Borders: `--border-muted`, `--border-bright`
- Text: `--text-bright`, `--text-normal`, `--text-muted`, `--text-disabled`
- Entity Colors: Cyan, Emerald, Purple, Orange, Amber.

**Missing Completely:**
- Spacing Tokens (padding/margin)
- Border Radius Tokens
- Elevation / Shadow Tokens
- Typography (Size, Line Height, Weight) Tokens
- Animation Duration / Easing Tokens

**Critical Bugs:**
- `--color-critical` is referenced in code but undefined in CSS.
- `--border-focus` is defined but unused (no `:focus-visible` styles).

## 3. Typography Scale Assessment
**Current State:** 
- Highly erratic. Sizes range from 8px (unreadable) to 32px without logical progression.
- Heavy reliance on `JetBrains Mono` for non-tabular data.

**Required Scale:**
- `text-xs`: 11px / 16px (Minimum readable, labels only)
- `text-sm`: 13px / 20px (Secondary text, UI controls)
- `text-base`: 14px / 20px (Body, detail panels)
- `text-lg`: 16px / 24px (Subtitles, panel headers)
- `text-xl`: 20px / 28px (Main headers)
- *Action:* Restrict monospace usage strictly to technical IDs, coordinates, and raw data.

## 4. Color System Assessment
**Semantic Conflicts:**
- `Amber` (`--color-camera` / `--color-warning`) is used simultaneously for Camera entities, 'PENDING' status, warnings, and audit badges. This destroys color as a pre-attentive attribute.
- `Orange` is used for Seismic entities and also for demo mode indicators and alerts.

**Required Roles:**
- Separate *Entity Mapping Colors* from *UI Status Colors*.
- Establish clear UI Status colors: Info (Blue), Success (Green), Warning (Amber), Critical (Red).

## 5. Spacing System Assessment
**Current State:** Total chaos. Scattered hardcoded values (`4px`, `6px`, `8px`, `10px`, `12px`, `14px`, `15px`, `16px`).

**Proposed System (4px grid):**
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px

## 6. Border, Radius, and Elevation System
- **Radius:** Standardize on two values. `radius-sm` (4px) for inner components (badges, small buttons), `radius-md` (8px) for outer containers (panels, cards).
- **Elevation:** Define 3 levels of shadow for the dark theme to create depth between the map canvas, floating panels, and interactive overlays.

## 7. Animation and Motion Assessment
- **Current State:** Three infinite pulse animations run simultaneously during demo mode, causing severe visual noise.
- **Gap:** No `@media (prefers-reduced-motion: reduce)` support.
- **Action:** Restrict infinite animations to critical, unacknowledged alerts only. Standardize transition durations (e.g., `150ms ease-in-out`).

## 8. Icon System Assessment
- **Current State:** Mix of inline SVG components and emojis (📷, 🔔, ⚠️, ℹ️).
- **Action:** Eradicate all emojis from the UI. Implement a cohesive SVG icon library (e.g., Lucide or Phosphor) with standardized sizing (`16px` for inline, `24px` for headers).

## 9. Component Pattern Inconsistency
Card padding and border radii vary across `TimelineStrip`, `AlertInbox`, and `SourceHealthPanel`. All "Card" surfaces must use identical layout primitives.

## 10. Design Principles for Redesign
1. **No Inline Styles:** All styling must derive from CSS classes mapped to design tokens.
2. **Spatial Supremacy:** The map is the primary interface; panels should float above or sit beside it without structural disruption.
3. **Data Clarity:** Typography and color must serve to clarify data, not decorate the interface. Use color sparingly and with strict semantic meaning.
4. **Enterprise Restraint:** Eliminate flashing animations, developer jargon, and consumer-grade UI patterns (e.g., emojis).
