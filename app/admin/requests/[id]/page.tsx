"use client";

import { ApproveDialog } from "@/components/requests/ApproveDialog";
import { RejectDialog } from "@/components/requests/RejectDialog";
import { RequestDetail } from "@/components/requests/RequestDetail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveRequest,
  useRejectRequest,
  useRequest,
  useRevokeRequest,
} from "@/lib/hooks/use-requests";
import { ApproveRequestDto, RejectRequestDto } from "@/lib/types/request.types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function AdminRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const { data: request, isLoading, mutate } = useRequest(requestId);
  const { mutateAsync: approveRequest, isPending: isApproving } =
    useApproveRequest(requestId);
  const { mutateAsync: rejectRequest, isPending: isRejecting } =
    useRejectRequest(requestId);
  const { mutateAsync: revokeRequest, isPending: isRevoking } =
    useRevokeRequest(requestId);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const handleApprove = async (data: ApproveRequestDto) => {
    try {
      await approveRequest(data);
      mutate(); // Refresh data
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = async (data: RejectRequestDto) => {
    try {
      await rejectRequest(data);
      mutate(); // Refresh data
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) return;

    try {
      await revokeRequest(revokeReason);
      mutate(); // Refresh data
      setRevokeDialogOpen(false);
      setRevokeReason("");
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/admin/requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <RequestDetail
        request={request}
        onApprove={() => setApproveDialogOpen(true)}
        onReject={() => setRejectDialogOpen(true)}
        onRevoke={() => setRevokeDialogOpen(true)}
      />

      {/* Approve Dialog */}
      <ApproveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onConfirm={handleApprove}
        requestType={request.type}
        isPending={isApproving}
      />

      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleReject}
        isPending={isRejecting}
      />

      {/* Revoke Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the approved request. The owner will no longer be
              able to use the invitation/permit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="revokeReason">Reason for Revocation *</Label>
            <Textarea
              id="revokeReason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Explain why this request is being revoked..."
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={isRevoking || !revokeReason.trim()}
            >
              Revoke Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
