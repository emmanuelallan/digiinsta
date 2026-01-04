import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { seoPlugin } from "@payloadcms/plugin-seo";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Subcategories } from "./collections/Subcategories";
import { Products } from "./collections/Products";
import { Bundles } from "./collections/Bundles";
import { Orders } from "./collections/Orders";
import { Posts } from "./collections/Posts";
import { HeroSlides } from "./collections/HeroSlides";
import { ContactSubmissions } from "./collections/ContactSubmissions";
import { NewsletterSubscribers } from "./collections/NewsletterSubscribers";
import { EmailCampaigns } from "./collections/EmailCampaigns";
import { Checkouts } from "./collections/Checkouts";
import { generateTitle, generateDescription, generateImage, generateURL } from "./lib/seo";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: "/components/admin/Dashboard/DashboardView#DashboardView",
          path: "/dashboard",
        },
      },
      afterNavLinks: ["/components/admin/Dashboard/DashboardNavLink#DashboardNavLink"],
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Subcategories,
    Products,
    Bundles,
    Orders,
    Posts,
    HeroSlides,
    ContactSubmissions,
    NewsletterSubscribers,
    EmailCampaigns,
    Checkouts,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    push: true,
  }),
  email: resendAdapter({
    defaultFromAddress: "noreply@notifications.digiinsta.store",
    defaultFromName: "DigiInsta",
    apiKey: process.env.RESEND_API_KEY || "",
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          // Enable signed URLs for secure downloads
          generateFileURL: ({ filename }) => {
            // Public URL for media files
            return `${process.env.R2_PUBLIC_URL}/${filename}`;
          },
        },
      },
      bucket: process.env.R2_BUCKET_NAME || "",
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
        // R2 requires 'auto' region and custom endpoint
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        forcePathStyle: true,
      },
    }),
    seoPlugin({
      collections: ["products", "posts", "bundles", "categories", "subcategories"],
      uploadsCollection: "media",
      tabbedUI: true,
      generateTitle,
      generateDescription,
      generateImage,
      generateURL,
    }),
  ],
});
