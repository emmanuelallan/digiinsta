/**
 * Core TypeScript interfaces for Digital Love Storefront
 */

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  emotionalPromise: string;
  price: number;
  salePrice?: number;
  images: ProductImage[];
  badges: Badge[];
  taxonomies: Taxonomy[];
  whatsIncluded: string[];
  whyItWorks: string[];
  howToUse: Step[];
  faqs: FAQ[];
  lemonSqueezyProductId: string;
  lemonSqueezyCheckoutUrl: string;
  variantId?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  type: 'lifestyle' | 'overview' | 'sample' | 'editable' | 'printable' | 'gift';
  order: number;
}

export interface Badge {
  text: string;
  type: 'bestseller' | 'valentine' | 'editable' | 'instant' | 'new';
  icon?: string;
}

export interface Taxonomy {
  type: 'relationship' | 'occasion' | 'format';
  value: string;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  emotionalCopy: string;
  icon: string;
  taxonomyFilter: Taxonomy;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
  order: number;
}

export interface EmailSubscription {
  email: string;
  subscribedAt: Date;
  source: 'homepage' | 'checkout';
}

export interface CTAButton {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary';
}
