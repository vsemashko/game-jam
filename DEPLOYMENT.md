# Deployment Guide

This game is a static web application that can be deployed to various hosting platforms. Below are guides for the most popular options.

## Prerequisites

The game requires:
- No build process
- No server-side code
- ES6 module support in browsers
- CORS-friendly hosting (for module loading)

## Option 1: GitHub Pages (Recommended)

GitHub Pages is free and integrates directly with your repository.

### Setup Steps

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to `Settings` → `Pages`
   - Under "Source", select `main` branch
   - Select `/ (root)` as the folder
   - Click `Save`

3. **Access your game**:
   - Your game will be available at: `https://<username>.github.io/<repository-name>/`
   - It may take a few minutes for the first deployment

4. **Custom Domain (Optional)**:
   - In the Pages settings, add your custom domain
   - Create a `CNAME` file in the repository root with your domain
   - Configure DNS with your domain provider

### Notes
- The `.nojekyll` file prevents Jekyll processing (already included)
- Deployments update automatically when you push to main
- Free SSL certificate included

## Option 2: Netlify

Netlify offers continuous deployment with additional features.

### Setup Steps

1. **Create Netlify account**:
   - Go to [netlify.com](https://www.netlify.com)
   - Sign up (free tier available)

2. **Deploy from Git**:
   - Click "New site from Git"
   - Connect to GitHub/GitLab/Bitbucket
   - Select your repository
   - Build settings:
     - Build command: *(leave empty)*
     - Publish directory: `.`
   - Click "Deploy site"

3. **Access your game**:
   - Netlify provides a URL: `https://<random-name>.netlify.app`
   - Customize the subdomain in Site Settings

### Configuration
- `netlify.toml` is already configured (included in repo)
- Provides:
  - Security headers
  - Cache optimization
  - Automatic HTTPS
  - Deploy previews for PRs

### Custom Domain
- Go to Domain Settings → Add custom domain
- Follow Netlify's DNS configuration guide
- Free SSL certificate included

## Option 3: Vercel

Similar to Netlify with excellent performance.

### Setup Steps

1. **Create Vercel account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up (free tier available)

2. **Import repository**:
   - Click "New Project"
   - Import your Git repository
   - Framework Preset: "Other"
   - Build settings:
     - Build Command: *(leave empty)*
     - Output Directory: `.`
   - Click "Deploy"

3. **Access your game**:
   - Vercel provides a URL: `https://<project-name>.vercel.app`

## Option 4: Local Server Testing

Before deploying, test locally:

### Python Server
```bash
python3 serve.py
# or
python3 -m http.server 8000
```

### Node.js Server
```bash
npx http-server -p 8000
```

### VS Code Live Server
- Install "Live Server" extension
- Right-click `index.html`
- Select "Open with Live Server"

## Post-Deployment Checklist

After deploying, verify:

- [ ] Game loads without errors
- [ ] All assets load (check browser console)
- [ ] Controls work properly
- [ ] Sound effects play
- [ ] Both boss levels are accessible
- [ ] Level selection persists
- [ ] Stats are saved (localStorage)
- [ ] All difficulty modes work
- [ ] Help overlay appears (H key)
- [ ] Mobile viewport is acceptable (if supporting mobile)

## Updating Meta Tags

After deployment, update the Open Graph URL in `index.html`:

```html
<meta property="og:url" content="https://your-actual-domain.com">
```

This improves social media sharing.

## Performance Tips

The game is already optimized, but for production:

1. **Enable Gzip/Brotli**: Most platforms do this automatically
2. **CDN**: GitHub Pages, Netlify, and Vercel all use CDNs
3. **Browser Caching**: Configured in `netlify.toml`
4. **Monitor Performance**: Use browser DevTools to check FPS

## Troubleshooting

### Issue: "Failed to load module script"
- **Cause**: CORS or MIME type issues
- **Solution**: Ensure hosting serves `.js` files with `Content-Type: application/javascript`
- All recommended platforms handle this correctly

### Issue: Black screen on load
- **Cause**: JavaScript errors
- **Solution**: Check browser console for errors
- Verify all file paths are correct (case-sensitive on some hosts)

### Issue: Sounds don't play
- **Cause**: Autoplay policies
- **Solution**: User interaction is required (already handled by start screen)

### Issue: Stats don't persist
- **Cause**: localStorage blocked or disabled
- **Solution**: User must enable cookies/storage in browser settings

## Environment-Specific URLs

Update URLs in your deployment based on environment:

- **Development**: `http://localhost:8000`
- **Staging**: Use Netlify/Vercel preview URLs
- **Production**: Your final domain

---

**Recommended Choice**: GitHub Pages for simplicity, Netlify for advanced features.

**Estimated Setup Time**: 5-10 minutes for first deployment.

Enjoy sharing your game! 🎮🌻
