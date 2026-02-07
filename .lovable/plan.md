
# Remove Email Verification & Fix "Legit" Label

This plan addresses your two requests:
1. **Remove all email verification** - Users should signup and login directly without any email confirmation
2. **Change verdict label** - When risk score is 0%, show "Legit" instead of "Low Risk"

---

## Overview

Currently, the app:
- Sends verification emails on signup
- Blocks users from logging in if email isn't confirmed
- Shows "Low Risk" for jobs with risk score 0-19

After changes:
- Users sign up and go directly to login
- Login works immediately without email checks
- Jobs with 0% risk show "Legit", while 1-19% show "Low Risk"

---

## Changes Required

### 1. Enable Auto-Confirm Email (Backend)

Configure the authentication to automatically confirm emails so users don't need to verify:

```text
auto_confirm_email: true
```

This means Supabase will mark all new signups as confirmed automatically.

---

### 2. Simplify Signup Page

**File: `src/pages/SignupPage.tsx`**

Remove:
- The `signupComplete` state and post-signup email verification screen
- The `handleResendEmail` function
- The call to `send-verification-email` edge function
- All resend-related UI and imports

After signup: Navigate directly to login with a success message.

---

### 3. Clean Up Login Page

**File: `src/pages/LoginPage.tsx`**

Remove:
- The `emailNotConfirmed` state
- The `handleResendVerification` function
- The yellow "Email Not Verified" alert box
- Related imports (`AlertCircle`, `RefreshCw`)

Login should work directly without any email verification checks.

---

### 4. Remove Dashboard Email Check

**File: `src/pages/DashboardPage.tsx`**

Remove:
- The redirect to `/verify-email` when email not confirmed
- The `isEmailConfirmed` check throughout the component

Users should access the dashboard directly after login.

---

### 5. Update Auth Hook

**File: `src/hooks/useAuth.tsx`**

Remove:
- The `resendVerificationEmail` function
- The `isEmailConfirmed` state (or keep but don't use it for blocking)

---

### 6. Delete VerifyEmailPage

**File: `src/pages/VerifyEmailPage.tsx`**

Delete this entire file - it's no longer needed.

---

### 7. Remove Route

**File: `src/App.tsx`**

Remove the `/verify-email` route since the page is deleted.

---

### 8. Fix Verdict Labels for 0% Risk

**File: `src/pages/ResultPage.tsx`**

Add special handling for 0% risk score:

```javascript
// When risk score is exactly 0, show "Legit" instead of "Low Risk"
if (result.risk_score === 0) {
  label = "Legit";
  description = "No risk indicators detected. This appears to be a legitimate job advert.";
}
```

Update `verdictConfig`:
- Keep `likely_legit` for scores 1-19 as "Low Risk"
- Add logic to show "Legit" only when score is exactly 0

---

### 9. Update Dashboard Labels

**File: `src/pages/DashboardPage.tsx`**

Add special handling for displaying "Legit" when risk score is 0 in the verification history list.

---

## Summary of Changes

| File | Action | What Changes |
|------|--------|--------------|
| Auth Config | Modify | Enable auto-confirm emails |
| `SignupPage.tsx` | Simplify | Remove email verification screen, redirect to login |
| `LoginPage.tsx` | Simplify | Remove email not confirmed handling |
| `DashboardPage.tsx` | Simplify | Remove email confirmation check |
| `useAuth.tsx` | Simplify | Remove resend verification function |
| `VerifyEmailPage.tsx` | Delete | No longer needed |
| `App.tsx` | Modify | Remove verify-email route |
| `ResultPage.tsx` | Modify | Show "Legit" for 0% risk score |
| `DashboardPage.tsx` | Modify | Show "Legit" label for 0% results |

---

## Result

After these changes:
- **Signup**: User fills form → Account created → Redirects to login with success message
- **Login**: User enters credentials → Logged in → Redirects to dashboard
- **No emails**: No verification emails sent or required
- **Verdict at 0%**: Shows "Legit" badge
- **Verdict at 1-19%**: Shows "Low Risk" badge

