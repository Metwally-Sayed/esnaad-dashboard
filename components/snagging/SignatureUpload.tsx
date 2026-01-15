"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import snaggingService from "@/lib/api/snagging.service";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface SignatureUploadProps {
  snaggingId: string;
  currentSignatureUrl?: string | null;
  onSignatureUpdate?: () => void;
}

export function SignatureUpload({
  snaggingId,
  currentSignatureUrl,
  onSignatureUpdate,
}: SignatureUploadProps) {
  const [signatureUrl, setSignatureUrl] = useState<string>(
    currentSignatureUrl || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Signature image must be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);

      // Upload to R2
      const uploadedUrls = await snaggingService.uploadFiles([file]);
      const uploadedUrl = uploadedUrls[0].publicUrl;

      setSignatureUrl(uploadedUrl);
      toast.success("Signature image uploaded");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload signature");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!signatureUrl) {
      toast.error("Please upload a signature image");
      return;
    }

    try {
      setIsSubmitting(true);
      await snaggingService.updateOwnerSignature(snaggingId, {
        ownerSignatureUrl: signatureUrl,
      });
      toast.success("Signature updated and PDF regenerated");
      onSignatureUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update signature");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignatureUrl(e.target.value);
  };

  return (
    <div className="space-y-4">
      {currentSignatureUrl && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Current Signature:</p>
          <Image
            src={currentSignatureUrl}
            alt="Current signature"
            width={300}
            height={96}
            className="max-w-xs h-24 object-contain border rounded"
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Signature Image</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading || isSubmitting}
              className="flex-1"
            />
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Upload an image of your signature (max 2MB)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Or Enter Signature Image URL</Label>
          <Input
            type="url"
            placeholder="https://example.com/signature.png"
            value={signatureUrl}
            onChange={handleUrlChange}
            disabled={isSubmitting}
          />
        </div>

        {signatureUrl && (
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <Image
              src={signatureUrl}
              alt="Signature preview"
              width={300}
              height={96}
              className="max-w-xs h-24 object-contain border rounded"
              onError={() => {
                toast.error("Invalid image URL");
                setSignatureUrl("");
              }}
            />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            !signatureUrl ||
            isSubmitting ||
            signatureUrl === currentSignatureUrl
          }
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Signature & Regenerate PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
