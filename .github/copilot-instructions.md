# Copilot Instructions for Masseuse Booking App

## Architecture Overview

Full-stack massage booking application with role-based access (USER/PRO/ADMIN):

- **Backend**: NestJS modular architecture with feature modules (auth, bookings, services, etc.)
- **Frontend**: Next.js App Router with Zustand state management
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT tokens stored in httpOnly cookies, bcrypt hashing, email verification
- **Payments**: Stripe Checkout with deposit payments
- **Email**: Resend service for notifications and verification
- **UI**: Tailwind CSS with French localization

## Key Patterns

### Backend Module Structure
Each feature follows consistent NestJS module pattern:
- `controller.ts`: REST endpoints with decorators
- `service.ts`: Business logic with Prisma operations
- `module.ts`: Dependency injection configuration
- `dto/`: Class-validator DTOs for request/response validation

Example from `backend/src/bookings/`:
```typescript
// dto/create-booking.dto.ts
export class CreateBookingDto {
  @IsString()
  serviceId: string;

  @IsDateString()
  date: string;

  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
  startTime: string;
}
```

### Database Operations
Inject `PrismaService` for type-safe database access:
```typescript
const booking = await this.prisma.booking.create({
  data: { ... },
  include: { service: true, user: true }
});
```

### Frontend State Management
Use Zustand stores for global state, with async actions:
```typescript
export const useAuthStore = create<AuthState>((set) => ({
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    set({ user: response.data.user, isAuthenticated: true });
  }
}));
```

### API Integration
Use configured axios instance from `frontend/lib/api.ts` with auth interceptors and cookie support.

## Critical Workflows

### Development Setup
1. Start PostgreSQL: `docker-compose up -d`
2. Backend: `cd backend && npm run prisma:migrate && npm run prisma:seed && npm run start:dev`
3. Frontend: `cd frontend && npm run dev`

### Database Schema Changes
- Edit `backend/prisma/schema.prisma`
- Run `npm run prisma:migrate` to create migration
- Run `npm run prisma:generate` to update client types

### Building for Production
- Backend: `npm run build` (auto-generates Prisma client)
- Frontend: `npm run build`

### Testing
- Backend: `npm run test:e2e` for integration tests
- Use `npm run prisma:studio` for database inspection

## Project-Specific Conventions

### Authentication & Authorization
- Roles: USER (clients), PRO (masseuse), ADMIN
- JWT payload includes `sub`, `email`, `role`
- Check roles in services: `if (user.role !== UserRole.ADMIN) throw new ForbiddenException()`
- Email verification required for new accounts

### Booking Logic
- Status flow: PENDING_PAYMENT → PENDING → CONFIRMED → COMPLETED
- Time slots in "HH:mm" format (24h)
- Availability checked against WeeklyAvailability and BlockedSlot models
- Site settings control advance booking limits (min/max days)

### Data Validation
- Use class-validator decorators in DTOs
- Time validation: `@Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)`
- UUID validation for entity IDs

### Email Templates
- Use Resend with HTML templates
- Escape user input with `escapeHtml()` function
- French content with proper encoding

### Date Handling
- Store dates as DateTime in DB
- Use date-fns with `fr` locale for formatting
- Booking dates stored as `@db.Date` (no time component)

### Currency & Payments
- Prices in euros, stored as Decimal(10,2)
- Stripe amounts in cents (multiply by 100)
- Deposit payments for bookings

## Common Implementation Patterns

### Adding New Features
1. Create NestJS module with controller/service/dto
2. Add to `backend/src/app.module.ts` imports
3. Create frontend pages in `app/feature/` directory
4. Add types to `frontend/types/index.ts`
5. Update Zustand stores if needed

### Error Handling
- Use NestJS exceptions: `BadRequestException`, `NotFoundException`, `ForbiddenException`
- Global exception filter in `app.module.ts`
- Frontend handles 401 with redirect to login

### File Organization
- Backend: Feature-based modules in `src/`
- Frontend: Pages in `app/`, components in `components/`, stores in `store/`
- Shared types in `frontend/types/index.ts`

## Key Files to Reference
- `backend/src/app.module.ts`: Module imports and global config
- `backend/prisma/schema.prisma`: Database schema and relationships
- `frontend/types/index.ts`: Shared TypeScript interfaces
- `frontend/lib/api.ts`: API client configuration
- `backend/src/bookings/bookings.service.ts`: Complex booking logic example