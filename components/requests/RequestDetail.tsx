"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Request } from "@/lib/types/request.types";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  User,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";
import { useState } from "react";

interface RequestDetailProps {
  request: Request;
  onCancel?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRevoke?: () => void;
}

export function RequestDetail({
  request,
  onCancel,
  onApprove,
  onReject,
  onRevoke,
}: RequestDetailProps) {
  const { user, isAdmin } = useAuth();
  const isOwner = user?.role === "OWNER" && request.ownerId === user.id;

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

  // Type badge configuration
  const getTypeBadge = (type: string) => {
    return type === "GUEST_VISIT" ? (
      <Badge variant="outline">Guest Visit</Badge>
    ) : (
      <Badge variant="outline">Work Permission</Badge>
    );
  };

  // Get validity text
  const getValidityText = () => {
    if (!request.expiresMode) return null;

    if (request.expiresMode === "DATE" && request.expiresAt) {
      return `Valid until ${format(new Date(request.expiresAt), "PPP")}`;
    } else if (request.expiresMode === "USES") {
      return `Valid for ${request.maxUses} uses (${request.usesCount} used)`;
    } else if (request.expiresMode === "UNLIMITED") {
      return "Unlimited validity";
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">
              {request.type === "GUEST_VISIT"
                ? "Guest Visit Invitation"
                : "Work Permission"}
            </h2>
            {getStatusBadge(request.status)}
            {getTypeBadge(request.type)}
          </div>
          <p className="text-sm text-muted-foreground">
            Request ID: {request.id}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {request.pdfUrl && (
            <Button asChild variant="outline">
              <a
                href={request.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          )}

          {isOwner && request.status === "SUBMITTED" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Cancel Request</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel your request. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>
                    Yes, cancel request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isAdmin && request.status === "SUBMITTED" && (
            <>
              <Button onClick={onReject} variant="outline">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={onApprove}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}

          {isAdmin && request.status === "APPROVED" && (
            <Button onClick={onRevoke} variant="outline">
              <Ban className="mr-2 h-4 w-4" />
              Revoke
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Unit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Unit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Unit Number
              </div>
              <div className="font-medium">{request.unit?.unitNumber}</div>
            </div>
            {request.unit?.buildingName && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Building
                </div>
                <div>{request.unit.buildingName}</div>
              </div>
            )}
            {request.unit?.floor !== undefined && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Floor
                </div>
                <div>{request.unit.floor}</div>
              </div>
            )}
            {request.unit?.address && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Address
                </div>
                <div>{request.unit.address}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Name
              </div>
              <div className="font-medium">
                {request.owner?.name || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Email
              </div>
              <div>{request.owner?.email}</div>
            </div>
            {request.owner?.phone && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Phone
                </div>
                <div>{request.owner.phone}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visitor/Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {request.type === "GUEST_VISIT"
                ? "Visitor Information"
                : "Company Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.type === "GUEST_VISIT" ? (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Visitor Name
                  </div>
                  <div className="font-medium">{request.visitorName}</div>
                </div>
                {request.visitorPhone && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Phone
                    </div>
                    <div>{request.visitorPhone}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Company Name
                  </div>
                  <div className="font-medium">{request.companyName}</div>
                </div>
                {request.representativeName && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Representative
                    </div>
                    <div>{request.representativeName}</div>
                  </div>
                )}
              </>
            )}
            {request.purpose && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Purpose
                </div>
                <div className="whitespace-pre-wrap">{request.purpose}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule & Validity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule & Validity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.startAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Start Date
                </div>
                <div>{format(new Date(request.startAt), "PPP")}</div>
              </div>
            )}
            {request.endAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  End Date
                </div>
                <div>{format(new Date(request.endAt), "PPP")}</div>
              </div>
            )}
            {getValidityText() && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Validity
                </div>
                <div className="font-medium text-green-600">
                  {getValidityText()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval/Rejection Info */}
      {(request.status === "APPROVED" ||
        request.status === "REJECTED" ||
        request.status === "CANCELLED") && (
        <Card>
          <CardHeader>
            <CardTitle>
              {request.status === "APPROVED"
                ? "Approval Details"
                : request.status === "REJECTED"
                ? "Rejection Details"
                : "Cancellation Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.approvedByAdmin && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Approved By
                </div>
                <div>{request.approvedByAdmin.name || request.approvedByAdmin.email}</div>
              </div>
            )}
            {request.approvedAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Approved At
                </div>
                <div>{format(new Date(request.approvedAt), "PPP p")}</div>
              </div>
            )}
            {request.rejectedByAdmin && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Rejected By
                </div>
                <div>{request.rejectedByAdmin.name || request.rejectedByAdmin.email}</div>
              </div>
            )}
            {request.rejectedAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Rejected At
                </div>
                <div>{format(new Date(request.rejectedAt), "PPP p")}</div>
              </div>
            )}
            {request.rejectionReason && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Reason
                </div>
                <div className="rounded-md bg-muted p-3 whitespace-pre-wrap">
                  {request.rejectionReason}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Request Created
            </div>
            <div>{format(new Date(request.createdAt), "PPP p")}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Last Updated
            </div>
            <div>{format(new Date(request.updatedAt), "PPP p")}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
