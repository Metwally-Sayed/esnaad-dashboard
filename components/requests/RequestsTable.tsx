"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Request } from "@/lib/types/request.types";
import { format } from "date-fns";
import {
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Mail,
  UserPlus,
  Briefcase,
  Users,
  Home,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RequestsTableProps {
  requests: Request[];
  basePath?: string; // "/requests" for owner, "/admin/requests" for admin
  isLoading?: boolean;
}

export function RequestsTable({
  requests,
  basePath = "/requests",
  isLoading = false,
}: RequestsTableProps) {
  const router = useRouter();

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { variant: any; label: string; icon: any }> = {
      SUBMITTED: { variant: "outline", label: "Submitted", icon: Clock },
      APPROVED: { variant: "default", label: "Approved", icon: CheckCircle },
      REJECTED: { variant: "destructive", label: "Rejected", icon: XCircle },
      EXPIRED: { variant: "secondary", label: "Expired", icon: Clock },
      CANCELLED: { variant: "secondary", label: "Cancelled", icon: Ban },
    };
    const config = badges[status] || badges.SUBMITTED;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Type badge with icons
  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; icon: any; className?: string }> = {
      GUEST_VISIT: { label: "Guest Visit", icon: Users },
      WORK_PERMISSION: { label: "Work Permission", icon: Briefcase },
      OWNERSHIP_TRANSFER: { label: "Ownership Transfer", icon: UserPlus, className: "bg-purple-100 text-purple-800 border-purple-200" },
      TENANT_REGISTRATION: { label: "Tenant Registration", icon: Home, className: "bg-blue-100 text-blue-800 border-blue-200" },
      UNIT_MODIFICATIONS: { label: "Unit Modifications", icon: Wrench, className: "bg-orange-100 text-orange-800 border-orange-200" },
    };
    const config = types[type] || types.GUEST_VISIT;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${config.className || ""}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Get details based on request type
  const getRequestDetails = (request: Request) => {
    switch (request.type) {
      case "GUEST_VISIT":
        return {
          primary: request.visitorName || "—",
          secondary: request.visitorPhone || null,
        };
      case "WORK_PERMISSION":
        return {
          primary: request.companyName || "—",
          secondary: request.representativeName || null,
        };
      case "OWNERSHIP_TRANSFER":
        return {
          primary: request.newOwnerName || request.newOwner?.name || "—",
          secondary: request.newOwnerEmail || request.newOwner?.email || null,
        };
      case "TENANT_REGISTRATION":
        return {
          primary: request.tenantName || "—",
          secondary: request.tenantEmail || null,
        };
      case "UNIT_MODIFICATIONS":
        const modType = request.modificationType === "OTHER"
          ? request.modificationTypeOther
          : request.modificationType?.replace(/_/g, " ");
        return {
          primary: modType || "—",
          secondary: request.contactEmail || null,
        };
      default:
        return { primary: "—", secondary: null };
    }
  };

  // Get unit info - handles multiple units for ownership transfer
  const getUnitInfo = (request: Request) => {
    if (request.type === "OWNERSHIP_TRANSFER" && request.transferUnitIds && request.transferUnitIds.length > 1) {
      return {
        primary: `${request.transferUnitIds.length} Units`,
        secondary: request.unit?.buildingName || null,
      };
    }
    return {
      primary: request.unit?.unitNumber || "—",
      secondary: request.unit?.buildingName || null,
    };
  };

  // Get validity/info summary based on type
  const getInfoSummary = (request: Request) => {
    // For ownership transfer, show message preview or status info
    if (request.type === "OWNERSHIP_TRANSFER") {
      if (request.status === "APPROVED") {
        return "Approved";
      }
      return request.message ? "Has message" : "—";
    }

    // For tenant registration, show tenant phone or status
    if (request.type === "TENANT_REGISTRATION") {
      if (request.status === "APPROVED") {
        return "Approved";
      }
      return request.tenantPhone || "—";
    }

    // For unit modifications, show contact phone or status
    if (request.type === "UNIT_MODIFICATIONS") {
      if (request.status === "APPROVED") {
        return "Approved";
      }
      return request.contactPhone || "—";
    }

    // For other types, show validity info
    if (!request.expiresMode || request.status !== "APPROVED") {
      return "—";
    }

    if (request.expiresMode === "DATE" && request.expiresAt) {
      return format(new Date(request.expiresAt), "PP");
    } else if (request.expiresMode === "USES") {
      return `${request.usesCount}/${request.maxUses} uses`;
    } else if (request.expiresMode === "UNLIMITED") {
      return "Unlimited";
    }
    return "—";
  };

  const handleView = (requestId: string) => {
    router.push(`${basePath}/${requestId}`);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Info</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No requests found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a new request to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Type</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[100px]">Unit</TableHead>
              <TableHead className="hidden md:table-cell min-w-[150px]">Details</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[100px]">Info</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[100px]">Created</TableHead>
              <TableHead className="text-right min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const details = getRequestDetails(request);
              const unitInfo = getUnitInfo(request);

              return (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleView(request.id)}
                >
                  <TableCell>{getTypeBadge(request.type)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="font-medium">{unitInfo.primary}</div>
                    {unitInfo.secondary && (
                      <div className="text-sm text-muted-foreground">
                        {unitInfo.secondary}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="font-medium">{details.primary}</div>
                    {details.secondary && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {details.secondary}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {getInfoSummary(request)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {format(new Date(request.createdAt), "PP")}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`${basePath}/${request.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {request.pdfUrl && (
                        <Button asChild variant="ghost" size="sm">
                          <a
                            href={request.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
