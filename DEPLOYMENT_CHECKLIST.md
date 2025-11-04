# Atlas Logged Website Deployment Checklist

Quick checklist to get your landing page live on atlaslogged.com

## Pre-Launch Checklist

### Required Steps

- [ ] **Enable GitHub Pages**
  - Settings → Pages → Source: GitHub Actions

- [ ] **Configure DNS Records**
  - Add 4 A records pointing to GitHub Pages IPs
  - Add CNAME record for www subdomain
  - Wait 15-30 minutes for propagation

- [ ] **Push to GitHub**
  ```bash
  git add website/ .github/workflows/
  git commit -m "Add landing page for atlaslogged.com"
  git push origin main
  ```

- [ ] **Verify Deployment**
  - Check Actions tab for successful deployment
  - Visit https://atlaslogged.com
  - Test on mobile and desktop

### Recommended Steps

- [ ] **Configure Chatwoot**
  - Uncomment Chatwoot code in index.html
  - Add your Chatwoot URL and token
  - Test chat widget

- [ ] **Add App Store Link**
  - Replace `href="#"` with actual App Store URL
  - Test download button links

- [ ] **Add Screenshots**
  - Create 4-6 iPhone screenshots
  - Add to assets/screenshots/
  - Update HTML to display them

- [ ] **Enable HTTPS**
  - Settings → Pages → Enforce HTTPS
  - Wait for SSL certificate provisioning

### Optional Enhancements

- [ ] **Add Analytics**
  - Google Analytics or Plausible
  - Add tracking code to index.html

- [ ] **Submit to Search Engines**
  - Google Search Console
  - Bing Webmaster Tools

- [ ] **Create sitemap.xml**
  - Add to website/ root
  - Submit to search engines

- [ ] **Add robots.txt**
  - Allow all crawlers
  - Link to sitemap

- [ ] **Social Media Setup**
  - Verify Open Graph tags work
  - Create social media posts
  - Share in relevant communities

## Post-Launch Testing

- [ ] Test on browsers:
  - [ ] Chrome/Edge
  - [ ] Safari
  - [ ] Firefox
  - [ ] Mobile Safari
  - [ ] Chrome Android

- [ ] Verify features:
  - [ ] All links work
  - [ ] Animations play smoothly
  - [ ] FAQ accordion opens/closes
  - [ ] Chatwoot widget appears
  - [ ] Images load correctly
  - [ ] Responsive on mobile

- [ ] Performance check:
  - [ ] Run PageSpeed Insights
  - [ ] Check Lighthouse scores
  - [ ] Test loading speed

- [ ] Accessibility check:
  - [ ] Test with screen reader
  - [ ] Verify keyboard navigation
  - [ ] Check color contrast

## DNS Configuration Reference

### A Records (for atlaslogged.com)
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### CNAME Record (for www.atlaslogged.com)
```
[your-github-username].github.io
```

## Quick Commands

### Test locally
```bash
cd website
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Check DNS propagation
```bash
dig atlaslogged.com +short
dig www.atlaslogged.com +short
```

### Deploy changes
```bash
git add website/
git commit -m "Update website"
git push origin main
```

### View deployment logs
```bash
# Go to GitHub → Actions tab
# Or visit: https://github.com/[username]/atlas-logged/actions
```

## Troubleshooting

### Site not loading?
1. Check Actions tab for deployment status
2. Verify DNS records (may take 24-48 hours)
3. Clear browser cache
4. Try incognito/private mode

### Animations not working?
1. Check browser console for errors
2. Verify GSAP loaded from CDN
3. Test in different browser

### Chatwoot not showing?
1. Verify code is uncommented
2. Check credentials are correct
3. Open browser console for errors

## Support

- Documentation: `website/README.md`
- Setup Guide: `WEBSITE_SETUP.md`
- Email: support@atlascodes.ai

---

Last updated: 2024-10-12
