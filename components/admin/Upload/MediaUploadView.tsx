"use client";

/**
 * Custom Media Upload View for Payload Admin
 *
 * Provides a dedicated upload interface that uses direct R2 uploads
 * via presigned URLs, bypassing Vercel's timeout limits.
 */

import React, { useState, useCallback, useRef } from "react";

interface UploadedFile {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "preparing" | "uploading" | "completing" | "success" | "error";
  progress: number;
  error?: string;
  result?: UploadedFile;
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

export const MediaUploadView: React.FC = () => {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File, fileId: string) => {
    const updateFile = (updates: Partial<UploadingFile>) => {
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f)));
    };

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      updateFile({ status: "error", error: `File type not allowed: ${file.type}` });
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      updateFile({
        status: "error",
        error: `File too large. Max ${Math.round(MAX_SIZE / 1024 / 1024)}MB`,
      });
      return;
    }

    try {
      // Step 1: Get presigned URL
      updateFile({ status: "preparing", progress: 0 });

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

      const { presignedUrl, filename } = await presignResponse.json();

      // Step 2: Upload directly to R2
      updateFile({ status: "uploading", progress: 0 });

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
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Step 3: Create media record
      updateFile({ status: "completing", progress: 100 });

      const completeResponse = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          filename,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          mimeType: file.type,
        }),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.error || "Failed to create media record");
      }

      const { media } = await completeResponse.json();

      updateFile({
        status: "success",
        progress: 100,
        result: media,
      });
    } catch (error) {
      updateFile({
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: UploadingFile[] = Array.from(fileList).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending" as const,
        progress: 0,
      }));

      setFiles((prev) => [...newFiles, ...prev]);

      // Start uploads
      Array.from(fileList).forEach((file, index) => {
        const uploadingFile = newFiles[index];
        if (uploadingFile) {
          void uploadFile(file, uploadingFile.id);
        }
      });
    },
    [uploadFile]
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

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== "success"));
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <div className="media-upload-view">
      <div className="upload-header">
        <h1>Upload Media</h1>
        <p>
          Upload files directly to cloud storage. Supports images, PDFs, and ZIP files up to 100MB.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        multiple
        style={{ display: "none" }}
      />

      <div
        className={`upload-dropzone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="dropzone-content">
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            <strong>Click to upload</strong> or drag and drop files here
          </p>
          <p className="upload-hint">Multiple files supported</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="upload-list">
          <div className="list-header">
            <h2>Uploads ({files.length})</h2>
            {successCount > 0 && (
              <button type="button" className="clear-btn" onClick={clearCompleted}>
                Clear completed ({successCount})
              </button>
            )}
          </div>

          {files.map((file) => (
            <div key={file.id} className={`upload-item ${file.status}`}>
              <div className="item-info">
                <span className="item-name">{file.name}</span>
                <span className="item-size">{formatSize(file.size)}</span>
              </div>

              <div className="item-status">
                {file.status === "pending" && <span className="status-text">Waiting...</span>}
                {file.status === "preparing" && <span className="status-text">Preparing...</span>}
                {file.status === "uploading" && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${file.progress}%` }} />
                    </div>
                    <span className="progress-text">{file.progress}%</span>
                  </div>
                )}
                {file.status === "completing" && <span className="status-text">Finalizing...</span>}
                {file.status === "success" && (
                  <span className="status-success">
                    ✓ Complete
                    {file.result && (
                      <a
                        href={`/admin/collections/media/${file.result.id}`}
                        className="view-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    )}
                  </span>
                )}
                {file.status === "error" && <span className="status-error">✕ {file.error}</span>}
              </div>

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeFile(file.id)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .media-upload-view {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }

        .upload-header {
          margin-bottom: 24px;
        }

        .upload-header h1 {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 600;
        }

        .upload-header p {
          margin: 0;
          color: var(--theme-elevation-600, #666);
        }

        .upload-dropzone {
          border: 2px dashed var(--theme-elevation-300, #ccc);
          border-radius: 12px;
          padding: 60px 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--theme-elevation-50, #fafafa);
        }

        .upload-dropzone:hover,
        .upload-dropzone.active {
          border-color: var(--theme-success-500, #0070f3);
          background: var(--theme-elevation-100, #f0f7ff);
        }

        .upload-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .upload-text {
          margin: 0 0 8px;
          font-size: 18px;
          color: var(--theme-elevation-800, #333);
        }

        .upload-hint {
          margin: 0;
          font-size: 14px;
          color: var(--theme-elevation-500, #666);
        }

        .upload-list {
          margin-top: 32px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .list-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .clear-btn {
          padding: 6px 12px;
          background: var(--theme-elevation-200, #eee);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .clear-btn:hover {
          background: var(--theme-elevation-300, #ddd);
        }

        .upload-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--theme-elevation-50, #fff);
          border: 1px solid var(--theme-elevation-200, #eee);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .upload-item.success {
          border-color: var(--theme-success-200, #9ae6b4);
          background: var(--theme-success-50, #f0fff4);
        }

        .upload-item.error {
          border-color: var(--theme-error-200, #feb2b2);
          background: var(--theme-error-50, #fff5f5);
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          display: block;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-size {
          font-size: 12px;
          color: var(--theme-elevation-500, #666);
        }

        .item-status {
          flex-shrink: 0;
          min-width: 150px;
        }

        .status-text {
          color: var(--theme-elevation-600, #666);
          font-size: 14px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: var(--theme-elevation-200, #eee);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--theme-success-500, #0070f3);
          transition: width 0.2s ease;
        }

        .progress-text {
          font-size: 12px;
          color: var(--theme-elevation-600, #666);
          min-width: 36px;
        }

        .status-success {
          color: var(--theme-success-600, #2f855a);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .view-link {
          color: var(--theme-success-700, #276749);
          text-decoration: underline;
        }

        .status-error {
          color: var(--theme-error-600, #c53030);
          font-size: 14px;
        }

        .remove-btn {
          width: 28px;
          height: 28px;
          padding: 0;
          background: var(--theme-elevation-200, #eee);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          color: var(--theme-elevation-600, #666);
        }

        .remove-btn:hover {
          background: var(--theme-elevation-300, #ddd);
        }
      `}</style>
    </div>
  );
};

export default MediaUploadView;
