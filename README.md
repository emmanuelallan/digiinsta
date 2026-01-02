# Digiinsta

**Digiinsta** is a high-performance, SEO-optimized e-commerce platform dedicated to digital products. Built for speed, efficiency, and a premium user experience, it serves as a marketplace for planners, journals, guides, templates, and more.

## tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **CMS**: [Payload CMS 3.0 (Beta)](https://payloadcms.com/)
- **Database**: [Postgres (Neon)](https://neon.tech/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Language**: TypeScript
- **Package Manager**: [Bun](https://bun.sh/)
- **Storage**: Cloudflare R2 (via AWS S3 SDK)
- **Email**: [Resend](https://resend.com/)
- **Payments**: [Polar.sh](https://polar.sh/)
- **Monitoring**: [Sentry](https://sentry.io/) (Error Tracking) & [Pino](https://github.com/pinojs/pino) (Logging)

## Features

- **Digital Product Marketplace**: Specialized support for digital downloads with secure, expiring links (24hr expiry).
- **High Performance & SEO**: Optimized for speed and search engine visibility to drive organic traffic.
- **Admin System**: Track product creation and revenue per admin (Me & Partner).
- **Content Marketing**: Integrated blog/article section for SEO-heavy content marketing.
- **Secure Access**: Presigned URLs for product delivery.
- **User Accounts**: Customer registration for purchase history viewing (optional guest checkout available).

## Getting Started

### Prerequisites

- **Bun**: Ensure you have Bun installed.
- **Postgres**: A Neon DB instance.
- **S3/R2**: Cloudflare R2 bucket for storage.

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/digiinsta.git
    cd digiinsta
    ```

2.  Install dependencies:

    ```bash
    bun install
    ```

3.  Environment Setup:
    - Copy `.env.example` to `.env.local` (ensure you have one) and populate it with your Payload secret, Database URL, Resend API key, and S3/R2 credentials.

4.  Run the development server:

    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to see the storefront.
    Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

## Project Structure

- `app/(frontend)`: Main storefront application (Next.js App Router).
- `app/(payload)`: Payload CMS admin routes.
- `collections/`: Payload CMS collection definitions (Products, Orders, Users, etc.).
- `components/ui`: Shadcn UI components.
- `lib/`: Shared utilities (Email, Revenue, Storage logic).

## Development Workflow

- **UI Components**: Install new components directly via Shadcn:
  ```bash
  bunx --bun shadcn@latest add [component-name]
  ```
- **Database Updates**: Payload manages the schema. After changing collections, Payload handles migrations automatically (or generates them).

## License

[MIT](LICENSE)
