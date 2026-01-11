import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
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
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Image",
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
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "active",
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
      media: "image",
      status: "status",
    },
    prepare({ title, media, status }) {
      return {
        title,
        media,
        subtitle: status === "archived" ? "Archived" : "Active",
      };
    },
  },
});
