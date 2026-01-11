import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "blockContent",
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "subcategory",
      title: "Subcategory",
      type: "reference",
      to: [{ type: "subcategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "creator",
      title: "Creator",
      type: "reference",
      to: [{ type: "creator" }],
    }),
    defineField({
      name: "polarProductId",
      title: "Polar Product ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customPrice",
      title: "Custom Price",
      type: "number",
      description: "Override subcategory price (in cents). Leave empty to use subcategory default.",
    }),
    defineField({
      name: "compareAtPrice",
      title: "Compare At Price",
      type: "number",
      description: "Original price for sale display (in cents)",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "productFileKey",
      title: "Product File Key",
      type: "string",
      description: "R2 file key for download",
    }),
    defineField({
      name: "productFileName",
      title: "Product File Name",
      type: "string",
      description: "Original filename for display",
    }),
    defineField({
      name: "productFileSize",
      title: "Product File Size",
      type: "number",
      description: "File size in bytes",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Draft", value: "draft" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "targetGroups",
      title: "Target Groups",
      type: "array",
      of: [{ type: "reference", to: [{ type: "targetGroup" }] }],
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      description: "SEO title (max 60 characters for best results)",
      validation: (Rule) => Rule.max(60).warning("Keep under 60 characters for optimal SEO"),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      description: "SEO description (max 160 characters for best results)",
      validation: (Rule) => Rule.max(160).warning("Keep under 160 characters for optimal SEO"),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subcategory.title",
      media: "images.0",
      status: "status",
    },
    prepare({ title, subtitle, media, status }) {
      const statusLabel =
        status === "active" ? "Active" : status === "draft" ? "Draft" : "Archived";
      return {
        title,
        subtitle: `${subtitle || "No subcategory"} • ${statusLabel}`,
        media,
      };
    },
  },
});
