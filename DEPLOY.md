# Deployment Guide

## Quick Deploy

Your site is ready to deploy to production. Follow these steps:

### 1. Push development branch
```bash
git push origin development
```

### 2. Merge to main (triggers auto-deploy)
```bash
git checkout main
git merge development
git push origin main
```

### 3. Verify deployment
Your site will auto-deploy to Cloudflare Pages at:
**https://schrodingers-site.pages.dev**

---

## Environment Variables (Optional)

For better build performance, add this to your Cloudflare Pages settings:

```
GITHUB_TOKEN=your_github_personal_access_token
```

This increases GitHub API rate limit from 60/hour to 5,000/hour.

### How to get a GitHub token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `public_repo`
4. Copy token and add to Cloudflare Pages environment variables

---

## Build Status

- ✓ All phases complete (0-7)
- ✓ 9 pages built successfully
- ✓ Build time: ~3s
- ✓ No build errors
- ✓ SEO metadata complete
- ✓ Accessibility features implemented
- ✓ Mobile optimized

---

## What's Included

### Pages
1. Homepage with atmospheric zones
2. Projects directory (27 repos, filterable)
3. Individual project pages with visualizations
4. Blog index (local + Substack)
5. Individual blog posts
6. Research publications index
7. Individual research papers
8. About page
9. Tag-based project pages

### Features
- Particle atmosphere (Canvas API)
- WebGL shader gradients
- 4 D3.js visualization types
- Frosted glass aesthetic
- Scroll animations
- GitHub API integration
- Substack RSS integration
- ORCID API integration

---

## Post-Deployment

### Verify
- [ ] Homepage loads with particle atmosphere
- [ ] Projects page shows all repos
- [ ] Filtering works (search, language, topic)
- [ ] Blog posts load
- [ ] Research page displays
- [ ] Mobile responsive on real devices

### Monitor
- Check Cloudflare Pages dashboard for build logs
- Monitor performance with Cloudflare Analytics
- Check for any console errors in browser DevTools

---

## Next Steps (Optional)

1. **Custom Domain**: Add your domain in Cloudflare Pages settings
2. **Analytics**: Enable Cloudflare Web Analytics
3. **Content**: Add more blog posts to `/src/content/blog/`
4. **Research**: Add papers to `/src/content/research/`
5. **Projects**: Feature more repos by pinning them on GitHub

---

## Support

See BUILD_LOG.md for full technical details, known issues, and troubleshooting.

**Status**: ✓ READY FOR DEPLOYMENT
