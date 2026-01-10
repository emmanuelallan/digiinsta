import type { CollectionConfig, Access } from "payload";
import {
  createRevalidationAfterChangeHook,
  createRevalidationAfterDeleteHook,
} from "@/lib/revalidation/hooks";

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
    defaultColumns: ["title", "slug", "subcategory", "status", "createdBy"],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto-generate slug from title if not provided
        if (data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
        // Auto-set createdBy to current user on create
        if (req.user && !data?.createdBy) {
          data.createdBy = req.user.id;
        }
        return data;
      },
    ],
    afterChange: [createRevalidationAfterChangeHook("products")],
    afterDelete: [createRevalidationAfterDeleteHook("products")],
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
        description: "URL-friendly identifier (auto-generated from title)",
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
      name: "subcategory",
      type: "relationship",
      relationTo: "subcategories",
      required: true,
      admin: {
        description: "Product subcategory (determines the parent category)",
      },
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: {
        description: "Product creator - auto-set to current user",
        readOnly: true,
        position: "sidebar",
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
      name: "price",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "Price in cents (e.g., 999 = $9.99). Must match Polar price.",
      },
    },
    {
      name: "compareAtPrice",
      type: "number",
      min: 0,
      admin: {
        description: "Original price in cents for sale display (optional)",
      },
    },
    {
      name: "file",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Downloadable product file (PDF, ZIP, etc.)",
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
    // Manual cache refresh button (Requirement 4.3)
    {
      name: "refreshCache",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field: "/components/admin/Revalidation/RefreshCacheButton#RefreshCacheButton",
        },
      },
    },
  ],
  timestamps: true,
};
