# Freelancer Dashboard Implementation Guide

## ✅ Completed Features

### 1. Homepage Profile Card
- ✅ Freelancer profile fetched on login
- ✅ Profile stored in localStorage
- ✅ Greeting card displays freelancer name
- ✅ Detailed profile card replaces income chart
- ✅ Profile warning if data unavailable

### 2. Current Projects Card
- ✅ API function `getAssignedProjects()` added
- ✅ Homepage fetches and displays assigned projects
- ✅ Shows first 2 current projects

### 3. Projects Page
- ✅ Updated UI with modern card design
- ✅ Connected to `/freelancer/projects` API
- ✅ Grid layout (2 columns on desktop)
- ✅ Mobile responsive
- ✅ Links to project details and bid pages

---

## 🚧 Remaining Implementation Tasks

### 4. Project Details Page (`/dashboard/freelancer/projects/[id]`)

**Current Status:** Has mock data  
**Required Changes:**

```typescript
// Update: app/dashboard/freelancer/projects/[id]/page.tsx

import { getProjectDetails } from "@/lib/api/freelancers"

// In useEffect:
const response = await getProjectDetails(projectId)
if (response.success && response.data) {
  setProject(response.data)
}
```

**API Endpoint:** `GET /project/{id}`  
**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "details": { "fullName", "businessEmail", "companyName", "businessType" },
    "services": [],
    "industries": [],
    "technologies": [],
    "features": [],
    "timeline": {},
    "estimate": {}
  }
}
```

---

### 5. Bid Page (`/dashboard/freelancer/project-bid`)

**Location:** `app/dashboard/freelancer/project-bid/page.tsx`

**Required Implementation:**

```typescript
"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { submitBid } from "@/lib/api/freelancers"
import { toast } from "sonner"

export default function BidPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const [bidAmount, setBidAmount] = useState("")
  const [proposalText, setProposalText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await submitBid(
        projectId!,
        parseFloat(bidAmount),
        proposalText
      )
      
      if (response.success) {
        toast.success("Bid submitted successfully!")
        router.push("/dashboard/freelancer/projects")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Place Your Bid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bidAmount">Bid Amount (USD)</Label>
            <Input
              id="bidAmount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter your bid amount"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="proposal">Proposal / Cover Letter</Label>
            <Textarea
              id="proposal"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Explain why you're the best fit for this project..."
              rows={8}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Bid"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
```

**API:** `POST /freelancer/bids`  
**Payload:**
```json
{
  "projectId": "uuid",
  "bidAmount": 25000,
  "proposalText": "optional string"
}
```

---

### 6. Project Status Page with Milestones

**Location:** `app/dashboard/freelancer/project-status/page.tsx`

**Required Implementation:**

```typescript
import { getAssignedProjects, getProjectMilestones } from "@/lib/api/freelancers"

// Fetch assigned projects
const projectsResponse = await getAssignedProjects()
const assignedProjects = projectsResponse.data.projects.filter(
  p => p.bids?.some(b => b.status === "ACCEPTED")
)

// For each project, fetch milestones
for (const project of assignedProjects) {
  const milestonesResponse = await getProjectMilestones(project.id)
  project.milestones = milestonesResponse.data
}
```

**Milestone Card Component:**

```typescript
// components/freelancer/MilestoneCard.tsx

export function MilestoneCard({ milestone }: { milestone: any }) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{milestone.milestoneName}</CardTitle>
          <Badge variant={getStatusVariant(milestone.status)}>
            {milestone.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{milestone.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="font-medium">{new Date(milestone.deadline).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="font-medium">{milestone.progress}%</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${milestone.progress}%` }}
          />
        </div>

        {milestone.deliverableUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={milestone.deliverableUrl} target="_blank">
              View Deliverable
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case "COMPLETED": return "default"
    case "IN_PROGRESS": return "secondary"
    case "BLOCKED": return "destructive"
    default: return "outline"
  }
}
```

**API:** `GET /project/{projectId}/milestones`

---

### 7. Settings Page

**Location:** `app/dashboard/freelancer/settings/page.tsx`

**Required API Functions:**

```typescript
// Add to lib/api/freelancers.ts

export async function updateFreelancerProfile(data: any) {
  const response = await apiInstance.patch("/freelancer/profile", data)
  return response.data
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await apiInstance.post("/freelancer/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return response.data
}
```

```typescript
// Add to lib/api/auth.ts

export async function updatePassword(currentPassword: string, newPassword: string) {
  const response = await authInstance.patch("/updatePassword", {
    currentPassword,
    newPassword
  })
  return response.data
}

export async function requestPasswordReset(email: string) {
  const response = await authInstance.post("/forgotPassword", { email })
  return response.data
}
```

**Settings Page Structure:**

```typescript
export default function SettingsPage() {
  const { freelancerProfile, refreshUser } = useAuthContext()
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="avatar">Avatar</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileForm profile={freelancerProfile} onUpdate={refreshUser} />
      </TabsContent>

      <TabsContent value="password">
        <PasswordForm />
      </TabsContent>

      <TabsContent value="avatar">
        <AvatarUpload onUpload={refreshUser} />
      </TabsContent>
    </Tabs>
  )
}
```

---

### 8. Avatar Sync Between Profile and Settings

**Implementation:**

1. **Store avatar URL in localStorage:**
```typescript
// When avatar is uploaded in settings
const response = await uploadAvatar(file)
if (response.success) {
  localStorage.setItem("userAvatar", response.data.avatarUrl)
  refreshUser() // Trigger context update
}
```

2. **Update AuthContext to include avatar:**
```typescript
// contexts/AuthContext.tsx
const [avatar, setAvatar] = useState<string | null>(null)

useEffect(() => {
  const savedAvatar = localStorage.getItem("userAvatar")
  if (savedAvatar) setAvatar(savedAvatar)
}, [])

// Add to context value
return (
  <AuthContext.Provider value={{ user, freelancerProfile, avatar, ... }}>
```

3. **Use avatar in components:**
```typescript
const { avatar } = useAuthContext()

<Avatar>
  <AvatarImage src={avatar || "/placeholder.jpg"} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

---

## API Endpoints Summary

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| Get Profile | GET | `/freelancer/profile` | ✅ Implemented |
| Get Projects | GET | `/freelancer/projects` | ✅ Implemented |
| Submit Bid | POST | `/freelancer/bids` | ✅ Implemented |
| Get Bids | GET | `/freelancer/bids` | ✅ Implemented |
| Get Project Details | GET | `/project/{id}` | ⚠️ Needs verification |
| Get Milestones | GET | `/project/{id}/milestones` | ⚠️ Needs verification |
| Update Profile | PATCH | `/freelancer/profile` | ❌ Not implemented |
| Upload Avatar | POST | `/freelancer/upload-avatar` | ❌ Not implemented |
| Update Password | PATCH | `/auth/updatePassword` | ❌ Not implemented |

---

## Next Steps

1. **Verify API endpoints** with backend team
2. **Implement remaining pages** (4-7)
3. **Test avatar sync** functionality
4. **Add error handling** and loading states
5. **Mobile responsiveness** testing
6. **Add pagination** to projects and bids pages

---

## Questions for Backend Team

1. What's the exact endpoint for project details? `/project/{id}` or `/freelancer/project/{id}`?
2. What's the endpoint for milestones? `/project/{id}/milestones` or `/freelancer/milestones`?
3. Is there an avatar upload endpoint? What's the expected format?
4. What's the endpoint to update freelancer profile details?
5. Password update endpoint - is it `/auth/updatePassword` or `/freelancer/updatePassword`?
