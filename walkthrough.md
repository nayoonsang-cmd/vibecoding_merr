# Vercel Deployment & Fixes Walkthrough

## Changes Made
I have fixed the errors that were preventing the application from working correctly and building:

1.  **Fixed AI Model Name**: Changed `gemini-2.5-flash` (which doesn't exist yet) to `gemini-1.5-flash` in `src/lib/ai-service.ts`.
2.  **Fixed Cron Job Reliability**: Added `await` to the `runDailyCheck()` call in `src/app/api/cron/route.ts`. This ensures the Vercel Serverless Function doesn't terminate before the scraping and emailing is finished.
3.  **Improved Scraping**: Added a `User-Agent` header to the Naver scraper in `src/lib/naver-scraper.ts` to prevent being blocked by Naver's anti-bot protections.

## Verification
I ran `npm run build` and it completed successfully.

```bash
> vibecoding@0.1.0 build
> next build

   ▲ Next.js 16.0.3 (Turbopack)
   - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully in 6.4s
   Running TypeScript ...
   Collecting page data using 7 workers ...
 ✓ Generating static pages using 7 workers (7/7) 
   Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/analyze
├ ƒ /api/cron
└ ƒ /api/feed

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## Vercel Deployment Steps

To finish the deployment on Vercel:

1.  **Push Changes**: Push the latest code to your GitHub repository.
2.  **Vercel Dashboard**: Go to your Vercel dashboard and import the project (if not already connected).
3.  **Environment Variables**: Ensure the following environment variables are set in the Vercel Project Settings:
    *   `AI_API_KEY`: Your Google Gemini API Key.
    *   `EMAIL_USER`: Gmail address for sending emails.
    *   `EMAIL_PASS`: Gmail App Password (not your regular password).
    *   `TARGET_EMAIL`: The email address to receive the digest.
4.  **Deploy**: Click "Deploy".
5.  **Cron Jobs**: Vercel will automatically detect the `vercel.json` file and set up the cron job to run daily at 10:00 AM (UTC+9, assuming the cron expression `0 1 * * *` corresponds to 10 AM KST if the server is UTC, which is `01:00 UTC` -> `10:00 KST`).
    *   *Note*: `0 1 * * *` in UTC is 10:00 AM KST.
