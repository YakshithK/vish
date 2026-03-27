## 1. The Identity: "Vish"
We aren't going for a "file explorer" vibe. We want **Vish** to feel like an ambient layer of your OS—something that is "living" in your computer.

* **The Vibe:** Precise, translucent, and hyper-fast. A precision instrument, not a toy.
* **The Metaphor:** A "Sonar" for your data. It's not just looking for keywords; it's sensing the *meaning* of your files.
* **The Logo Concept:** A stylized, geometric "V" that resembles a ripple or wave form.

### Color Palette: "Deep Forest Neon"
Vish uses a dark, forest-green aesthetic — organic yet technical, like a terminal in the woods.
* **Primary (Background):** `#0c1510` (Forest Deep — near-OLED dark forest green)
* **Surface:** `rgba(13, 20, 16, 0.48)` (Forest Panel — translucent elevated layer)
* **Accent (Action):** `rgba(155, 255, 215, ~0.8–0.96)` (Mint Glow — electric mint/seafoam green)
* **Glow:** `rgba(155, 255, 215, 0.75)` (Mint glow for shadows and halos)
* **Text Main:** `#e7efe8` (Frosted forest white)
* **Text Soft:** `rgba(231, 239, 232, 0.82)`
* **Text Dim:** `rgba(231, 239, 232, 0.58)`
* **Text Mono:** `rgba(155, 215, 185, 0.65)` (for paths, meta, scores)
* **Ink:** `#243126` (dark forest green for text on light/mint backgrounds)

**File type accent colors** (semantic, independent of main theme):
- PDF: `#F97316` (orange)
- Image: `#22C55E` (green)
- Code: `#3B82F6` (blue)
- Audio: `#A855F7` (purple)
- Video: `#EF4444` (red)
- Markdown/Text: mint-dim
- Config/JSON/YAML: `#F59E0B` (amber)

---

## 2. The Screen Architecture

### I. Setup ("Where should Vish look?")
Single-column centered layout, max-w-[480px]. No sidebar.
* **Top:** Vish wordmark (mono, tiny, uppercase, tracked)
* **Headline:** "Where should Vish look?" (light weight, medium size)
* **Dropzone:** Large dashed rounded rect (mint border) — primary interaction hero
* **Path input row:** Text field + Add button for manual entry
* **Folder chips:** Compact mint-tinted pills with inline × removal
* **CTA:** Full-width "Start indexing →" — enabled only when folders are selected

### II. Indexing (progress screen)
Centered, single-column, max-w-[520px]. No sidebar.
* **Status label:** "INDEXING · 8 concurrent workers" (mono, uppercase, dim)
* **Progress bar:** 2px height, sharp (no border-radius), mint gradient with shimmer
* **Stats row:** files done / total · percent · ETA remaining (mono, small)
* **Cancel:** Minimal ghost link, centered below

### III. Search Hero (no query submitted)
Full-height centered layout.
* **VISH wordmark** top-left (large, light Inter uppercase)
* **Settings gear** top-right
* **Centered search bar:** Large, glassmorphism input with VishLogo inside

### IV. Search Results — the precision instrument
Full-screen list layout. No modal chrome.
* **Top bar (50px):** VishLogo (small) · wordmark · compact search bar · settings gear
* **Meta row:** "{N} results for 'query'"
* **Results list** (scrollable): compact horizontal rows, not cards

**Result row anatomy:**
- Left: file type badge (3-letter code, color-coded pill)
- Center: filename (bold) · directory path (mono, dim) · snippet (1 line, soft)
- Right: score bar (2px, matches badge color) + score%
- Hover: left mint accent bar slides in · action buttons (Open / Reveal) replace score

### V. Settings (drawer)
380px right-edge drawer, slides in from right.
* Backdrop: semi-opaque blur
* Header: "Settings" + X close
* Sections: Background sync status · Indexed folders (list + add) · Danger zone (Reset Index)
* No border-radius on right edges (flush with screen edge)

---

## 3. Design Elements
* **Glassmorphism:** `backdrop-filter: blur(14–20px)` for panels and top bar.
* **Glow Effects:** Soft mint glows (`rgba(155,255,215,...)`) around CTAs and focused inputs.
* **Typography:** **Inter** (UI text, all weights) + **JetBrains Mono** (paths, scores, meta, labels)
* **Animation:** 150–220ms ease-out. Stagger list rows 30ms. No decorative motion in results.
* **Precision aesthetic:** Sharp progress bars, type-coded badges, score bars, hover reveals. Feels like a dev tool, not a consumer app.
