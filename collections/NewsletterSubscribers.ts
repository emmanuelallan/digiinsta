import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

/**
 * Newsletter Subscribers Collection
 * Stores newsletter subscription information
 */
export const NewsletterSubscribers: CollectionConfig = {
  slug: "newsletter-subscribers",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "status", "source", "createdAt"],
    description: "Newsletter subscription list",
  },
  access: {
    // Only admins can read subscribers
    read: isAdmin,
    // Anyone can create (subscribe)
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Normalize email to lowercase
        if (data?.email) {
          data.email = data.email.toLowerCase().trim();
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "firstName",
      type: "text",
      admin: {
        description: "Optional first name for personalization",
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Subscribed", value: "subscribed" },
        { label: "Unsubscribed", value: "unsubscribed" },
        { label: "Bounced", value: "bounced" },
        { label: "Complained", value: "complained" },
      ],
      defaultValue: "subscribed",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "source",
      type: "select",
      options: [
        { label: "Footer Form", value: "footer" },
        { label: "Popup", value: "popup" },
        { label: "Checkout", value: "checkout" },
        { label: "Blog", value: "blog" },
        { label: "Landing Page", value: "landing" },
        { label: "Manual Import", value: "import" },
        { label: "Other", value: "other" },
      ],
      defaultValue: "footer",
      admin: {
        description: "Where the subscriber signed up",
      },
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
        description: "Topics the subscriber is interested in",
      },
    },
    {
      name: "subscribedAt",
      type: "date",
      admin: {
        readOnly: true,
        description: "When the user first subscribed",
      },
    },
    {
      name: "unsubscribedAt",
      type: "date",
      admin: {
        readOnly: true,
        description: "When the user unsubscribed (if applicable)",
      },
    },
    {
      name: "ipAddress",
      type: "text",
      admin: {
        readOnly: true,
        description: "IP address at time of subscription",
      },
    },
    {
      name: "userAgent",
      type: "text",
      admin: {
        readOnly: true,
        description: "Browser/device info at time of subscription",
      },
    },
  ],
  timestamps: true,
};
