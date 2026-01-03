import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

export const Bundles: CollectionConfig = {
  slug: "bundles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status", "createdBy"],
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
      name: "polarProductId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Polar.sh product ID - one bundle = one Polar product",
      },
    },
    {
      name: "price",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "Bundle price in cents (e.g., 2999 = $29.99). Must match Polar price.",
      },
    },
    {
      name: "compareAtPrice",
      type: "number",
      min: 0,
      admin: {
        description: "Original price in cents (sum of individual products) for savings display",
      },
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      required: true,
      admin: {
        description: "Products included in this bundle",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: {
        description: "Bundle creator - auto-set to current user",
        readOnly: true,
        position: "sidebar",
      },
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
  ],
  timestamps: true,
};
