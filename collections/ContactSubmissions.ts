import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

/**
 * Contact Submissions Collection
 * Stores contact form submissions from the website
 */
export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  admin: {
    useAsTitle: "subject",
    defaultColumns: ["name", "email", "subject", "status", "createdAt"],
    description: "Contact form submissions from website visitors",
  },
  access: {
    // Only admins can read submissions
    read: isAdmin,
    // Anyone can create (submit contact form)
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "phone",
      type: "text",
      admin: {
        readOnly: true,
        description: "Optional phone number",
      },
    },
    {
      name: "subject",
      type: "text",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "message",
      type: "textarea",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "New", value: "new" },
        { label: "In Progress", value: "in-progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Spam", value: "spam" },
      ],
      defaultValue: "new",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "notes",
      type: "textarea",
      admin: {
        description: "Internal notes about this submission",
        position: "sidebar",
      },
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      admin: {
        description: "Team member handling this inquiry",
        position: "sidebar",
      },
    },
    {
      name: "source",
      type: "text",
      admin: {
        readOnly: true,
        description: "Page or form where submission originated",
      },
    },
    {
      name: "ipAddress",
      type: "text",
      admin: {
        readOnly: true,
        description: "IP address of submitter (for spam prevention)",
      },
    },
  ],
  timestamps: true,
};
