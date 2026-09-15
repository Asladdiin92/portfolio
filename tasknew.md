# Portfolio Monorepo — Task Tracker

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Roadmap

### Task 1: Inventory & Verify Current State
- [x] 1.1 Full tree audit
- [x] 1.2 Root scripts confirmed
- [x] 1.3 Client App.tsx wiring checked
- [x] 1.4 Server routes reviewed
- [x] 1.5 Phantom dirs removed, git initialized
- [ ] 1.6 Live app checklist passes

### Task 2: Seed Realistic Data
- [ ] 2.1 Create `apps/server/src/scripts/seed.ts`
- [ ] 2.2 Add `seed` script to server package.json
- [ ] 2.3 Run seed, verify DB
- [ ] 2.4 Verify filters narrow grid correctly

### Task 3: Polish Public UI
- [ ] 3.1 Tighten card layout
- [ ] 3.2 Add loading skeleton
- [ ] 3.3 Improve empty state copy
- [ ] 3.4 Hover state via CSS

### Task 4: Split Backend into Controllers
- [ ] 4.1 Create `controllers/projectController.ts`
- [ ] 4.2 Create `services/projectService.ts`
- [ ] 4.3 Thin out `routes/projectRoutes.ts`

### Task 5: Admin Auth Flow
- [ ] 5.1 Extend shared schema: `LoginPayload`, `AuthUser`
- [ ] 5.2 Server: `authRoutes.ts`, bcrypt, JWT
- [ ] 5.3 Client: `AuthContext`, `LoginPage`, `RequireAuth`
- [ ] 5.4 Verify: unauthed user redirected to `/login`

### Task 6: Admin CRUD
- [ ] 6.1 Admin project list view
- [ ] 6.2 Create project form
- [ ] 6.3 Edit / delete actions

### Task 7: Tests + CI
- [ ] 7.1 Vitest unit tests (slugify, validators)
- [ ] 7.2 Supertest integration tests (`GET /api/projects`)
- [ ] 7.3 GitHub Actions workflow