/**
 * Audit Log Types
 */

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'UNIT_CREATED'
  | 'UNIT_UPDATED'
  | 'UNIT_DELETED'
  | 'UNIT_ASSIGNED'
  | 'UNIT_UNASSIGNED'
  | 'OWNER_CHANGED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  | 'SNAGGING_CREATED'
  | 'SNAGGING_UPDATED'
  | 'SNAGGING_DELETED'
  | 'SNAGGING_STATUS_CHANGED'
  | 'SNAGGING_MESSAGE_CREATED'
  | 'SNAGGING_MESSAGE_UPDATED'
  | 'SNAGGING_MESSAGE_DELETED';

export interface AuditActor {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'OWNER';
}

export interface AuditUnit {
  id: string;
  unitNumber: string;
  buildingName: string | null;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  actorId: string;
  unitId?: string | null;
  changes?: any;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor: AuditActor;
  unit?: AuditUnit | null;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  action?: AuditAction;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  actorId?: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper to format action names
export const formatAuditAction = (action: AuditAction): string => {
  const actionMap: Record<AuditAction, string> = {
    USER_CREATED: 'User Created',
    USER_UPDATED: 'User Updated',
    USER_DELETED: 'User Deleted',
    UNIT_CREATED: 'Unit Created',
    UNIT_UPDATED: 'Unit Updated',
    UNIT_DELETED: 'Unit Deleted',
    UNIT_ASSIGNED: 'Unit Assigned',
    UNIT_UNASSIGNED: 'Unit Unassigned',
    OWNER_CHANGED: 'Owner Changed',
    PROJECT_CREATED: 'Project Created',
    PROJECT_UPDATED: 'Project Updated',
    PROJECT_DELETED: 'Project Deleted',
    SNAGGING_CREATED: 'Snagging Created',
    SNAGGING_UPDATED: 'Snagging Updated',
    SNAGGING_DELETED: 'Snagging Deleted',
    SNAGGING_STATUS_CHANGED: 'Snagging Status Changed',
    SNAGGING_MESSAGE_CREATED: 'Message Created',
    SNAGGING_MESSAGE_UPDATED: 'Message Updated',
    SNAGGING_MESSAGE_DELETED: 'Message Deleted',
  };
  return actionMap[action] || action;
};

// Helper to get action color
export const getAuditActionColor = (action: AuditAction): string => {
  if (action.includes('CREATED')) return 'success';
  if (action.includes('UPDATED')) return 'warning';
  if (action.includes('DELETED')) return 'destructive';
  if (action.includes('ASSIGNED')) return 'info';
  if (action.includes('UNASSIGNED')) return 'secondary';
  return 'default';
};

// Helper to format entity type
export const formatEntityType = (entityType: string): string => {
  const typeMap: Record<string, string> = {
    user: 'User',
    unit: 'Unit',
    project: 'Project',
    snagging: 'Snagging',
    snagging_message: 'Message',
  };
  return typeMap[entityType.toLowerCase()] || entityType;
};