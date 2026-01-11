import { defineField, defineType } from "sanity";

export default defineType({
  name: "heroSlide",
  title: "Hero Slide",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Internal title for identification",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mobileImage",
      title: "Mobile Image",
      type: "image",
      options: { hotspot: true },
      description: "Optional image optimized for mobile devices",
    }),
    defineField({
      name: "primaryCta",
      title: "Primary CTA",
      type: "object",
      fields: [
        { name: "text", title: "Text", type: "string" },
        { name: "url", title: "URL", type: "string" },
      ],
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary CTA",
      type: "object",
      fields: [
        { name: "text", title: "Text", type: "string" },
        { name: "url", title: "URL", type: "string" },
      ],
    }),
    defineField({
      name: "textPosition",
      title: "Text Position",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "left",
    }),
    defineField({
      name: "textColor",
      title: "Text Color",
      type: "string",
      options: {
        list: [
          { title: "White", value: "white" },
          { title: "Black", value: "black" },
        ],
      },
      initialValue: "white",
    }),
    defineField({
      name: "overlayOpacity",
      title: "Overlay Opacity",
      type: "number",
      description: "0-100 (0 = no overlay, 100 = fully opaque)",
      validation: (Rule) => Rule.min(0).max(100),
      initialValue: 40,
    }),
    defineField({
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
        ],
      },
      initialValue: "active",
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "displayOrder",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      headline: "headline",
      media: "image",
      status: "status",
      displayOrder: "displayOrder",
    },
    prepare({ title, headline, media, status, displayOrder }) {
      return {
        title: title || headline,
        subtitle: `Order: ${displayOrder || 0} • ${status === "active" ? "Active" : "Inactive"}`,
        media,
      };
    },
  },
});
