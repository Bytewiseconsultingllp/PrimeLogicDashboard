# Freelancer Profile Debug Guide

## Issue: Profile Data Not Displaying

The freelancer profile data and name are not showing on the homepage despite the API being correctly configured.

---

## Changes Applied

### 1. **Enhanced AuthContext with Debugging** ✅

**File:** `contexts/AuthContext.tsx`

Added comprehensive console logging to track profile loading:

```typescript
// When user is FREELANCER
console.log("🔍 User is FREELANCER, checking for profile...")

// If profile found in localStorage
console.log("✅ Profile found in localStorage:", profile)

// If fetching from API
console.log("⚠️ Profile not in localStorage, fetching from API...")
console.log("📡 API Response:", response)

// Success
console.log("✅ Profile fetched successfully, storing...")

// Errors
console.error("❌ API returned unsuccessful response:", response)
console.error("❌ Failed to fetch freelancer profile:", error)
```

### 2. **Enhanced Homepage with Debug Info** ✅

**File:** `app/dashboard/freelancer/page.tsx`

Added:
- Console logging for user, profile, and loading state
- Loading indicator when profile is being fetched
- Refresh button in error alert
- Better visual feedback

```typescript
// Debug logging
useEffect(() => {
  console.log("🏠 HomePage - User:", user)
  console.log("🏠 HomePage - Freelancer Profile:", freelancerProfile)
  console.log("🏠 HomePage - Is Loading:", isLoading)
}, [user, freelancerProfile, isLoading])

// Loading state alert
{user && user.role === "FREELANCER" && !freelancerProfile && !profileWarning && (
  <Alert>
    <Loader2 className="h-4 w-4 animate-spin" />
    <AlertDescription>
      Loading your profile data...
    </AlertDescription>
  </Alert>
)}
```

### 3. **Created Debug Page** ✅

**File:** `app/dashboard/freelancer/debug-profile/page.tsx`

A comprehensive debug page that shows:
- User info from AuthContext
- Profile from AuthContext
- Profile from localStorage
- Manual API test button
- Environment variables
- Debugging instructions

**Access:** Navigate to `/dashboard/freelancer/debug-profile`

---

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these logs:

```
🔍 User is FREELANCER, checking for profile...
✅ Profile found in localStorage: {...}
OR
⚠️ Profile not in localStorage, fetching from API...
📡 API Response: {...}
```

### Step 2: Use Debug Page

1. Navigate to: `/dashboard/freelancer/debug-profile`
2. Check all sections:
   - **User Info**: Should show `role: "FREELANCER"`
   - **Profile from Context**: Should show profile data
   - **Profile from localStorage**: Should show stored profile
3. Click "Test API Call" button
4. Check the response

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for request to: `http://localhost:8000/api/v1/freelancer/profile`
4. Check:
   - **Status**: Should be 200
   - **Headers**: Should have `Authorization: Bearer <token>`
   - **Response**: Should contain profile data

### Step 4: Verify Token

1. Open DevTools → Application tab
2. Go to Cookies
3. Check for `userDetails` cookie
4. Decode the JWT token to verify it's valid

### Step 5: Check API Response Structure

The API should return:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACCEPTED",
    "userId": "uuid",
    "details": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "country": "USA",
      "timeZone": "America/New_York",
      "primaryDomain": "Full Stack Development",
      "eliteSkillCards": ["React", "Node.js"],
      "tools": ["VS Code", "Git"]
    },
    "availabilityWorkflow": {...},
    "domainExperiences": [...],
    "softSkills": {...},
    "certifications": [...],
    "projectBidding": {...},
    "legalAgreements": {...}
  }
}
```

---

## Common Issues & Solutions

### Issue 1: Profile Not in localStorage

**Symptom:** Console shows "⚠️ Profile not in localStorage, fetching from API..."

**Possible Causes:**
1. First time login
2. localStorage was cleared
3. Profile wasn't saved during login

**Solution:**
- The system should automatically fetch from API
- Check if API call succeeds
- If API fails, check token validity

### Issue 2: API Call Fails (401 Unauthorized)

**Symptom:** Network tab shows 401 error

**Possible Causes:**
1. Token expired
2. Token not included in request
3. Invalid token

**Solution:**
```typescript
// Check token in localStorage
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
console.log('Access Token:', userDetails?.accessToken)

// Check if token is expired
const decoded = JSON.parse(atob(userDetails.accessToken.split('.')[1]))
console.log('Token expires:', new Date(decoded.exp * 1000))
console.log('Current time:', new Date())
```

### Issue 3: API Call Fails (404 Not Found)

**Symptom:** Network tab shows 404 error

**Possible Causes:**
1. Freelancer profile doesn't exist in database
2. Wrong API endpoint
3. Backend not running

**Solution:**
1. Verify backend is running on `http://localhost:8000`
2. Check if freelancer profile was created during registration
3. Verify API endpoint: `/api/v1/freelancer/profile`

### Issue 4: Profile Data Structure Mismatch

**Symptom:** Profile loads but data doesn't display correctly

**Possible Causes:**
1. API returns different structure than expected
2. Missing fields in response

**Solution:**
1. Check actual API response in Network tab
2. Compare with expected structure
3. Update TypeScript interfaces if needed

---

## API Configuration

### Environment Variables

**File:** `.env`

```bash
NEXT_PUBLIC_PLS=http://localhost:8000/api/v1
NEXT_PUBLIC_PLS_AUTH=http://localhost:8000/api/v1/auth
```

### API Endpoint

```
GET /api/v1/freelancer/profile
Authorization: Bearer <access_token>
```

### Axios Instance

**File:** `lib/api/axiosInstance.ts`

- Automatically adds Bearer token to requests
- Handles token refresh on 401 errors
- Retries failed requests after token refresh

---

## Testing Checklist

- [ ] Login as freelancer
- [ ] Check browser console for profile logs
- [ ] Verify profile appears on homepage
- [ ] Check welcome message shows real name
- [ ] Navigate to debug page
- [ ] Test manual API call
- [ ] Check Network tab for API request
- [ ] Verify response structure
- [ ] Check localStorage for stored profile
- [ ] Test page refresh (profile should persist)
- [ ] Clear localStorage and test (should auto-fetch)

---

## Expected Behavior

### On Login:
1. User logs in with credentials
2. Backend returns access token
3. Frontend decodes token and checks role
4. If role is FREELANCER:
   - Fetch profile from `/freelancer/profile`
   - Store in localStorage
   - Set in AuthContext
5. Redirect to dashboard

### On Page Load:
1. AuthContext initializes
2. Checks localStorage for user details
3. If user is FREELANCER:
   - Check localStorage for profile
   - If found: Load into context
   - If not found: Fetch from API
4. Homepage displays profile data

### On Homepage:
1. Welcome message shows: `freelancerProfile?.details?.fullName`
2. Profile card displays all profile details
3. If profile missing: Show loading indicator
4. If profile fails: Show error with refresh button

---

## Quick Fixes

### Force Profile Refresh

```javascript
// In browser console
localStorage.removeItem('freelancerProfile')
window.location.reload()
```

### Manual Profile Fetch

```javascript
// In browser console
fetch('http://localhost:8000/api/v1/freelancer/profile', {
  headers: {
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetails')).accessToken}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Profile:', data)
  localStorage.setItem('freelancerProfile', JSON.stringify(data.data))
  window.location.reload()
})
```

---

## Files Modified

1. **contexts/AuthContext.tsx**
   - Added detailed console logging
   - Enhanced error handling

2. **app/dashboard/freelancer/page.tsx**
   - Added debug logging
   - Added loading state indicator
   - Enhanced error alert with refresh button

3. **app/dashboard/freelancer/debug-profile/page.tsx** (NEW)
   - Comprehensive debug page
   - Manual API testing
   - Profile inspection tools

---

## Next Steps

1. **Test the debug page:**
   - Navigate to `/dashboard/freelancer/debug-profile`
   - Click "Test API Call"
   - Check the response

2. **Check console logs:**
   - Open browser console
   - Look for profile-related logs
   - Share any errors you see

3. **Verify API is working:**
   - Check if backend is running
   - Test API endpoint directly
   - Verify token is valid

4. **Share findings:**
   - Screenshot of debug page
   - Console logs
   - Network tab showing API request/response

---

## Support

If the issue persists after following these steps, please provide:

1. **Console logs** (all messages starting with 🔍, ✅, ⚠️, ❌)
2. **Network tab** screenshot showing the API request
3. **Debug page** screenshot showing all sections
4. **API response** from the manual test button

This will help identify the exact issue and provide a targeted fix.
