"use client";

import Image from "next/image";
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
import snaggingService from "@/lib/api/snagging.service";
import { Snagging } from "@/lib/types/snagging.types";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SnaggingDetailProps {
  snagging: Snagging;
  onDelete?: () => void;
  onRegeneratePdf?: () => void;
}

export function SnaggingDetail({
  snagging,
  onDelete,
  onRegeneratePdf,
}: SnaggingDetailProps) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isOwner = user?.role === "OWNER" && snagging.ownerId === user.id;

  const handleDelete = async () => {
    if (!isAdmin) return;

    try {
      setIsDeleting(true);
      await snaggingService.deleteSnagging(snagging.id);
      toast.success("Snagging cancelled successfully");
      onDelete?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel snagging");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegeneratePdf = async () => {
    if (!isAdmin) return;

    try {
      setIsRegenerating(true);
      await snaggingService.regeneratePdf(snagging.id);
      toast.success("PDF regenerated successfully");
      onRegeneratePdf?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate PDF");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSendToOwner = async () => {
    if (!isAdmin) return;

    try {
      setIsSending(true);
      await snaggingService.sendToOwner(snagging.id);
      toast.success("Snagging sent to owner successfully");
      onRegeneratePdf?.(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to send snagging to owner");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Snaggings
        </Button>

        <div className="bg-gradient-to-r from-background to-muted/30 rounded-xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {snagging.title}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {snagging.id}
                  </p>
                </div>

                {/* Key Details */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  {snagging.unit && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        Unit {snagging.unit.unitNumber}
                      </span>
                      {snagging.unit.buildingName && (
                        <span className="text-muted-foreground">
                          • {snagging.unit.buildingName}
                        </span>
                      )}
                    </div>
                  )}

                  {snagging.owner && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {snagging.owner.name || snagging.owner.email}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(snagging.createdAt), "PPP")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-col items-end gap-2">
              {/* Workflow Status */}
              <Badge
                variant="outline"
                className={`text-sm px-3 py-1.5 ${
                  snagging.status === 'DRAFT'
                    ? 'text-gray-700 border-gray-300 bg-gray-50'
                    : snagging.status === 'SENT_TO_OWNER'
                    ? 'text-blue-700 border-blue-300 bg-blue-50'
                    : snagging.status === 'ACCEPTED'
                    ? 'text-green-700 border-green-300 bg-green-50'
                    : 'text-red-700 border-red-300 bg-red-50'
                }`}
              >
                {snagging.status === 'DRAFT' && 'Draft'}
                {snagging.status === 'SENT_TO_OWNER' && 'Sent to Owner'}
                {snagging.status === 'ACCEPTED' && 'Accepted'}
                {snagging.status === 'CANCELLED' && 'Cancelled'}
              </Badge>

              {/* PDF Status */}
              {snagging.pdfUrl ? (
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1.5 text-green-700 border-green-300 bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  PDF Ready
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm px-3 py-1.5">
                  PDF Pending
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Description</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Snagging report details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap leading-relaxed">
                {snagging.description}
              </p>
            </CardContent>
          </Card>

          {/* Snagging Items Section */}
          {snagging.items && snagging.items.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Snagging Items
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {snagging.items.length} issue
                        {snagging.items.length !== 1 ? "s" : ""} identified
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {snagging.items.map((item, itemIndex) => (
                    <div key={item.id} className="space-y-4">
                      {/* Item Header */}
                      <div className="flex items-start gap-3 pb-3 border-b">
                        <Badge
                          variant="outline"
                          className={`mt-1 ${
                            item.severity === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : item.severity === 'HIGH'
                              ? 'bg-orange-50 text-orange-700 border-orange-300'
                              : item.severity === 'MEDIUM'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                        >
                          {item.severity}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base mb-1">
                            {itemIndex + 1}. {item.label}
                          </h4>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span>
                              <strong>Category:</strong> {item.category}
                            </span>
                            <span>•</span>
                            <span>
                              <strong>Location:</strong> {item.location}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Images */}
                      {item.images && item.images.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.images.map((image, imageIndex) => (
                            <div key={image.id} className="space-y-2">
                              <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted group">
                                <Image
                                  src={image.imageUrl}
                                  alt={`${item.label} - Image ${imageIndex + 1}`}
                                  width={400}
                                  height={225}
                                  className="w-full h-full object-cover"
                                />
                                <a
                                  href={image.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Eye className="h-6 w-6 text-white" />
                                </a>
                                <Badge
                                  variant="secondary"
                                  className="absolute top-2 left-2 text-xs"
                                >
                                  #{imageIndex + 1}
                                </Badge>
                              </div>
                              {image.caption && (
                                <div className="p-2 bg-muted/50 rounded border">
                                  <p className="text-xs leading-relaxed">
                                    {image.caption}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointment Details (if scheduled) */}
          {snagging.scheduledAt && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Scheduled Appointment</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Inspection scheduled by owner
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(snagging.scheduledAt), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
                {snagging.scheduledNote && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm leading-relaxed">
                      {snagging.scheduledNote}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Acceptance Details (if accepted) */}
          {snagging.status === 'ACCEPTED' && snagging.acceptedAt && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-green-50 dark:bg-green-950/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Accepted</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Snagging report accepted by owner
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Accepted on {format(new Date(snagging.acceptedAt), "PPP 'at' p")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF generated and available for download
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
              {/* View/Download PDF */}
              {snagging.pdfUrl && (
                <>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => window.open(snagging.pdfUrl!, "_blank")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = snagging.pdfUrl!;
                      link.download = `snagging-${
                        snagging.unit?.unitNumber || snagging.id
                      }.pdf`;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <>
                  <Separator className="my-4" />

                  {/* Send to Owner - Only show in DRAFT status */}
                  {snagging.status === 'DRAFT' && (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={handleSendToOwner}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send to Owner
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleRegeneratePdf}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Regenerate PDF
                  </Button>

                  {snagging.status !== 'ACCEPTED' && snagging.status !== 'CANCELLED' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Cancel Snagging
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancel Snagging Report?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the snagging report as cancelled. The report will be kept for audit purposes but will no longer be active.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Active</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive"
                          >
                            Cancel Report
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* PDF Document Card */}
          {snagging.pdfUrl && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-green-50 dark:bg-green-950/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Snagging Agreement
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      PDF Document
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      snagging-{snagging.unit?.unitNumber || "report"}.pdf
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generated {format(new Date(snagging.createdAt), "PP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unit & Owner Info Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Unit & Owner</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {snagging.unit && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Unit
                    </p>
                    <p className="text-sm font-medium">
                      {snagging.unit.unitNumber}
                    </p>
                    {snagging.unit.buildingName && (
                      <p className="text-xs text-muted-foreground">
                        {snagging.unit.buildingName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {snagging.owner && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Owner
                    </p>
                    <p className="text-sm font-medium">
                      {snagging.owner.name || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {snagging.owner.email}
                    </p>
                    {snagging.owner.phone && (
                      <p className="text-xs text-muted-foreground">
                        {snagging.owner.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {snagging.createdByAdmin && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created By
                    </p>
                    <p className="text-sm font-medium">
                      {snagging.createdByAdmin.name ||
                        snagging.createdByAdmin.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(snagging.createdAt), "PPp")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
