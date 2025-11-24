import { apiClient } from './apiClient';

interface ProjectDraft {
  id: string;
  clientId: string;
  isFinalized: boolean;
  details: {
    companyName: string;
    businessType: string;
    companyWebsite?: string;
    businessAddress?: string;
    fullName?: string;
    businessEmail?: string;
    phoneNumber?: string;
  };
  estimate?: {
    estimateFinalPriceMin: number;
    estimateFinalPriceMax: number;
    currency: string;
  };
  [key: string]: any;
}

export const projectDraftsApi = {
  // Step 1: Create project draft with business details
  async createDraft(data: {
    companyName: string;
    businessType: string;
    companyWebsite?: string;
    businessAddress?: string;
  }): Promise<{ data: ProjectDraft }> {
    const response = await apiClient.post('/projects/draft/create', data);
    return response.data;
  },

  // Get all drafts for authenticated client
  async getDrafts(): Promise<{ data: ProjectDraft[] }> {
    const response = await apiClient.get('/projects/draft/my-drafts');
    return response.data;
  },

  // Get single draft by ID
  async getDraftById(draftId: string): Promise<{ data: ProjectDraft }> {
    const response = await apiClient.get(`/projects/draft/${draftId}`);
    return response.data;
  },

  // Step 2: Add services to draft
  async addServices(draftId: string, services: Array<{ id: string; name: string }>) {
    const response = await apiClient.post(`/projects/draft/${draftId}/services`, { services });
    return response.data;
  },

  // Step 3: Add industries to draft
  async addIndustries(draftId: string, industries: string[]) {
    const response = await apiClient.post(`/projects/draft/${draftId}/industries`, { industries });
    return response.data;
  },

  // Step 4: Add technologies to draft
  async addTechnologies(draftId: string, technologies: string[]) {
    const response = await apiClient.post(`/projects/draft/${draftId}/technologies`, { technologies });
    return response.data;
  },

  // Step 5: Add features to draft
  async addFeatures(draftId: string, features: string[]) {
    const response = await apiClient.post(`/projects/draft/${draftId}/features`, { features });
    return response.data;
  },

  // Step 6: Add discount to draft
  async addDiscount(
    draftId: string,
    discount: {
      type: string;
      percent: number;
      notes?: string;
    }
  ) {
    const response = await apiClient.post(`/projects/draft/${draftId}/discount`, discount);
    return response.data;
  },

  // Step 7: Add timeline to draft (Auto-calculates estimate)
  async addTimeline(
    draftId: string,
    timeline: {
      option: string;
      rushFeePercent: number;
      estimatedDays: number;
      description?: string;
    }
  ) {
    const response = await apiClient.post(`/projects/draft/${draftId}/timeline`, timeline);
    return response.data;
  },

  // Get draft estimate
  async getEstimate(draftId: string) {
    const response = await apiClient.get(`/projects/draft/${draftId}/estimate`);
    return response.data;
  },

  // Accept draft estimate
  async acceptEstimate(draftId: string) {
    const response = await apiClient.post(`/projects/draft/${draftId}/estimate/accept`);
    return response.data;
  },

  // Finalize draft and create actual project
  async finalizeDraft(draftId: string, paymentMethod: string) {
    const response = await apiClient.post(`/projects/draft/${draftId}/finalize`, {
      paymentMethod,
    });
    return response.data;
  },

  // Delete draft
  async deleteDraft(draftId: string) {
    const response = await apiClient.delete(`/projects/draft/${draftId}`);
    return response.data;
  },
};

export default projectDraftsApi;
