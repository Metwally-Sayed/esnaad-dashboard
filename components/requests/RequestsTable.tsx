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

  // Type badge
  const getTypeBadge = (type: string) => {
    return type === "GUEST_VISIT" ? (
      <Badge variant="outline">Guest Visit</Badge>
    ) : (
      <Badge variant="outline">Work Permission</Badge>
    );
  };

  // Get validity summary
  const getValiditySummary = (request: Request) => {
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
              <TableHead>Visitor/Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
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
                  <Skeleton className="h-4 w-28" />
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Visitor/Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Validity</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow
            key={request.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleView(request.id)}
          >
            <TableCell>{getTypeBadge(request.type)}</TableCell>
            <TableCell>
              <div className="font-medium">{request.unit?.unitNumber}</div>
              {request.unit?.buildingName && (
                <div className="text-sm text-muted-foreground">
                  {request.unit.buildingName}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="font-medium">
                {request.type === "GUEST_VISIT"
                  ? request.visitorName
                  : request.companyName}
              </div>
              {request.type === "WORK_PERMISSION" &&
                request.representativeName && (
                  <div className="text-sm text-muted-foreground">
                    {request.representativeName}
                  </div>
                )}
            </TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell className="text-sm">
              {getValiditySummary(request)}
            </TableCell>
            <TableCell className="text-sm">
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
        ))}
      </TableBody>
    </Table>
  );
}
