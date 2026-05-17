# YTNiches Deployment Guide

## Step 1 — Push to GitHub
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/ytniches.git
git push -u origin main

## Step 2 — Connect Vercel
1. Go to vercel.com
2. Import GitHub repository
3. Framework: Next.js (auto-detected)
4. Add all environment variables from .env.production
5. Deploy

## Step 3 — Connect domain
1. In Vercel → Settings → Domains
2. Add: ytniches.com
3. Add: www.ytniches.com
4. Copy nameservers to your domain registrar
5. Wait 24-48 hours for DNS propagation

## Step 4 — Configure Supabase for production
1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: https://ytniches.com
3. Redirect URLs: 
   - https://ytniches.com/auth/callback
   - https://ytniches.com/auth/reset-password
4. Enable Google OAuth:
   - Create Google Cloud project
   - Enable Google OAuth API
   - Add credentials to Supabase

## Step 5 — Run migrations on production
supabase db push --db-url your_production_db_url

## Step 6 — Configure LemonSqueezy webhook
1. Set webhook URL: https://ytniches.com/api/webhooks/lemonsqueezy
2. Verify all events are selected

## Step 7 — Test production
- Sign up with Google ✅
- Sign up with email ✅
- Browse free niches ✅
- Premium niche shows lock ✅
- Checkout Pro plan ✅
- Webhook fires + plan updates ✅
- Dashboard shows Pro features ✅
- Admin panel accessible ✅

## Step 8 — Submit to Google Search Console
1. Go to search.google.com/search-console
2. Add property: https://ytniches.com
3. Verify via HTML tag in metadata
4. Submit sitemap: https://ytniches.com/sitemap.xml

## Step 9 — Submit to Bing Webmaster
1. bing.com/webmasters
2. Add site + submit sitemap

## Monitoring
- Vercel Analytics: enabled by default
- Supabase Dashboard: monitor DB usage
- LemonSqueezy Dashboard: monitor payments
- Google Search Console: monitor search performance
