import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  const userRole = (user as unknown as { role?: string }).role;
  return userRole === "admin";
};

/**
 * Check if user is admin or owns the order (by email)
 */
const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false;
  const userRole = (user as unknown as { role?: string }).role;
  if (userRole === "admin") return true;
  // Users can only see their own orders
  return {
    email: {
      equals: user.email,
    },
  };
};

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "polarOrderId",
    defaultColumns: [
      "polarOrderId",
      "email",
      "status",
      "ownerAttribution",
      "totalAmount",
      "createdAt",
    ],
  },
  access: {
    // Admins can read all, users can read their own orders
    read: isAdminOrOwner,
    // Only system/webhooks should create orders (handled via local API)
    create: isAdmin,
    // Only admins can update orders
    update: isAdmin,
    // Only admins can delete orders
    delete: isAdmin,
  },
  fields: [
    {
      name: "polarOrderId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Polar.sh order ID",
      },
    },
    {
      name: "polarCheckoutId",
      type: "text",
      admin: {
        description: "Polar.sh checkout ID",
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      admin: {
        description: "Customer email",
      },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: false,
      admin: {
        description: "Payload user (null for guest checkout)",
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
      defaultValue: "pending",
      required: true,
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            { label: "Product", value: "product" },
            { label: "Bundle", value: "bundle" },
          ],
          required: true,
        },
        {
          name: "productId",
          type: "relationship",
          relationTo: "products",
          admin: {
            condition: (data) => data.type === "product",
          },
        },
        {
          name: "bundleId",
          type: "relationship",
          relationTo: "bundles",
          admin: {
            condition: (data) => data.type === "bundle",
          },
        },
        {
          name: "title",
          type: "text",
          required: true,
          admin: {
            description: "Product/bundle title at time of purchase",
          },
        },
        {
          name: "fileKey",
          type: "text",
          required: true,
          admin: {
            description: "R2 file key for download",
          },
        },
        {
          name: "maxDownloads",
          type: "number",
          defaultValue: 5,
          required: true,
          admin: {
            description: "Maximum number of downloads allowed",
          },
        },
        {
          name: "downloadsUsed",
          type: "number",
          defaultValue: 0,
          required: true,
          admin: {
            description: "Number of downloads used",
          },
        },
      ],
    },
    {
      name: "expiresAt",
      type: "date",
      admin: {
        description: "Order expiration date (null = never expires)",
      },
    },
    {
      name: "totalAmount",
      type: "number",
      required: true,
      admin: {
        description: "Total amount in cents",
      },
    },
    {
      name: "currency",
      type: "text",
      defaultValue: "usd",
      required: true,
    },
    {
      name: "fulfilled",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether fulfillment emails have been sent",
      },
    },
    {
      name: "ownerAttribution",
      type: "select",
      options: [
        { label: "ME", value: "ME" },
        { label: "PARTNER", value: "PARTNER" },
      ],
      required: true,
      admin: {
        description: "Revenue attribution - who gets credit for this sale",
      },
    },
  ],
  timestamps: true,
};
