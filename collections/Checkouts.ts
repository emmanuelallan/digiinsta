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
 * Checkouts Collection
 * Tracks checkout sessions for cart abandonment emails
 */
export const Checkouts: CollectionConfig = {
  slug: "checkouts",
  admin: {
    useAsTitle: "polarCheckoutId",
    defaultColumns: ["email", "completed", "abandonmentEmailSent", "createdAt"],
    description: "Checkout sessions for cart abandonment tracking",
    group: "Marketing",
  },
  access: {
    read: isAdmin,
    // Allow creation from checkout API
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "polarCheckoutId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Polar.sh checkout ID",
        readOnly: true,
      },
    },
    {
      name: "email",
      type: "email",
      admin: {
        description: "Customer email (if provided)",
      },
    },
    {
      name: "items",
      type: "array",
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
          type: "number",
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "price",
          type: "number",
          admin: {
            description: "Price in cents",
          },
        },
      ],
    },
    {
      name: "totalAmount",
      type: "number",
      admin: {
        description: "Total amount in cents",
        readOnly: true,
      },
    },
    {
      name: "completed",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether checkout was completed",
      },
    },
    {
      name: "abandonmentEmailSent",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether abandonment email was sent",
      },
    },
    {
      name: "checkoutUrl",
      type: "text",
      admin: {
        description: "Polar checkout URL for retry",
      },
    },
  ],
  timestamps: true,
};
