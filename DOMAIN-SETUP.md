# Custom Domain Setup: schrodingers.site

## Cloudflare Pages Custom Domain Configuration

### Step 1: Add Custom Domain in Cloudflare Pages

1. Go to your Cloudflare dashboard
2. Navigate to **Workers & Pages** → **schrodingers-site**
3. Click on **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `schrodingers.site`
6. Click **Continue**

### Step 2: Configure DNS Records

Cloudflare will automatically configure the DNS records if your domain is already on Cloudflare. If not, you'll need to add:

**For root domain (schrodingers.site):**
- Type: `CNAME`
- Name: `@` (or `schrodingers.site`)
- Target: `schrodingers-site.pages.dev`
- Proxy status: Proxied (orange cloud)

**For www subdomain (optional):**
- Type: `CNAME`
- Name: `www`
- Target: `schrodingers-site.pages.dev`
- Proxy status: Proxied (orange cloud)

### Step 3: SSL/TLS Configuration

1. Go to **SSL/TLS** in your Cloudflare dashboard
2. Set encryption mode to **Full** or **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

### Step 4: Verify

Once DNS propagates (usually 5-15 minutes), your site will be available at:
- https://schrodingers.site
- https://www.schrodingers.site (if configured)

The old URL will still work:
- https://schrodingers-site.pages.dev

## Current Configuration

- **Primary Domain**: https://schrodingers.site
- **Cloudflare Pages URL**: https://schrodingers-site.pages.dev
- **Framework**: Next.js 15 (static export)
- **Build Command**: `npm run build`
- **Output Directory**: `out/`

## Troubleshooting

**If the domain doesn't work:**
1. Check DNS records are correct
2. Wait for DNS propagation (use https://dnschecker.org)
3. Clear browser cache
4. Check Cloudflare Pages deployment logs

**If you see SSL errors:**
1. Ensure SSL/TLS mode is set to **Full** or **Full (strict)**
2. Wait a few minutes for SSL certificate provisioning
3. Enable **Always Use HTTPS** in SSL/TLS settings
