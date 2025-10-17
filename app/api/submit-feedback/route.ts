import { type NextRequest, NextResponse } from "next/server"
import { getClientById } from "../verify-payment/route"

// Mock feedback database - replace with real database
const feedbackDatabase: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, clientId, rating, comment } = body

    if (!projectId || !clientId || !rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const client = getClientById(clientId)
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found or not registered",
        },
        { status: 404 },
      )
    }

    await saveFeedbackToDB(projectId, clientId, rating, comment, client.email)

    console.log("[v0] Feedback submitted:", { projectId, clientId, rating })

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while submitting feedback",
      },
      { status: 500 },
    )
  }
}

async function saveFeedbackToDB(
  projectId: number,
  clientId: string,
  rating: number,
  comment: string,
  clientEmail: string,
): Promise<void> {
  const feedback = {
    id: `feedback_${Date.now()}`,
    projectId,
    clientId,
    clientEmail,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  }

  feedbackDatabase.push(feedback)
  console.log("[v0] Feedback saved to database:", feedback)
}

export function getAllFeedback(): any[] {
  return feedbackDatabase
}
