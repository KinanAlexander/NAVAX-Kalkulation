# NAVAX Design System Rules for v0

Copy everything below the line into your v0 Rules panel (sidebar > Rules) to enforce this design system across all projects.

---

## Brand Identity

- Company: NAVAX — Microsoft Dynamics Partner
- Primary brand color: #79217A (magenta) — HSL 299 57% 30%
- Secondary brand color: #006F6E (teal) — HSL 180 100% 22%
- Accent color: #2769B2 (blue) — HSL 212 63% 43%
- Visual style: Clean & Minimal — generous whitespace, subtle borders, restrained color use
- Personality: Professional, modern, trustworthy

## Color Palette (5 colors)

1. **Primary (Magenta):** #79217A — CTAs, active states, brand accents, sidebar highlights
2. **Secondary (Teal):** #006F6E — hero backgrounds, section accents, secondary buttons
3. **Info (Blue):** #2769B2 — links, informational elements, chart accents
4. **Foreground (Dark):** #1F2937 — headings and body text
5. **Background (White):** #FFFFFF — page backgrounds and cards

Semantic colors (use sparingly):
- Destructive/Error: #E53935
- Success: #1A9A5C
- Warning: #E99200

## Typography

- **Body/UI font:** Inter (font-sans) — use for all body text, labels, navigation
- **Heading font:** DM Sans (font-heading) — use for all headings (h1-h4), semibold weight
- **Monospace font:** JetBrains Mono (font-mono) — use for code blocks, technical values

### Scale
- Page headings (h1): text-4xl, font-heading, font-semibold, tracking-tight
- Section headings (h2): text-2xl, font-heading, font-semibold, tracking-tight
- Sub-headings (h3): text-lg, font-heading, font-semibold
- Body: text-base (16px), font-sans, leading-relaxed
- Small/Caption: text-sm, text-muted-foreground
- Code: text-sm, font-mono

## Spacing & Layout

- Use Tailwind's spacing scale: p-4, p-6, p-8 — avoid arbitrary values
- Section padding: py-16 or py-20 on desktop, py-10 on mobile
- Component gaps: gap-4 for tight layouts, gap-6 for standard, gap-8 for loose
- Card padding: p-6
- Max content width: max-w-6xl mx-auto for pages, max-w-md for forms

## Component Conventions

- Border radius: rounded-lg (default), rounded-md for smaller elements
- Shadows: shadow-sm for cards, no heavy shadows — keep it flat and clean
- Borders: border border-border — always 1px, use the semantic border color
- Focus rings: ring-2 ring-ring ring-offset-2 — always use the primary ring color
- Transitions: transition-colors for color changes, duration-150

### Buttons
- Default (primary): bg-primary text-primary-foreground (magenta)
- Secondary: bg-secondary text-secondary-foreground (teal)
- Ghost: transparent background, hover:bg-accent
- Outline: border border-input, transparent background
- Destructive: bg-destructive text-destructive-foreground
- Always include hover/focus/disabled states

### Cards
- bg-card border border-border rounded-lg shadow-sm
- Header: p-6, Title: text-2xl font-heading font-semibold
- Content: p-6 pt-0

### Inputs & Forms
- Height: h-10
- Border: border border-input rounded-md
- Focus: ring-2 ring-ring
- Labels: text-sm font-medium, above inputs with gap-2
- Error text: text-sm text-destructive

### Badges
- Rounded-full, small: px-2.5 py-0.5 text-xs font-semibold
- Default: bg-primary text-primary-foreground
- Use secondary/outline variants for lower emphasis

## Icons

- Use Lucide React icons exclusively
- Default sizes: 16px (size-4), 20px (size-5), 24px (size-6)
- Match icon color to surrounding text color
- Never use emojis as icons

## Registry Components

When building NAVAX apps, prefer these design system components:
- `NavaxLogo` — SVG logo with dark/light/brand variants
- `AppHeader` — Full responsive header with dropdowns, top bar, and mobile menu
- `AppSidebar` — Collapsible sidebar with nested nav, badges, and user section
- `AppFooter` — Dark footer with brand column and multi-column links
- `Heading` / `Text` — Consistent typography with level/variant props
- `StatCard` / `ProgressBar` / `Timeline` — Data display patterns
- `AlertBanner` / `EmptyState` / `SkeletonCard` — Feedback patterns
- `FormField` / `SearchInput` / `FileUpload` — Form patterns
- `Stack` / `Section` / `Divider` — Layout utilities

## General Rules

- Mobile-first responsive design: base styles for mobile, md: for tablet, lg: for desktop
- Use semantic HTML (main, header, nav, section, article)
- Add proper ARIA labels and sr-only text for accessibility
- Use shadcn/ui components as the base — extend with the tokens above
- Prefer flexbox for layouts (flex items-center justify-between)
- Use CSS Grid only for complex 2D layouts (grid grid-cols-3 gap-4)
- Always use text-balance or text-pretty on headings
- No decorative blobs, abstract shapes, or gradient backgrounds unless explicitly asked
- Charts should use the --chart-1 through --chart-5 CSS variables (magenta, teal, blue, amber, green)
