import axios from "axios";
import { apiInstance } from "./axiosInstance";

// Get all project builder requests
export async function getAllProjectBuilders() {
  try {
    const response = await apiInstance.get("/project-builder");
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch project builders"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get single project builder by ID
export async function getSingleProjectBuilder(id: string) {
  try {
    const response = await apiInstance.get(`/project-builder/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch project builder"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Create project builder
export async function createProjectBuilder(data: any) {
  try {
    const response = await apiInstance.post("/project-builder", data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to create project builder"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Update project builder
export async function updateProjectBuilder(id: string, data: any) {
  try {
    const response = await apiInstance.put(`/project-builder/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to update project builder"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Delete project builder
export async function deleteProjectBuilder(id: string) {
  try {
    const response = await apiInstance.delete(`/project-builder/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to delete project builder"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Get project builder with freelancers
export async function getProjectBuilderWithFreelancers(id: string) {
  try {
    const response = await apiInstance.get(`/project-builder/${id}/freelancers`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch project builder with freelancers"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Add interested freelancers
export async function addInterestedFreelancers(id: string, freelancerIds: string[]) {
  try {
    const response = await apiInstance.post(`/project-builder/${id}/interested-freelancers`, {
      freelancerIds
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to add interested freelancers"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Remove interested freelancer
export async function removeInterestedFreelancer(id: string, freelancerId: string) {
  try {
    const response = await apiInstance.delete(`/project-builder/${id}/interested-freelancers`, {
      data: { freelancerId }
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to remove interested freelancer"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Select freelancers for project
export async function selectFreelancers(id: string, freelancerIds: string[]) {
  try {
    const response = await apiInstance.post(`/project-builder/${id}/selected-freelancers`, {
      freelancerIds
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to select freelancers"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

// Remove selected freelancer
export async function removeSelectedFreelancer(id: string, freelancerId: string) {
  try {
    const response = await apiInstance.delete(`/project-builder/${id}/selected-freelancers`, {
      data: { freelancerId }
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to remove selected freelancer"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

