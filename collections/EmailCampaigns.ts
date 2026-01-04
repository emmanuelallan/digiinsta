import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

/**
 * Email Campaigns Collection
 * Stores email campaigns for newsletters, upsells, and announcements
 */
export const EmailCampaigns: CollectionConfig = {
  slug: "email-campaigns",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "status", "sentAt", "recipientCount"],
    description: "Email marketing campaigns",
    group: "Marketing",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Internal name for this campaign",
      },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "New Product Announcement", value: "new-product" },
        { label: "Upsell / Cross-sell", value: "upsell" },
        { label: "Newsletter", value: "newsletter" },
        { label: "Promotion / Sale", value: "promotion" },
        { label: "Cart Abandonment", value: "cart-abandonment" },
        { label: "Re-engagement", value: "re-engagement" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Sending", value: "sending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "subject",
              type: "text",
              required: true,
              admin: {
                description: "Email subject line",
              },
            },
            {
              name: "previewText",
              type: "text",
              admin: {
                description: "Preview text shown in email clients (optional)",
              },
            },
            {
              name: "content",
              type: "richText",
              required: true,
              admin: {
                description: "Email body content",
              },
            },
            {
              name: "ctaText",
              type: "text",
              admin: {
                description: "Call-to-action button text (e.g., 'Shop Now')",
              },
            },
            {
              name: "ctaUrl",
              type: "text",
              admin: {
                description: "Call-to-action button URL",
              },
            },
          ],
        },
        {
          label: "Targeting",
          fields: [
            {
              name: "audience",
              type: "select",
              required: true,
              defaultValue: "all-subscribers",
              options: [
                { label: "All Subscribers", value: "all-subscribers" },
                { label: "Recent Customers (30 days)", value: "recent-customers" },
                { label: "All Customers", value: "all-customers" },
                { label: "By Interest", value: "by-interest" },
                { label: "Custom List", value: "custom" },
              ],
            },
            {
              name: "interests",
              type: "select",
              hasMany: true,
              options: [
                { label: "Academic & Bio-Med", value: "academic-bio-med" },
                { label: "Wealth & Finance", value: "wealth-finance" },
                { label: "Life & Legacy", value: "life-legacy" },
                { label: "Digital Aesthetic", value: "digital-aesthetic" },
                { label: "Work & Flow", value: "work-flow" },
                { label: "New Products", value: "new-products" },
                { label: "Sales & Promotions", value: "sales" },
              ],
              admin: {
                condition: (data) => data?.audience === "by-interest",
                description: "Target subscribers with these interests",
              },
            },
            {
              name: "customEmails",
              type: "textarea",
              admin: {
                condition: (data) => data?.audience === "custom",
                description: "Enter email addresses, one per line",
              },
            },
            {
              name: "excludePurchasers",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description: "Exclude customers who already purchased the promoted product",
              },
            },
          ],
        },
        {
          label: "Product Link",
          fields: [
            {
              name: "linkedProduct",
              type: "relationship",
              relationTo: "products",
              admin: {
                description: "Link to a specific product (for new product announcements)",
              },
            },
            {
              name: "linkedBundle",
              type: "relationship",
              relationTo: "bundles",
              admin: {
                description: "Link to a specific bundle",
              },
            },
          ],
        },
        {
          label: "Stats",
          fields: [
            {
              name: "recipientCount",
              type: "number",
              admin: {
                readOnly: true,
                description: "Number of recipients",
              },
            },
            {
              name: "sentAt",
              type: "date",
              admin: {
                readOnly: true,
                description: "When the campaign was sent",
              },
            },
            {
              name: "scheduledFor",
              type: "date",
              admin: {
                description: "Schedule send time (optional)",
              },
            },
            {
              name: "errorMessage",
              type: "text",
              admin: {
                readOnly: true,
                condition: (data) => data?.status === "failed",
              },
            },
          ],
        },
      ],
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Set createdBy on create
        if (operation === "create" && req.user) {
          data.createdBy = req.user.id;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};
