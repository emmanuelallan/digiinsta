"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, Check, X, Loader2 } from "lucide-react";

interface UploadedFile {
  fileKey: string;
  fileName: string;
  fileSize: number;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function ProductFileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = useCallback(async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const newFile: UploadedFile = {
      fileKey: "",
      fileName: file.name,
      fileSize: file.size,
      status: "uploading",
      progress: 0,
    };

    setFiles((prev) => [newFile, ...prev]);

    const updateFile = (updates: Partial<UploadedFile>) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.fileName === file.name && f.fileSize === file.size ? { ...f, ...updates } : f
        )
      );
    };

    try {
      // Step 1: Get presigned URL
      const presignResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        }),
      });

      if (!presignResponse.ok) {
        const error = await presignResponse.json();
        throw new Error(error.error || "Failed to prepare upload");
      }

      const { presignedUrl, fileKey } = await presignResponse.json();
      updateFile({ fileKey });

      // Step 2: Upload directly to R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateFile({ progress });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      updateFile({ status: "success", progress: 100 });
    } catch (error) {
      updateFile({
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) return;

      Array.from(selectedFiles).forEach((file) => {
        if (file.size > MAX_SIZE) {
          alert(`File ${file.name} is too large. Max size is 500MB.`);
          return;
        }
        void uploadFile(file);
      });

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  const removeFile = useCallback((fileName: string, fileSize: number) => {
    setFiles((prev) => prev.filter((f) => !(f.fileName === fileName && f.fileSize === fileSize)));
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="hover:border-primary/50 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-sm font-medium">Click to upload product files</p>
            <p className="text-muted-foreground mt-1 text-xs">ZIP, PDF, RAR up to 500MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".zip,.pdf,.rar"
            multiple
          />
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file, index) => (
              <div
                key={`${file.fileName}-${file.fileSize}-${index}`}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {file.status === "uploading" && (
                      <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    )}
                    {file.status === "success" && <Check className="h-4 w-4 text-green-600" />}
                    {file.status === "error" && <X className="h-4 w-4 text-red-600" />}
                    <span className="max-w-[300px] truncate font-medium">{file.fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.fileName, file.fileSize)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {file.status === "uploading" && (
                  <div className="space-y-1">
                    <div className="bg-secondary h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">Uploading... {file.progress}%</p>
                  </div>
                )}

                {file.status === "error" && <p className="text-sm text-red-600">{file.error}</p>}

                {file.status === "success" && (
                  <div className="space-y-3 border-t pt-2">
                    <p className="text-muted-foreground text-xs font-medium">
                      Copy these values to Sanity:
                    </p>

                    {/* File Key */}
                    <div className="space-y-1">
                      <Label className="text-xs">Product File Key</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={file.fileKey} className="font-mono text-xs" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(file.fileKey, `key-${index}`)}
                        >
                          {copiedField === `key-${index}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* File Name */}
                    <div className="space-y-1">
                      <Label className="text-xs">Product File Name</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={file.fileName} className="text-xs" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(file.fileName, `name-${index}`)}
                        >
                          {copiedField === `name-${index}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* File Size */}
                    <div className="space-y-1">
                      <Label className="text-xs">Product File Size (bytes)</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={file.fileSize.toString()}
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(file.fileSize.toString(), `size-${index}`)}
                        >
                          {copiedField === `size-${index}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-xs">{formatBytes(file.fileSize)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
