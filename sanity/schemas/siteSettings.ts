import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
      description: "Default meta description for the site",
    }),
    defineField({
      name: "defaultMetaImage",
      title: "Default Meta Image",
      type: "image",
      description: "Default Open Graph image for social sharing",
      options: { hotspot: true },
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        { name: "twitter", title: "Twitter", type: "url" },
        { name: "instagram", title: "Instagram", type: "url" },
        { name: "facebook", title: "Facebook", type: "url" },
        { name: "linkedin", title: "LinkedIn", type: "url" },
        { name: "youtube", title: "YouTube", type: "url" },
        { name: "tiktok", title: "TikTok", type: "url" },
      ],
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "footerText",
      title: "Footer Text",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: "siteName",
    },
    prepare({ title }) {
      return {
        title: title || "Site Settings",
        subtitle: "Global site configuration",
      };
    },
  },
});
