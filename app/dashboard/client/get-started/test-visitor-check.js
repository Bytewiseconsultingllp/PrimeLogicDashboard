// Test script to verify the visitor check API integration
// This can be run in the browser console to test the functionality

async function testVisitorCheck() {
  const API_BASE_URL = "http://localhost:8000"
  
  // Test email check
  const testEmail = "john@company.com"
  
  try {
    console.log('Testing visitor check API...')
    
    const response = await fetch(`${API_BASE_URL}/api/v1/visitors/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    })
    
    const data = await response.json()
    
    console.log('API Response:', data)
    
    if (data.success) {
      const { isClient, isVisitor, visitorId, message } = data.data
      
      if (isClient) {
        console.log('✅ Client already exists - would show error notification')
      } else if (isVisitor && visitorId) {
        console.log('✅ Existing visitor found - would use visitor ID:', visitorId)
      } else {
        console.log('✅ New visitor - would create new visitor')
      }
    } else {
      console.log('❌ API check failed - would fallback to creating new visitor')
    }
    
  } catch (error) {
    console.error('❌ Error testing visitor check:', error)
  }
}

// Run the test
testVisitorCheck()
