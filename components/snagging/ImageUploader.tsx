"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import snaggingService from "@/lib/api/snagging.service";
import { cn } from "@/lib/utils";
import { Camera, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

export interface ImageWithComment {
  file?: File;
  imageUrl?: string; // After upload (Cloudinary secure_url)
  publicId?: string; // Cloudinary public_id
  caption?: string; // Alternative to comment for snagging items
  comment?: string; // Kept for backward compatibility
  sortOrder: number;
  uploading?: boolean;
  uploadProgress?: number;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

interface ImageUploaderProps {
  value: ImageWithComment[];
  onChange: (images: ImageWithComment[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 5,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || disabled) return;

      const maxSizeBytes = maxSize * 1024 * 1024;

      const validateFile = (file: File): string | null => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return `${file.name} is not a supported image type`;
        }
        if (file.size > maxSizeBytes) {
          return `${file.name} exceeds ${maxSize}MB limit`;
        }
        return null;
      };

      const newFiles = Array.from(files);
      const currentCount = value.length;
      const availableSlots = maxFiles - currentCount;

      if (availableSlots <= 0) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      const filesToAdd = newFiles.slice(0, availableSlots);
      const errors: string[] = [];

      const validFiles = filesToAdd.filter((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
          return false;
        }
        return true;
      });

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      if (validFiles.length > 0) {
        // Add new images with files (initially with local file for preview)
        const newImages: ImageWithComment[] = validFiles.map((file, index) => ({
          file,
          comment: "",
          caption: "",
          sortOrder: currentCount + index,
          uploading: true,
          uploadProgress: 0,
        }));

        const updatedImages = [...value, ...newImages];
        onChange(updatedImages);

        // Upload files to Cloudinary via backend
        try {
          const uploadResults = await snaggingService.uploadFiles(
            validFiles,
            () => {
              // Progress callback - we skip real-time updates to avoid stale closure issues
            }
          );

          // Update images with uploaded URLs and public IDs from Cloudinary
          const finalImages = updatedImages.map((img, idx) => {
            const uploadIndex = idx - currentCount;
            if (uploadIndex >= 0 && uploadIndex < uploadResults.length) {
              return {
                ...img,
                imageUrl: uploadResults[uploadIndex].publicUrl,
                publicId: uploadResults[uploadIndex].publicId,
                uploading: false,
                uploadProgress: 100,
              };
            }
            return img;
          });

          onChange(finalImages);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          toast.error(`Upload failed: ${message}`);
          // Remove failed uploads - revert to original value
          onChange(value);
        }
      }
    },
    [value, onChange, maxFiles, maxSize, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    // Reorder sortOrder
    const reordered = newImages.map((img, idx) => ({
      ...img,
      sortOrder: idx,
    }));
    onChange(reordered);
  };

  const updateComment = (index: number, comment: string) => {
    onChange(
      value.map((img, idx) => (idx === index ? { ...img, comment } : img))
    );
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFilesBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isMobile =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile Camera Quick Access */}
      {isMobile && value.length === 0 && !disabled && (
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <Button
            type="button"
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={handleCameraCapture}
            disabled={disabled || value.length >= maxFiles}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">Take Photo</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={handleFilesBrowse}
            disabled={disabled || value.length >= maxFiles}
          >
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">Choose from Gallery</span>
          </Button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:border-primary/50",
          isMobile && value.length === 0 && "hidden md:block"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">
            {isMobile
              ? "Tap to upload or take a photo"
              : "Drag and drop images here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} images, up to {maxSize}MB each
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFilesBrowse}
              disabled={disabled || value.length >= maxFiles}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Browse Files
            </Button>

            {isMobile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCameraCapture}
                disabled={disabled || value.length >= maxFiles}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Image Cards with Comments */}
      {value.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            Images ({value.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {value.map((image, index) => {
              const imageSrc =
                image.imageUrl ||
                (image.file ? URL.createObjectURL(image.file) : "");
              const isUploading = image.uploading || false;

              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {/* Image Preview */}
                    <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted">
                      {imageSrc ? (
                        <>
                          <Image
                            src={imageSrc}
                            alt={`Image ${index + 1}`}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              if (image.file && !image.imageUrl) {
                                URL.revokeObjectURL(imageSrc);
                              }
                            }}
                          />
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="text-white text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p className="text-xs">
                                  {image.uploadProgress !== undefined
                                    ? `${Math.round(image.uploadProgress)}%`
                                    : "Uploading..."}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}

                      {/* Remove Button */}
                      {!disabled && !isUploading && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="space-y-2">
                      <Label htmlFor={`comment-${index}`} className="text-xs">
                        Comment (optional)
                      </Label>
                      <Textarea
                        id={`comment-${index}`}
                        placeholder="Add a comment for this image..."
                        value={image.comment || ""}
                        onChange={(e) => updateComment(index, e.target.value)}
                        disabled={disabled || isUploading}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
