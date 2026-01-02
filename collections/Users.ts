import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 * Uses type assertion to access the role field we added
 */
export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  // Access role from user object - will be available after types regenerate
  const userRole = (user as unknown as { role?: string }).role;
  return userRole === "admin";
};

/**
 * Check if user is admin or accessing their own data
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  const userRole = (user as unknown as { role?: string }).role;
  if (userRole === "admin") return true;
  return {
    id: {
      equals: user.id,
    },
  };
};

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "createdAt"],
  },
  auth: true, // Enables Payload's built-in authentication
  fields: [
    {
      name: "name",
      type: "text",
      admin: {
        description: "User's full name",
      },
    },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Customer", value: "customer" },
      ],
      defaultValue: "customer",
      required: true,
      access: {
        // Only admins can change roles
        update: ({ req: { user } }) =>
          (user as { role?: string } | null)?.role === "admin",
      },
      admin: {
        description: "User role - determines access permissions",
      },
    },
    // Email and password are added automatically by auth: true
  ],
  access: {
    // Admins can read all, users can read their own
    read: isAdminOrSelf,
    // Anyone can create (registration)
    create: () => true,
    // Admins can update all, users can update their own
    update: isAdminOrSelf,
    // Only admins can delete users
    delete: isAdmin,
  },
};
