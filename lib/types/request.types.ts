// Request types
export type RequestType = 'GUEST_VISIT' | 'WORK_PERMISSION' | 'OWNERSHIP_TRANSFER' | 'TENANT_REGISTRATION' | 'UNIT_MODIFICATIONS';
export type RequestStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type ExpiresMode = 'DATE' | 'USES' | 'UNLIMITED';
export type ModificationType = 'RENOVATION' | 'REPAIR' | 'ADDITION' | 'REMOVAL' | 'ELECTRICAL' | 'PLUMBING' | 'HVAC' | 'STRUCTURAL' | 'COSMETIC' | 'OTHER';

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

  // Ownership Transfer info
  transferUnitIds?: string[];
  newOwnerId?: string;
  newOwnerName?: string;
  newOwnerEmail?: string;
  newOwnerPhone?: string;
  message?: string;

  // Tenant Registration info
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  emiratesIdUrl?: string;
  passportUrl?: string;
  rentContractUrl?: string;
  ijaryUrl?: string;

  // Unit Modifications info
  modificationType?: ModificationType;
  modificationTypeOther?: string;
  modificationMessage?: string;
  contactEmail?: string;
  contactPhone?: string;

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
  newOwner?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
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
  unitId?: string;
  type: RequestType;
  purpose?: string;
  visitorName?: string;
  visitorPhone?: string;
  companyName?: string;
  representativeName?: string;
  transferUnitIds?: string[];
  newOwnerId?: string;
  newOwnerName?: string;
  newOwnerEmail?: string;
  newOwnerPhone?: string;
  message?: string; // Message for ownership transfer requests
  // Tenant Registration fields
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  emiratesIdUrl?: string;
  passportUrl?: string;
  rentContractUrl?: string;
  ijaryUrl?: string;
  // Unit Modifications fields
  modificationType?: ModificationType;
  modificationTypeOther?: string;
  modificationMessage?: string;
  contactEmail?: string;
  contactPhone?: string;
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

// Message types
export type UserRole = 'ADMIN' | 'OWNER';

export interface RequestMessage {
  id: string;
  requestId: string;
  authorUserId: string;
  authorRole: UserRole;
  body: string;
  createdAt: string;
  deletedAt?: string;
  author: {
    id: string;
    name?: string;
    email: string;
    role: UserRole;
  };
}

export interface CreateMessageDto {
  body: string;
}

export interface MessageFilters {
  limit?: number;
  cursor?: string;
}

export interface MessageListResponse {
  success: boolean;
  data: RequestMessage[];
  nextCursor?: string;
}

export interface MessageResponse {
  success: boolean;
  data: RequestMessage;
}
