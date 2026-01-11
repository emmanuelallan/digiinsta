"use client";

/**
 * File Upload Component
 *
 * Provides a drag-and-drop file upload interface that uploads directly to R2
 * using presigned URLs. Shows upload progress and completion status.
 *
 * Requirements: 3.4, 12.1
 */

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  fileKey: string;
  filename: string;
  publicUrl: string;
  size: number;
  contentType: string;
}

export interface FileUploadProps {
  /** Callback when file is successfully uploaded */
  onUploadComplete?: (file: UploadedFile) => void;
  /** Callback when upload fails */
  onUploadError?: (error: string) => void;
  /** Accepted file types (MIME types) */
  accept?: string;
  /** Maximum file size in bytes (default: 100MB) */
  maxSize?: number;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadState {
  status: UploadStatus;
  progress: number;
  file: File | null;
  error: string | null;
  uploadedFile: UploadedFile | null;
}

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100MB

const DEFAULT_ACCEPT =
  "image/*,application/pdf,application/zip,application/x-zip-compressed,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    file: null,
    error: null,
    uploadedFile: null,
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetState = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState({
      status: "idle",
      progress: 0,
      file: null,
      error: null,
      uploadedFile: null,
    });
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024);
        const error = `File too large. Maximum size is ${maxSizeMB}MB`;
        setState((prev) => ({ ...prev, status: "error", error }));
        onUploadError?.(error);
        toast.error(error);
        return;
      }

      setState({
        status: "uploading",
        progress: 0,
        file,
        error: null,
        uploadedFile: null,
      });

      try {
        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Step 1: Get presigned URL from our API
        const presignResponse = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!presignResponse.ok) {
          const data = await presignResponse.json();
          throw new Error(data.error || "Failed to get upload URL");
        }

        const { presignedUrl, fileKey } = await presignResponse.json();

        setState((prev) => ({ ...prev, progress: 10 }));

        // Step 2: Upload file directly to R2 using presigned URL
        const xhr = new XMLHttpRequest();

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              // Progress from 10% to 90% during upload
              const uploadProgress = 10 + (event.loaded / event.total) * 80;
              setState((prev) => ({ ...prev, progress: Math.round(uploadProgress) }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload cancelled"));
          });

          // Handle abort controller
          abortControllerRef.current?.signal.addEventListener("abort", () => {
            xhr.abort();
          });

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setState((prev) => ({ ...prev, progress: 95 }));

        // Step 3: Notify completion
        const uploadedFile: UploadedFile = {
          fileKey,
          filename: file.name,
          publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ""}/${fileKey}`,
          size: file.size,
          contentType: file.type,
        };

        setState({
          status: "success",
          progress: 100,
          file,
          error: null,
          uploadedFile,
        });

        onUploadComplete?.(uploadedFile);
        toast.success("File uploaded successfully");
      } catch (error) {
        if (error instanceof Error && error.message === "Upload cancelled") {
          resetState();
          return;
        }

        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));
        onUploadError?.(errorMessage);
        toast.error(errorMessage);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [maxSize, onUploadComplete, onUploadError, resetState]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || state.status === "uploading") return;
      handleFileSelect(e.dataTransfer.files);
    },
    [disabled, state.status, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled || state.status === "uploading") return;
      setIsDragOver(true);
    },
    [disabled, state.status]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled || state.status === "uploading") return;
    fileInputRef.current?.click();
  }, [disabled, state.status]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetState();
  }, [resetState]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || state.status === "uploading"}
        />

        {state.status === "idle" && (
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <Upload className="text-muted-foreground mb-4 h-10 w-10" />
            <p className="text-foreground mb-1 text-sm font-medium">
              Drop a file here or click to browse
            </p>
            <p className="text-muted-foreground text-xs">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        )}

        {state.status === "uploading" && state.file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileIcon className="text-muted-foreground h-8 w-8" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">{state.file.name}</p>
                <p className="text-muted-foreground text-xs">{formatFileSize(state.file.size)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading...
                </span>
                <span className="text-muted-foreground">{state.progress}%</span>
              </div>
            </div>
          </div>
        )}

        {state.status === "success" && state.uploadedFile && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {state.uploadedFile.filename}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(state.uploadedFile.size)} • Uploaded successfully
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-md p-3">
              <p className="text-muted-foreground mb-1 text-xs font-medium">File Key</p>
              <p className="font-mono text-xs break-all">{state.uploadedFile.fileKey}</p>
            </div>

            <Button variant="outline" onClick={resetState} className="w-full">
              Upload Another File
            </Button>
          </div>
        )}

        {state.status === "error" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">Upload Failed</p>
                <p className="text-muted-foreground text-xs">{state.error}</p>
              </div>
            </div>

            <Button variant="outline" onClick={resetState} className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FileUpload;
