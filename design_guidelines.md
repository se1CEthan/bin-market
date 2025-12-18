# BIN (Brain Inspired Network) Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Marketplace Hybrid)
Drawing inspiration from **Gumroad** (creator marketplace), **Stripe** (payment UX), and **Linear** (dark mode aesthetics) to create a professional, modern bot marketplace with exceptional dark theme execution.

**Core Principles:**
- Premium dark aesthetic with high contrast for readability
- Trust-building through professional polish and clear information hierarchy
- Conversion-focused layouts that guide users to purchase or upload
- Developer-friendly dashboard with data visualization emphasis

---

## Typography System

**Font Stack:**
- **Primary:** Inter (Google Fonts) - Body text, UI elements, cards
- **Display:** Space Grotesk (Google Fonts) - Headlines, hero sections, bot titles
- **Monospace:** JetBrains Mono - Pricing, stats, technical details

**Hierarchy:**
- Hero Headlines: Space Grotesk, 4xl-6xl, font-bold
- Section Headers: Space Grotesk, 3xl-4xl, font-semibold
- Bot Titles: Space Grotesk, xl-2xl, font-semibold
- Body Text: Inter, base-lg, font-normal
- Captions/Meta: Inter, sm-xs, font-medium
- Pricing: JetBrains Mono, 2xl-3xl, font-bold

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro-spacing (padding within cards): p-4, p-6
- Component spacing: gap-4, gap-6, gap-8
- Section spacing: py-12, py-16, py-20, py-24
- Container max-widths: max-w-7xl for content, max-w-6xl for dashboards

**Grid Systems:**
- Bot Listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Features: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard Stats: grid-cols-2 lg:grid-cols-4
- Developer Profiles: grid-cols-1 lg:grid-cols-3

---

## Component Library

### Navigation
- **Top Bar:** Full-width sticky header with logo (left), search bar (center), auth/profile (right)
- **Search:** Prominent search bar with autocomplete dropdown, category filters
- **Mobile:** Hamburger menu with slide-in drawer navigation

### Cards
- **Bot Cards:** Elevated cards with bot thumbnail, title, developer info, price tag, rating stars, quick preview on hover
- **Developer Cards:** Profile photo, name, total sales, rating, featured bots count
- **Stat Cards:** Large number display with icon, label, trend indicator

### Forms
- **Upload Forms:** Multi-step wizard with progress indicator, drag-drop file upload zones, thumbnail previews
- **Checkout:** Single-page checkout with bot summary sidebar, PayPal integration, secure badges
- **Review Forms:** Star rating selector, textarea with character count, image upload

### Buttons
- **Primary CTA:** Large rounded buttons with subtle glow effect, font-semibold
- **Secondary:** Outlined buttons with hover fill transition
- **Icon Buttons:** Circular with single icon, used for actions (favorite, share, message)
- **Blurred Buttons on Images:** backdrop-blur-md bg-white/10 for buttons overlaying hero images

### Data Display
- **Tables:** Striped rows for dashboard analytics, sortable columns, pagination
- **Charts:** Line graphs for sales trends, bar charts for category performance
- **Badges:** Pill-shaped badges for categories, status indicators, featured tags

### Chat System
- **Chat Window:** Fixed bottom-right expandable widget, message bubbles with timestamps, typing indicators
- **Message Thread:** Alternating sender/receiver with profile pictures, time-grouped messages

---

## Page-Specific Layouts

### Landing Page
**Hero Section:** Full-width banner with background featuring abstract neural network pattern (60vh), large headline overlay, dual CTAs ("Browse Bots" + "Sell Your Bot"), trust indicators below (user count, bot count, total earnings)

**Trending Bots:** Horizontal scrollable carousel with large bot cards, navigation arrows, "View All" link

**Categories:** 3-column grid of category cards with icons, bot counts, quick links

**How It Works:** 3-step visual timeline with icons and descriptions

**Top Developers:** 4-column grid of developer profile cards with stats

**CTA Section:** Centered with background treatment, strong headline, dual action buttons

### Bot Listing Page
**Filter Sidebar:** Category checkboxes, price range slider, rating filter, OS compatibility toggles
**Main Grid:** 3-4 column responsive bot card grid, load more pagination
**Sort Controls:** Dropdown for sorting (trending, newest, price, rating)

### Bot Detail Page
**2-Column Layout:**
- Left: Large demo video player, screenshot gallery carousel below
- Right: Bot title, developer info card, pricing panel, feature bullet list, system requirements, "Buy Now" CTA, "Message Developer" button

**Below Fold:** Tabbed interface (Description, Reviews, Support) with full-width content area

### Developer Dashboard
**Top Stats Row:** 4 stat cards (total sales, earnings, active bots, avg rating)
**Main Tabs:** Upload, My Bots (table view), Sales Analytics (charts), Payout Requests
**Upload Section:** Multi-step form with file dropzone, thumbnail upload, description editor, pricing fields

### Admin Dashboard
**Sidebar Navigation:** Fixed left sidebar with dashboard sections
**Main Area:** Pending approvals table, platform stats, featured bot manager, developer verification queue

---

## Images

**Hero Image:** Abstract dark neural network visualization with glowing nodes and connections, subtle animation of pulse effects on nodes. Image spans full width, 60vh height.

**Category Icons:** Custom illustrated icons for each bot category (WhatsApp, Instagram, Scrapers, Business, AI) with consistent line style

**Bot Thumbnails:** 16:9 ratio preview images showing bot interfaces or demo screenshots, standardized across listings

**Developer Avatars:** Circular profile photos, fallback to initials with gradient backgrounds

**Empty States:** Friendly illustrations for no bots found, empty cart, no messages yet

---

## Special Features

**Rating System:** 5-star display with half-star support, aggregate rating with review count
**Video Previews:** Inline video players with custom controls, autoplay on hover for listings
**Download Progress:** Progress bar modal during bot file preparation
**Success Animations:** Subtle checkmark animation on successful purchase/upload
**Toast Notifications:** Top-right positioned for actions (added to cart, payment success, upload complete)

**Search Autocomplete:** Dropdown with recent searches, suggested bots, trending keywords, category shortcuts

---

**Design Maturity:** This is a production-ready marketplace requiring polished, trustworthy aesthetics. Every interaction must feel professional and secure to build confidence in both buyers and sellers. The dark theme should feel premium, not gimmicky, with careful attention to contrast ratios and readability.