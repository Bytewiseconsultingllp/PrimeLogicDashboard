import axios from "axios";
import { apiInstance } from "./axiosInstance";
import { TKPIRANK } from "@/types/project";


// Get all FreeLancers Request
export async function getAllFreelancersRequest() {
  try {
    const response = await apiInstance.get("/freelancer/getAllFreeLancerRequest");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch projects"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get all FreeLancers 
// export async function getAllFreelancers() {
//   try {
//     const response = await apiInstance.get("/freelancer/listAllFreelancers");
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error("Axios error:", error.response?.data || error.message);
//       throw new Error(
//         error.response?.data?.message || "Failed to fetch projects"
//       );
//     } else {
//       console.error("Unexpected error:", error);
//       throw new Error("An unexpected error occurred");
//     }
//   }
// }
export async function getAllFreelancers(page: number) {
  try {
    const response = await apiInstance.get("/freelancer/listAllFreelancers", {
      params: {
        page:page,
        // limit:limit // Include only if a rank is selected
      },
    });

    return response.data; // Response contains freelancers & pagination metadata
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch freelancers");
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get all FreeLancers 
export async function getAllTrashedFreelancers() {
  try {
    const response = await apiInstance.get("/freelancer/listAllFreelancers");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch projects"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}
// Accept FreeLancers 
export async function AcceptFreeLancerRequests(id:number) {
  try {
    const response = await apiInstance.patch(`/freelancer/acceptFreeLancerRequest/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch projects"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

//Trash a freelancer
export async function TrashAFreeLancer(id:number) {
  try {
    const response = await apiInstance.patch(`/freelancer/trashFreeLancerRequest/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to Trash the freelancer"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get current freelancer's profile
export async function getFreelancerProfile() {
  try {
    const response = await apiInstance.get("/freelancer/profile");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch freelancer profile"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get all available projects for bidding
export async function getAvailableProjects(page: number = 1, limit: number = 10) {
  try {
    const response = await apiInstance.get("/freelancer/projects", {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch available projects"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Submit a bid on a project
export async function submitBid(projectId: string, bidAmount: number, proposalText?: string) {
  try {
    const response = await apiInstance.post("/freelancer/bids", {
      projectId,
      bidAmount,
      proposalText
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to submit bid"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get all bids submitted by freelancer
export async function getFreelancerBids(page: number = 1, limit: number = 10, status?: string) {
  try {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    const response = await apiInstance.get("/freelancer/bids", { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch bids"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get specific bid details
export async function getBidDetails(bidId: string) {
  try {
    const response = await apiInstance.get(`/freelancer/bids/${bidId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch bid details"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get assigned/current projects for freelancer
// This fetches projects where freelancer is selected and payment succeeded
export async function getAssignedProjects() {
  try {
    const response = await apiInstance.get("/freelancer/projects");
    // Filter for assigned projects (where freelancer is in selectedFreelancers)
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch assigned projects"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get project details by ID
export async function getProjectDetails(projectId: string) {
  try {
    const response = await apiInstance.get(`/project/${projectId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch project details"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get milestones for a project
export async function getProjectMilestones(projectId: string) {
  try {
    const response = await apiInstance.get(`/project/${projectId}/milestones`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch milestones"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

