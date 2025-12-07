# Quick Start - Firebase Setup & Testing

## Step 1: Enable Firestore Database

**Time: 2 minutes**

1. Open Firebase Console: https://console.firebase.google.com/
2. Select your project: **events-fc01b**
3. Left sidebar → **Build** → **Firestore Database**
4. Click **Create database**
5. **Location**: Select closest region (e.g., us-east1)
6. **Security rules**: Select **Start in test mode**
7. Click **Enable**

✅ **Firestore is now ready!**

---

## Step 2: Verify Security Rules

After Firestore is created, go to **Firestore → Rules** tab and verify:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 7);
    }
  }
}
```

The default test mode rule above is fine for development. ✅

---

## Step 3: Run Your App

```bash
# In your project directory
npm run dev
```

App runs on: http://localhost:5173

---

## Step 4: Test Google Sign-In

1. Open http://localhost:5173 in your browser
2. Click **"Sign in with Google"**
3. Complete the Google OAuth flow
4. You should see the **"Complete Your Profile"** page

✅ **Sign-in working!**

---

## Step 5: Verify User Data in Firestore

1. Go back to Firebase Console
2. **Firestore Database** → **Data**
3. You should see a new **`users`** collection
4. Click to expand and see your user document with:
   - `id`
   - `firebaseUid` (matches your Google UID)
   - `email`
   - `fullName`
   - `photoUrl`
   - `role` (STANDARD_USER)
   - `interests` (empty array)
   - `createdAt` (timestamp)
   - `updatedAt` (timestamp)

✅ **User data saved in Firestore!**

---

## Step 6: Complete Profile

1. Back to your app
2. Fill out the profile form:
   - Full name
   - Select Student/Professional
   - (If Student) Enter college name
   - Select at least one interest category
3. Click **Continue**

✅ **Profile saved!**

---

## Step 7: Verify Profile Update in Firestore

1. Back to Firebase Console
2. **Firestore** → **Data** → **users** → your user document
3. Refresh the page or check the data
4. You should see updated fields:
   - `fullName`: Your entered name
   - `isStudent`: true/false
   - `collegeName`: Your college (if student)
   - `interests`: Array of selected categories

✅ **Everything working!**

---

## Architecture Diagram

```
┌─────────────────────┐
│   Your React App    │
│  (parivadi.netlify) │
└──────────┬──────────┘
           │
           ├─→ Google OAuth (Firebase Auth)
           │
           ├─→ Firestore Database
           │   └─ users/{uid}
           │
           └─→ API (for events, admin, etc.)
```

---

## Backend Status

**What NO LONGER needs backend:**
- ✅ User sign-in/sign-up
- ✅ User profile storage
- ✅ User profile updates
- ✅ User interests

**What STILL uses backend API:**
- Events management
- Event registration
- Event search/filtering
- Admin functionality
- Categories (can migrate later)

---

## Troubleshooting

### Problem: "Permission denied" error when signing in

**Solution**: Make sure Firestore security rules allow it
- Go to Firestore → Rules
- Check that test mode is enabled
- Rules should allow read/write for authenticated users

### Problem: User data not appearing in Firestore

**Solution**: 
1. Check browser console for errors (F12)
2. Verify Firestore Database is created in Firebase
3. Check network requests tab to see if Firestore calls succeed

### Problem: Profile update not working

**Solution**:
1. Make sure you've selected at least one interest
2. Fill all required fields
3. Check console for specific error message

---

## What to Do Next

### Option A: Keep Backend for Now (Recommended)
- Keep existing API for events
- Gradually migrate to Firestore over time
- All user auth now works without backend

### Option B: Full Firebase Migration
- Migrate events to Firestore
- Migrate categories to Firestore
- Migrate registrations to Firestore
- Turn off backend completely

---

## File Changes Summary

```
src/lib/firebase.ts          ← Added Firestore import
src/lib/firestore.ts         ← NEW: Firestore operations
src/contexts/AuthContext.tsx ← Removed backend sync
src/pages/CompleteProfilePage.tsx ← Uses Firestore directly
```

---

## Next Commands

```bash
# View recent commits
git log --oneline -5

# See what changed
git show --stat HEAD

# Pull latest code
git pull origin main
```

---

**You're all set!** 🎉

Your app now uses Firebase for authentication and user profiles. Test it and let me know if you hit any issues!
