# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the landing page website for Atlas Logged, a privacy-first iOS location tracking app. The site is a static website built with vanilla HTML, CSS, and JavaScript - no build step or framework required. It deploys automatically to GitHub Pages at atlaslogged.com.

## Development Commands

### Local Development
```bash
# Start local server (Python)
python3 -m http.server 8000
# Visit http://localhost:8000

# Start local server (Node.js)
npx http-server .
```

### Testing & Validation
```bash
# Check DNS propagation
dig atlaslogged.com +short
dig www.atlaslogged.com +short

# Verify deployment (check GitHub Actions tab)
# Visit: https://github.com/shinkansensupportgroup/atlas-logged/actions
```

## Architecture

### Tech Stack
- **No build step**: Pure vanilla HTML/CSS/JS
- **Styling**: Custom CSS with Tailwind utility concepts (no actual Tailwind build)
- **Animations**: Custom CSS animations (GSAP references in README but not actually used in current code)
- **Live Chat**: Chatwoot widget integration (configured in index.html:202-225)
- **Deployment**: GitHub Pages via automatic git push to main branch

### Site Structure
- `index.html` - Main landing page with hero, features sections
- `privacy.html` - Privacy policy page
- `css/style.css` - All styling including glassmorphism effects and responsive design
- `js/main.js` - Interactive features: mobile menu, FAQ accordion, smooth scrolling, Safari detection
- `assets/` - Logo, favicon, and other static assets
- `sitemap.xml`, `robots.txt` - SEO configuration
- `CNAME` - Custom domain configuration for GitHub Pages

### Key Design Patterns

**Glassmorphism with Subtle Distortion**:
- Primary effect: Clean `backdrop-filter: blur()` + transparency (works everywhere)
- Optional subtle distortion: SVG filter on `::before` pseudo-elements (Chromium desktop only)
- **Critical**: Cannot use `backdrop-filter: ... url(#svg-filter)` - that syntax is invalid
- SVG filter (index.html:74-94) uses minimal distortion (scale: 3) for barely-noticeable organic texture
- Safari detection in js/main.js:10-20 applies `.is-safari` class for progressive enhancement
- Chromium (Chrome/Edge/Opera) on desktop >1024px gets subtle distortion via `filter: url(#glass-distortion)`
- Safari/Firefox/Mobile get clean glassmorphism only
- Distortion applied to backgrounds only, never to text/buttons for clean layout
- Implementation: css/style.css:78-96 (nav), 288-307 (features)

**Mobile-First Responsive Design**:
- Hamburger menu system (css/style.css:586-617, js/main.js:62-91)
- Mobile nav slides in from right at 768px breakpoint
- Features grid adapts: 3 columns → 2 columns (1024px) → 1 column (768px)

**Accessibility**:
- Skip-to-content link for keyboard navigation (index.html:72)
- ARIA labels throughout navigation and interactive elements
- Semantic HTML5 structure
- Reduced motion support (@media prefers-reduced-motion in css)

## Development Workflow

### Making Content Changes
1. Edit HTML files directly (index.html, privacy.html)
2. Test locally with Python or Node server
3. Commit and push to `main` branch
4. GitHub automatically deploys via GitHub Actions

### Styling Changes
- Edit `css/style.css` directly
- Color scheme defined as standard CSS colors (no CSS variables/root defined despite README suggestion)
- Key colors: `#2563eb` (primary blue), `#1e293b` (dark text), `#64748b` (secondary text)

### JavaScript Changes
- Edit `js/main.js` for interactive features
- Current features: Safari detection, FAQ accordion, smooth scroll, mobile menu
- Note: README mentions GSAP but it's not actually imported or used in current implementation

## Deployment

### Automatic Deployment
- Push any changes to `main` branch
- GitHub Actions automatically deploys to GitHub Pages
- No manual deployment needed

### DNS Configuration
Site uses custom domain `atlaslogged.com` configured via:
- CNAME file in root
- DNS A records pointing to GitHub Pages IPs (see DEPLOYMENT_CHECKLIST.md:101-107)

## Important Configuration

### Chatwoot Live Chat
- Already configured and active in production (index.html:202-225)
- Base URL: `https://app.chatwoot.com`
- Website token: `xiyWsj719fc5BZUsg8i4n88i`

### App Store Links
- App ID: 6538725214
- Smart App Banner enabled (index.html:30)
- Download links point to: `https://apps.apple.com/us/app/atlas-logged/id6538725214`

### SEO Metadata
- Structured data (JSON-LD) at index.html:44-67
- Open Graph tags for social sharing (index.html:14-19)
- Twitter Card metadata (index.html:22-25)
- Canonical URL: https://atlaslogged.com/

## File References

### Key Files to Understand
- `index.html:92-116` - Navigation component with mobile menu
- `index.html:121-134` - Hero section with App Store badge
- `css/style.css:64-156` - Navigation glassmorphism styling
- `css/style.css:242-309` - Feature card styling with hover effects
- `js/main.js:10-21` - Safari browser detection for progressive enhancement
- `js/main.js:62-91` - Mobile menu toggle implementation

### Documentation Files
- `README.md` - Comprehensive setup and customization guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment verification checklist
- `deploy.sh` - Legacy manual deployment script (not used; GitHub Actions handles deployment)

### Design Philosophy
- **Prioritize working UX over extreme visual effects**
- Clean, professional glassmorphism that works cross-browser
- Subtle progressive enhancement for modern browsers
- Never sacrifice layout/readability for visual effects

## Browser Support
- Chrome/Edge: Latest 2 versions
- Safari: Latest 2 versions (with glassmorphism fallback)
- Firefox: Latest 2 versions
- Mobile: iOS 14+, Chrome Android latest
