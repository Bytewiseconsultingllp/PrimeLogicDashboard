# Network Debug Guide - Profile API Not Being Called

## Enhanced Logging Added ✅

I've added comprehensive console logging to track exactly where the API call might be failing.

---

## Console Logs to Check

When you open `http://localhost:3000/dashboard/freelancer`, you should see these logs in order:

### **1. Component Mount**
```
🚀 HomePage component mounted/rendered
```
If you DON'T see this, the component isn't rendering at all.

### **2. useEffect Triggered**
```
⚡ useEffect for profile fetch is running!
```
If you DON'T see this, the useEffect isn't being called.

### **3. Fetch Started**
```
🔄 Starting profile fetch...
```

### **4. localStorage Check**
```
📦 Checking localStorage for userDetails...
📦 userDetails raw: EXISTS
```
If you see `NULL`, you're not logged in.

### **5. User Details Parsed**
```
📦 Parsing userDetails...
👤 User details found: { role: "FREELANCER", username: "...", hasToken: true }
```

### **6. Role Verification**
```
✅ User is FREELANCER, proceeding with fetch
```
If you see `ℹ️ User is not a freelancer`, your role is wrong.

### **7. Token Found**
```
🔑 Token found, length: 500
🔑 Token preview: eyJhbGciOiJIUzI1NiIs...
🔑 Preparing to fetch profile from API...
```

### **8. API Call Made**
```
🌐 API URL: http://localhost:8000/api/v1/freelancer/profile
📡 API Response Status: 200
```

---

## Troubleshooting Based on Console Output

### **Scenario 1: No Logs at All**

**Problem:** Component not rendering

**Check:**
1. Are you on the correct URL? `http://localhost:3000/dashboard/freelancer`
2. Is there a redirect happening?
3. Check browser console for any errors

**Solution:**
```javascript
// In browser console, check current path
console.log('Current path:', window.location.pathname)
// Should be: /dashboard/freelancer
```

---

### **Scenario 2: Component Mounts but useEffect Doesn't Run**

**You see:**
```
🚀 HomePage component mounted/rendered
```

**But NOT:**
```
⚡ useEffect for profile fetch is running!
```

**Problem:** useEffect is blocked or component is unmounting immediately

**Check:**
1. Is there a layout that's preventing render?
2. Are there any errors in console?
3. Is the component being unmounted?

---

### **Scenario 3: useEffect Runs but Stops at localStorage Check**

**You see:**
```
⚡ useEffect for profile fetch is running!
🔄 Starting profile fetch...
📦 Checking localStorage for userDetails...
📦 userDetails raw: NULL
❌ No user details found in localStorage
❌ Cannot fetch profile without authentication
```

**Problem:** You're not logged in

**Solution:**
1. Login first at `/login`
2. Or check if login stored the data correctly:
```javascript
// In browser console
console.log('All localStorage keys:', Object.keys(localStorage))
console.log('userDetails:', localStorage.getItem('userDetails'))
```

---

### **Scenario 4: User Details Found but Wrong Role**

**You see:**
```
👤 User details found: { role: "ADMIN", username: "...", hasToken: true }
ℹ️ User is not a freelancer, skipping profile fetch
ℹ️ User role is: ADMIN
```

**Problem:** You're logged in as ADMIN, not FREELANCER

**Solution:**
1. Logout
2. Login with freelancer credentials
3. Or check your role:
```javascript
// In browser console
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
console.log('Your role:', userDetails.role)
// Should be: FREELANCER
```

---

### **Scenario 5: Token Not Found**

**You see:**
```
👤 User details found: { role: "FREELANCER", username: "...", hasToken: false }
❌ No access token found
❌ parsedDetails.accessToken is: undefined
```

**Problem:** Token wasn't stored during login

**Solution:**
1. Logout and login again
2. Check if login is storing the token:
```javascript
// In browser console
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
console.log('Has accessToken:', !!userDetails.accessToken)
console.log('Token:', userDetails.accessToken)
```

---

### **Scenario 6: Everything Works but No Network Call**

**You see all logs including:**
```
🔑 Token found, length: 500
🔑 Preparing to fetch profile from API...
```

**But NO network request in Network tab**

**Problem:** Fetch is failing silently or being blocked

**Check:**
1. Network tab filter - make sure "All" or "Fetch/XHR" is selected
2. Check if there's a CORS error in console
3. Check if fetch is being blocked by browser

**Solution:**
```javascript
// Test fetch manually in console
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
const token = userDetails.accessToken

fetch('http://localhost:8000/api/v1/freelancer/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Manual fetch result:', data))
.catch(err => console.error('Manual fetch error:', err))
```

---

## Step-by-Step Debugging

### **Step 1: Open the Page**
```
Navigate to: http://localhost:3000/dashboard/freelancer
```

### **Step 2: Open DevTools**
```
Press F12 or Right-click → Inspect
Go to Console tab
```

### **Step 3: Check Console Logs**
Look for the logs in order and identify where it stops.

### **Step 4: Check Network Tab**
```
Go to Network tab
Filter by: Fetch/XHR
Look for: freelancer/profile
```

### **Step 5: Identify the Issue**
Based on which log you see last, identify the problem from the scenarios above.

---

## Quick Checks

### **Check 1: Are you logged in?**
```javascript
// In browser console
const userDetails = localStorage.getItem('userDetails')
console.log('Logged in:', !!userDetails)
```

### **Check 2: What's your role?**
```javascript
// In browser console
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
console.log('Role:', userDetails?.role)
// Should be: FREELANCER
```

### **Check 3: Do you have a token?**
```javascript
// In browser console
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
console.log('Has token:', !!userDetails?.accessToken)
console.log('Token length:', userDetails?.accessToken?.length)
```

### **Check 4: Is backend running?**
```bash
# In terminal
curl http://localhost:8000/api/v1/freelancer/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Check 5: Test fetch manually**
```javascript
// In browser console - copy this entire block
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
if (!userDetails) {
  console.error('Not logged in!')
} else if (userDetails.role !== 'FREELANCER') {
  console.error('Not a freelancer! Role:', userDetails.role)
} else if (!userDetails.accessToken) {
  console.error('No token!')
} else {
  console.log('All checks passed, testing fetch...')
  fetch('http://localhost:8000/api/v1/freelancer/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userDetails.accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => {
    console.log('Response status:', r.status)
    return r.json()
  })
  .then(data => console.log('Profile data:', data))
  .catch(err => console.error('Fetch error:', err))
}
```

---

## Common Issues and Solutions

### **Issue: "Not logged in"**
**Solution:** Go to `/login` and login with freelancer credentials

### **Issue: "Wrong role"**
**Solution:** Logout and login with freelancer account (aaa@mailinator.com)

### **Issue: "No token"**
**Solution:** Logout and login again to get a fresh token

### **Issue: "CORS error"**
**Solution:** Check backend CORS configuration

### **Issue: "Network error"**
**Solution:** Make sure backend is running on `http://localhost:8000`

### **Issue: "401 Unauthorized"**
**Solution:** Token expired, logout and login again

### **Issue: "404 Not Found"**
**Solution:** Check API endpoint URL in logs

---

## What to Share for Help

If the issue persists, share:

1. **All console logs** (copy entire console output)
2. **localStorage content:**
```javascript
console.log('userDetails:', localStorage.getItem('userDetails'))
```
3. **Network tab screenshot** showing the requests
4. **Any errors** in console (red text)
5. **Which scenario** from above matches your situation

---

## Expected Working Flow

When everything works correctly, you should see:

```
🚀 HomePage component mounted/rendered
⚡ useEffect for profile fetch is running!
🔄 Starting profile fetch...
📦 Checking localStorage for userDetails...
📦 userDetails raw: EXISTS
📦 Parsing userDetails...
👤 User details found: { role: "FREELANCER", username: "aaa", hasToken: true }
✅ User is FREELANCER, proceeding with fetch
🔑 Token found, length: 500
🔑 Token preview: eyJhbGciOiJIUzI1NiIs...
🔑 Preparing to fetch profile from API...
🌐 API URL: http://localhost:8000/api/v1/freelancer/profile
📡 API Response Status: 200
✅ Profile fetched successfully: { success: true, data: {...} }
📊 Data structure check:
  - Full Name: aaa
  - Email: aaa@mailinator.com
✅ Profile data set to state
```

**AND** in Network tab:
- Request to: `freelancer/profile`
- Status: `200 OK`
- Response: Profile data

---

## Summary

The enhanced logging will tell you **exactly** where the flow stops. Follow the scenarios above based on which log you see last, and you'll find the issue! 🎯
