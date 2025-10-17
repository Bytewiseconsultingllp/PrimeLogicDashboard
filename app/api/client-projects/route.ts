// import { type NextRequest, NextResponse } from "next/server"
// import { getClientById } from "../verify-payment/route"

// // Mock projects database - replace with real database
// const projectsDatabase: Map<string, any[]> = new Map([
//   [
//     "client_demo_001",
//     [
//       {
//         id: 1,
//         fullName: "John Doe",
//         title: "E-commerce Platform Development",
//         detail:
//           "Build a complete e-commerce platform with payment integration, inventory management, and admin dashboard.",
//         deadline: "2025-03-15",
//         bounty: 15000,
//         progressPercentage: 65,
//         niche: "Web Development",
//         difficultyLevel: "HARD",
//         projectType: "Full Stack",
//         projectStatus: "ONGOING",
//         projectSlug: "ecommerce-platform",
//         createdAt: "2025-01-10",
//         selectedFreelancers: [
//           {
//             uid: "freelancer_1",
//             fullName: "Alice Johnson",
//             username: "alicejohn",
//             email: "alice@example.com",
//             yearsOfExperience: 5,
//             niche: "Full Stack Development",
//             kpiRank: "Expert",
//           },
//         ],
//       },
//       {
//         id: 2,
//         fullName: "John Doe",
//         title: "Mobile App UI/UX Design",
//         detail: "Design a modern and intuitive UI/UX for a fitness tracking mobile application.",
//         deadline: "2025-02-28",
//         bounty: 8000,
//         progressPercentage: 100,
//         niche: "UI/UX Design",
//         difficultyLevel: "MEDIUM",
//         projectType: "Design",
//         projectStatus: "COMPLETED",
//         projectSlug: "fitness-app-design",
//         createdAt: "2024-12-20",
//         selectedFreelancers: [
//           {
//             uid: "freelancer_2",
//             fullName: "Bob Smith",
//             username: "bobsmith",
//             email: "bob@example.com",
//             yearsOfExperience: 3,
//             niche: "UI/UX Design",
//             kpiRank: "Professional",
//           },
//         ],
//       },
//     ],
//   ],
// ])

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const clientId = searchParams.get("clientId")
//     const page = searchParams.get("page") || "1"

//     if (!clientId) {
//       return NextResponse.json(
//         {
//           projects: [],
//           totalPages: 0,
//           message: "Missing clientId",
//         },
//         { status: 400 },
//       )
//     }

//     const client = getClientById(clientId)
//     if (!client) {
//       console.log("[v0] Client not found:", clientId)
//       return NextResponse.json(
//         {
//           projects: [],
//           totalPages: 0,
//           message: "Client not found or not registered",
//         },
//         { status: 404 },
//       )
//     }

//     const { projects, totalPages } = await fetchClientProjectsFromDB(clientId, Number.parseInt(page))

//     console.log("[v0] Projects fetched for client:", { clientId, projectCount: projects.length })

//     return NextResponse.json({
//       projects,
//       totalPages,
//       clientInfo: {
//         id: client.id,
//         fullName: client.fullName,
//         email: client.email,
//       },
//       message: "Projects fetched successfully",
//     })
//   } catch (error) {
//     console.error("Error fetching client projects:", error)
//     return NextResponse.json(
//       {
//         projects: [],
//         totalPages: 0,
//         message: "An error occurred while fetching projects",
//       },
//       { status: 500 },
//     )
//   }
// }

// async function fetchClientProjectsFromDB(clientId: string, page: number): Promise<any> {
//   const itemsPerPage = 10

//   // Get projects for this client
//   const clientProjects = projectsDatabase.get(clientId) || []

//   // Calculate pagination
//   const startIndex = (page - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const paginatedProjects = clientProjects.slice(startIndex, endIndex)

//   const totalPages = Math.ceil(clientProjects.length / itemsPerPage)

//   console.log("[v0] Database query:", {
//     clientId,
//     page,
//     totalProjects: clientProjects.length,
//     returnedProjects: paginatedProjects.length,
//     totalPages,
//   })

//   return {
//     projects: paginatedProjects,
//     totalPages: Math.max(1, totalPages),
//   }
// }

// export function addProjectsForClient(clientId: string, projects: any[]): void {
//   projectsDatabase.set(clientId, projects)
// }
