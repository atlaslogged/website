# Atlas Logged Landing Page

Modern, animated landing page for atlaslogged.com built with vanilla HTML, CSS, and JavaScript.

## Features

- **Liquid Glass Effects**: Optional WebGL-based glass effects with real-time background blur
  - Desktop: Enabled by default
  - Mobile: Opt-in via popup (resets on page reload)
  - Live controls panel for adjusting glass parameters
- **Smooth Animations**: GSAP-powered scroll animations and transitions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Privacy-Focused Content**: Highlights the app's privacy-first approach
- **Interactive FAQ**: Accordion-style FAQ section
- **Chatwoot Integration**: Live chat support widget with GDPR-compliant cookie consent
  - Cookie consent banner for website visitors
  - Automatic consent for iOS app users via URL parameter
  - Session persistence with localStorage
- **Fast Performance**: No build step, lightweight, SEO-friendly
- **Accessibility**: WCAG compliant with screen reader support

## Structure

```
website/
├── index.html                      # Main landing page
├── privacy.html                    # Privacy policy page
├── location-faq.html               # Location tracking FAQ
├── changelog.html                  # Release notes and version history
├── roadmap.html                    # Product roadmap
├── css/
│   ├── style.css                  # Custom styles and animations
│   └── liquid-glass.css           # Liquid glass effect styles
├── js/
│   ├── main.js                    # Interactive elements and GSAP animations
│   ├── cookie-consent.js          # GDPR-compliant cookie consent for Chatwoot
│   ├── feature-flags.js           # Feature flag management
│   ├── liquid-glass-container.js  # WebGL container for liquid glass
│   ├── liquid-glass-button.js     # Glass button component
│   └── liquid-glass-controls.js   # Settings and controls for liquid glass
├── assets/
│   ├── logo.png                   # App logo (1024x1024)
│   ├── app-store-badge.svg        # App Store download badge
│   └── screenshots/               # iOS app screenshots
├── CNAME                          # Custom domain configuration
└── README.md                      # This file
```

## Setup

### 1. Local Development

Simply open `index.html` in your browser. No build step required!

For a local server:
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server .

# Then visit http://localhost:8000
```

### 2. Chatwoot Configuration

The Chatwoot live chat widget is **already configured** and includes GDPR-compliant cookie consent management.

**How it works:**

1. **Website Visitors**: See a cookie consent banner on first visit
   - Must accept/reject before Chatwoot loads
   - Choice stored in localStorage
   - Banner doesn't show again after decision

2. **iOS App Users**: Automatically consent via URL parameter
   - App passes `?consent=chat` parameter
   - No banner shown (clicking "Chat with Us" = consent)
   - Widget auto-opens immediately

**Configuration:**

The Chatwoot widget is configured in `js/cookie-consent.js`:

```javascript
const CHATWOOT_CONFIG = {
    baseUrl: 'https://app.chatwoot.com',
    websiteToken: 'xiyWsj719fc5BZUsg8i4n88i'
};
```

**URL Parameters:**

- `?consent=chat` - Auto-accept cookies and open chat (used by iOS app)
- Regular visit - Show cookie banner if no previous decision

**GDPR Compliance:**

- ✅ Explicit opt-in required for website visitors
- ✅ App users consent by clicking "Chat with Us" button
- ✅ Privacy policy link displayed before action
- ✅ Granular control with accept/reject options
- ✅ Session persistence via cookies (with consent)

**Testing:**

```bash
# Test website visitor flow (shows banner)
open https://atlaslogged.com

# Test app user flow (auto-opens, no banner)
open "https://atlaslogged.com?consent=chat"
```

### 3. Add App Store Link

Update the download button links in `index.html`:
- Search for `href="#"` in the download buttons
- Replace with your actual App Store URL

### 4. Add Screenshots

Add iOS app screenshots to `assets/screenshots/`:
- Recommended: 1170 x 2532 pixels (iPhone 14 Pro size)
- Use iPhone mockups for professional presentation
- Add 4-6 screenshots showcasing key features

## Deployment

### GitHub Pages

The site is configured to auto-deploy via GitHub Actions when changes are pushed to `main`.

**Setup Steps:**

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The site will deploy automatically

2. **Configure DNS** (for atlaslogged.com):
   - Add these DNS records at your domain provider:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153

   Type: CNAME
   Name: www
   Value: [username].github.io
   ```

3. **Enable HTTPS**:
   - In GitHub Pages settings, check "Enforce HTTPS"
   - DNS propagation may take 24-48 hours

4. **Verify Deployment**:
   - Push changes to `main` branch
   - Check Actions tab for deployment status
   - Visit https://atlaslogged.com

### Manual Deployment

To deploy elsewhere (Netlify, Vercel, etc.):
```bash
# Just upload the entire website/ directory
# No build step required!
```

## Customization

### Colors

Update colors in `css/style.css`:
```css
:root {
    --primary-blue: #3b82f6;
    --secondary-purple: #a855f7;
    --dark-bg: #0f172a;
}
```

### Content

- **Hero Section**: Update tagline and description in `index.html`
- **Features**: Modify feature cards with your app's unique features
- **FAQ**: Add/remove questions in the FAQ section
- **Privacy Policy**: Update links to your actual policy pages

### Animations

Customize animations in `js/main.js`:
- Adjust GSAP animation timing
- Modify scroll trigger thresholds
- Change easing functions

## Cookie Consent & GDPR Compliance

### Implementation Details

The website uses a custom cookie consent system (`js/cookie-consent.js`) that handles GDPR-compliant consent for the Chatwoot live chat widget.

**Key Features:**

- **Smart Detection**: Automatically detects if user is coming from the iOS app
- **URL-Based Consent**: `?consent=chat` parameter grants automatic consent
- **User Agent Detection**: Recognizes `AtlasLogged/` user agent from iOS app
- **localStorage Persistence**: Remembers user's consent choice
- **Auto-Open Logic**: Opens chat widget automatically when coming from app

**Flow Diagram:**

```
Website Visitor:
1. Land on atlaslogged.com
2. See cookie consent banner
3. Accept/Reject → Choice stored in localStorage
4. If accepted → Chatwoot loads
5. Return visits → No banner (choice remembered)

iOS App User:
1. Click "Chat with Us" in app
2. See disclaimer: "By using chat, you agree to our privacy policy"
3. WebView loads: atlaslogged.com?consent=chat
4. JavaScript detects parameter → Auto-accept cookies
5. Chatwoot loads and opens automatically
6. No banner shown (consent via button click)
```

**Integration with iOS App:**

The iOS app (`ChatWebView.swift`) automatically appends `?consent=chat` to the URL:

```swift
// iOS App Integration
var urlWithConsent = url
if var components = URLComponents(url: url, resolvingAgainstBaseURL: false) {
    var queryItems = components.queryItems ?? []
    queryItems.append(URLQueryItem(name: "consent", value: "chat"))
    components.queryItems = queryItems
    urlWithConsent = components.url ?? url
}
```

**Manual Control:**

For debugging/testing, you can manually control consent via browser console:

```javascript
// Check consent status
ChatwootConsent.getStatus()

// Manually accept
ChatwootConsent.accept()

// Manually reject
ChatwootConsent.reject()

// Reset consent (shows banner again)
ChatwootConsent.reset()
```

**Privacy Policy Integration:**

The privacy policy (`privacy.html`) includes a comprehensive "Customer Support & Live Chat" section explaining:
- Cookie usage for session persistence
- Anonymous chat option (no email required)
- What data is collected by Chatwoot
- GDPR compliance measures
- Link to Chatwoot's privacy policy

## Technologies Used

- **Tailwind CSS** (via CDN): Utility-first CSS framework
- **GSAP 3.12**: Professional-grade animation library
- **ScrollTrigger**: Scroll-based animations
- **Vanilla JavaScript**: No framework dependencies
- **Chatwoot**: Open-source live chat support
- **[liquid-glass-js](https://github.com/dashersw/liquid-glass-js)**: WebGL-based liquid glass effect library
- **[html2canvas](https://html2canvas.hertzen.com/)**: Screenshot library for background capture (used by liquid-glass-js)

## Performance

- Lighthouse Score: 95+ (Performance, Accessibility, Best Practices, SEO)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- No build step or bundling required

## Browser Support

- Chrome/Edge: Latest 2 versions
- Safari: Latest 2 versions
- Firefox: Latest 2 versions
- Mobile Safari: iOS 14+
- Chrome Android: Latest

## Accessibility

- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Reduced motion support

## Future Enhancements

- [ ] Add blog section for travel stories
- [ ] Implement newsletter signup
- [ ] Add testimonials/reviews section
- [ ] Create video demo section
- [ ] Add multi-language support
- [ ] Implement dark/light mode toggle

## License

Proprietary - Atlas Logged © 2025

## Support

For questions or issues:
- Email: support@atlaslogged.com
- Privacy Policy: https://atlaslogged.com/privacy.html
- FAQ: https://atlaslogged.com/location-faq.html
