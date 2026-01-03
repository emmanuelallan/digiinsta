import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

/**
 * Categories Collection
 * Main product categories (e.g., Academic & Bio-Med, Wealth & Finance)
 * These are the top-level categories shown on the storefront
 */
export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status"],
    description: "Main product categories for the storefront",
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
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Category name (e.g., Academic & Bio-Med)",
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
        description: "Brief description of the category",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Category image for storefront display",
      },
    },
    {
      name: "icon",
      type: "select",
      options: [
        { label: "Microscope (Academic)", value: "Microscope" },
        { label: "Chart Line (Finance)", value: "ChartLine" },
        { label: "Sparkles (Life)", value: "Sparkles" },
        { label: "Palette (Aesthetic)", value: "Palette" },
        { label: "Workflow (Work)", value: "Workflow" },
        { label: "Folder (Default)", value: "Folder" },
      ],
      defaultValue: "Folder",
      admin: {
        description: "Icon to display for this category",
      },
    },
    {
      name: "gradient",
      type: "select",
      options: [
        { label: "Blue to Cyan", value: "from-blue-500 to-cyan-500" },
        { label: "Emerald to Green", value: "from-emerald-500 to-green-500" },
        { label: "Purple to Pink", value: "from-purple-500 to-pink-500" },
        { label: "Orange to Red", value: "from-orange-500 to-red-500" },
        { label: "Indigo to Violet", value: "from-indigo-500 to-violet-500" },
        { label: "Gray", value: "from-gray-500 to-gray-600" },
      ],
      defaultValue: "from-gray-500 to-gray-600",
      admin: {
        description: "Gradient color for category card background",
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
  ],
  timestamps: true,
};
