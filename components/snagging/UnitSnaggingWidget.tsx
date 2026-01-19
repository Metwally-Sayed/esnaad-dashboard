'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, FileText, Calendar, Download, Loader2, Plus, Eye, MapPin, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnitSnaggings, useAcceptSnagging } from '@/lib/hooks/use-snagging'
import { Snagging } from '@/lib/types/snagging.types'

/**
 * Component props
 */
interface UnitSnaggingWidgetProps {
  unitId: string
  userRole?: 'ADMIN' | 'OWNER'
  onCreateSnagging?: () => void
}

/**
 * Status badge colors
 */
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
  SENT_TO_OWNER: 'bg-blue-100 text-blue-800 border-blue-300',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300'
}

/**
 * Severity badge colors
 */
const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300'
}

/**
 * UnitSnaggingWidget Component
 *
 * Widget for viewing and accepting snagging reports.
 *
 * Owner Access:
 * - View all snaggings for their units
 * - Accept snaggings when status = SENT_TO_OWNER
 * - Download PDFs when available
 *
 * Admin Access:
 * - Same as owner, plus ability to create new snaggings
 *
 * Workflow:
 * 1. Admin creates snagging (DRAFT)
 * 2. Admin sends to owner (SENT_TO_OWNER)
 * 3. Owner accepts snagging (ACCEPTED) - PDF auto-generated
 * 4. Owner downloads PDF
 */
export function UnitSnaggingWidget({
  unitId,
  userRole = 'OWNER',
  onCreateSnagging
}: UnitSnaggingWidgetProps) {
  const [selectedSnagging, setSelectedSnagging] = useState<Snagging | null>(null)

  // Fetch snaggings for this unit
  const { data, isLoading, error, mutate } = useUnitSnaggings(unitId)
  const snaggings = data?.data || []

  // Accept snagging hook - always initialize with stable ID
  const acceptSnagging = useAcceptSnagging(selectedSnagging?.id || '')

  /**
   * Accept snagging and generate PDF
   */
  const handleAcceptSnagging = async () => {
    if (!selectedSnagging?.id) return

    try {
      const result = await acceptSnagging.mutateAsync()
      // Refresh the list to get updated data with PDF URL
      await mutate()
      // Update the selected snagging with the new data including PDF URL
      if (result) {
        setSelectedSnagging(result)
      }
    } catch (error) {
      console.error('Failed to accept snagging:', error)
    }
  }

  /**
   * Download PDF if accepted
   */
  const handleDownloadPDF = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank')
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load snaggings. Please try again.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Snagging Reports</CardTitle>
            <CardDescription>
              {snaggings.length} report{snaggings.length !== 1 ? 's' : ''} for this unit
            </CardDescription>
          </div>
          {userRole === 'ADMIN' && onCreateSnagging && (
            <Button
              size="sm"
              onClick={onCreateSnagging}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {snaggings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No snagging reports yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Snagging reports will appear here when created by the admin
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {snaggings.map((snagging) => (
              <Card
                key={snagging.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group"
                onClick={() => setSelectedSnagging(snagging)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                      snagging.status === 'ACCEPTED' ? 'bg-green-100' :
                      snagging.status === 'SENT_TO_OWNER' ? 'bg-blue-100' :
                      snagging.status === 'CANCELLED' ? 'bg-gray-100' :
                      'bg-amber-100'
                    )}>
                      <AlertTriangle className={cn(
                        "h-5 w-5",
                        snagging.status === 'ACCEPTED' ? 'text-green-600' :
                        snagging.status === 'SENT_TO_OWNER' ? 'text-blue-600' :
                        snagging.status === 'CANCELLED' ? 'text-gray-600' :
                        'text-amber-600'
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                          {snagging.title}
                        </h3>
                        <Badge className={cn('px-2 py-0.5 text-xs flex-shrink-0', STATUS_COLORS[snagging.status])}>
                          {snagging.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                        {snagging.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{snagging.items?.length || 0} issue{snagging.items?.length !== 1 ? 's' : ''}</span>
                        </div>

                        {snagging.scheduledAt && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Scheduled</span>
                          </div>
                        )}

                        {snagging.pdfUrl && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Download className="h-3.5 w-3.5" />
                            <span>PDF Available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Arrow */}
                    <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Snagging Detail Dialog - READ ONLY */}
      {selectedSnagging && (
        <Dialog open={!!selectedSnagging} onOpenChange={() => setSelectedSnagging(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-xl">{selectedSnagging.title}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {selectedSnagging.description}
                  </DialogDescription>
                </div>
                <Badge className={cn('px-3 py-1 flex-shrink-0', STATUS_COLORS[selectedSnagging.status])}>
                  {selectedSnagging.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Timeline Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">
                    {new Date(selectedSnagging.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {selectedSnagging.scheduledAt && (
                  <div>
                    <p className="text-muted-foreground mb-1">Scheduled Appointment</p>
                    <p className="font-medium text-blue-600">
                      {new Date(selectedSnagging.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedSnagging.acceptedAt && (
                  <div>
                    <p className="text-muted-foreground mb-1">Accepted On</p>
                    <p className="font-medium text-green-600">
                      {new Date(selectedSnagging.acceptedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Issues List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">
                    Issues Found ({selectedSnagging.items?.length || 0})
                  </h4>
                </div>

                {selectedSnagging.items && selectedSnagging.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSnagging.items.map((item, index) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          {/* Item Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-2 flex-1">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary mt-0.5">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.category}
                                </p>
                              </div>
                            </div>
                            <Badge className={cn('px-2 py-0.5 text-xs flex-shrink-0', SEVERITY_COLORS[item.severity])}>
                              {item.severity}
                            </Badge>
                          </div>

                          {/* Item Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{item.location}</span>
                            </div>

                            {item.notes && (
                              <div className="bg-muted/50 rounded-md p-3 text-sm">
                                <p className="text-muted-foreground italic">{item.notes}</p>
                              </div>
                            )}

                            {/* Images */}
                            {item.images && item.images.length > 0 && (
                              <div className="pt-2">
                                <p className="text-xs font-medium text-muted-foreground mb-3">
                                  {item.images.length} Image{item.images.length !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {item.images.map((image, imageIndex) => (
                                    <div key={image.id} className="space-y-2">
                                      <a
                                        href={image.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-video rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all block"
                                      >
                                        <Image
                                          src={image.imageUrl}
                                          alt={image.caption || `Issue ${index + 1} image ${imageIndex + 1}`}
                                          width={400}
                                          height={225}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <Badge
                                          variant="secondary"
                                          className="absolute top-2 left-2 text-xs"
                                        >
                                          #{imageIndex + 1}
                                        </Badge>
                                      </a>
                                      {image.caption && (
                                        <div className="relative p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                                          <div className="flex items-start gap-2">
                                            <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-0.5">
                                                Image Note
                                              </p>
                                              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap break-words">
                                                {image.caption}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No issues recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t space-y-3">
              {/* Accept Button - Only when SENT_TO_OWNER */}
              {selectedSnagging.status === 'SENT_TO_OWNER' && userRole === 'OWNER' && (
                <Button
                  className="w-full"
                  onClick={handleAcceptSnagging}
                  disabled={acceptSnagging.isPending || !selectedSnagging.id}
                >
                  {acceptSnagging.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting & Generating PDF...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Snagging
                    </>
                  )}
                </Button>
              )}

              {/* Download PDF - Only when accepted and PDF is available */}
              {selectedSnagging.status === 'ACCEPTED' && (
                <>
                  {selectedSnagging.pdfUrl ? (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => window.open(selectedSnagging.pdfUrl!, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View PDF Report
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleDownloadPDF(selectedSnagging.pdfUrl!)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF Report
                      </Button>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {userRole === 'ADMIN' ? (
                          <>PDF not available. Please regenerate the PDF from the admin snagging detail page.</>
                        ) : (
                          <>PDF is being generated or unavailable. Please contact the administrator if this persists.</>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {/* Info Messages */}
              {selectedSnagging.status === 'DRAFT' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This snagging is still in draft. The admin will send it to you when ready.
                  </AlertDescription>
                </Alert>
              )}

              {selectedSnagging.status === 'SENT_TO_OWNER' && !selectedSnagging.pdfUrl && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Please review the issues above and accept the snagging to generate the PDF report.
                  </AlertDescription>
                </Alert>
              )}

              {selectedSnagging.status === 'CANCELLED' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This snagging has been cancelled by the admin.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
