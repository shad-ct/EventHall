# Firebase Firestore Setup Instructions

## Current Status
✅ Google Sign-In configured with Firebase
✅ Authentication layer migrated to use Firestore
✅ No backend dependency for user authentication

## What Changed
1. **Authentication Flow** - Now completely Firebase-based:
   - User signs in with Google
   - User data stored in Firestore at `users/{uid}`
   - No backend `/auth/sync-user` call needed

2. **Files Modified**:
   - `src/lib/firebase.ts` - Added Firestore initialization
   - `src/lib/firestore.ts` - New service for Firestore operations
   - `src/contexts/AuthContext.tsx` - Removed backend API calls

## Next Steps - Enable Firestore

### 1. Go to Firebase Console
- Visit https://console.firebase.google.com/
- Select your project: **events-fc01b**

### 2. Create Firestore Database
1. In left sidebar, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose region (closest to your users)
4. Select **Start in test mode** (for development)
5. Click **Enable**

### 3. Set Security Rules (for Production - UPDATE LATER)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read: if request.auth.uid != null;
    }
  }
}
```

### 4. Test the App
1. Run your frontend: `npm run dev`
2. Click "Sign in with Google"
3. You should see user data appear in Firestore Console

## Firestore Collection Structure
```
/users/{uid}
  ├── id: string
  ├── firebaseUid: string
  ├── email: string
  ├── fullName: string
  ├── photoUrl?: string
  ├── role: 'STANDARD_USER' | 'EVENT_ADMIN' | 'ULTIMATE_ADMIN'
  ├── isStudent: boolean | null
  ├── collegeName: string | null
  ├── interests: UserInterest[]
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

## User Profile Update Function
When users complete their profile, update Firestore:

```typescript
import { updateUserProfile } from '../lib/firestore';

// Update user profile
await updateUserProfile(uid, {
  fullName: 'User Name',
  collegeName: 'College Name',
  isStudent: true,
  interests: [/* ... */]
});
```

## Important Notes
⚠️ **Test Mode Firestore Rules**
- In test mode, anyone can read/write any data
- Update security rules before going to production
- Rules above restrict access to own user data

✅ **Working Features**
- Google Sign-In
- User creation on first login
- User profile storage in Firestore

⏳ **Still Needs Backend** (for now)
- Event management
- Event registration
- Admin functionality

These can be migrated to Firestore later as needed.
