

# EventHall: Full-Stack Event Management Platform

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Frontend (React + Vite + Tailwind)](#frontend-react--vite--tailwind)
  - [Pages & Components](#pages--components)
  - [Event Creation Form Fields](#event-creation-form-fields)
  - [Registration Form Builder](#registration-form-builder)
- [Backend (Node.js + Express + MySQL)](#backend-nodejs--express--mysql)
  - [API Endpoints](#api-endpoints)
  - [Authentication & User Roles](#authentication--user-roles)
- [Database Schema](#database-schema)
- [How to Run Locally](#how-to-run-locally)
- [Replication Checklist](#replication-checklist)

---

## Overview

EventHall is a full-stack web application for discovering, creating, and managing campus and public events. It supports custom registration forms, event asset uploads, user roles (standard, event admin, ultimate admin), and a robust approval workflow for event publishing.

---

## Features

- User authentication (login, profile, roles)
- Event discovery, search, and filtering by category/district/date
- Event creation with rich details, banners, brochures, posters, and social links
- Custom registration forms (drag-and-drop builder)
- Two registration modes: external link or platform form
- Event approval workflow (draft, pending, published, rejected, archived)
- Host/admin dashboard for event and registration management
- Like/favorite events, track registered/created events
- Full CRUD for events and registration forms
- File uploads (images, PDFs)
- Responsive, modern UI (React + Tailwind)

---

## Architecture

- **Frontend:** React (Vite), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, MySQL
- **Database:** MySQL (see schema below)
- **File Storage:** ImgBB for images, local/remote for PDFs

---

## Frontend (React + Vite + Tailwind)

### Pages & Components

- **HomePage:** Event feed, featured events, search bar
- **EventDetailPage:** Full event info, registration, like button, social links, assets
- **EventFormPage:** Create/edit event (see fields below)
- **RegistrationFormBuilder:** Drag-and-drop builder for custom registration questions
- **RegistrationFormModal:** Dynamic form for user registration (fields from builder)
- **HostDashboardPage:** Manage created events, view registrations, approve/reject
- **ProfilePage:** User info, interests, registered/liked/created events
- **AdminEventsPage:** Ultimate admin event management
- **Other:** CategoryBrowser, BannerSlider, DesktopNav, BottomNav, etc.

### Event Creation Form Fields

**Required:**
- Event Title
- Description
- Date (future only)
- Time
- Location (manual or map picker)
- District (dropdown: Thiruvananthapuram, Kollam, ... Kasaragod)
- At least one Category (predefined or custom)
- Contact Email
- Contact Phone (10 digits)

**Optional:**
- Google Maps Link
- Additional Categories
- Entry Fee (if not free)
- Prize Details
- Banner Image (upload or URL)
- Brochures (PDF upload)
- Posters (image upload)
- Social Media Links (Instagram, Facebook, YouTube, etc.)
- External Registration Link (if using external form)
- How to Register Link

**Registration Method:**
- External (Google Forms, Typeform, etc.)
- Platform Form (customizable, see below)

### Registration Form Builder

**Preset Question Categories:**
- Basic Participant Information
  - Full Name (text)
  - Email (email)
  - Phone (text, 10 digits)
  - Institution/College (text)
  - Department (text)
  - Year/Semester (dropdown: 1st Year, 2nd Year, ...)
  - Role (dropdown: Student, Research Scholar, Faculty, Professional)
  - Gender (dropdown: Male, Female, Other, Prefer not to say)
  - District/City (text)
- Experience & Skill-Level
  - Proficiency (dropdown: Beginner, Intermediate, Advanced)
  - Prior Experience (textarea)
  - GitHub/LinkedIn (url)
  - Programming Languages (multi-select)
  - Previous Events (yes/no)
- Event Logistics
  - Accommodation (yes/no)
  - Food Preference (dropdown: Veg, Non-Veg, Vegan)
  - Transportation (yes/no)
  - Certificate Needed (yes/no)
  - Printed Materials (yes/no)
- Workshop/Hands-On
  - Will bring laptop (yes/no)
  - Software installed (yes/no)
  - OS (dropdown: Windows, macOS, Linux)
  - Tool Experience (yes/no)
- **Custom Questions:** Any type (text, email, textarea, dropdown, url, yes/no, multi-select)

**Form Field Types:**
- text, email, textarea, dropdown, url, yes/no, multi-select
- Required/optional toggle for each
- Options for dropdown/multi-select

---

## Backend (Node.js + Express + MySQL)

### API Endpoints (Key Examples)

#### Auth & User
- `POST /api/auth/login` — Login with username/password
- `GET /api/users/:uid` — Get user profile
- `PUT /api/users/:uid/profile` — Update profile
- `PUT /api/users/:uid/interests` — Update interests

#### Categories
- `GET /api/categories` — List all event categories

#### Events
- `GET /api/events` — List/search events (filter by category, district, date, etc.)
- `GET /api/events/:id` — Get event details
- `POST /api/events` — Create event (requires x-user-id header)
- `PUT /api/events/:id` — Update event
- `POST /api/events/:id/like` — Like event
- `POST /api/events/:id/register` — Register (external)
- `POST /api/events/:id/register-with-form` — Register (platform form)
- `GET /api/events/:id/registration-form` — Get registration form questions
- `POST /api/events/:id/registration-form` — Set registration form questions
- `GET /api/events/user/registered` — List events user registered for
- `GET /api/events/user/liked` — List liked events
- `GET /api/events/user/created` — List created events

#### Host/Admin
- `POST /api/host/applications` — Apply for event admin
- `GET /api/host/applications` — List admin applications
- `POST /api/host/applications/:id/review` — Approve/reject application
- `GET /api/host/events/pending` — List pending events
- `POST /api/host/events/:id/status` — Update event status (approve/reject)
- `DELETE /api/host/events/:id` — Delete event
- `GET /api/host/events` — List all events (admin)
- `POST /api/host/events/:id/featured` — Toggle featured
- `POST /api/host/events/:id/publish` — Publish/unpublish event
- `GET /api/host/events/:id/registrations` — List registrations with responses
- `PATCH /api/host/registrations/:id/status` — Approve/reject registration

#### Maps
- `GET /api/maps/search` — Search locations (OpenStreetMap)
- `GET /api/maps/reverse` — Reverse geocode

---

### Authentication & User Roles

- **STANDARD_USER:** Can browse, register, like events
- **EVENT_ADMIN:** Can create/manage events, view registrations, approve/reject
-- **ADMIN:** Full access, manage all events and users

---

## Database Schema (MySQL)

**Key Tables:**

- `users` — id, username, password_hash, email, full_name, photo_url, role, is_student, college_name, created_at, ...
- `event_categories` — id, name, slug, description
- `user_interests` — user_id, category_id
- `events` — id, title, description, date, time, location, district, google_maps_link, entry_fee, is_free, prize_details, contact_email, contact_phone, external_registration_link, how_to_register_link, banner_url, status, is_featured, created_by_id, ...
- `event_category_links` — event_id, category_id, is_primary
- `event_likes` — user_id, event_id
- `event_registrations` — user_id, event_id, registration_type
- `admin_applications` — user_id, motivation_text, status
- `event_assets` — event_id, asset_type (BROCHURE, POSTER, SOCIAL), name, url, label
- `registration_form_questions` — event_id, question_category, question_key, question_text, question_type, options, is_required, display_order, is_custom
- `registration_form_responses` — registration_id, event_id, user_id, question_id, answer

**See** `database/schema.sql` **for full schema and sample data.**

---

## How to Run Locally

### Prerequisites
- Node.js (18+ recommended)
- npm
- MySQL (XAMPP or similar)

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd EventHall
```

### 2. Install Dependencies
```sh
npm install
cd server && npm install
```

### 3. Setup Database
- Start MySQL (e.g., via XAMPP)
- Run:
  ```sh
  mysql -u root < database/schema.sql
  ```

### 4. Configure Backend
- Create `server/.env`:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=eventhall
  PORT=3001
  ```

### 5. Start Backend
```sh
cd server
npm run dev
```

### 6. Start Frontend
```sh
cd ..

```

---

## Replication Checklist

- [ ] Clone repo & install dependencies
- [ ] Setup MySQL and import schema
- [ ] Configure backend `.env`
- [ ] Start backend and frontend
- [ ] Test event creation, registration, admin flows
- [ ] Review all form fields and endpoints above

---

## Contact & Credits

- Built with React, Vite, Tailwind, Node.js, Express, MySQL
- For questions, see code comments and schema.sql for all details

---

**This documentation is generated to be as detailed as possible for full replication.**
