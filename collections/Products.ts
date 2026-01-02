import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "polarProductId", "owner", "status"],
  },
  access: {
    // Public can read active products
    read: () => true,
    // Only admins can create/update/delete
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly identifier",
      },
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "shortDescription",
      type: "textarea",
      admin: {
        description: "Brief description for listings",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "owner",
      type: "select",
      options: [
        { label: "ME", value: "ME" },
        { label: "PARTNER", value: "PARTNER" },
      ],
      defaultValue: "ME",
      required: true,
      admin: {
        description: "Product creator - used for revenue attribution",
      },
    },
    {
      name: "polarProductId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Polar.sh product ID - one per price point",
      },
    },
    {
      name: "fileKey",
      type: "text",
      required: true,
      admin: {
        description: "R2 storage key/path for the product file",
      },
    },
    {
      name: "fileSize",
      type: "number",
      admin: {
        description: "File size in bytes",
      },
    },
    {
      name: "images",
      type: "array",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "alt",
          type: "text",
        },
      ],
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
      ],
      defaultValue: "draft",
      required: true,
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
        },
      ],
    },
    // SEO fields
    {
      name: "metaTitle",
      type: "text",
      admin: {
        description: "SEO title (overrides default)",
      },
    },
    {
      name: "metaDescription",
      type: "textarea",
      admin: {
        description: "SEO meta description",
      },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Open Graph image",
      },
    },
  ],
  timestamps: true,
};
