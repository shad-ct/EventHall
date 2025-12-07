# Event Hall - Campus Event Management Platform

A production-ready full-stack web application for discovering and managing college events with personalized recommendations, built with React, TypeScript, Node.js, Firebase Authentication, and Neon PostgreSQL.

## 🚀 Features

### For Standard Users
- **Google Sign-in**: Secure authentication with Firebase
- **Personalized Feed**: Event recommendations based on selected interests
- **Event Discovery**: Browse, search, and filter events by category, district, date, and more
- **Bookmarking**: Like events to save them for later
- **Registration**: Register for events and track your applications
- **Profile Management**: Update preferences and interests anytime

### For Event Admins
- **Event Creation**: Create and manage campus events with rich details
- **Event Management**: Edit your events and track their approval status
- **Dashboard**: View all your events organized by status

### For Ultimate Admins
- **Application Review**: Approve or reject admin role applications
- **Event Moderation**: Publish or reject pending events
- **User Management**: Full access to platform administration

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS 4** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **Firebase Client SDK** for authentication

### Backend
- **Node.js** with TypeScript
- **Express.js** for API server
- **Prisma ORM** for database management
- **Neon PostgreSQL** as the database
- **Firebase Admin SDK** for token verification
- **CORS** for cross-origin requests

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Neon PostgreSQL account
- Firebase project with Google authentication enabled

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Google Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
4. Get your web app credentials:
   - Go to Project Settings > General
   - Add a web app if you haven't
   - Copy the config values
5. Generate Firebase Admin SDK credentials:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely (you'll need values from it)

### 3. Set Up Neon PostgreSQL

1. Go to [Neon Console](https://neon.tech/)
2. Create a new project
3. Copy your connection string

### 4. Configure Environment Variables

The `.env` file is already created. Update it with your actual credentials:

```bash
# Your Neon PostgreSQL connection string
DATABASE_URL="postgresql://..."

# Your Firebase credentials are already filled in
# Update Firebase Admin SDK credentials:
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@events-fc01b.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Add your email to become Ultimate Admin
ULTIMATE_ADMIN_EMAILS="your-email@example.com"
```

### 5. Set Up Database

Generate Prisma client:
```bash
npm run prisma:generate
```

Run migrations to create database tables:
```bash
npm run prisma:migrate
```

Seed initial data (event categories):
```bash
npx tsx prisma/seed.ts
```

### 6. Start Development Servers

Run both frontend and backend:
```bash
npm run dev:all
```

Or run separately:
- Frontend: `npm run dev` (http://localhost:5173)
- Backend: `npm run dev:server` (http://localhost:3001)

## 📱 Application Structure

### User Roles

1. **Standard User**: Browse events, like, register, apply for admin
2. **Event Admin**: All standard user features + create/manage events
3. **Ultimate Admin**: All features + approve admins and events

### Main Screens

- **Login**: Google Sign-in
- **Complete Profile**: Set interests on first login
- **Home**: Personalized event feed by categories
- **Search**: Browse all events with filters
- **Profile**: View applied and liked events
- **Settings**: Edit profile, manage interests, apply for admin
- **Event Detail**: Full event information with registration
- **Admin Dashboard**: Create and manage events (Event Admins)
- **Ultimate Admin**: Review applications and events (Ultimate Admins)

## 🗄️ Database Schema

Key models:
- `User` - User accounts with roles (STANDARD_USER, EVENT_ADMIN, ULTIMATE_ADMIN)
- `EventCategory` - Event types (Hackathon, Workshop, Quiz, etc.)
- `UserInterest` - User's selected interests for personalized feed
- `Event` - Events with status workflow (DRAFT, PENDING_APPROVAL, PUBLISHED, REJECTED, ARCHIVED)
- `EventLike` - User bookmarks
- `EventRegistration` - Event applications
- `AdminApplication` - Admin role requests

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/sync-user` - Sync user on login
- `POST /api/auth/update-profile` - Update user profile
- `GET /api/auth/categories` - Get all event categories

### Events
- `GET /api/events` - List published events with filters
- `GET /api/events/by-categories` - Events grouped by category IDs
- `GET /api/events/:id` - Event details
- `POST /api/events` - Create event (Event Admin+)
- `PUT /api/events/:id` - Update event (Event Admin+)
- `POST /api/events/:id/like` - Like/unlike event
- `POST /api/events/:id/register` - Register for event

### User
- `GET /api/me` - Current user profile
- `GET /api/me/likes` - User's liked events
- `GET /api/me/registrations` - User's registered events
- `GET /api/me/events` - User's created events (admins)

### Admin
- `POST /api/admin/apply` - Apply for admin role
- `GET /api/admin/applications` - List applications (Ultimate Admin)
- `PATCH /api/admin/applications/:id` - Approve/reject application
- `GET /api/admin/events/pending` - List pending events
- `PATCH /api/admin/events/:id/status` - Update event status (publish/reject)

## 🚀 Usage Guide

### Becoming an Ultimate Admin

1. Add your email to `ULTIMATE_ADMIN_EMAILS` in `.env`
2. Restart the backend server
3. Sign in with Google using that email
4. You'll automatically have Ultimate Admin access

### Creating Your First Event (as Admin)

1. Apply for admin role from Settings (or be added as Ultimate Admin)
2. Go to Settings > My Events
3. Click "Create Event"
4. Fill in all required details
5. Submit (goes to Pending Approval)
6. Ultimate Admin reviews and publishes

### Event Workflow

```
Draft → Pending Approval → Published
                ↓
              Rejected
```

- Event Admins create events (status: PENDING_APPROVAL)
- Ultimate Admin reviews and approves/rejects
- Published events appear in user feeds
- Editing published events resets to PENDING_APPROVAL

## 📦 Build & Deploy

### Build for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
npm run build:server
```

### Deployment Recommendations

**Frontend**: Vercel, Netlify, or Cloudflare Pages
**Backend**: Fly.io, Railway, or Render
**Database**: Neon PostgreSQL (already set up)

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform. Update URLs to production domains.

## 🎨 Customization

- **Categories**: Edit `prisma/seed.ts` to add/modify event categories
- **Districts**: Update the districts array in `EventFormPage.tsx` and `SearchPage.tsx`
- **Styling**: Modify Tailwind classes throughout components
- **Roles**: Extend the `UserRole` enum in `prisma/schema.prisma` for additional roles

## 📄 License

MIT License - Free to use for personal and commercial projects

## 🤝 Contributing

Contributions welcome! Please open issues or submit pull requests.

## 📧 Support

For questions or issues, please open a GitHub issue.

---

Built with ❤️ using React, TypeScript, Node.js, Firebase, and Neon PostgreSQL
