"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getFreelancerProfile } from "@/lib/api/freelancers"
import { useAuthContext } from "@/contexts/AuthContext"
import { getFreelancerProfile as getStoredProfile } from "@/lib/api/storage"

export default function DebugProfilePage() {
  const { user, freelancerProfile } = useAuthContext()
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAPICall = async () => {
    setLoading(true)
    setError(null)
    setApiResponse(null)

    try {
      console.log("🧪 Testing API call to /freelancer/profile...")
      const response = await getFreelancerProfile()
      console.log("✅ API Response:", response)
      setApiResponse(response)
    } catch (err) {
      console.error("❌ API Error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const storedProfile = getStoredProfile()

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Debug Page</h1>
        <p className="text-muted-foreground mt-2">
          Test and debug freelancer profile fetching
        </p>
      </div>

      {/* User Info from Context */}
      <Card>
        <CardHeader>
          <CardTitle>User Info (from AuthContext)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Profile from Context */}
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Profile (from AuthContext)</CardTitle>
        </CardHeader>
        <CardContent>
          {freelancerProfile ? (
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(freelancerProfile, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground">No profile in context</p>
          )}
        </CardContent>
      </Card>

      {/* Profile from localStorage */}
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Profile (from localStorage)</CardTitle>
        </CardHeader>
        <CardContent>
          {storedProfile ? (
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(storedProfile, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground">No profile in localStorage</p>
          )}
        </CardContent>
      </Card>

      {/* API Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test API Call</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAPICall} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test GET /freelancer/profile"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {apiResponse && (
            <div>
              <p className="font-semibold mb-2">API Response:</p>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">NEXT_PUBLIC_PLS:</span>{" "}
              {process.env.NEXT_PUBLIC_PLS || "Not set"}
            </p>
            <p>
              <span className="font-semibold">NEXT_PUBLIC_PLS_AUTH:</span>{" "}
              {process.env.NEXT_PUBLIC_PLS_AUTH || "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Debugging Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check if user info is present (should show role: FREELANCER)</li>
            <li>Check if profile is in AuthContext</li>
            <li>Check if profile is in localStorage</li>
            <li>Click "Test API Call" to manually fetch profile</li>
            <li>Check browser console for detailed logs</li>
            <li>Verify environment variables are correct</li>
            <li>Check Network tab in DevTools for API requests</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
