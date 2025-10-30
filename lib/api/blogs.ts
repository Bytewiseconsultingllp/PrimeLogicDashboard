import axios from "axios";
import { apiInstance } from "./axiosInstance";


// Create a blog
export async function createABlog(data: any) {
  try {
    const response = await apiInstance.post("/blog/createBlog", data);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    } else {
      throw new Error("Failed to trash the message");
    }
  }
}



// get Single Blog
export async function getASingleBlog(blogSlug:string) {
  try {
    const response = await apiInstance.get(`/blog/getSingleBlog/${blogSlug}`);
    if(response?.status === 200) {
      return response?.data;
    }
  } catch (error: any) {
    if(axios.isAxiosError(error) && error.response) {
      throw error?.response?.data;
    } else {
      throw new Error("Failed to fetch Single blog");
    }
  }
}


// get All Public blogs
export async function getAllPublicBlogs(currentPage: number, limit: number) {
  try {
    const response = await apiInstance.get(`/blog/getAllPublicBlogs/?page=${currentPage}&limit=${limit}`)
    if(response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if(axios.isAxiosError(error) && error.response) {
      throw error?.response?.data;
    } else {
      throw new Error("Failed to fetch all blogs");
    }
  }
}

// Delete a blog
export async function deleteABlog(blogSLug: string) {
  try {
    const response = await apiInstance.delete(`/blog/deleteBlog/${blogSLug}`);
    if(response.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if(axios.isAxiosError(error) && error.response) {
      throw error?.response?.data;
    } else {
      throw new Error("Failed to Delete the blogs");
    }
  }
}

// Update a blog
export async function updateABlog(blogSlug: string, blogData: any) {
  try{
    const response = await apiInstance.patch(`/blog/updateBlog/${blogSlug}`, blogData);
    if(response?.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if(axios.isAxiosError(error) && error.response) {
      throw error?.response?.data;
    } else {
      throw new Error("Failed to update the blog");
    }
  }
}
 
// Get all private Blogs
export async function getAllPrivateBlogs() {
  try {
    const response = await apiInstance.get("/blog/getAllPrivateBlogs");
    if(response?.status === 200) {
      return response.data;
    }
  } catch (error: any) {
    if(axios.isAxiosError(error) && error.response) {
      throw error?.response?.data;
    } else {
      throw new Error("Failed to get All Private Blogs");
    }
  }
}

// Update blog visibility
export async function updateBlogVisibility(blogSlug: string, isPublic: boolean) {
  // Simulate API call
  try {
    const response = await apiInstance.patch(`/blog/makeBlogPublicOrPrivate/${blogSlug}`);
    if(response?.status === 200) {
      console.log(`Updating blog ${blogSlug} visibility to ${isPublic ? "public" : "private"}`)
      return response?.data;
     
    }
  } catch (error: any) {
    if(axios.isAxiosError(error) && error.response) {
      throw error?.response?.data;
    } else {
      throw new Error("Failed to fetch Single blog");
    }
  }
}