# Requirements Document

## Introduction

This document specifies the requirements for a Lemon Squeezy Product Management Admin Dashboard. The system enables an authenticated administrator to sync products from the Lemon Squeezy API, enhance them with custom taxonomy metadata (Product Types, Formats, Occasions, Collections), and manage these taxonomies through an intuitive interface. The dashboard provides a centralized location for product data enrichment before products are displayed on a customer-facing storefront.

## Glossary

- **Admin_Dashboard**: The web application interface accessible at /admin for managing products and taxonomies
- **Authentication_System**: The email-based OTP verification system that controls access to the Admin_Dashboard
- **Product_Sync_Service**: The service responsible for fetching product data from the Lemon Squeezy API
- **Taxonomy_Entity**: A classification system (Product Type, Format, Occasion, or Collection) used to categorize products
- **Simple_Taxonomy**: A taxonomy entity with only a title field (Product Type, Format)
- **Complex_Taxonomy**: A taxonomy entity with title, description, and image fields (Occasion, Collection)
- **OTP**: One-Time Password sent via email for authentication
- **Session**: An authenticated user session maintained after successful OTP verification
- **Lemon_Squeezy_API**: The external API service that provides product data
- **Product_Enhancement**: The process of adding taxonomy metadata to synced products

## Requirements

### Requirement 1: Admin Authentication

**User Story:** As an administrator, I want to authenticate using my email address with OTP verification, so that only authorized personnel can access the admin dashboard.

#### Acceptance Criteria

1. WHEN a user navigates to /admin, THE Authentication_System SHALL display a login page
2. WHEN a user enters the email "digiinstastore@gmail.com" and submits, THE Authentication_System SHALL send an OTP to that email address
3. WHEN a user enters an email other than "digiinstastore@gmail.com", THE Authentication_System SHALL reject the login attempt with an error message
4. WHEN an OTP is sent, THE Authentication_System SHALL display an OTP input field
5. WHEN a user enters a valid OTP within the expiration window, THE Authentication_System SHALL create a Session and grant access to the Admin_Dashboard
6. WHEN a user enters an invalid OTP, THE Authentication_System SHALL reject the verification attempt and display an error message
7. WHEN an OTP expires, THE Authentication_System SHALL reject the expired OTP and allow the user to request a new one
8. WHEN a Session is established, THE Authentication_System SHALL maintain the Session across page navigations within the Admin_Dashboard
9. WHEN a user without a valid Session attempts to access any /admin route, THE Authentication_System SHALL redirect them to the login page

### Requirement 2: Product Synchronization

**User Story:** As an administrator, I want to sync products from Lemon Squeezy, so that I have the latest product data available for enhancement.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads, THE Admin_Dashboard SHALL display a "Resync Products" button
2. WHEN the administrator clicks "Resync Products", THE Product_Sync_Service SHALL fetch all products from the Lemon_Squeezy_API
3. WHEN fetching products, THE Product_Sync_Service SHALL retrieve all product data including all available images for each product
4. WHEN products are fetched, THE Product_Sync_Service SHALL check each product against the database to identify duplicates
5. WHEN a fetched product does not exist in the database, THE Product_Sync_Service SHALL insert the new product into the database
6. WHEN a fetched product already exists in the database, THE Product_Sync_Service SHALL skip insertion to avoid duplicates
7. WHEN the sync operation completes successfully, THE Admin_Dashboard SHALL display a success message with the count of new products added
8. WHEN the sync operation fails, THE Admin_Dashboard SHALL display an error message with failure details
9. WHEN a sync operation is in progress, THE Admin_Dashboard SHALL disable the "Resync Products" button and show a loading indicator

### Requirement 3: Product List Display

**User Story:** As an administrator, I want to view all synced products in a list, so that I can select products to enhance with taxonomy metadata.

#### Acceptance Criteria

1. WHEN the Admin_Dashboard loads after authentication, THE Admin_Dashboard SHALL display a list of all products from the database
2. WHEN displaying products, THE Admin_Dashboard SHALL show product name, thumbnail image, and enhancement status for each product
3. WHEN a product has been enhanced with taxonomy metadata, THE Admin_Dashboard SHALL visually indicate the enhancement status
4. WHEN the product list is empty, THE Admin_Dashboard SHALL display a message prompting the administrator to sync products
5. WHEN the administrator clicks on a product in the list, THE Admin_Dashboard SHALL navigate to the product edit interface

### Requirement 4: Product Enhancement Interface

**User Story:** As an administrator, I want to edit products and assign taxonomy metadata, so that products are properly categorized for the storefront.

#### Acceptance Criteria

1. WHEN the administrator selects a product to edit, THE Admin_Dashboard SHALL display the product enhancement interface
2. WHEN the enhancement interface loads, THE Admin_Dashboard SHALL display all product images in a preview carousel
3. WHEN the enhancement interface loads, THE Admin_Dashboard SHALL display selectors for Product Type, Formats, Occasion, and Collection
4. WHEN the administrator selects a Product Type, THE Admin_Dashboard SHALL associate the selected Product Type with the product
5. WHEN the administrator selects one or more Formats, THE Admin_Dashboard SHALL associate the selected Formats with the product
6. WHEN the administrator selects an Occasion, THE Admin_Dashboard SHALL associate the selected Occasion with the product
7. WHEN the administrator selects a Collection, THE Admin_Dashboard SHALL associate the selected Collection with the product
8. WHEN the administrator clicks "Save", THE Admin_Dashboard SHALL persist all taxonomy associations to the database
9. WHEN the save operation succeeds, THE Admin_Dashboard SHALL display a success message and update the product's enhancement status
10. WHEN the save operation fails, THE Admin_Dashboard SHALL display an error message without modifying the product data

### Requirement 5: Simple Taxonomy Management

**User Story:** As an administrator, I want to create new Product Types and Formats on-the-fly, so that I can quickly categorize products without leaving the enhancement interface.

#### Acceptance Criteria

1. WHEN the Product Type selector is displayed, THE Admin_Dashboard SHALL show a "+" button next to the selector
2. WHEN the administrator clicks the "+" button for Product Type, THE Admin_Dashboard SHALL open a dialog with a title input field
3. WHEN the administrator enters a title and clicks "Save" in the Product Type dialog, THE Admin_Dashboard SHALL create a new Simple_Taxonomy entry in the database
4. WHEN a new Product Type is created, THE Admin_Dashboard SHALL immediately add it to the Product Type selector options
5. WHEN the Formats selector is displayed, THE Admin_Dashboard SHALL show a "+" button next to the selector
6. WHEN the administrator clicks the "+" button for Formats, THE Admin_Dashboard SHALL open a dialog with a title input field
7. WHEN the administrator enters a title and clicks "Save" in the Formats dialog, THE Admin_Dashboard SHALL create a new Simple_Taxonomy entry in the database
8. WHEN a new Format is created, THE Admin_Dashboard SHALL immediately add it to the Formats selector options
9. WHEN the administrator clicks "Cancel" in any taxonomy dialog, THE Admin_Dashboard SHALL close the dialog without creating a new entry

### Requirement 6: Complex Taxonomy Management

**User Story:** As an administrator, I want to create new Occasions and Collections with descriptions and images, so that I can provide rich categorization for products.

#### Acceptance Criteria

1. WHEN the Occasion selector is displayed, THE Admin_Dashboard SHALL show a "+" button next to the selector
2. WHEN the administrator clicks the "+" button for Occasion, THE Admin_Dashboard SHALL open a dialog with title, description, and image upload fields
3. WHEN the administrator fills all fields and clicks "Save" in the Occasion dialog, THE Admin_Dashboard SHALL create a new Complex_Taxonomy entry in the database
4. WHEN a new Occasion is created, THE Admin_Dashboard SHALL immediately add it to the Occasion selector options
5. WHEN the Collection selector is displayed, THE Admin_Dashboard SHALL show a "+" button next to the selector
6. WHEN the administrator clicks the "+" button for Collection, THE Admin_Dashboard SHALL open a dialog with title, description, and image upload fields
7. WHEN the administrator fills all fields and clicks "Save" in the Collection dialog, THE Admin_Dashboard SHALL create a new Complex_Taxonomy entry in the database
8. WHEN a new Collection is created, THE Admin_Dashboard SHALL immediately add it to the Collection selector options
9. WHEN the administrator attempts to save a Complex_Taxonomy without required fields, THE Admin_Dashboard SHALL display validation errors and prevent submission
10. WHEN an image is uploaded for a Complex_Taxonomy, THE Admin_Dashboard SHALL validate the image format and size before accepting it

### Requirement 7: Session Management

**User Story:** As an administrator, I want my session to persist while I work, so that I don't have to re-authenticate frequently.

#### Acceptance Criteria

1. WHEN a Session is created after successful OTP verification, THE Authentication_System SHALL store the Session with an expiration time
2. WHEN the administrator navigates between pages in the Admin_Dashboard, THE Authentication_System SHALL maintain the Session
3. WHEN a Session expires, THE Authentication_System SHALL redirect the administrator to the login page
4. WHEN the administrator closes the browser, THE Authentication_System SHALL invalidate the Session
5. WHEN the administrator logs out, THE Authentication_System SHALL immediately invalidate the Session and redirect to the login page

### Requirement 8: Error Handling and User Feedback

**User Story:** As an administrator, I want clear feedback on all operations, so that I understand what's happening and can respond to errors appropriately.

#### Acceptance Criteria

1. WHEN any operation is in progress, THE Admin_Dashboard SHALL display a loading indicator
2. WHEN an operation completes successfully, THE Admin_Dashboard SHALL display a success message with relevant details
3. WHEN an operation fails, THE Admin_Dashboard SHALL display an error message with actionable information
4. WHEN the Lemon_Squeezy_API is unreachable, THE Product_Sync_Service SHALL display a network error message
5. WHEN the database operation fails, THE Admin_Dashboard SHALL display a database error message and maintain the current state
6. WHEN form validation fails, THE Admin_Dashboard SHALL highlight invalid fields and display validation messages
7. WHEN the administrator attempts to save incomplete data, THE Admin_Dashboard SHALL prevent submission and display validation errors

### Requirement 9: User Interface Design

**User Story:** As an administrator, I want a clean and intuitive interface, so that I can efficiently manage products and taxonomies.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL use shadcn UI components for all interface elements
2. THE Admin_Dashboard SHALL follow a clean design aesthetic consistent with Lemon Squeezy's visual style
3. THE Admin_Dashboard SHALL be responsive and functional on desktop screen sizes
4. WHEN displaying lists, THE Admin_Dashboard SHALL use clear visual hierarchy with appropriate spacing and typography
5. WHEN displaying forms, THE Admin_Dashboard SHALL group related fields logically and provide clear labels
6. WHEN displaying dialogs, THE Admin_Dashboard SHALL use modal overlays that focus attention on the current task
7. THE Admin_Dashboard SHALL use consistent color schemes for success, error, and informational messages
8. THE Admin_Dashboard SHALL provide clear navigation between different sections of the dashboard

### Requirement 10: Data Persistence

**User Story:** As an administrator, I want all my changes to be reliably saved, so that product enhancements and taxonomy data are not lost.

#### Acceptance Criteria

1. WHEN products are synced from Lemon_Squeezy_API, THE Product_Sync_Service SHALL persist all product data including images to the database
2. WHEN taxonomy associations are saved, THE Admin_Dashboard SHALL persist the relationships between products and taxonomies to the database
3. WHEN new taxonomy entries are created, THE Admin_Dashboard SHALL persist the taxonomy data to the database
4. WHEN a database write operation fails, THE Admin_Dashboard SHALL rollback any partial changes and maintain data consistency
5. WHEN the administrator refreshes the page, THE Admin_Dashboard SHALL load the current state from the database without data loss
6. WHEN multiple taxonomy items are associated with a product, THE Admin_Dashboard SHALL persist all associations atomically
