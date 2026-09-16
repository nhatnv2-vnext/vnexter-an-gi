# Fix: Admin Redirect to Localhost in Production

## Issue Summary

**Problem**: When accessing `/admin` routes on the production site, users were redirected to `http://127.0.0.1:3000` instead of staying on the production domain, making the admin panel unreachable.

## Root Cause Analysis

### Technical Details

1. **NextAuth.js v5 URL Detection**: NextAuth.js v5 uses automatic URL detection based on incoming HTTP request headers:
   - `X-Forwarded-Host` header (for the hostname)
   - `X-Forwarded-Proto` header (for the protocol: http/https)
   - `Host` header (fallback)

2. **trustHost Setting**: The app correctly has `trustHost: true` in `auth.config.ts`, which tells NextAuth to trust these proxy headers.

3. **Production Environment Issue**: In some Vercel or reverse proxy configurations, these headers may:
   - Be missing or incorrectly set
   - Point to internal/localhost addresses
   - Use http instead of https

4. **Fallback Behavior**: When NextAuth can't determine the correct public URL from headers, it may construct URLs using `localhost:3000` as a fallback.

### Why This Happens

- Vercel/hosting platforms run the Next.js server behind reverse proxies
- If the reverse proxy doesn't forward the correct headers, NextAuth sees the internal server address
- This is especially common with custom domain configurations or certain Vercel settings

## Solution

Set the `AUTH_URL` environment variable explicitly in production to override auto-detection.

### Implementation

The fix adds documentation and guidance for setting `AUTH_URL`:

```bash
AUTH_URL=https://your-production-domain.vercel.app
```

This variable tells NextAuth exactly which URL to use for constructing redirect URLs, callback URLs, and other authentication flows.

## Deployment Steps

### For Vercel

1. Open your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add a new variable:
   - **Name**: `AUTH_URL`
   - **Value**: `https://your-actual-domain.vercel.app` (replace with your real domain)
   - **Environment**: Production (or All if you want consistency)
4. Save and redeploy

### For Other Platforms

Set the `AUTH_URL` environment variable in your hosting platform's configuration:

- **Railway**: Add in Variables section
- **Render**: Add in Environment tab
- **Docker**: Include in docker-compose.yml or Dockerfile ENV
- **Self-hosted**: Export in your shell or systemd service

## Verification

After setting `AUTH_URL` and redeploying:

1. Visit your production admin URL: `https://your-domain.com/admin`
2. You should see the login page (not a redirect to localhost)
3. After logging in, you should stay on your production domain
4. Check the URL bar—it should remain `https://your-domain.com/admin`

## Why This Fix Works

- **Explicit Configuration**: `AUTH_URL` provides an explicit, reliable base URL
- **Overrides Auto-Detection**: Takes precedence over header-based detection
- **No Code Changes**: Only configuration, preserving all existing functionality
- **Backward Compatible**: Sites where auto-detection works don't need to set it
- **Follows Best Practices**: Recommended by NextAuth.js documentation for production

## Impact

- ✅ **Zero breaking changes**: Only adds documentation and comments
- ✅ **Optional configuration**: Only needed when auto-detection fails
- ✅ **Local development unchanged**: `localhost:3000` still works without `AUTH_URL`
- ✅ **Production-ready**: Fixes the immediate issue without side effects

## Files Changed

1. **`.env.example`**: Added `AUTH_URL` documentation
2. **`README.md`**: Added deployment instructions and troubleshooting note
3. **`auth.config.ts`**: Added explanatory comments about `trustHost` and `AUTH_URL`

## References

- [NextAuth.js v5 Deployment Guide](https://authjs.dev/getting-started/deployment)
- [NextAuth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [GitHub Discussion: Redirect Issues](https://github.com/nextauthjs/next-auth/discussions/13377)
- [GitHub Issue #10928: URL Detection](https://github.com/nextauthjs/next-auth/issues/10928)

## Prevention

To prevent similar issues in future deployments:

1. Always set `AUTH_URL` in production environment variables
2. Ensure reverse proxies forward `X-Forwarded-Host` and `X-Forwarded-Proto` headers
3. Verify admin access immediately after deployment
4. Use HTTPS in production (required for secure cookies)

## Support

If the issue persists after setting `AUTH_URL`:

1. Verify the environment variable is set correctly (no typos, correct domain)
2. Ensure the variable is in the Production environment
3. Confirm you redeployed after adding the variable
4. Check Vercel logs for any AUTH-related warnings
5. Verify your domain is correctly configured in Vercel
