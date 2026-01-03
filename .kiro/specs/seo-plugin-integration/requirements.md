# Requirements Document

## Introduction

This feature integrates the official `@payloadcms/plugin-seo` plugin into the DigiInsta platform to replace the existing manual SEO fields with a more robust, user-friendly solution. The plugin provides auto-generation capabilities, real-time search preview, and character count indicators to help content editors write effective metadata.

## Glossary

- **SEO_Plugin**: The `@payloadcms/plugin-seo` package that adds meta field management to Payload CMS
- **Meta_Fields**: A group of fields containing title, description, and image for SEO purposes
- **Auto_Generate**: Plugin feature that executes custom functions to populate meta fields from document content
- **Search_Preview**: Visual component showing how the page might appear in search engine results
- **Content_Editor**: Admin panel user who creates and manages products, posts, and bundles

## Requirements

### Requirement 1: Plugin Installation and Configuration

**User Story:** As a developer, I want to install and configure the SEO plugin, so that SEO management is available across the platform.

#### Acceptance Criteria

1. THE SEO_Plugin SHALL be installed as a project dependency
2. THE SEO_Plugin SHALL be configured in the Payload config plugins array
3. THE SEO_Plugin SHALL use the existing "media" collection for image uploads

### Requirement 2: Collection SEO Enablement

**User Story:** As a content editor, I want SEO fields on products, posts, and bundles, so that I can manage metadata for each content type.

#### Acceptance Criteria

1. THE SEO_Plugin SHALL be enabled for the "products" collection
2. THE SEO_Plugin SHALL be enabled for the "posts" collection
3. THE SEO_Plugin SHALL be enabled for the "bundles" collection
4. WHEN SEO is enabled on a collection, THE SEO_Plugin SHALL add a meta field group with title, description, and image subfields

### Requirement 3: Auto-Generation Functions

**User Story:** As a content editor, I want to auto-generate SEO metadata from document content, so that I can quickly create effective meta tags.

#### Acceptance Criteria

1. WHEN auto-generate is clicked for title, THE SEO_Plugin SHALL generate a title using the format "DigiInsta — {document title}"
2. WHEN auto-generate is clicked for description, THE SEO_Plugin SHALL use the document's shortDescription or excerpt field
3. WHEN auto-generate is clicked for image, THE SEO_Plugin SHALL use the document's featured image or first product image
4. WHEN a document has no suitable content for auto-generation, THE SEO_Plugin SHALL leave the field empty

### Requirement 4: URL Preview Generation

**User Story:** As a content editor, I want to see how my page will appear in search results, so that I can optimize my metadata effectively.

#### Acceptance Criteria

1. THE SEO_Plugin SHALL display a search engine preview below the meta fields
2. WHEN generating the preview URL for products, THE SEO_Plugin SHALL use the format "https://digiinsta.com/products/{slug}"
3. WHEN generating the preview URL for posts, THE SEO_Plugin SHALL use the format "https://digiinsta.com/blog/{slug}"
4. WHEN generating the preview URL for bundles, THE SEO_Plugin SHALL use the format "https://digiinsta.com/bundles/{slug}"

### Requirement 5: Admin Panel UI Enhancement

**User Story:** As a content editor, I want SEO fields organized in a dedicated tab, so that I can easily find and manage metadata.

#### Acceptance Criteria

1. THE SEO_Plugin SHALL display meta fields in a dedicated "SEO" tab using tabbedUI
2. THE SEO_Plugin SHALL show character count indicators for title and description fields
3. THE SEO_Plugin SHALL provide visual hints to help write effective metadata

### Requirement 6: Legacy Field Migration

**User Story:** As a developer, I want to remove the old manual SEO fields, so that the codebase is clean and consistent.

#### Acceptance Criteria

1. WHEN the SEO_Plugin is configured, THE System SHALL remove the legacy metaTitle field from all collections
2. WHEN the SEO_Plugin is configured, THE System SHALL remove the legacy metaDescription field from all collections
3. WHEN the SEO_Plugin is configured, THE System SHALL remove the legacy ogImage field from all collections

### Requirement 7: TypeScript Type Generation

**User Story:** As a developer, I want proper TypeScript types for SEO fields, so that I can use them safely in the frontend.

#### Acceptance Criteria

1. WHEN types are regenerated, THE SEO_Plugin SHALL add meta field types to the generated payload-types.ts
2. THE Meta_Fields type SHALL include title, description, and image properties
