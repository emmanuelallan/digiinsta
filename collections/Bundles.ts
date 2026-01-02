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
    defaultColumns: ["title", "slug", "polarProductId", "status"],
  },
  access: {
    // Public can read active bundles
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
      name: "polarProductId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Polar.sh product ID - one bundle = one Polar product",
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
