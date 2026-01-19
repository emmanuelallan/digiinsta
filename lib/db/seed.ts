import { db } from "./index";
import {
  categories,
  productTypes,
  formats,
  audiences,
  useCases,
} from "./schema";

export async function seed() {
  // Categories
  await db.insert(categories).values([
    {
      slug: "christian-faith-devotion",
      name: "Christian Faith & Devotion",
      description:
        "Prayer planners, Bible study guides, and faith-based reflection tools.",
      seoTitle: "Christian Faith & Devotion Resources | DigiInsta Store",
      seoDescription:
        "Discover digital planners, journals, and guides to deepen your Christian faith journey.",
      displayOrder: 1,
    },
    {
      slug: "motherhood-family-life",
      name: "Motherhood & Family Life",
      description:
        "Mom planners, family routines, and gentle home management systems.",
      seoTitle: "Motherhood & Family Planning Tools | DigiInsta Store",
      seoDescription:
        "Digital planners and resources designed specifically for busy moms and families.",
      displayOrder: 2,
    },
    {
      slug: "marriage-couples",
      name: "Marriage & Couples",
      description:
        "Date night planners, marriage finance tools, and communication workbooks.",
      seoTitle: "Marriage & Couples Resources | DigiInsta Store",
      seoDescription:
        "Strengthen your marriage with digital planners, budgeting tools, and relationship-building resources.",
      displayOrder: 3,
    },
    {
      slug: "health-nutrition-body-care",
      name: "Health, Nutrition & Body Care",
      description:
        "Evidence-based meal planners, health trackers, and gentle movement guides.",
      seoTitle: "Health & Nutrition Planning Tools | DigiInsta Store",
      seoDescription:
        "Science-backed digital health trackers and nutrition planners for holistic wellness.",
      displayOrder: 4,
    },
    {
      slug: "students-science-studies",
      name: "Students & Science Studies",
      description:
        "Study planners, exam prep tools, and biomedical science note systems.",
      seoTitle: "Student Study & Science Resources | DigiInsta Store",
      seoDescription:
        "Digital study planners and science-focused resources for students and academics.",
      displayOrder: 5,
    },
    {
      slug: "productivity-life-systems",
      name: "Productivity & Life Systems",
      description:
        "Daily planners, life dashboards, habit trackers, and routine builders.",
      seoTitle: "Productivity & Life Organization Tools | DigiInsta Store",
      seoDescription:
        "Digital planners and systems to help you organize your life and build better habits.",
      displayOrder: 6,
    },
    {
      slug: "small-business-digital-income",
      name: "Small Business & Digital Income",
      description:
        "Business templates, content planning systems, and creator workflows.",
      seoTitle: "Small Business & Creator Resources | DigiInsta Store",
      seoDescription:
        "Digital business tools and templates for entrepreneurs and content creators.",
      displayOrder: 7,
    },
    {
      slug: "creative-templates-printables",
      name: "Creative Templates & Printables",
      description:
        "Canva templates, printable planners, journals, and worksheets.",
      seoTitle: "Creative Templates & Printables | DigiInsta Store",
      seoDescription:
        "Beautiful digital templates and printables for all your creative needs.",
      displayOrder: 8,
    },
  ]);

  // Product Types
  await db.insert(productTypes).values([
    { slug: "planner", name: "Planner", displayOrder: 1 },
    { slug: "workbook", name: "Workbook", displayOrder: 2 },
    { slug: "guide", name: "Guide", displayOrder: 3 },
    { slug: "template", name: "Template", displayOrder: 4 },
    { slug: "dashboard", name: "Dashboard", displayOrder: 5 },
    { slug: "tracker", name: "Tracker", displayOrder: 6 },
    { slug: "journal", name: "Journal", displayOrder: 7 },
    { slug: "checklist", name: "Checklist", displayOrder: 8 },
  ]);

  // Formats
  await db.insert(formats).values([
    { slug: "pdf", name: "PDF", displayOrder: 1 },
    { slug: "notion", name: "Notion", displayOrder: 2 },
    { slug: "goodnotes", name: "GoodNotes", displayOrder: 3 },
    { slug: "canva", name: "Canva", displayOrder: 4 },
    { slug: "google-sheets", name: "Google Sheets", displayOrder: 5 },
    { slug: "excel", name: "Excel", displayOrder: 6 },
    { slug: "printable", name: "Printable", displayOrder: 7 },
  ]);

  // Audiences
  await db.insert(audiences).values([
    { slug: "moms", name: "Moms", displayOrder: 1 },
    { slug: "students", name: "Students", displayOrder: 2 },
    { slug: "couples", name: "Couples", displayOrder: 3 },
    { slug: "creatives", name: "Creatives", displayOrder: 4 },
    { slug: "entrepreneurs", name: "Entrepreneurs", displayOrder: 5 },
    { slug: "christians", name: "Christians", displayOrder: 6 },
  ]);

  // Use Cases
  await db.insert(useCases).values([
    { slug: "daily-planning", name: "Daily Planning", displayOrder: 1 },
    { slug: "habit-building", name: "Habit Building", displayOrder: 2 },
    { slug: "meal-planning", name: "Meal Planning", displayOrder: 3 },
    { slug: "budget-management", name: "Budget Management", displayOrder: 4 },
    { slug: "study-organization", name: "Study Organization", displayOrder: 5 },
    { slug: "content-creation", name: "Content Creation", displayOrder: 6 },
    { slug: "spiritual-growth", name: "Spiritual Growth", displayOrder: 7 },
    {
      slug: "relationship-building",
      name: "Relationship Building",
      displayOrder: 8,
    },
  ]);

  console.log("✅ Database seeded successfully");
}
