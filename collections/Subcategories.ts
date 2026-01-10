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

/**
 * Subcategories Collection
 * Product subcategories that belong to a main category
 * Products are assigned to subcategories, which link to their parent category
 */
export const Subcategories: CollectionConfig = {
  slug: "subcategories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "category", "status"],
    description: "Product subcategories (products are assigned to these)",
  },
  access: {
    read: () => true,
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
    afterChange: [createRevalidationAfterChangeHook("subcategories")],
    afterDelete: [createRevalidationAfterDeleteHook("subcategories")],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Subcategory name (e.g., Study Planners, Budget Templates)",
      },
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
      type: "textarea",
      admin: {
        description: "Brief description of the subcategory",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      admin: {
        description: "Parent category this subcategory belongs to",
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Archived", value: "archived" },
      ],
      defaultValue: "active",
      required: true,
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
