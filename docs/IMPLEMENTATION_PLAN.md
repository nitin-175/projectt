# Show Booking Platform Implementation Plan

## Goal

Build an interview-ready show booking platform in phased increments with:

- React + Vite frontend
- Spring Boot backend
- MySQL schema and SQL scripts
- JWT authentication with RBAC
- Booking engine with seat locking flow
- Payment simulation
- Admin dashboard
- WebSocket-based seat synchronization

## Delivery Strategy

Each phase should end in a working checkpoint, not just partial code.

## Phase 1: Foundation and Monorepo

### Outcome

A clean pnpm monorepo with frontend, backend, shared packages, docs, and infrastructure folders.

### Tasks

- Create the required workspace structure
- Configure root `package.json` and `pnpm-workspace.yaml`
- Add frontend app scaffold
- Add backend app scaffold
- Add shared `types`, `ui`, and `utils` packages
- Add initial documentation and environment examples

### Exit Criteria

- Repository matches required folder structure
- Frontend and backend can be started independently after dependencies are installed
- Base documentation exists for future phases

## Phase 2: Database and Domain Modeling

### Outcome

A solid relational schema that supports shows, seats, bookings, users, roles, and payments.

### Tasks

- Create MySQL schema scripts
- Define entities for users, roles, venues, screens, seats, shows, show timings, bookings, booking seats, payments
- Add DTOs and enum definitions
- Seed base roles and sample venue/show data

### Exit Criteria

- SQL scripts exist in `infra/database`
- Backend entity structure maps to required tables
- Base seed data is available

## Phase 3: Authentication and RBAC

### Outcome

Secure login/register flow with JWT role enforcement.

### Tasks

- Implement registration and login APIs
- Configure Spring Security with JWT filters
- Model `USER`, `ADMIN`, `ORGANIZER`, `STAFF` roles
- Protect admin-only endpoints

### Exit Criteria

- `POST /auth/register` works
- `POST /auth/login` returns JWT
- Role-based authorization is enforced

## Phase 4: Show Management

### Outcome

Admins and organizers can manage shows and users can browse them.

### Tasks

- Implement show CRUD services and APIs
- Add show listing and show detail pages
- Add admin show management screens
- Add loading, empty, and error states

### Exit Criteria

- `GET /shows` and `GET /shows/{id}` work
- `POST /shows` and update flow are role protected
- Frontend displays shows from API data

## Phase 5: Seat Selection and Booking Engine

### Outcome

Users can select seats for a show timing and create bookings safely.

### Tasks

- Build seat matrix API
- Build seat selection page with booked/available/selected states
- Implement booking creation and booking-seat persistence
- Prevent duplicate seat reservation through validation and transaction boundaries

### Exit Criteria

- `GET /seats?showTimingId=` works
- `POST /bookings` creates bookings with seats
- Already booked seats are rejected and disabled in UI

## Phase 6: Payment Simulation

### Outcome

Bookings can move through simulated payment success or failure flows.

### Tasks

- Create payment entity and service
- Generate transaction IDs
- Support success/failure simulation
- Reflect payment state in checkout and booking history

### Exit Criteria

- Payment result is saved with transaction metadata
- Checkout page handles success and failure cleanly

## Phase 7: Admin Dashboard and User Management

### Outcome

Admins get actionable metrics and user management controls.

### Tasks

- Add revenue, bookings, and active-show metrics
- Add user listing and role management
- Add dashboard cards and tables

### Exit Criteria

- Dashboard shows key aggregates
- Manage-users page exists and is role protected

## Phase 8: Real-Time Seat Sync

### Outcome

Seat availability updates in real time to reduce double booking.

### Tasks

- Configure Spring WebSocket + STOMP
- Broadcast seat lock / release / booked events
- Subscribe from frontend seat selection page
- Sync UI state without refresh

### Exit Criteria

- Seat updates appear live across sessions
- Booking conflicts are reduced and surfaced clearly

## Phase 9: Hardening and Quality

### Outcome

A polished, testable project with good UX and stable behavior.

### Tasks

- Add validation and global error handling
- Add toasts and skeleton loaders
- Add backend unit/integration tests where practical
- Add frontend empty/error/loading states consistently
- Document local setup and API flow

### Exit Criteria

- Core flows are documented and testable
- Edge cases like invalid token, payment failure, and double booking are handled

## Recommended Build Order Inside the Repo

1. Finish backend domain model and auth foundation
2. Connect frontend auth and routing shell
3. Implement shows browsing and details
4. Implement seat selection and booking flow
5. Add payment simulation
6. Add admin dashboard and management features
7. Add WebSocket seat sync
8. Polish, test, and document
