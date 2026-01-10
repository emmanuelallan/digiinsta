"use client";

/**
 * Direct Upload Field for Payload CMS
 *
 * Custom field component that replaces the default upload behavior
 * with client-side direct uploads to R2.
 */

import React, { useState, useCallback, useRef } from "react";
import { useField } from "@payloadcms/ui";

interface UploadState {
  status: "idle" | "preparing" | "uploading" | "completing" | "success" | "error";
  progress: number;
  error?: string;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export const DirectUploadField: React.FC = () => {
  const { value, setValue } = useField<string>({ path: "filename" });
  const [state, setState] = useState<UploadState>({ status: "idle", progress: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setState({
          status: "error",
          progress: 0,
          error: `File type not allowed: ${file.type}`,
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_SIZE) {
        setState({
          status: "error",
          progress: 0,
          error: `File too large. Maximum size is ${Math.round(MAX_SIZE / 1024 / 1024)}MB`,
        });
        return;
      }

      // Show preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }

      try {
        // Step 1: Get presigned URL
        setState({ status: "preparing", progress: 0 });

        const presignResponse = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
        });

        if (!presignResponse.ok) {
          const error = await presignResponse.json();
          throw new Error(error.error || "Failed to prepare upload");
        }

        const { presignedUrl, filename, publicUrl } = await presignResponse.json();

        // Step 2: Upload directly to R2
        setState({ status: "uploading", progress: 0 });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setState((prev) => ({ ...prev, progress }));
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
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload cancelled"));
          });

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // Step 3: Update field value
        setState({ status: "completing", progress: 100 });

        // Set the filename in the form
        setValue(filename);

        // Also set other fields if they exist
        const form = document.querySelector("form");
        if (form) {
          const urlInput = form.querySelector('input[name="url"]') as HTMLInputElement;
          const mimeTypeInput = form.querySelector('input[name="mimeType"]') as HTMLInputElement;
          const filesizeInput = form.querySelector('input[name="filesize"]') as HTMLInputElement;

          if (urlInput) urlInput.value = publicUrl;
          if (mimeTypeInput) mimeTypeInput.value = file.type;
          if (filesizeInput) filesizeInput.value = String(file.size);
        }

        setState({ status: "success", progress: 100 });
      } catch (error) {
        setState({
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
        });
        setPreview(null);
      }
    },
    [setValue]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadFile(e.dataTransfer.files[0]);
      }
    },
    [uploadFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        uploadFile(e.target.files[0]);
      }
    },
    [uploadFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", progress: 0 });
    setPreview(null);
    setValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [setValue]);

  const isUploading =
    state.status === "preparing" || state.status === "uploading" || state.status === "completing";

  return (
    <div className="direct-upload-field">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        style={{ display: "none" }}
        disabled={isUploading}
      />

      {/* Preview or Dropzone */}
      {preview || value ? (
        <div className="upload-preview">
          {preview && preview.startsWith("data:image") ? (
            <img src={preview} alt="Preview" className="preview-image" />
          ) : (
            <div className="file-icon">📄</div>
          )}
          {value && <p className="filename">{value}</p>}
          {state.status === "success" && (
            <button type="button" className="change-btn" onClick={reset}>
              Change file
            </button>
          )}
        </div>
      ) : (
        <div
          className={`upload-dropzone ${dragActive ? "active" : ""} ${isUploading ? "disabled" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={isUploading ? undefined : handleClick}
        >
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="upload-hint">
            Images, PDFs, ZIPs up to {Math.round(MAX_SIZE / 1024 / 1024)}MB
          </p>
        </div>
      )}

      {/* Progress */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="progress-text">
            {state.status === "preparing" && "Preparing..."}
            {state.status === "uploading" && `Uploading ${state.progress}%`}
            {state.status === "completing" && "Finalizing..."}
          </p>
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="upload-error">
          <p className="error-text">⚠️ {state.error}</p>
          <button type="button" className="retry-btn" onClick={reset}>
            Try again
          </button>
        </div>
      )}

      {/* Success */}
      {state.status === "success" && (
        <div className="upload-success">
          <p className="success-text">✓ Upload complete</p>
        </div>
      )}

      <style jsx>{`
        .direct-upload-field {
          width: 100%;
          margin-bottom: 16px;
        }

        .upload-dropzone {
          border: 2px dashed var(--theme-elevation-200, #ccc);
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--theme-elevation-50, #fafafa);
        }

        .upload-dropzone:hover:not(.disabled),
        .upload-dropzone.active {
          border-color: var(--theme-success-500, #0070f3);
          background: var(--theme-elevation-100, #f0f7ff);
        }

        .upload-dropzone.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .upload-text {
          margin: 0 0 8px;
          color: var(--theme-elevation-800, #333);
        }

        .upload-hint {
          margin: 0;
          font-size: 14px;
          color: var(--theme-elevation-500, #666);
        }

        .upload-preview {
          text-align: center;
          padding: 20px;
          border: 1px solid var(--theme-elevation-200, #eee);
          border-radius: 8px;
          background: var(--theme-elevation-50, #fafafa);
        }

        .preview-image {
          max-width: 200px;
          max-height: 200px;
          object-fit: contain;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .file-icon {
          font-size: 64px;
          margin-bottom: 12px;
        }

        .filename {
          margin: 0 0 12px;
          font-size: 14px;
          color: var(--theme-elevation-600, #555);
          word-break: break-all;
        }

        .change-btn {
          padding: 8px 16px;
          background: var(--theme-elevation-200, #eee);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .change-btn:hover {
          background: var(--theme-elevation-300, #ddd);
        }

        .upload-progress {
          margin-top: 16px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--theme-elevation-200, #eee);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--theme-success-500, #0070f3);
          transition: width 0.2s ease;
        }

        .progress-text {
          margin: 8px 0 0;
          font-size: 14px;
          color: var(--theme-elevation-600, #666);
          text-align: center;
        }

        .upload-error {
          margin-top: 16px;
          padding: 12px;
          background: var(--theme-error-50, #fff5f5);
          border: 1px solid var(--theme-error-200, #feb2b2);
          border-radius: 4px;
          text-align: center;
        }

        .error-text {
          margin: 0 0 8px;
          color: var(--theme-error-600, #c53030);
        }

        .retry-btn {
          padding: 6px 12px;
          background: var(--theme-error-500, #e53e3e);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .retry-btn:hover {
          background: var(--theme-error-600, #c53030);
        }

        .upload-success {
          margin-top: 16px;
          padding: 12px;
          background: var(--theme-success-50, #f0fff4);
          border: 1px solid var(--theme-success-200, #9ae6b4);
          border-radius: 4px;
          text-align: center;
        }

        .success-text {
          margin: 0;
          color: var(--theme-success-600, #2f855a);
        }
      `}</style>
    </div>
  );
};

export default DirectUploadField;
