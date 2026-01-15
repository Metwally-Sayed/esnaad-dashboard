import axios from './axios-config';
import { toast } from 'sonner';
import {
  Request,
  RequestListResponse,
  RequestResponse,
  RequestFilters,
  CreateRequestDto,
  ApproveRequestDto,
  RejectRequestDto
} from '@/lib/types/request.types';

const API_BASE = '/requests';

export const requestService = {
  // Create new request (owner)
  async create(data: CreateRequestDto): Promise<Request> {
    try {
      const response = await axios.post<RequestResponse>(API_BASE, data);
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to create request';
      toast.error(errorMessage);
      throw error;
    }
  },

  // List requests with filters and pagination
  async list(filters: RequestFilters = {}): Promise<RequestListResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await axios.get<RequestListResponse>(
        `${API_BASE}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to load requests';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Get request by ID
  async getById(id: string): Promise<Request> {
    try {
      const response = await axios.get<RequestResponse>(`${API_BASE}/${id}`);
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to load request';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Approve request (admin only)
  async approve(id: string, data: ApproveRequestDto): Promise<Request> {
    try {
      const response = await axios.post<RequestResponse>(
        `${API_BASE}/${id}/approve`,
        data
      );
      toast.success('Request approved successfully');
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to approve request';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Reject request (admin only)
  async reject(id: string, data: RejectRequestDto): Promise<Request> {
    try {
      const response = await axios.post<RequestResponse>(
        `${API_BASE}/${id}/reject`,
        data
      );
      toast.success('Request rejected');
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to reject request';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Cancel request (owner can cancel their own)
  async cancel(id: string): Promise<Request> {
    try {
      const response = await axios.post<RequestResponse>(
        `${API_BASE}/${id}/cancel`
      );
      toast.success('Request cancelled');
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to cancel request';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Revoke request (admin only)
  async revoke(id: string, reason: string): Promise<Request> {
    try {
      const response = await axios.post<RequestResponse>(
        `${API_BASE}/${id}/revoke`,
        { reason }
      );
      toast.success('Request revoked');
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to revoke request';
      toast.error(errorMessage);
      throw error;
    }
  }
};
