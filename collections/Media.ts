import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Public can read media
    read: () => true,
    // Only admins can upload/update/delete
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: true,
};
