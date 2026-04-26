# StagePass

Premium show booking platform built as a monorepo with a React frontend and a Spring Boot backend.

StagePass supports public show discovery, seat selection, booking simulation, role-based admin and organizer management, venue management, profile editing, and Google sign-in.

## Team Members
- Manotosh Mandal
- Devansh Singh 
- Shivank Kashyap Jha

## What This Project Includes

- Public show browsing and show detail pages
- Seat selection and booking flow
- Booking history for normal users
- Role-based admin dashboard
- Show management for admins and organizers
- Venue management for admins
- Organizer access scoped to assigned venues only
- User management for admins
- Profile update and account deletion
- Email/password authentication
- Google OAuth sign-in
- Local in-memory development mode
- MySQL persistent mode

## Monorepo Structure

```text
Booking platform/
├─ apps/
│  ├─ backend/          Spring Boot API
│  └─ frontend/         React + Vite app
├─ packages/
│  ├─ types/            Shared TypeScript types
│  ├─ ui/               Shared UI package
│  └─ utils/            Shared helpers
├─ infra/
│  └─ database/         SQL schema and seed references
├─ docs/                Project notes and architecture docs
└─ README.md
```

## Tech Stack

### Frontend

- React 19
- React Router 7
- Vite
- Tailwind CSS
- Zustand
- Axios

### Backend

- Spring Boot 3.4
- Spring Security
- Spring Data JPA
- MySQL
- H2
- JWT
- Google OAuth
- WebSocket scaffold

## Roles

The application currently uses these roles internally:

- `USER`
- `ADMIN`
- `ORGANIZER`


## Current Role Behavior

### USER

- Can register and log in
- Can browse shows
- Can select seats
- Can create bookings
- Can view own bookings
- Can edit own profile
- Can delete own account

### ADMIN

- Can access admin dashboard
- Can manage shows
- Can edit shows
- Can manage venues
- Can create users
- Can change user roles
- Can assign venues to organizers

### ORGANIZER

- Can access admin area
- Can view only the shows for assigned venues
- Can create and edit only shows belonging to assigned venues
- Cannot manage users
- Cannot create venues

## Core Features

### Public Experience

- Home page
- Show listing
- Show details
- Seat selection
- Checkout simulation

### User Experience

- Email/password sign-in
- Google sign-in
- Booking history
- Editable profile
- Account deletion

### Admin Experience

- Dashboard metrics
- Venue management
- Show management
- User provisioning
- Role override
- Organizer venue assignment

## Venue and Organizer Rules

This repo now supports venue-based organizer control.

- Shows can belong to one or more venues
- Organizers can be assigned one or more venues
- Organizers can only see and manage shows linked to their assigned venues
- Admins can manage all venues and all shows

## Authentication Modes

### Email and Password

Users can:

- Register through the register page
- Log in through the login page
- Update their credentials from the profile page

### Google OAuth

Google sign-in is implemented with:

- backend start endpoint: `/api/auth/google`
- backend callback endpoint: `/api/auth/google/callback`
- frontend callback route: `/auth/google/callback`

Google sign-in:

- redirects the user to Google
- exchanges the authorization code on the backend
- fetches Google user info
- creates a local account if the user does not exist
- issues a normal JWT session used by the app

## Profiles

Users can now manage their own account from the profile page.

Supported profile actions:

- update full name
- update email
- change password
- delete account

Deleting an account immediately clears the local session and removes the user from the backend database.

## Environment Configuration

There are separate env files for frontend and backend.

### Frontend Env

File:

- `apps/frontend/.env`

Example:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_AUTH_URL=http://localhost:8080/api/auth/google
```

### Backend Env

File:

- `apps/backend/.env`

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=show_booking_platform
DB_USERNAME=root
DB_PASSWORD=your_db_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
GOOGLE_FRONTEND_SUCCESS_URL=http://localhost:5173/auth/google/callback
```

Important:

- The backend is configured to import `apps/backend/.env`
- The frontend reads `apps/frontend/.env` through Vite
- Restart backend or frontend after changing env files

## Google OAuth Setup

Create a Google OAuth client in Google Cloud Console.

Use:

- Authorized JavaScript origins:
  - `http://localhost:5173`
- Authorized redirect URIs:
  - `http://localhost:8080/api/auth/google/callback`

Then copy the client ID and client secret into:

- `apps/backend/.env`

Required backend keys:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_FRONTEND_SUCCESS_URL`

Required frontend key:

- `VITE_GOOGLE_AUTH_URL=http://localhost:8080/api/auth/google`

## Running the Project

## Prerequisites

- Node.js 20+
- pnpm 10+
- Java 17
- Maven 3.9+
- MySQL 8 if using persistent mode

## Install Frontend Dependencies

From the repository root:

```powershell
pnpm install
```

If pnpm is not installed:

```powershell
corepack enable
```

## Option 1: Local Development Mode

This is the easiest way to run the app.

It uses:

- H2 in-memory database
- auto-seeded demo data
- demo login accounts

Backend:

```powershell
cd apps/backend
mvn spring-boot:run
```

Frontend:

```powershell
cd ..
pnpm --filter frontend dev
```

URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:8080`

### Demo Accounts

Available in local mode:

- `user@stagepass.local` / `password123`
- `admin@stagepass.local` / `admin123`
- `organizer@stagepass.local` / `organizer123`

## Option 2: MySQL Persistent Mode

Use this when you want data to persist between restarts.

Before starting:

- make sure MySQL is running
- configure `apps/backend/.env`

Backend:

```powershell
cd apps/backend
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

Frontend:

```powershell
cd ..
pnpm --filter frontend dev
```

### MySQL Mode Behavior

- connects to MySQL using `apps/backend/.env`
- creates the database if it does not exist
- seeds demo accounts if they are missing
- seeds demo venues, screens, seats, and shows only when the MySQL database is empty

If the database already has venue/show data:

- users may still be seeded if missing
- venue/show demo records are not recreated

## Common Startup Problems

### Port 8080 already in use

If backend fails with `Port 8080 was already in use`:

```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### MySQL access denied

Check:

- `DB_USERNAME`
- `DB_PASSWORD`
- MySQL service is running
- `apps/backend/.env` is correct

### Google login not working

Check:

- Google client ID and secret are correct
- Google redirect URI exactly matches `http://localhost:8080/api/auth/google/callback`
- backend restarted after env changes
- frontend restarted after env changes

## Scripts

### Root

```powershell
pnpm install
pnpm --filter frontend dev
pnpm --filter frontend build
pnpm --filter frontend typecheck
```

### Backend

```powershell
mvn spring-boot:run
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
mvn -DskipTests compile
```

### Frontend

```powershell
pnpm --filter frontend dev
pnpm --filter frontend build
pnpm --filter frontend typecheck
```

## Main Routes

### Public Routes

- `/`
- `/shows`
- `/shows/:showId`
- `/shows/:showId/seats`
- `/login`
- `/register`

### Protected User Routes

- `/checkout`
- `/bookings`
- `/profile`

### Admin and Organizer Routes

- `/admin`
- `/admin/shows`

### Admin-only Routes

- `/admin/users`
- `/admin/venues`

### Frontend OAuth Route

- `/auth/google/callback`

## Important Backend Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

### Shows

- `GET /api/shows`
- `GET /api/shows/{id}`
- `GET /api/shows/manage`
- `POST /api/shows`
- `PUT /api/shows/{id}`
- `DELETE /api/shows/{id}`

### Venues

- `GET /api/venues`
- `POST /api/venues`

### Users

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/{id}/roles`
- `PUT /api/users/me`
- `DELETE /api/users/me`

### Booking and Payment

- `GET /api/seats`
- `POST /api/bookings`
- `GET /api/bookings/user`
- `POST /api/payments/simulate`

## Database Notes

The repo includes SQL reference files under:

- `infra/database/schema.sql`
- `infra/database/seed.sql`

The running app currently relies on JPA schema updates through Hibernate.

Key data areas:

- roles
- users
- venues
- screens
- seats
- shows
- show timings
- bookings
- payments
- user-to-venue mapping
- show-to-venue mapping

## Current Admin Flows

### Manage Users

Admin can:

- create new user accounts
- assign `ADMIN`, `ORGANIZER`, or `USER`
- assign venues when the selected role is `ORGANIZER`

### Manage Venues

Admin can:

- add new venues
- view existing venues

### Manage Shows

Admin can:

- create shows
- assign one or more venues to a show
- upload or link poster images
- edit shows
- delete shows

### Organizer Show Management

Organizer can:

- view only allowed shows
- create shows for allowed venues only
- edit only allowed shows

## Profile Management

Profile page supports:

- changing full name
- changing email
- changing password
- deleting account permanently

Credential changes require the current password.

## File Uploads

Poster image uploads are stored under:

- `apps/backend/uploads`

This folder is ignored by git.

## Git Ignore Strategy

This repo uses layered `.gitignore` files:

- root `.gitignore`
- `apps/backend/.gitignore`
- `apps/frontend/.gitignore`
- `.m2/.gitignore`
- `.codex-logs/.gitignore`

These ignore:

- local env files
- build outputs
- uploads
- cache folders
- IDE folders
- log files

## Repository Setup Summary

If someone clones this repo and wants the fastest successful run:

1. Install Node, pnpm, Java, and Maven
2. Run `pnpm install`
3. Create `apps/frontend/.env`
4. Create `apps/backend/.env`
5. Start backend
6. Start frontend
7. Open `http://localhost:5173`

For no-database setup:

1. run backend in local mode
2. use seeded demo credentials

For persistent setup:

1. configure MySQL
2. configure backend `.env`
3. run backend with `mysql` profile
4. use MySQL-backed data


