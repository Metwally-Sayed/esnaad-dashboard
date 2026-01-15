"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApproveRequestDto, RequestType } from "@/lib/types/request.types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ApproveRequestDto) => Promise<void>;
  requestType: RequestType;
  isPending?: boolean;
}

export function ApproveDialog({
  open,
  onOpenChange,
  onConfirm,
  requestType,
  isPending,
}: ApproveDialogProps) {
  const [formData, setFormData] = useState<Partial<ApproveRequestDto>>({
    expiresMode: requestType === "WORK_PERMISSION" ? "DATE" : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.expiresMode) return;

    if (formData.expiresMode === "DATE" && !formData.expiresAt) return;
    if (formData.expiresMode === "USES" && !formData.maxUses) return;

    await onConfirm(formData as ApproveRequestDto);
    onOpenChange(false);
    // Reset form
    setFormData({
      expiresMode: requestType === "WORK_PERMISSION" ? "DATE" : undefined,
    });
  };

  const handleChange = (field: keyof ApproveRequestDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Set the validity rules for this request. A PDF invitation will be
              generated and sent to the owner.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expiresMode">Expiry Mode *</Label>
              <Select
                value={formData.expiresMode}
                onValueChange={(value) => handleChange("expiresMode", value)}
                required
                disabled={requestType === "WORK_PERMISSION"}
              >
                <SelectTrigger id="expiresMode">
                  <SelectValue placeholder="Select expiry mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DATE">Date-based</SelectItem>
                  {requestType === "GUEST_VISIT" && (
                    <>
                      <SelectItem value="USES">Uses-based</SelectItem>
                      <SelectItem value="UNLIMITED">Unlimited</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {requestType === "WORK_PERMISSION" && (
                <p className="text-xs text-muted-foreground">
                  Work permissions must use date-based expiry
                </p>
              )}
            </div>

            {formData.expiresMode === "DATE" && (
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date *</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={
                    formData.expiresAt
                      ? new Date(formData.expiresAt).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "expiresAt",
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : ""
                    )
                  }
                  required
                />
              </div>
            )}

            {formData.expiresMode === "USES" && (
              <div className="space-y-2">
                <Label htmlFor="maxUses">Maximum Uses *</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses || ""}
                  onChange={(e) =>
                    handleChange(
                      "maxUses",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter maximum number of uses"
                  required
                />
              </div>
            )}

            {formData.expiresMode === "UNLIMITED" && (
              <div className="rounded-md bg-muted p-3 text-sm">
                This invitation will have unlimited validity and can be used
                indefinitely.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve & Generate PDF
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
