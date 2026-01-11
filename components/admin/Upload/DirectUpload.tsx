"use client";

/**
 * Direct Upload Component for Payload Admin
 *
 * Handles client-side direct uploads to R2 using presigned URLs.
 * This bypasses Vercel's serverless timeout limits.
 */

import React, { useState, useCallback, useRef } from "react";

interface UploadState {
  status: "idle" | "preparing" | "uploading" | "completing" | "success" | "error";
  progress: number;
  error?: string;
  result?: {
    id: number;
    filename: string;
    url: string;
  };
}

interface DirectUploadProps {
  onUploadComplete?: (media: { id: number; filename: string; url: string }) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export function DirectUpload({
  onUploadComplete,
  accept = "image/*,application/pdf,application/zip",
  maxSize = 100 * 1024 * 1024, // 100MB default
}: DirectUploadProps) {
  const [state, setState] = useState<UploadState>({ status: "idle", progress: 0 });
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file size
      if (file.size > maxSize) {
        setState({
          status: "error",
          progress: 0,
          error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
        });
        return;
      }

      try {
        // Step 1: Get presigned URL
        setState({ status: "preparing", progress: 0 });

        const presignResponse = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        const { presignedUrl, filename } = await presignResponse.json();

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
            reject(new Error("Upload failed"));
          });

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // Step 3: Create media record in Payload
        setState({ status: "completing", progress: 100 });

        const completeResponse = await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            alt: file.name.replace(/\.[^/.]+$/, ""),
            mimeType: file.type,
          }),
        });

        if (!completeResponse.ok) {
          const error = await completeResponse.json();
          throw new Error(error.error || "Failed to complete upload");
        }

        const { media } = await completeResponse.json();

        setState({
          status: "success",
          progress: 100,
          result: media,
        });

        onUploadComplete?.(media);
      } catch (error) {
        setState({
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    },
    [maxSize, onUploadComplete]
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

      if (e.dataTransfer.files?.[0]) {
        void uploadFile(e.dataTransfer.files[0]);
      }
    },
    [uploadFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        void uploadFile(e.target.files[0]);
      }
    },
    [uploadFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", progress: 0 });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  return (
    <div className="direct-upload">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {state.status === "idle" && (
        <div
          className={`upload-dropzone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="upload-hint">Max file size: {Math.round(maxSize / 1024 / 1024)}MB</p>
        </div>
      )}

      {(state.status === "preparing" ||
        state.status === "uploading" ||
        state.status === "completing") && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="progress-text">
            {state.status === "preparing" && "Preparing upload..."}
            {state.status === "uploading" && `Uploading... ${state.progress}%`}
            {state.status === "completing" && "Finalizing..."}
          </p>
        </div>
      )}

      {state.status === "success" && state.result && (
        <div className="upload-success">
          <div className="success-icon">✓</div>
          <p className="success-text">Upload complete!</p>
          <p className="success-filename">{state.result.filename}</p>
          <button type="button" className="upload-another-btn" onClick={reset}>
            Upload another
          </button>
        </div>
      )}

      {state.status === "error" && (
        <div className="upload-error">
          <div className="error-icon">✕</div>
          <p className="error-text">{state.error}</p>
          <button type="button" className="retry-btn" onClick={reset}>
            Try again
          </button>
        </div>
      )}

      <style jsx>{`
        .direct-upload {
          width: 100%;
        }

        .upload-dropzone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafafa;
        }

        .upload-dropzone:hover,
        .upload-dropzone.active {
          border-color: #0070f3;
          background: #f0f7ff;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .upload-text {
          margin: 0 0 8px;
          color: #333;
        }

        .upload-hint {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .upload-progress {
          padding: 20px;
          text-align: center;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: #0070f3;
          transition: width 0.2s ease;
        }

        .progress-text {
          margin: 0;
          color: #666;
        }

        .upload-success,
        .upload-error {
          padding: 20px;
          text-align: center;
          border-radius: 8px;
        }

        .upload-success {
          background: #f0fff4;
          border: 1px solid #9ae6b4;
        }

        .upload-error {
          background: #fff5f5;
          border: 1px solid #feb2b2;
        }

        .success-icon {
          font-size: 32px;
          color: #38a169;
          margin-bottom: 8px;
        }

        .error-icon {
          font-size: 32px;
          color: #e53e3e;
          margin-bottom: 8px;
        }

        .success-text,
        .error-text {
          margin: 0 0 8px;
          font-weight: 500;
        }

        .success-filename {
          margin: 0 0 16px;
          font-size: 14px;
          color: #666;
          word-break: break-all;
        }

        .upload-another-btn,
        .retry-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .upload-another-btn {
          background: #38a169;
          color: white;
        }

        .retry-btn {
          background: #e53e3e;
          color: white;
        }

        .upload-another-btn:hover {
          background: #2f855a;
        }

        .retry-btn:hover {
          background: #c53030;
        }
      `}</style>
    </div>
  );
}

export default DirectUpload;
