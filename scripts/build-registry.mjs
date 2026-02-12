/**
 * Build script for the shadcn registry.
 * Reads components/ds/*.tsx and generates public/r/<name>.json files
 * following the shadcn registry-item.json schema.
 *
 * Run: node scripts/build-registry.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs"
import { join, basename } from "path"

const DS_DIR = join(process.cwd(), "components", "ds")
const OUT_DIR = join(process.cwd(), "public", "r")

// Component metadata: name -> { description, dependencies, registryDependencies, type }
const META = {
  heading: {
    description: "Semantic heading component with 4 levels and serif/sans variants.",
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
  },
  text: {
    description: "Typography component with body, small, caption, code, and lead variants.",
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
  },
  stack: {
    description: "Flexbox layout helper with direction, gap, align, and justify props.",
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
  },
  section: {
    description: "Page section wrapper with consistent padding and optional container.",
    dependencies: [],
    registryDependencies: [],
  },
  divider: {
    description: "Horizontal, vertical, or labeled divider component.",
    dependencies: [],
    registryDependencies: [],
  },
  "icon-button": {
    description: "Accessible icon-only button with required aria label.",
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
  },
  "status-badge": {
    description: "Semantic status indicator with colored dot and variants.",
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
  },
  "stat-card": {
    description: "Metric display card with label, value, trend, and icon.",
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
  },
  "avatar-group": {
    description: "Stacked avatar group with overflow indicator.",
    dependencies: [],
    registryDependencies: ["avatar"],
  },
  "progress-bar": {
    description: "Accessible progress bar with color variants and optional label.",
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
  },
  timeline: {
    description: "Vertical timeline with status indicators and icons.",
    dependencies: [],
    registryDependencies: [],
  },
  "alert-banner": {
    description: "Dismissible alert banner with icon, title, and semantic variants.",
    dependencies: ["class-variance-authority", "lucide-react"],
    registryDependencies: [],
  },
  "empty-state": {
    description: "Empty state placeholder with icon, title, description, and action.",
    dependencies: [],
    registryDependencies: [],
  },
  "skeleton-card": {
    description: "Loading skeleton card with configurable lines, avatar, and image slots.",
    dependencies: [],
    registryDependencies: ["skeleton"],
  },
  navbar: {
    description: "Sticky top navigation bar with logo, links, and actions slots.",
    dependencies: [],
    registryDependencies: [],
  },
  breadcrumbs: {
    description: "Accessible breadcrumb navigation with chevron separators.",
    dependencies: ["lucide-react"],
    registryDependencies: [],
  },
  "tab-nav": {
    description: "Underline-style tab navigation with counts and active state.",
    dependencies: [],
    registryDependencies: [],
  },
  "page-header": {
    description: "Page header with title, description, actions, and breadcrumb slots.",
    dependencies: [],
    registryDependencies: [],
  },
  "form-field": {
    description: "Form field wrapper with label, description, error, and required indicator.",
    dependencies: [],
    registryDependencies: ["label"],
  },
  "search-input": {
    description: "Search input with icon prefix and clearable value.",
    dependencies: ["lucide-react"],
    registryDependencies: [],
  },
  "toggle-button-group": {
    description: "Segmented control / toggle group with radio-like behavior.",
    dependencies: [],
    registryDependencies: [],
  },
  "file-upload": {
    description: "Drag and drop file upload zone with click fallback.",
    dependencies: ["lucide-react"],
    registryDependencies: [],
  },
  "navax-logo": {
    description: "NAVAX SVG logo component with dark, light, and brand color variants.",
    dependencies: [],
    registryDependencies: [],
  },
  "app-header": {
    description: "Full responsive app header with dropdown navigation, top bar, search, CTA, and mobile menu.",
    dependencies: ["lucide-react"],
    registryDependencies: ["button"],
  },
  "app-sidebar": {
    description: "Collapsible app sidebar with nested navigation, badges, user section, and sign-out.",
    dependencies: ["lucide-react"],
    registryDependencies: ["button"],
  },
  "app-footer": {
    description: "Dark footer with brand logo, multi-column links, and bottom bar with legal links.",
    dependencies: [],
    registryDependencies: [],
  },
  "data-table": {
    description: "Generic sortable data table with typed columns, hover states, and empty state.",
    dependencies: ["lucide-react"],
    registryDependencies: [],
  },
  stepper: {
    description: "Step progress indicator with horizontal and vertical orientations.",
    dependencies: ["lucide-react"],
    registryDependencies: [],
  },
  "user-menu": {
    description: "Avatar dropdown user menu with profile, settings, and sign-out actions.",
    dependencies: ["lucide-react"],
    registryDependencies: [],
  },
  "command-menu": {
    description: "Spotlight-style command palette with search, groups, and keyboard shortcuts.",
    dependencies: ["lucide-react"],
    registryDependencies: [],
  },
  "pricing-card": {
    description: "Pricing tier card with feature list, highlight badge, and CTA button.",
    dependencies: ["lucide-react"],
    registryDependencies: ["button"],
  },
  "testimonial-card": {
    description: "Customer testimonial card with quote, avatar, star rating, and attribution.",
    dependencies: [],
    registryDependencies: [],
  },
  "feature-card": {
    description: "Feature highlight card with icon, title, description, and optional link.",
    dependencies: [],
    registryDependencies: [],
  },
  kbd: {
    description: "Keyboard shortcut hint with styled key caps and separator.",
    dependencies: [],
    registryDependencies: [],
  },
}

// Ensure output directory
mkdirSync(OUT_DIR, { recursive: true })

const registryItems = []

// Get all .tsx files from DS_DIR (skip index.ts)
const files = readdirSync(DS_DIR).filter(
  (f) => f.endsWith(".tsx") && f !== "index.tsx"
)

for (const file of files) {
  const name = basename(file, ".tsx")
  const meta = META[name]

  if (!meta) {
    console.warn(`[SKIP] No metadata for ${name}`)
    continue
  }

  const content = readFileSync(join(DS_DIR, file), "utf-8")

  const registryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:ui",
    title: name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: meta.description,
    dependencies: meta.dependencies,
    registryDependencies: meta.registryDependencies,
    files: [
      {
        path: `components/ds/${file}`,
        type: "registry:ui",
        content,
      },
    ],
  }

  // Write individual file
  writeFileSync(
    join(OUT_DIR, `${name}.json`),
    JSON.stringify(registryItem, null, 2)
  )

  registryItems.push({
    name,
    type: "registry:ui",
    title: registryItem.title,
    description: meta.description,
    dependencies: meta.dependencies,
    registryDependencies: meta.registryDependencies,
  })

  console.log(`[OK] ${name}.json`)
}

// Write master registry index
const registryIndex = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "navax-ds",
  homepage: "",
  items: registryItems,
}

writeFileSync(
  join(OUT_DIR, "index.json"),
  JSON.stringify(registryIndex, null, 2)
)

console.log(`\n[DONE] Built ${registryItems.length} registry items to public/r/`)
console.log(`Registry index: public/r/index.json`)
