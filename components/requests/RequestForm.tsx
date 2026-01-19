"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UnitMultiSelect } from "@/components/UnitMultiSelect";
import { UserSearchInput } from "@/components/UserSearchInput";
import { useMyUnits } from "@/lib/hooks/useMyUnits";
import { useAuth } from "@/contexts/AuthContext";
import { CreateRequestDto, ModificationType } from "@/lib/types/request.types";
import { unitDocumentsService } from "@/lib/api/unit-documents.service";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

// Modification types for Unit Modifications request
const MODIFICATION_TYPES: { value: ModificationType; label: string }[] = [
  { value: "RENOVATION", label: "Renovation" },
  { value: "REPAIR", label: "Repair" },
  { value: "ADDITION", label: "Addition" },
  { value: "REMOVAL", label: "Removal" },
  { value: "ELECTRICAL", label: "Electrical Work" },
  { value: "PLUMBING", label: "Plumbing Work" },
  { value: "HVAC", label: "HVAC (Heating/Cooling)" },
  { value: "STRUCTURAL", label: "Structural Changes" },
  { value: "COSMETIC", label: "Cosmetic Changes" },
  { value: "OTHER", label: "Other" },
];

interface RequestFormProps {
  units: Array<{ id: string; unitNumber: string; buildingName?: string }>;
  onSubmit: (data: CreateRequestDto) => Promise<void>;
  isPending?: boolean;
}

export function RequestForm({ units, onSubmit, isPending }: RequestFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<CreateRequestDto>>({
    type: "GUEST_VISIT",
  });
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [newOwner, setNewOwner] = useState<{
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  } | null>(null);

  // Pre-fill contact info for unit modifications when type changes
  useEffect(() => {
    if (formData.type === "UNIT_MODIFICATIONS" && user) {
      setFormData((prev) => ({
        ...prev,
        contactEmail: prev.contactEmail || user.email || "",
      }));
    }
  }, [formData.type, user]);

  // Tenant registration file states
  const [emiratesIdFile, setEmiratesIdFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [rentContractFile, setRentContractFile] = useState<File | null>(null);
  const [ijaryFile, setIjaryFile] = useState<File | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const emiratesIdInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const rentContractInputRef = useRef<HTMLInputElement>(null);
  const ijaryInputRef = useRef<HTMLInputElement>(null);

  const { units: myUnits, isLoading: unitsLoading } = useMyUnits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields based on request type
    if (formData.type === "OWNERSHIP_TRANSFER") {
      if (selectedUnits.length === 0 || !newOwner) {
        return;
      }

      await onSubmit({
        type: "OWNERSHIP_TRANSFER",
        transferUnitIds: selectedUnits,
        newOwnerId: newOwner.id,
        newOwnerName: newOwner.name,
        newOwnerEmail: newOwner.email,
        newOwnerPhone: newOwner.phone,
        message: formData.message,
      } as CreateRequestDto);
      return;
    }

    // Handle tenant registration with file uploads
    if (formData.type === "TENANT_REGISTRATION") {
      // Validate required fields
      if (!formData.unitId || !formData.tenantName || !formData.tenantEmail || !formData.tenantPhone) {
        toast.error("Please fill in all required tenant fields");
        return;
      }

      if (!emiratesIdFile || !passportFile || !rentContractFile || !ijaryFile) {
        toast.error("Please upload all required documents (Emirates ID, Passport, Rent Contract, and Ijary)");
        return;
      }

      setIsUploadingFiles(true);

      try {
        // Upload all files to R2
        const [emiratesIdResult, passportResult, rentContractResult, ijaryResult] = await Promise.all([
          unitDocumentsService.uploadFileDirect(emiratesIdFile),
          unitDocumentsService.uploadFileDirect(passportFile),
          unitDocumentsService.uploadFileDirect(rentContractFile),
          unitDocumentsService.uploadFileDirect(ijaryFile),
        ]);

        await onSubmit({
          type: "TENANT_REGISTRATION",
          unitId: formData.unitId,
          tenantName: formData.tenantName,
          tenantEmail: formData.tenantEmail,
          tenantPhone: formData.tenantPhone,
          emiratesIdUrl: emiratesIdResult.publicUrl,
          passportUrl: passportResult.publicUrl,
          rentContractUrl: rentContractResult.publicUrl,
          ijaryUrl: ijaryResult.publicUrl,
        } as CreateRequestDto);
      } catch (error: any) {
        toast.error(error.message || "Failed to upload documents");
      } finally {
        setIsUploadingFiles(false);
      }
      return;
    }

    // Handle unit modifications
    if (formData.type === "UNIT_MODIFICATIONS") {
      // Validate required fields
      if (!formData.unitId || !formData.modificationType || !formData.modificationMessage || !formData.contactEmail || !formData.contactPhone) {
        toast.error("Please fill in all required fields");
        return;
      }

      // If OTHER is selected, modificationTypeOther is required
      if (formData.modificationType === "OTHER" && !formData.modificationTypeOther) {
        toast.error("Please specify the modification type");
        return;
      }

      await onSubmit({
        type: "UNIT_MODIFICATIONS",
        unitId: formData.unitId,
        modificationType: formData.modificationType,
        modificationTypeOther: formData.modificationTypeOther,
        modificationMessage: formData.modificationMessage,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
      } as CreateRequestDto);
      return;
    }

    // Validate for other request types
    if (!formData.unitId || !formData.type) {
      return;
    }

    if (formData.type === "GUEST_VISIT" && !formData.visitorName) {
      return;
    }

    if (formData.type === "WORK_PERMISSION" && !formData.companyName) {
      return;
    }

    await onSubmit(formData as CreateRequestDto);
  };

  const handleChange = (field: keyof CreateRequestDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Type */}
      <Card>
        <CardHeader>
          <CardTitle>Request Type</CardTitle>
          <CardDescription>Choose the type of request</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
              required
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GUEST_VISIT">Guest Visit</SelectItem>
                <SelectItem value="WORK_PERMISSION">Work Permission</SelectItem>
                <SelectItem value="OWNERSHIP_TRANSFER">Ownership Transfer</SelectItem>
                <SelectItem value="TENANT_REGISTRATION">Tenant Registration</SelectItem>
                <SelectItem value="UNIT_MODIFICATIONS">Unit Modifications</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conditional Unit Selection */}
      {formData.type !== "OWNERSHIP_TRANSFER" && formData.type !== "TENANT_REGISTRATION" && formData.type !== "UNIT_MODIFICATIONS" ? (
        <Card>
          <CardHeader>
            <CardTitle>Unit Selection</CardTitle>
            <CardDescription>Select the unit for this request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="unitId">Unit *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) => handleChange("unitId", value)}
                required
              >
                <SelectTrigger id="unitId">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unitNumber}
                      {unit.buildingName && ` - ${unit.buildingName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : formData.type === "OWNERSHIP_TRANSFER" ? (
        <Card>
          <CardHeader>
            <CardTitle>Ownership Transfer</CardTitle>
            <CardDescription>Select units to transfer and the new owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Units to Transfer *</Label>
              <UnitMultiSelect
                units={myUnits}
                selectedIds={selectedUnits}
                onChange={setSelectedUnits}
                isLoading={unitsLoading}
                placeholder="Select units to transfer..."
              />
            </div>
            <div className="space-y-2">
              <Label>New Owner *</Label>
              <UserSearchInput
                value={newOwner}
                onChange={setNewOwner}
                role="OWNER"
                placeholder="Search or add new owner..."
                newUserBadgeText="New owner - will be created on approval"
                existingUsersHeading="Existing Owners"
                newUserFormTitle="New Owner Details"
                nameLabel="Owner Name"
                confirmButtonText="Confirm New Owner"
                addButtonText="Add New Owner"
                addManualButtonText="Add New Owner Manually"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message || ""}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Add a message for the new owner or admin..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ) : formData.type === "TENANT_REGISTRATION" ? (
        <Card>
          <CardHeader>
            <CardTitle>Tenant Registration</CardTitle>
            <CardDescription>Register a tenant for your unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unit Selection */}
            <div className="space-y-2">
              <Label htmlFor="unitId">Unit to Rent *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) => handleChange("unitId", value)}
                required
              >
                <SelectTrigger id="unitId">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unitNumber}
                      {unit.buildingName && ` - ${unit.buildingName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="tenantName">Tenant Name *</Label>
              <Input
                id="tenantName"
                value={formData.tenantName || ""}
                onChange={(e) => handleChange("tenantName", e.target.value)}
                placeholder="Enter tenant's full name"
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tenantEmail">Tenant Email *</Label>
                <Input
                  id="tenantEmail"
                  type="email"
                  value={formData.tenantEmail || ""}
                  onChange={(e) => handleChange("tenantEmail", e.target.value)}
                  placeholder="tenant@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantPhone">Tenant Phone *</Label>
                <Input
                  id="tenantPhone"
                  type="tel"
                  value={formData.tenantPhone || ""}
                  onChange={(e) => handleChange("tenantPhone", e.target.value)}
                  placeholder="+971 XX XXX XXXX"
                  required
                />
              </div>
            </div>

            {/* Emirates ID & Passport Uploads */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Emirates ID Upload */}
              <div className="space-y-2">
                <Label>Emirates ID (PDF/Image) *</Label>
                {!emiratesIdFile ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                    onClick={() => emiratesIdInputRef.current?.click()}
                  >
                    <input
                      ref={emiratesIdInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEmiratesIdFile(file);
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm">Upload Emirates ID</p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[120px]">{emiratesIdFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEmiratesIdFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Passport Upload */}
              <div className="space-y-2">
                <Label>Passport (PDF/Image) *</Label>
                {!passportFile ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                    onClick={() => passportInputRef.current?.click()}
                  >
                    <input
                      ref={passportInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPassportFile(file);
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm">Upload Passport</p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[120px]">{passportFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPassportFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Rent Contract Upload */}
            <div className="space-y-2">
              <Label>Rent Contract (PDF) *</Label>
              {!rentContractFile ? (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onClick={() => rentContractInputRef.current?.click()}
                >
                  <input
                    ref={rentContractInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === "application/pdf") {
                        setRentContractFile(file);
                      } else if (file) {
                        toast.error("Only PDF files are allowed");
                      }
                    }}
                    className="hidden"
                  />
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm">Click to upload rent contract</p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{rentContractFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRentContractFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Ijary Upload */}
            <div className="space-y-2">
              <Label>Ijary Certificate (PDF) *</Label>
              {!ijaryFile ? (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onClick={() => ijaryInputRef.current?.click()}
                >
                  <input
                    ref={ijaryInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === "application/pdf") {
                        setIjaryFile(file);
                      } else if (file) {
                        toast.error("Only PDF files are allowed");
                      }
                    }}
                    className="hidden"
                  />
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm">Click to upload Ijary certificate</p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{ijaryFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIjaryFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : formData.type === "UNIT_MODIFICATIONS" ? (
        <Card>
          <CardHeader>
            <CardTitle>Unit Modifications</CardTitle>
            <CardDescription>Request approval for modifications to your unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unit Selection */}
            <div className="space-y-2">
              <Label htmlFor="unitId">Unit *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) => handleChange("unitId", value)}
                required
              >
                <SelectTrigger id="unitId">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unitNumber}
                      {unit.buildingName && ` - ${unit.buildingName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modification Type */}
            <div className="space-y-2">
              <Label htmlFor="modificationType">Modification Type *</Label>
              <Select
                value={formData.modificationType}
                onValueChange={(value) => handleChange("modificationType", value as ModificationType)}
                required
              >
                <SelectTrigger id="modificationType">
                  <SelectValue placeholder="Select modification type" />
                </SelectTrigger>
                <SelectContent>
                  {MODIFICATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Other Modification Type (shown when OTHER is selected) */}
            {formData.modificationType === "OTHER" && (
              <div className="space-y-2">
                <Label htmlFor="modificationTypeOther">Specify Modification Type *</Label>
                <Input
                  id="modificationTypeOther"
                  value={formData.modificationTypeOther || ""}
                  onChange={(e) => handleChange("modificationTypeOther", e.target.value)}
                  placeholder="Enter the type of modification"
                  required
                />
              </div>
            )}

            {/* Modification Message */}
            <div className="space-y-2">
              <Label htmlFor="modificationMessage">Description *</Label>
              <Textarea
                id="modificationMessage"
                value={formData.modificationMessage || ""}
                onChange={(e) => handleChange("modificationMessage", e.target.value)}
                placeholder="Describe the modifications you plan to make..."
                rows={4}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Contact information for this request (pre-filled from your profile, editable)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ""}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone || ""}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    placeholder="+971 XX XXX XXXX"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Conditional Fields - Only for GUEST_VISIT and WORK_PERMISSION */}
      {(formData.type === "GUEST_VISIT" || formData.type === "WORK_PERMISSION") && (
        <Card>
          <CardHeader>
            <CardTitle>
              {formData.type === "GUEST_VISIT"
                ? "Visitor Information"
                : "Company Information"}
            </CardTitle>
            <CardDescription>
              Provide details about the visitor or company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.type === "GUEST_VISIT" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="visitorName">Visitor Name *</Label>
                <Input
                  id="visitorName"
                  value={formData.visitorName || ""}
                  onChange={(e) => handleChange("visitorName", e.target.value)}
                  placeholder="Enter visitor's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitorPhone">Phone (Optional)</Label>
                <Input
                  id="visitorPhone"
                  type="tel"
                  value={formData.visitorPhone || ""}
                  onChange={(e) => handleChange("visitorPhone", e.target.value)}
                  placeholder="+966 XX XXX XXXX"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ""}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="representativeName">
                  Representative Name (Optional)
                </Label>
                <Input
                  id="representativeName"
                  value={formData.representativeName || ""}
                  onChange={(e) =>
                    handleChange("representativeName", e.target.value)
                  }
                  placeholder="Enter representative's name"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      )}

      {/* Purpose & Schedule - Only for GUEST_VISIT and WORK_PERMISSION */}
      {(formData.type === "GUEST_VISIT" || formData.type === "WORK_PERMISSION") && (
      <Card>
        <CardHeader>
          <CardTitle>Purpose & Schedule</CardTitle>
          <CardDescription>Optional additional details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (Optional)</Label>
            <Textarea
              id="purpose"
              value={formData.purpose || ""}
              onChange={(e) => handleChange("purpose", e.target.value)}
              placeholder="Describe the purpose of the visit..."
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start Date (Optional)</Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={
                  formData.startAt
                    ? new Date(formData.startAt).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "startAt",
                    e.target.value ? new Date(e.target.value).toISOString() : ""
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">End Date (Optional)</Label>
              <Input
                id="endAt"
                type="datetime-local"
                value={
                  formData.endAt
                    ? new Date(formData.endAt).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "endAt",
                    e.target.value ? new Date(e.target.value).toISOString() : ""
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending || isUploadingFiles}>
          {(isPending || isUploadingFiles) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploadingFiles ? "Uploading Documents..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}
