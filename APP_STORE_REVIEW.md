# App Store Readiness Review

## Status: Ready for TestFlight / Internal Testing
## Target: iOS App Store (primary), Google Play (secondary)

---

## ✅ Architecture & Security

| Item | Status | Notes |
|---|---|---|
| Auth tokens in SecureStore | ✅ | `src/core/auth/secureStorage.ts` — device keychain only, never AsyncStorage |
| No secrets in source | ✅ | All env vars via `.env.local` / EAS Secrets |
| RLS enforced server-side | ✅ | `my_family_group_ids()` scopes all Supabase queries |
| Frontend validation | ✅ | Zod schemas on all forms |
| No `any` types | ✅ | TypeScript strict mode enforced via ESLint |
| No console.log in production | ⚠️ | Replace `console.warn` calls with a proper logger before production build |

---

## ✅ App Store Technical Requirements

| Item | Status | Notes |
|---|---|---|
| Bundle ID set | ✅ | `com.familyhealth.app` |
| iOS deployment target | ✅ | Expo SDK 51 → iOS 13+ |
| No private API usage | ✅ | Expo managed workflow enforces this |
| Required permissions declared | ⚠️ | See Permissions section below |
| App icon (1024×1024) | ❌ | **Must provide before submission** |
| Splash screen | ✅ | Configured in `app.config.ts` with `#F7F5F0` background |
| App name ≤ 30 chars | ✅ | "Family Health" = 13 chars |
| Privacy policy URL | ❌ | **Required for health app — must provide before submission** |
| Support URL | ❌ | **Required — must provide before submission** |

---

## ⚠️ Permissions — Must Review Before Submission

This app currently uses:

| Permission | Why | Declaration needed |
|---|---|---|
| Network access | Supabase API calls | Automatic |
| Keychain access | SecureStore auth tokens | Automatic via Expo |
| Phone dialler | `DoctorCard` — tap phone number to call | Add `NSContactsUsageDescription` is NOT needed; phone URI opens without contacts access |

**No permissions need to be added to `app.config.ts`** for current features. If documents/photos are added later, `NSPhotoLibraryUsageDescription` will be required.

---

## ⚠️ Health & Privacy — App Store Review Risk Areas

Health apps receive extra scrutiny. Address these before submission:

### 1. Privacy Nutrition Label (required)
You must complete the App Privacy section in App Store Connect. This app collects:
- **Health & Fitness data** (medications, diagnoses, visit records) — linked to user identity
- **Contact info** (email address for authentication)
- **User content** (notes, todos)

All data is user-provided and stored in their own Supabase instance. Prepare a privacy policy that makes this clear.

### 2. Not a Medical Device disclaimer
Add a disclaimer visible on first launch or in Settings:
> "Family Health is a personal record-keeping tool and is not intended to provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional."

Add this to `SettingsScreen` and consider showing it on first onboarding.

### 3. Data deletion
App Store guidelines require users to be able to delete their account and data. Add a "Delete account" option to Settings that calls `supabase.auth.admin.deleteUser()` or submits a deletion request.

---

## ⚠️ Performance — Items to Address

| Item | Priority | Action |
|---|---|---|
| Large note content | Medium | Add character limit (5000 chars) to `NoteModal` — already in Zod schema |
| Calendar month grid | Low | `MonthCalendarView` re-renders on every visit change — memoize with `useMemo` |
| `fetchVisitsWithNames` | Medium | Fetches all people and doctors on every visit query — add person/doctor query key dependencies |
| Image/document uploads | N/A | Not yet implemented — add compression when added |

---

## ⚠️ Technical Debt — Before Production

| Item | Priority | File |
|---|---|---|
| Person picker in AddVisitModal | High | `src/features/visits/components/AddVisitModal.tsx` — currently takes raw personId string |
| Person picker in AddTodoModal | Medium | `src/features/todos/components/AddTodoModal.tsx` — same issue |
| Overview tab counts are hardcoded 0 | Medium | `src/features/family/components/PersonOverviewTab.tsx` — wire to real query counts |
| Visit detail screen stub | High | `app/(app)/visits/[visitId].tsx` — still a stub |
| Doctor screens stub | Medium | `src/features/doctors/screens/` — main doctors list screen not built |
| `console.warn` calls | Low | Replace with structured logger before production |
| `experimental_createPersister` | Low | API may change — monitor TanStack Query releases |

---

## ❌ Must Fix Before App Store Submission

1. **App icon** — 1024×1024 PNG, no alpha channel, no rounded corners (Apple applies them)
2. **Privacy policy** — hosted URL required; must cover health data handling
3. **Support URL** — email or website
4. **Medical disclaimer** — shown in app, not just in privacy policy
5. **Account deletion** — required by App Store guidelines since Jun 2023
6. **Person picker** — raw ID field in visit/todo add modals is not user-facing ready
7. **Visit detail screen** — `[visitId].tsx` is a stub; tapping a visit crashes gracefully but shows nothing

---

## ✅ What's Production-Ready Now

- Auth flow (sign in, onboarding, session persistence, sign out)
- Family home with colour-coded person cards
- Person detail — all 4 tabs (Overview with Notes, Doctors, Medications, Medical Events)
- Visits list + week calendar + month calendar
- To-do list with per-person colour sections
- Settings (display name, sign out)
- Start Appointment capture flow
- Offline support (queued mutations, persisted cache, sync on reconnect)
- Offline banner UI
- TypeScript strict mode throughout
- ESLint + Prettier configured
- EAS Build configured with CI/CD
- Unit tests for all domain logic (80% coverage threshold)

---

## Recommended Pre-Submission Sprint

**Week 1 — Fix critical items:**
1. Build person picker component (reusable, used by visit + todo modals)
2. Build visit detail screen
3. Add medical disclaimer to onboarding
4. Add account deletion to Settings

**Week 2 — Store assets + legal:**
1. Design app icon (consider hiring a designer)
2. Write privacy policy (use a health app template)
3. Set up support email/page
4. Complete App Store Connect metadata (screenshots, description)

**Week 3 — TestFlight:**
1. Submit EAS preview build to TestFlight
2. Internal testing with real family data
3. Fix any crashes or UX issues found

**Week 4 — Submission:**
1. Submit for App Store review
2. Typical review time: 1–3 days for new apps
