import { defineField, defineType } from "sanity";

const gradientOptions = [
  { title: "Blue to Purple", value: "from-blue-500 to-purple-600" },
  { title: "Green to Teal", value: "from-green-500 to-teal-600" },
  { title: "Orange to Red", value: "from-orange-500 to-red-600" },
  { title: "Pink to Rose", value: "from-pink-500 to-rose-600" },
  { title: "Indigo to Blue", value: "from-indigo-500 to-blue-600" },
  { title: "Yellow to Orange", value: "from-yellow-500 to-orange-600" },
];

export default defineType({
  name: "targetGroup",
  title: "Target Group",
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
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Short tagline for display",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "GraduationCap", value: "GraduationCap" },
          { title: "Briefcase", value: "Briefcase" },
          { title: "Heart", value: "Heart" },
          { title: "Users", value: "Users" },
          { title: "Star", value: "Star" },
        ],
      },
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gradient",
      title: "Gradient",
      type: "string",
      options: { list: gradientOptions },
    }),
    defineField({
      name: "relatedCategories",
      title: "Related Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
  },
});
