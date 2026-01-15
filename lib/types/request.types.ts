// Request types
export type RequestType = 'GUEST_VISIT' | 'WORK_PERMISSION';
export type RequestStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type ExpiresMode = 'DATE' | 'USES' | 'UNLIMITED';

// Base request interface
export interface Request {
  id: string;
  unitId: string;
  ownerId: string;
  type: RequestType;
  status: RequestStatus;
  purpose?: string;

  // Visitor/Work info
  visitorName?: string;
  visitorPhone?: string;
  companyName?: string;
  representativeName?: string;

  // Schedule
  startAt?: string;
  endAt?: string;

  // Expiry configuration
  expiresMode?: ExpiresMode;
  expiresAt?: string;
  maxUses?: number;
  usesCount: number;

  // Approval/Rejection
  approvedByAdminId?: string;
  approvedAt?: string;
  rejectedByAdminId?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // PDF
  pdfUrl?: string;
  pdfPublicId?: string;

  // Meta
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Relations
  unit?: {
    id: string;
    unitNumber: string;
    buildingName?: string;
    floor?: number;
    area?: number;
    address?: string;
    project?: {
      id: string;
      name: string;
      location?: string;
    };
  };
  owner?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    address?: string;
  };
  approvedByAdmin?: {
    id: string;
    name?: string;
    email: string;
  };
  rejectedByAdmin?: {
    id: string;
    name?: string;
    email: string;
  };
}

// DTOs
export interface CreateRequestDto {
  unitId: string;
  type: RequestType;
  purpose?: string;
  visitorName?: string;
  visitorPhone?: string;
  companyName?: string;
  representativeName?: string;
  startAt?: string;
  endAt?: string;
}

export interface ApproveRequestDto {
  expiresMode: ExpiresMode;
  expiresAt?: string;
  maxUses?: number;
}

export interface RejectRequestDto {
  reason: string;
}

// Filters
export interface RequestFilters {
  status?: RequestStatus;
  type?: RequestType;
  unitId?: string;
  ownerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'approvedAt' | 'type' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// API Response
export interface RequestListResponse {
  success: boolean;
  data: Request[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RequestResponse {
  success: boolean;
  data: Request;
}
