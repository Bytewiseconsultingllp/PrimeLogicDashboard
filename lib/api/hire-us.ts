import axios from "axios";
import { apiInstance } from "./axiosInstance";

// Fetch all the Hire Us Requests
export async function getAllHireUsRequests() {
  try {
    const response = await apiInstance.get("/hireUs/getAllHireUsRequests");

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to fetch Hire Us Requests"
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}


// Trash a Hire Us Request
export async function trashHireUsRequest(id: number) {
    try {
        const response = await apiInstance.patch(`/hireUs/trashHireUsRequest/${id}`);
        return response;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
          throw new Error(
            error.response?.data?.message || "Failed to Trash Hire Us Requests"
          );
        } else {
          console.error("Unexpected error:", error);
          throw new Error("An unexpected error occurred");
        }
      }
}

// Fetch trashed Hire Us Requests
export async function getTrashedHireUsRequests() {
  try {
      const response = await apiInstance.get("/trash/getTrashedHireUs");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || "Failed to Fetch trashed Hire Us Requests"
        );
      } else {
        console.error("Unexpected error:", error);
        throw new Error("An unexpected error occurred");
      }
    }
}


// Untrash a Hire Us Request
export async function untrashHireUsRequest(id: number) {
  try {
      const response = await apiInstance.patch(`/hireUs/untrashHireUsRequest/${id}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || "Failed to Untrash Hire Us Request"
        );
      } else {
        console.error("Unexpected error:", error);
        throw new Error("An unexpected error occurred");
      }
    }
}

// Delete a Hire Us Request
export async function deleteHireUsRequest(id: number) {
  try {
      const response = await apiInstance.delete(`/hireUs/permanentDeleteHireUsRequest/${id}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || "Failed to Delete Hire Us Request"
        );
      } else {
        console.error("Unexpected error:", error);
        throw new Error("An unexpected error occurred");
      }
    }
}