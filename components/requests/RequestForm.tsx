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
import { CreateRequestDto } from "@/lib/types/request.types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface RequestFormProps {
  units: Array<{ id: string; unitNumber: string; buildingName?: string }>;
  onSubmit: (data: CreateRequestDto) => Promise<void>;
  isPending?: boolean;
}

export function RequestForm({ units, onSubmit, isPending }: RequestFormProps) {
  const [formData, setFormData] = useState<Partial<CreateRequestDto>>({
    type: "GUEST_VISIT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
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
      {/* Unit Selection */}
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conditional Fields */}
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

      {/* Purpose & Schedule */}
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

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Request
        </Button>
      </div>
    </form>
  );
}
