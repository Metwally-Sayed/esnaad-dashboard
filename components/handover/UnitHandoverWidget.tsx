"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, CheckCircle, Clock, AlertCircle, Loader2, ListChecks } from "lucide-react"
import { unitsService } from "@/lib/api/units.service"
import { handoverService } from "@/lib/api/handover.service"
import { HandoverStatusBadge } from "./HandoverStatusBadge"
import { useHandover } from "@/lib/hooks/use-handovers"
import { HandoverStatus } from "@/lib/types/handover.types"
import { toast } from "sonner"

interface UnitHandoverWidgetProps {
  unitId: string
  unitName?: string
}

export function UnitHandoverWidget({ unitId, unitName }: UnitHandoverWidgetProps) {
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [handoverData, setHandoverData] = useState<{
    exists: boolean
    handover?: {
      id: string
      status: string
      scheduledAt?: string
      handoverAt?: string
      ownerAcceptedAt?: string
      pdfUrl?: string
      adminSignature?: string
      ownerSignature?: string
      notes?: string
      createdAt: string
      updatedAt: string
    }
    message?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch handover status
  const fetchHandoverStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await unitsService.getUnitHandover(unitId)
      setHandoverData(data)
    } catch (err: any) {
      console.error("Error fetching handover status:", err)
      setError(err.message || "Failed to load handover status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHandoverStatus()
  }, [unitId])

  // Fetch full handover details (including items) using the hook
  // IMPORTANT: This must be called before any conditional returns (Rules of Hooks)
  const { handover: fullHandover, isLoading: isLoadingDetails } = useHandover(handoverData?.handover?.id)

  // Group items by category
  const groupedItems = fullHandover?.items?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof fullHandover.items>) || {}

  // Handle accept handover
  const handleAcceptHandover = async () => {
    if (!handoverData?.handover?.id) return

    try {
      setAccepting(true)
      await handoverService.acceptHandover(handoverData.handover.id)

      // Refresh handover status
      await fetchHandoverStatus()

      toast.success("Handover accepted successfully! PDF has been generated.")
    } catch (err: any) {
      console.error("Error accepting handover:", err)
      // Error toast is already shown by the service
    } finally {
      setAccepting(false)
    }
  }

  // Handle download PDF
  const handleDownloadPDF = () => {
    if (handoverData?.handover?.pdfUrl) {
      window.open(handoverData.handover.pdfUrl, "_blank")
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Unit Handover
          </CardTitle>
          <CardDescription>
            Handover agreement and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Unit Handover
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // No handover exists
  if (!handoverData?.exists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Unit Handover
          </CardTitle>
          <CardDescription>
            Handover agreement and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              No handover has been initiated for this unit yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const { handover } = handoverData

  // Render handover information
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Unit Handover
        </CardTitle>
        <CardDescription>
          {unitName ? `Handover agreement for ${unitName}` : "Handover agreement and documentation"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <HandoverStatusBadge status={(handover?.status || HandoverStatus.DRAFT) as HandoverStatus} />
        </div>

        {/* Notes from Admin */}
        {handover?.notes && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-1">Admin Notes:</p>
            <p className="text-sm text-muted-foreground">{handover.notes}</p>
          </div>
        )}

        {/* Scheduled Date */}
        {handover?.scheduledAt && (
          <div className="text-sm">
            <span className="font-medium">Scheduled Date: </span>
            <span className="text-muted-foreground">
              {new Date(handover.scheduledAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        )}

        {/* Checklist Items - Show for SENT_TO_OWNER status */}
        {handover?.status === "SENT_TO_OWNER" && fullHandover?.items && fullHandover.items.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              <h3 className="text-sm font-semibold">Handover Checklist</h3>
              <Badge variant="secondary">{fullHandover.items.length} items</Badge>
            </div>

            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      {items
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                        .map((item) => (
                          <div key={item.id} className="flex items-start gap-3 py-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.label}</p>
                              {item.expectedValue && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expected: {item.expectedValue}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SENT_TO_OWNER - Show Accept Button */}
        {handover?.status === "SENT_TO_OWNER" && (
          <div className="space-y-4 pt-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The handover is ready for your acceptance. Please review all details carefully before accepting.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleAcceptHandover}
              disabled={accepting}
              className="w-full"
              size="lg"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting Handover...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Handover
                </>
              )}
            </Button>
          </div>
        )}

        {/* ACCEPTED - Show PDF Download */}
        {handover?.status === "ACCEPTED" && handover.pdfUrl && (
          <div className="space-y-4 pt-2">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Handover has been accepted and finalized.
              </AlertDescription>
            </Alert>

            {/* Acceptance Details */}
            <div className="space-y-2 text-sm">
              {handover.ownerAcceptedAt && (
                <div>
                  <span className="font-medium">Accepted On: </span>
                  <span className="text-muted-foreground">
                    {new Date(handover.ownerAcceptedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              )}

              {handover.adminSignature && (
                <div>
                  <span className="font-medium">Admin Signature: </span>
                  <span className="text-muted-foreground">{handover.adminSignature}</span>
                </div>
              )}

              {handover.ownerSignature && (
                <div>
                  <span className="font-medium">Owner Signature: </span>
                  <span className="text-muted-foreground">{handover.ownerSignature}</span>
                </div>
              )}
            </div>

            {/* Download PDF Button */}
            <Button
              onClick={handleDownloadPDF}
              variant="default"
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Handover Agreement (PDF)
            </Button>
          </div>
        )}

        {/* DRAFT or other statuses */}
        {handover?.status === "DRAFT" && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              The handover is being prepared by the administrator.
            </AlertDescription>
          </Alert>
        )}

        {handover?.status === "CANCELLED" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This handover has been cancelled.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
