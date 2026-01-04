/**
 * Audit Log API Service
 */

import { api } from './axios-config';
import { AuditLog, AuditLogFilters, AuditLogResponse } from '@/lib/types/audit.types';
import { ApiResponse } from '@/lib/types/auth.types';

class AuditService {
  private baseURL = '/audit-logs';

  /**
   * Get all audit logs with pagination and filters
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<ApiResponse<AuditLogResponse>>(
      `${this.baseURL}?${params.toString()}`
    );
    return response.data.data!;
  }

  /**
   * Get audit logs for a specific entity
   */
  async getAuditLogsByEntity(
    entityType: string,
    entityId: string,
    filters?: AuditLogFilters
  ): Promise<AuditLogResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<ApiResponse<AuditLogResponse>>(
      `${this.baseURL}/entity/${entityType}/${entityId}?${params.toString()}`
    );
    return response.data.data!;
  }

  /**
   * Get audit logs by actor (user who performed the action)
   */
  async getAuditLogsByActor(
    actorId: string,
    filters?: AuditLogFilters
  ): Promise<AuditLogResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<ApiResponse<AuditLogResponse>>(
      `${this.baseURL}/actor/${actorId}?${params.toString()}`
    );
    return response.data.data!;
  }

  /**
   * Get audit logs for a specific unit
   */
  async getUnitAuditLogs(
    unitId: string,
    filters?: AuditLogFilters
  ): Promise<AuditLogResponse> {
    return this.getAuditLogsByEntity('unit', unitId, filters);
  }

  /**
   * Get audit logs for a specific project
   */
  async getProjectAuditLogs(
    projectId: string,
    filters?: AuditLogFilters
  ): Promise<AuditLogResponse> {
    return this.getAuditLogsByEntity('project', projectId, filters);
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: string,
    filters?: AuditLogFilters
  ): Promise<AuditLogResponse> {
    return this.getAuditLogsByEntity('user', userId, filters);
  }
}

export const auditService = new AuditService();