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
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Request } from "@/lib/types/request.types";
import { format } from "date-fns";
import {
  Ban,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Mail,
  User,
  Wrench,
  XCircle
} from "lucide-react";
import { RequestMessages } from "./RequestMessages";

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
    if (type === "GUEST_VISIT") {
      return <Badge variant="outline">Guest Visit</Badge>;
    } else if (type === "WORK_PERMISSION") {
      return <Badge variant="outline">Work Permission</Badge>;
    } else if (type === "OWNERSHIP_TRANSFER") {
      return <Badge variant="outline">Ownership Transfer</Badge>;
    } else if (type === "TENANT_REGISTRATION") {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Tenant Registration</Badge>;
    } else if (type === "UNIT_MODIFICATIONS") {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Unit Modifications</Badge>;
    }
    return <Badge variant="outline">{type}</Badge>;
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">
              {request.type === "GUEST_VISIT"
                ? "Guest Visit Invitation"
                : request.type === "WORK_PERMISSION"
                ? "Work Permission"
                : request.type === "OWNERSHIP_TRANSFER"
                ? "Ownership Transfer Request"
                : request.type === "UNIT_MODIFICATIONS"
                ? "Unit Modifications Request"
                : "Tenant Registration Request"}
            </h2>
            {getStatusBadge(request.status)}
            {getTypeBadge(request.type)}
          </div>
          <p className="text-sm text-muted-foreground">
            Request ID: {request.id}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {request.pdfUrl && (
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
              <a
                href={request.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </a>
            </Button>
          )}

          {isOwner && request.status === "SUBMITTED" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <span className="hidden sm:inline">Cancel Request</span>
                  <span className="sm:hidden">Cancel</span>
                </Button>
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
              <Button onClick={onReject} variant="outline" size="sm" className="flex-1 sm:flex-none">
                <XCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Reject</span>
              </Button>
              <Button onClick={onApprove} size="sm" className="flex-1 sm:flex-none">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Approve</span>
              </Button>
            </>
          )}

          {isAdmin && request.status === "APPROVED" && (
            <Button onClick={onRevoke} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Ban className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Revoke</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Unit Information - Conditional based on request type */}
        {request.type === "OWNERSHIP_TRANSFER" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Units to Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.transferUnitIds && request.transferUnitIds.length > 0 ? (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {request.transferUnitIds.length} unit(s) selected for transfer
                  </div>
                  <div className="space-y-2">
                    {request.transferUnitIds.map((unitId, index) => (
                      <div key={unitId} className="p-2 rounded-md bg-muted">
                        <div className="font-medium">Unit #{index + 1}</div>
                        <div className="text-sm text-muted-foreground">ID: {unitId}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No units specified for transfer
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
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
        )}

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {request.type === "OWNERSHIP_TRANSFER" ? "Current Owner" : "Owner Information"}
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

        {/* Visitor/Company/New Owner/Tenant Information - Not for UNIT_MODIFICATIONS */}
        {request.type !== "UNIT_MODIFICATIONS" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {request.type === "OWNERSHIP_TRANSFER"
                ? "New Owner"
                : request.type === "GUEST_VISIT"
                ? "Visitor Information"
                : request.type === "TENANT_REGISTRATION"
                ? "Tenant Information"
                : "Company Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.type === "OWNERSHIP_TRANSFER" ? (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Name
                  </div>
                  <div className="font-medium">{request.newOwnerName || "N/A"}</div>
                </div>
                {request.newOwnerEmail && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Email
                    </div>
                    <div>{request.newOwnerEmail}</div>
                  </div>
                )}
                {request.newOwnerPhone && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Phone
                    </div>
                    <div>{request.newOwnerPhone}</div>
                  </div>
                )}
                {!request.newOwnerId && (
                  <div>
                    <Badge variant="secondary" className="mt-2">
                      New owner - will be created on approval
                    </Badge>
                  </div>
                )}
                {request.newOwner && (
                  <div>
                    <Badge variant="default" className="mt-2">
                      Existing owner account
                    </Badge>
                  </div>
                )}
              </>
            ) : request.type === "TENANT_REGISTRATION" ? (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Tenant Name
                  </div>
                  <div className="font-medium">{request.tenantName || "N/A"}</div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Email
                    </div>
                    <div>{request.tenantEmail || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Phone
                    </div>
                    <div>{request.tenantPhone || "N/A"}</div>
                  </div>
                </div>
              </>
            ) : request.type === "GUEST_VISIT" ? (
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
            {request.purpose && request.type !== "OWNERSHIP_TRANSFER" && request.type !== "TENANT_REGISTRATION" && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Purpose
                </div>
                <div className="whitespace-pre-wrap">{request.purpose}</div>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Tenant Documents - Only for TENANT_REGISTRATION */}
        {request.type === "TENANT_REGISTRATION" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Emirates ID</div>
                    <div className="text-sm text-muted-foreground">PDF/Image Document</div>
                  </div>
                </div>
                {request.emiratesIdUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={request.emiratesIdUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      View
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Not uploaded</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Passport</div>
                    <div className="text-sm text-muted-foreground">PDF/Image Document</div>
                  </div>
                </div>
                {request.passportUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={request.passportUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      View
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Not uploaded</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Rent Contract</div>
                    <div className="text-sm text-muted-foreground">PDF Document</div>
                  </div>
                </div>
                {request.rentContractUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={request.rentContractUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Not uploaded</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Ijary Certificate</div>
                    <div className="text-sm text-muted-foreground">PDF Document</div>
                  </div>
                </div>
                {request.ijaryUrl ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={request.ijaryUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Not uploaded</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unit Modification Details - Only for UNIT_MODIFICATIONS */}
        {request.type === "UNIT_MODIFICATIONS" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Modification Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Modification Type
                </div>
                <div className="font-medium">
                  {request.modificationType === "OTHER"
                    ? request.modificationTypeOther
                    : request.modificationType?.replace(/_/g, " ")}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Description
                </div>
                <div className="whitespace-pre-wrap bg-muted rounded-md p-3">
                  {request.modificationMessage || "No description provided"}
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  Contact Information
                </div>
                <div className="grid gap-12 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{request.contactEmail || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div>{request.contactPhone || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule & Validity - Not applicable for ownership transfer, tenant registration, and unit modifications */}
        {request.type !== "OWNERSHIP_TRANSFER" && request.type !== "TENANT_REGISTRATION" && request.type !== "UNIT_MODIFICATIONS" && (
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
        )}
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

      {/* Messages - Only for UNIT_MODIFICATIONS */}
      {request.type === "UNIT_MODIFICATIONS" && (
        <RequestMessages
          requestId={request.id}
          disabled={request.status === "CANCELLED" || request.status === "REJECTED"}
        />
      )}
    </div>
  );
}
