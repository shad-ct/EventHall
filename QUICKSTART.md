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
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCapbtKFQTrOorf\n6CCfpWToOgUEdV4jUgZDs4PJ3u/FJ8cy4XVXoEAipWunFWEOPf6PK6faY9C0HPV7\nfuMlk/1/sXwzcY+G2WZOJuiMwCibD+NFq+pCsdwEZAtzQDxU5ZnDktZdSU556ZXS\n//tJ1nvGYgsxI7FUP7NkqZgZiB+zwcNtoKnzC91+grm/4jQKSIvomAXrwB5R051x\nMzemctMND0sKy9tGUVX+8YAUFNLdT8qL/sHi9GRwTtmNHWF5uWAN9VKuVaWKUYpL\nCEmvRaKNvaS7R0VziMQt/4DMRzNNT3DXzeZ/A0PwyODPy3dFR5KXkFqsC6UY3UL9\nptVTWPCfAgMBAAECggEAKUR9mJTIVb8vDPYEMqXvqfrFmP167AD48/sE+Ys4v4tQ\nYFcCuanlQ3mSIymU1zia4/i515DYQiASL+zZz47Q0FD7/DxbGRiNcOB4IQssKsjQ\nFKj+H+MXe8J4vb4P+3WzlRlrg8RKoUTAeuhdVcRbDkLeirPkH7/J7txE3tdQ4mYx\nYgWTWXgYpmj8FWMxWN6We+ieH45INrWtwU+uiFWYgot8k/8Tbbp+eTcoclPdb6jN\n9qmo5NrpjmcrwADXvVLnyoZKA6CPp6RJ8P6Neqvn3KBjPBqhC47SkZcSVzc7sE8e\nvOotzPzQgaGc1kE1Wkc6KPN+9kQXMZiV52chcJJeCQKBgQDYLf34UzElRBF9i6X1\nSALu1UYX47tM3dnbD4tuozkxHbwaw7kXtZ5VSNRH3ryVsk8QKagihRqta5vgl5qX\n8FLUxBhOaxqZiIpoXtUno0ZG3GTMickKlbiljC6c+cUsjxAhdPEj/S8lacdWF3V8\nEXyA1pYwwVqi007YMHtaqZIsmQKBgQC3IithPPeEvuTeoZucCjKX6IJYXFBxQ/5C\n1Oy9ndTyL8qmKMM+OLPvyVyHAYc7IgavGxtswxzrjroC37S4zYZK6wk1crsApQ2V\nvGJZT2D3E6Gr6bWaolNGp3i5oX2oglnCuFBiOrUOnc+CThdZpesxmpnUwVhYj6S3\n7iRQ6X/R9wKBgQCoeN9OIXdRdYSz9Jr3VpGCk482mvGi69oWED03kdjGYEfyC8o5\nof6stD9La1hIyVc4X1562IR71jr6guulsVK8Ib5XjryCHpjO0ekIJQRlwOiFRnP4\n3cmyqlbBWx3AphWKHVq4E14kqBUDEPEsKWx/87vEb0s1TbxKWy4m77PNMQKBgD7Q\nco6syb13eKtARU6VVNsz/hluuIzRJJIp1HYJf/P+HoU1sBpUequBpsIL7SWEO0Su\niI6asf29++Fmd+d3X1utGICDtM64zlsQva8iggDdc/Oyev7qNKQkZ01MrfwxkbYv\nYCsBNf8oc/ee73Vpaq2d+Ku4EaR2yKnp/fzeyl/rAoGAf5PwMMzM1kV4udQBoPUy\nQHZgaNLnpHjjwjj/WbrtS0MRMcOVUiOWJgzq8F5cLAozBfKE3eX1kSd6V0UhsnbL\nTqW/SqSW+oCUOx3BdtkzzN5rmUM5bFNbnO7k+BIDb1Wz5G5HGhpveGkc51TAqqrB\nPYQLVU5nIF2ejiACWdeUpdA=\n-----END PRIVATE KEY-----\n"


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
