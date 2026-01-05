import type { DealsResponse } from '../types/deals';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const dealsApi = {
  async getDeals(): Promise<DealsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deals`);
      
      if (!response.ok) {
        throw new ApiError(
          `Failed to fetch deals: ${response.statusText}`,
          response.status
        );
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error: Unable to connect to the API',
        undefined,
        error
      );
    }
  },
};
