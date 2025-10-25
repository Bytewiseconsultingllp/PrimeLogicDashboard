// "use client"

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Loader2, ArrowRight } from "lucide-react"

// interface Project {
//   id: string
//   projectName: string
//   projectDescription: string
//   budget: number
//   timeline: string
//   status: string
// }

// export default function ProjectsPage() {
//   const [projects, setProjects] = useState<Project[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         setLoading(true)
//         const token = localStorage.getItem("authToken")
//         const response = await fetch("/api/projects", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         const data = await response.json()

//         if (data.success) {
//           setProjects(data.data)
//         } else {
//           setError(data.error || "Failed to fetch projects")
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to fetch projects")
//         console.error("[v0] Error fetching projects:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchProjects()
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Projects</h1>
//         <p className="text-muted-foreground mt-2 text-sm md:text-base">Browse and bid on projects</p>
//       </div>

//       {error && (
//         <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
//           {error}
//         </div>
//       )}

//       {projects.length === 0 ? (
//         <Card>
//           <CardContent className="py-12 text-center">
//             <p className="text-muted-foreground">No projects available at the moment</p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 gap-4 md:gap-6">
//           {projects.map((project) => (
//             <Card key={project.id} className="hover:shadow-lg transition-shadow">
//               <CardContent className="p-4 md:p-6 space-y-4">
//                 <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-lg md:text-xl font-bold text-foreground break-words">{project.projectName}</h3>
//                     <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
//                       {project.projectDescription}
//                     </p>
//                   </div>
//                   <Badge className="bg-green-100 text-green-800 whitespace-nowrap">{project.status}</Badge>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
//                   <div>
//                     <p className="text-xs text-muted-foreground">Budget</p>
//                     <p className="text-lg md:text-xl font-bold text-[#003087]">${project.budget.toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted-foreground">Timeline</p>
//                     <p className="text-lg md:text-xl font-bold text-foreground">{project.timeline}</p>
//                   </div>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
//                   <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
//                     <Button variant="outline" className="w-full bg-transparent">
//                       View More
//                     </Button>
//                   </Link>
//                   <Link href={`/dashboard/project-bid/${project.id}`} className="flex-1">
//                     <Button className="w-full gap-2 bg-[#003087] hover:bg-[#002060]">
//                       Bid <ArrowRight className="w-4 h-4" />
//                     </Button>
//                   </Link>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight } from "lucide-react"

interface Project {
  id: string
  projectName: string
  projectDescription: string
  budget: number
  timeline: string
  status: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (data.success) {
          setProjects(data.data)
        } else {
          setError(data.error || "Failed to fetch projects")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch projects")
        console.error("[v0] Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Projects</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">Browse and bid on projects</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No projects available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-foreground break-words">{project.projectName}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">
                      {project.projectDescription}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 whitespace-nowrap">{project.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-lg md:text-xl font-bold text-[#003087]">${project.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="text-lg md:text-xl font-bold text-foreground">{project.timeline}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href={`/dashboard/freelancer/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View More
                    </Button>
                  </Link>
                  <Link href={`/dashboard/freelancer/project-bid/${project.id}`} className="flex-1">
                    <Button className="w-full gap-2 bg-[#003087] hover:bg-[#002060]">
                      Bid <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
