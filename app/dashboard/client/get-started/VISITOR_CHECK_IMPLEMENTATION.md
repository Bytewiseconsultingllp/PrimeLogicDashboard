# Visitor Check API Integration

## Overview
This implementation integrates the visitor check API (`/api/v1/visitors/check-email`) into the get-started flow to handle existing visitors, new visitors, and existing clients.

## API Endpoint
```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/visitors/check-email' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "john@company.com"
}'
```

## Expected Response Format
```json
{
  "success": true,
  "status": 200,
  "message": "Visitor found",
  "data": {
    "isClient": false,
    "isVisitor": true,
    "visitorId": "7aa15207-46ce-45dc-aca6-b77baeb3a7a0",
    "message": "Visitor data found. You can continue from where you left off."
  },
  "requestInfo": {
    "url": "/api/v1/visitors/check-email",
    "method": "POST"
  }
}
```

## Implementation Details

### Files Modified

1. **`/app/get-started/utils/api.ts`**
   - Added `checkVisitorByEmail(email: string)` function
   - Handles the API call to check visitor status

2. **`/app/get-started/page.tsx`**
   - Modified `goToNextStep()` function for step 0 (Register)
   - Implements visitor check logic before creating new visitor
   - Handles three scenarios: existing client, existing visitor, new visitor

3. **`/app/get-started/layout.tsx`** (Created)
   - Basic layout component with metadata for SEO

### Logic Flow

When user clicks "Next" on the Register step:

1. **Check Visitor Status**
   ```typescript
   const checkResult = await api.checkVisitorByEmail(email)
   ```

2. **Handle Response**
   - **If `isClient: true`**: 
     - Show error notification
     - Prevent form progression
     - Display toast: "Email already registered as client!"
   
   - **If `isVisitor: true` and `visitorId` exists**:
     - Use existing visitor ID
     - Show success toast: "Welcome back! Continuing from where you left off."
     - Continue to next step
   
   - **If new visitor**:
     - Create new visitor via existing API
     - Show success toast: "Registration successful! Welcome to Prime Logic Solutions."
     - Continue to next step

3. **Error Handling**
   - If API check fails, fallback to creating new visitor
   - Multiple fallback layers ensure robustness
   - All errors are logged for debugging

### User Experience

- **Existing Clients**: Clear error message with visual feedback
- **Returning Visitors**: Welcoming message indicating continuation
- **New Visitors**: Standard success flow
- **API Failures**: Graceful fallback without user disruption

### Notifications

Uses `react-hot-toast` for user feedback:
- 🚫 Red toast for client already registered
- ✅ Green toast for successful actions
- Consistent styling with brand colors

### Error States

- Visual error display in UI with red border
- Toast notifications for immediate feedback
- Console logging for debugging
- Graceful fallbacks prevent user blocking

## Testing

Use the provided test script (`test-visitor-check.js`) in browser console to verify API integration.

## Security Considerations

- Email validation before API calls
- Error message sanitization
- No sensitive data exposure in client-side logs
- Proper error boundaries to prevent crashes

## Future Enhancements

- Add loading states during API calls
- Implement retry logic for failed requests
- Add analytics tracking for visitor patterns
- Consider caching visitor status for performance
