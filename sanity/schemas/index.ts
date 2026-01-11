// Document schemas
import category from "./category";
import subcategory from "./subcategory";
import product from "./product";
import creator from "./creator";
import bundle from "./bundle";
import post from "./post";
import postCategory from "./postCategory";
import targetGroup from "./targetGroup";
import heroSlide from "./heroSlide";
import siteSettings from "./siteSettings";

// Shared types
import blockContent from "./blockContent";
import seo from "./objects/seo";

export const schemaTypes = [
  // Document types
  category,
  subcategory,
  product,
  creator,
  bundle,
  post,
  postCategory,
  targetGroup,
  heroSlide,
  siteSettings,
  // Shared types
  blockContent,
  seo,
];
