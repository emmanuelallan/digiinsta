import type { CollectionConfig, Access } from "payload";

/**
 * Check if user is an admin
 */
const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === "admin";
};

/**
 * Hero Slides Collection
 * Carousel slides for the homepage hero section
 */
export const HeroSlides: CollectionConfig = {
  slug: "hero-slides",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "status", "updatedAt"],
    description: "Manage homepage hero carousel slides",
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Internal title for this slide",
      },
    },
    {
      name: "headline",
      type: "text",
      required: true,
      admin: {
        description: "Main headline text displayed on the slide",
      },
    },
    {
      name: "subheadline",
      type: "textarea",
      admin: {
        description: "Supporting text below the headline",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Background image for the slide (recommended: 1920x800)",
      },
    },
    {
      name: "mobileImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional mobile-optimized image (recommended: 800x1200)",
      },
    },
    {
      name: "primaryCta",
      type: "group",
      admin: {
        description: "Primary call-to-action button",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          defaultValue: "Shop Now",
        },
        {
          name: "href",
          type: "text",
          required: true,
          defaultValue: "/categories",
        },
      ],
    },
    {
      name: "secondaryCta",
      type: "group",
      admin: {
        description: "Optional secondary call-to-action button",
      },
      fields: [
        {
          name: "label",
          type: "text",
        },
        {
          name: "href",
          type: "text",
        },
      ],
    },
    {
      name: "textPosition",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "left",
      admin: {
        description: "Position of the text content on the slide",
      },
    },
    {
      name: "textColor",
      type: "select",
      options: [
        { label: "Light (for dark backgrounds)", value: "light" },
        { label: "Dark (for light backgrounds)", value: "dark" },
      ],
      defaultValue: "light",
      admin: {
        description: "Text color scheme",
      },
    },
    {
      name: "overlayOpacity",
      type: "select",
      options: [
        { label: "None", value: "0" },
        { label: "Light (20%)", value: "20" },
        { label: "Medium (40%)", value: "40" },
        { label: "Heavy (60%)", value: "60" },
      ],
      defaultValue: "40",
      admin: {
        description: "Dark overlay opacity for better text readability",
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Display order (lower numbers appear first)",
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
      ],
      defaultValue: "draft",
      required: true,
    },
  ],
  timestamps: true,
};
