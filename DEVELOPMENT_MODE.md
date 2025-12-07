# 🔧 Development Mode - Mock Authentication

## Overview

The application is currently running in **Development/Testing Mode** with a **mock authentication system**. This allows you to test the entire application without Firebase authentication.

## What's Changed

### 1. **Mock Authentication System**
- Firebase authentication has been **paused/disabled**
- A default user profile is automatically created on app load
- Default email: `muhammedshad9895@gmail.com`
- Default role: `ULTIMATE_ADMIN` (full access to all features)

### 2. **CSS/Styling Fixed**
- Fixed Tailwind CSS imports in `src/index.css`
- Updated `src/main.tsx` to properly import CSS
- Styling now working correctly across all pages

### 3. **Default User Profile**
```json
{
  "id": "mock-user-dev",
  "firebaseUid": "mock-firebase-uid",
  "email": "muhammedshad9895@gmail.com",
  "fullName": "Developer User",
  "role": "ULTIMATE_ADMIN",
  "collegeName": "Test College",
  "isStudent": true,
  "interests": [
    "Hackathon",
    "Workshop",
    "Technical Talk"
  ]
}
```

## How to Use

1. **Start the Frontend:**
   ```bash
   npm run dev
   ```
   - Opens on: `http://localhost:5174` (or next available port)

2. **Automatic Login:**
   - The app will automatically log you in with the mock profile
   - No need to click "Sign in" button
   - You'll be redirected to the Home page

3. **Access All Features:**
   - ✅ Home page with personalized feeds
   - ✅ Search and filter events
   - ✅ View your profile
   - ✅ Access settings
   - ✅ Admin dashboard (event creation)
   - ✅ Ultimate admin dashboard (approvals)

4. **Logout:**
   - Go to Settings page
   - Click "Sign Out"
   - This clears the mock token from localStorage

## File Changes

### Frontend Changes
- `src/contexts/AuthContext.tsx` - Replaced Firebase logic with mock auth
- `src/lib/api.ts` - Updated to use localStorage token instead of Firebase
- `src/pages/LoginPage.tsx` - Updated UI to show development mode
- `src/index.css` - Fixed Tailwind imports
- `src/main.tsx` - Added CSS import

### Backend Notes
- Server auth middleware still expects Bearer tokens
- Mock token is `mock-dev-token-for-testing`
- You may need to update backend auth middleware to accept this token

## To Return to Firebase Authentication

1. **Restore the original AuthContext:**
   ```bash
   git checkout src/contexts/AuthContext.tsx
   ```

2. **Restore the original API client:**
   ```bash
   git checkout src/lib/api.ts
   ```

3. **Update Firebase credentials in `.env`:**
   - Add your Firebase Admin SDK private key to `FIREBASE_PRIVATE_KEY`

4. **Restart the app:**
   ```bash
   npm run dev
   ```

## Testing the Application

### Recommended Testing Flow

1. **Login**
   - Click button or auto-redirect happens
   - You're logged in as ULTIMATE_ADMIN

2. **Explore Home Page**
   - See personalized event feed
   - Events grouped by interests

3. **Search Events**
   - Try searching with filters
   - Test category, district, date filters

4. **Create an Event** (Admin)
   - Go to Admin Dashboard
   - Create a test event
   - Event status: PENDING_APPROVAL

5. **Approve Event** (Ultimate Admin)
   - Go to Ultimate Admin Dashboard
   - View pending events
   - Approve/Reject the event

6. **Register for Event**
   - Go to Home or Search
   - Click on an event
   - Click "Register" button

7. **Like Events**
   - Click heart icon on event cards
   - Check Profile > Liked Events

8. **Manage Profile**
   - Go to Settings
   - Update interests
   - Change profile info

## API Integration

The mock auth uses a localStorage token that's sent as:
```
Authorization: Bearer mock-dev-token-for-testing
```

If you want to test with a backend server:
1. Update `VITE_API_BASE_URL` in `.env`
2. Modify backend auth middleware to accept mock tokens during development
3. Update `server/middleware/auth.ts`:
   ```typescript
   if (token === 'mock-dev-token-for-testing') {
     // Allow mock token in development
     req.user = mockUser;
     return next();
   }
   ```

## Troubleshooting

### Port Already in Use
- The app will automatically try the next available port
- Check the terminal output for the actual port (usually 5174, 5175, etc.)

### CSS Not Loading
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Restart the dev server

### App Stuck on Login
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Refresh the page

### Mock User Not Loading
- Open browser DevTools Console
- Check for error messages
- Restart dev server

## Environment Variables

Current `.env` setup:
```env
# Database
DATABASE_URL="..." # Your Neon connection

# Firebase Config (not used in mock mode)
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
# ... other Firebase variables

# Server
PORT=3001
NODE_ENV=development

# Admin Email
ULTIMATE_ADMIN_EMAILS="muhammedshad9895@gmail.com"

# Frontend/Backend URLs
FRONTEND_URL="http://localhost:5173"
VITE_API_BASE_URL="http://localhost:3001/api"
```

## Next Steps

When ready for production:
1. ✅ Re-enable Firebase authentication
2. ✅ Set up proper backend auth validation
3. ✅ Configure CORS properly
4. ✅ Add Firebase Admin SDK private key
5. ✅ Run database migrations
6. ✅ Test with real Firebase

---

**Current Status:** ✅ Frontend working perfectly with mock auth  
**Styling:** ✅ Tailwind CSS fully functional  
**Next:** Start backend and test full integration
