import { defineField, defineType } from "sanity";

export default defineType({
  name: "bundle",
  title: "Bundle",
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
      name: "products",
      title: "Products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "polarProductId",
      title: "Polar Product ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      description: "Bundle price in cents",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Compare At Price",
      type: "number",
      description: "Sum of individual prices for savings display (in cents)",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
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
      media: "heroImage",
      status: "status",
      products: "products",
    },
    prepare({ title, media, status, products }) {
      const productCount = products?.length || 0;
      const statusLabel =
        status === "active" ? "Active" : status === "draft" ? "Draft" : "Archived";
      return {
        title,
        subtitle: `${productCount} products • ${statusLabel}`,
        media,
      };
    },
  },
});
