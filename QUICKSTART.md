# Quick Start Guide - Event Hall

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Firebase project created with Google Auth enabled
- [ ] Neon PostgreSQL database created
- [ ] Firebase Admin SDK private key downloaded

## 5-Minute Setup

### 1. Configure `.env` File

Open `.env` and update these critical values:

```bash
# 1. Add your Neon PostgreSQL connection string (REPLACE THIS!)
DATABASE_URL="postgresql://neondb_owner:npg_3rdYqbjn7BoS@ep-sweet-dew-ahde8ryh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 2. Firebase Admin SDK - Get from Firebase Console > Project Settings > Service Accounts
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@events-fc01b.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# 3. Add your email to become Ultimate Admin
ULTIMATE_ADMIN_EMAILS="your-email@gmail.com"
```

### 2. Install & Setup Database

Run this single command:
```bash
npm run setup
```

This will:
- Install all dependencies
- Generate Prisma client
- Create database tables
- Seed event categories

### 3. Start the Application

```bash
npm run dev:all
```

This starts both frontend (port 5173) and backend (port 3001).

### 4. First Login

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Sign in with the email you added to `ULTIMATE_ADMIN_EMAILS`
4. Complete your profile (select interests)
5. You now have Ultimate Admin access!

## Testing the Application

### As Ultimate Admin:
1. Go to Settings
2. Click "Ultimate Admin Dashboard"
3. You can approve admin applications and events

### Create a Test Event:
1. Go to Settings > My Events
2. Click "Create Event"
3. Fill in the form
4. Submit (it goes to Pending Approval)
5. Go to Ultimate Admin Dashboard
6. Approve your own event
7. It now appears in the Home feed!

### Test Standard User Flow:
1. Open app in incognito/private window
2. Sign in with a different Google account
3. Complete profile with different interests
4. Browse events
5. Like and register for events
6. Apply for Admin role from Settings

## Common Issues

### "Cannot find module '@prisma/client'"
Run: `npm run prisma:generate`

### Database connection fails
- Check your DATABASE_URL in `.env`
- Ensure your Neon database is active
- Verify the connection string format

### Firebase authentication fails
- Check Firebase config in `.env`
- Ensure Google Auth is enabled in Firebase Console
- Verify FIREBASE_PRIVATE_KEY is properly formatted (with \n for newlines)

### Port already in use
Change ports in `.env`:
```bash
PORT=3002
VITE_API_BASE_URL="http://localhost:3002/api"
```

## What's Next?

1. **Customize Categories**: Edit `prisma/seed.ts` and run `npm run prisma:seed`
2. **Add More Districts**: Update district lists in event form and search pages
3. **Customize Styling**: Modify Tailwind classes throughout the app
4. **Add Image Upload**: Integrate Cloudinary or similar for event banners
5. **Deploy**: Follow SETUP.md for deployment instructions

## Useful Commands

```bash
# View database in browser
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-seed categories
npm run prisma:seed

# Check TypeScript errors
npm run lint

# Build for production
npm run build && npm run build:server
```

## Getting Help

- Check SETUP.md for detailed documentation
- Check API endpoints in server/routes/
- Review component structure in src/pages/
- Open GitHub issues for bugs

Happy coding! 🚀
