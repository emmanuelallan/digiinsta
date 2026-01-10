import type { CollectionConfig, Access, CollectionBeforeChangeHook } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

/**
 * Handle direct uploads from R2
 * When files are uploaded directly to R2 via presigned URLs,
 * this hook populates the file metadata from the context.
 */
const handleDirectUpload: CollectionBeforeChangeHook = ({ data, context }) => {
  // Check if this is a direct upload (file already in R2)
  if (context?.skipFileUpload && context?.directUpload) {
    const { filename, mimeType, filesize, url } = context.directUpload as {
      filename: string;
      mimeType: string;
      filesize: number;
      url: string;
    };

    return {
      ...data,
      filename,
      mimeType,
      filesize,
      url,
    };
  }

  return data;
};

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Public can read media
    read: () => true,
    // Only admins can upload/update/delete
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [handleDirectUpload],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    // Supported MIME types
    mimeTypes: ["image/*", "application/pdf", "application/zip", "application/x-zip-compressed"],
    // Image resize settings
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "feature",
        width: 1920,
        height: undefined,
        position: "centre",
      },
    ],
    // Admin thumbnail
    adminThumbnail: "thumbnail",
    // Disable focal point to speed up processing
    focalPoint: false,
  },
};
