/**
 * Admin Upload Page
 *
 * Allows admins to upload product files to R2 storage.
 * Displays file details (key, name, size) for copying to Sanity.
 */

import { ProductFileUpload } from "./product-file-upload";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Product Files</h1>
        <p className="text-muted-foreground mt-1">
          Upload product files to R2 storage. Copy the file details to Sanity after upload.
        </p>
      </div>
      <ProductFileUpload />
    </div>
  );
}
