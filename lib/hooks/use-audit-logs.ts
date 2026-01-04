/**
 * Custom hooks for Audit Logs
 */

import useSWR from 'swr';
import { auditService } from '@/lib/api/audit.service';
import { AuditLogFilters, AuditLogResponse } from '@/lib/types/audit.types';
import { toast } from 'sonner';

/**
 * Hook to get all audit logs
 */
export function useAuditLogs(filters?: AuditLogFilters) {
  const queryString = filters ? JSON.stringify(filters) : '';

  const { data, error, isLoading, mutate } = useSWR<AuditLogResponse>(
    `/audit-logs?${queryString}`,
    () => auditService.getAuditLogs(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error('Error fetching audit logs:', err);
        toast.error('Failed to load audit logs');
      }
    }
  );

  return {
    auditLogs: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate
  };
}

/**
 * Hook to get audit logs for a specific entity
 */
export function useEntityAuditLogs(
  entityType: string | undefined,
  entityId: string | undefined,
  filters?: AuditLogFilters
) {
  const queryString = filters ? JSON.stringify(filters) : '';
  const shouldFetch = entityType && entityId;

  const { data, error, isLoading, mutate } = useSWR<AuditLogResponse>(
    shouldFetch ? `/audit-logs/entity/${entityType}/${entityId}?${queryString}` : null,
    () => auditService.getAuditLogsByEntity(entityType!, entityId!, filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error('Error fetching entity audit logs:', err);
      }
    }
  );

  return {
    auditLogs: data?.data || [],
    pagination: data?.pagination,
    isLoading: shouldFetch ? isLoading : false,
    error,
    mutate
  };
}

/**
 * Hook to get audit logs for a specific unit
 */
export function useUnitAuditLogs(unitId: string | undefined, filters?: AuditLogFilters) {
  return useEntityAuditLogs('unit', unitId, filters);
}

/**
 * Hook to get audit logs for a specific project
 */
export function useProjectAuditLogs(projectId: string | undefined, filters?: AuditLogFilters) {
  return useEntityAuditLogs('project', projectId, filters);
}

/**
 * Hook to get audit logs for a specific user
 */
export function useUserAuditLogs(userId: string | undefined, filters?: AuditLogFilters) {
  return useEntityAuditLogs('user', userId, filters);
}

/**
 * Hook to get audit logs by actor
 */
export function useActorAuditLogs(actorId: string | undefined, filters?: AuditLogFilters) {
  const queryString = filters ? JSON.stringify(filters) : '';
  const shouldFetch = !!actorId;

  const { data, error, isLoading, mutate } = useSWR<AuditLogResponse>(
    shouldFetch ? `/audit-logs/actor/${actorId}?${queryString}` : null,
    () => auditService.getAuditLogsByActor(actorId!, filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error('Error fetching actor audit logs:', err);
      }
    }
  );

  return {
    auditLogs: data?.data || [],
    pagination: data?.pagination,
    isLoading: shouldFetch ? isLoading : false,
    error,
    mutate
  };
}

/**
 * Helper hook to format dates for display
 */
export function useAuditFormatters() {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    return formatDate(date);
  };

  return {
    formatDate,
    formatRelativeTime
  };
}