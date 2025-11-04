import { getUserDetails } from "./storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_PLS || "http://localhost:8000/api/v1";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const userDetails = getUserDetails();
  const token = userDetails?.accessToken;
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
};

// Get all projects for the authenticated client
export const getMyProjects = async (page: number = 1, limit: number = 10) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/my-projects?page=${page}&limit=${limit}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching my projects:", error);
    throw error;
  }
};

// Get single project by ID
export const getProjectById = async (projectId: string) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

// Get project payment status
export const getProjectPaymentStatus = async (projectId: string) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/payment/project/${projectId}/status`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payment status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching payment status:", error);
    throw error;
  }
};

// Create project payment checkout session
export const createProjectPaymentSession = async (projectId: string, successUrl: string, cancelUrl: string) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/payment/project/create-checkout-session`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        projectId,
        successUrl,
        cancelUrl
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment session: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating payment session:", error);
    throw error;
  }
};

// Get project milestones
export const getProjectMilestones = async (projectId: string) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch milestones: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching milestones:", error);
    throw error;
  }
};

// Create milestone
export const createMilestone = async (projectId: string, milestoneData: any) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones`, {
      method: "POST",
      headers,
      body: JSON.stringify(milestoneData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create milestone: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
};

// Update milestone
export const updateMilestone = async (projectId: string, milestoneId: string, milestoneData: any) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(milestoneData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update milestone: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
};

// Submit feedback
export const submitProjectFeedback = async (projectId: string, feedbackData: any) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...feedbackData,
        projectId,
        source: "client_project_view"
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

// Update project Discord URL
export const updateProjectDiscordUrl = async (projectId: string, discordChatUrl: string) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/discord-url`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ discordChatUrl })
    });

    if (!response.ok) {
      throw new Error(`Failed to update Discord URL: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating Discord URL:", error);
    throw error;
  }
};
