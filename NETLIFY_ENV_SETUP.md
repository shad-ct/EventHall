# Netlify Environment Variables Setup

## Required Environment Variables for Production

Go to your Netlify dashboard: **Site settings → Environment variables**

Set these variables for the **Production** deploy context:

### API Configuration
```
VITE_API_BASE_URL=https://eventhall-api.onrender.com/api
```

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=events-fc01b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=events-fc01b
VITE_FIREBASE_STORAGE_BUCKET=events-fc01b.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
VITE_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
```

## Steps to Fix CORS Error

1. **Update Environment Variables:**
   - Go to Netlify Dashboard → parivadi.netlify.app
   - Site settings → Environment variables
   - Edit `VITE_API_BASE_URL` for **Production** context
   - Change from `localhost:3001/api` to `https://eventhall-api.onrender.com/api`

2. **Trigger New Deployment:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for build to complete

3. **Verify:**
   - Check browser console - should connect to Render, not localhost
   - No more CORS errors from `localhost:3001`

## Current Issue

The deployed frontend at `https://parivadi.netlify.app` is trying to connect to `http://localhost:3001/api` instead of your production backend at `https://eventhall-api.onrender.com/api`.

This happens because:
- Vite bakes environment variables into the build at build-time
- The production deploy was built with the wrong API URL
- Need to update the variable and redeploy

## Quick Fix Command

In Netlify CLI (if installed):
```bash
netlify env:set VITE_API_BASE_URL https://eventhall-api.onrender.com/api --context production
netlify deploy --prod
```

Or just use the Netlify UI as described above.
