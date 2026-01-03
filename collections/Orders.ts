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
      "totalAmount",
      "createdBy",
      "createdAt",
    ],
    // Hide create button - orders are created automatically via webhooks
    hidden: false,
    description:
      "Orders are created automatically when customers complete checkout. Do not create manually.",
  },
  access: {
    read: isAdminOrOwner,
    // Disable manual creation - orders come from webhooks only
    create: () => false,
    update: isAdmin,
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
        readOnly: true,
      },
    },
    {
      name: "polarCheckoutId",
      type: "text",
      admin: {
        description: "Polar.sh checkout ID",
        readOnly: true,
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      admin: {
        description: "Customer email",
        readOnly: true,
      },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: false,
      admin: {
        description: "Payload user (null for guest checkout)",
        readOnly: true,
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
      admin: {
        readOnly: true,
      },
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
        },
        {
          name: "downloadsUsed",
          type: "number",
          defaultValue: 0,
          required: true,
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
        readOnly: true,
      },
    },
    {
      name: "currency",
      type: "text",
      defaultValue: "usd",
      required: true,
      admin: {
        readOnly: true,
      },
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
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      admin: {
        description: "Product creator who gets revenue attribution",
        readOnly: true,
        position: "sidebar",
      },
    },
  ],
  timestamps: true,
};
