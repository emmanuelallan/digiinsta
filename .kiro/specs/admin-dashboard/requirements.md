# Requirements Document

## Introduction

This document defines the requirements for the Admin Revenue & Analytics Dashboard feature for DigiInsta. The dashboard will be integrated into Payload CMS's admin panel, providing real-time revenue tracking, partner attribution, and key business metrics to help admins monitor progress toward the $400/month revenue goal per partner.

## Glossary

- **Admin_Dashboard**: The custom Payload CMS admin view displaying revenue and analytics data
- **Revenue_Widget**: A UI component showing revenue metrics for a specific time period
- **Partner**: An admin user who creates products and receives revenue attribution
- **Revenue_Goal**: The target monthly revenue of $400 per partner
- **Order**: A completed purchase record in the system
- **Analytics_Service**: Server-side functions that calculate and aggregate business metrics

## Requirements

### Requirement 1: Revenue Overview Dashboard

**User Story:** As an admin, I want to see a revenue overview on my admin dashboard, so that I can quickly understand the current business performance.

#### Acceptance Criteria

1. WHEN an admin accesses the admin dashboard THEN the Admin_Dashboard SHALL display total revenue for the current month
2. WHEN an admin views the revenue overview THEN the Admin_Dashboard SHALL show revenue broken down by each partner
3. WHEN displaying partner revenue THEN the Admin_Dashboard SHALL show progress toward the $400/month goal as a percentage
4. WHEN displaying revenue data THEN the Admin_Dashboard SHALL format amounts in USD with proper currency formatting
5. THE Admin_Dashboard SHALL update revenue data on each page load without requiring manual refresh

### Requirement 2: Revenue Time Period Selection

**User Story:** As an admin, I want to view revenue for different time periods, so that I can analyze trends and compare performance.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Admin_Dashboard SHALL provide period selection options (This Month, Last Month, Last 7 Days, Last 30 Days, This Year)
2. WHEN an admin selects a time period THEN the Admin_Dashboard SHALL recalculate and display revenue for that period
3. WHEN displaying period data THEN the Admin_Dashboard SHALL show the date range being displayed
4. THE Admin_Dashboard SHALL default to "This Month" period on initial load

### Requirement 3: Order Statistics

**User Story:** As an admin, I want to see order statistics, so that I can understand purchase patterns and volume.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Admin_Dashboard SHALL display total number of orders for the selected period
2. WHEN displaying order stats THEN the Admin_Dashboard SHALL show orders by status (completed, pending, failed, refunded)
3. WHEN displaying order stats THEN the Admin_Dashboard SHALL show average order value (AOV)
4. THE Admin_Dashboard SHALL calculate order statistics from the orders collection

### Requirement 4: Product Performance Metrics

**User Story:** As an admin, I want to see which products are performing best, so that I can make informed decisions about inventory and marketing.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Admin_Dashboard SHALL display a list of top-selling products
2. WHEN displaying top products THEN the Admin_Dashboard SHALL show product title, units sold, and revenue generated
3. WHEN displaying top products THEN the Admin_Dashboard SHALL limit the list to top 5 products by revenue
4. THE Admin_Dashboard SHALL include bundle sales in product performance calculations

### Requirement 5: Recent Orders List

**User Story:** As an admin, I want to see recent orders at a glance, so that I can monitor incoming purchases without navigating away.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Admin_Dashboard SHALL display the 5 most recent orders
2. WHEN displaying recent orders THEN the Admin_Dashboard SHALL show order ID, customer email, total amount, and status
3. WHEN an admin clicks on an order THEN the Admin_Dashboard SHALL navigate to the full order detail in Payload
4. IF no orders exist THEN the Admin_Dashboard SHALL display a friendly empty state message

### Requirement 6: Download Analytics

**User Story:** As an admin, I want to see download statistics, so that I can understand product delivery and customer engagement.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Admin_Dashboard SHALL display total downloads for the selected period
2. WHEN displaying download stats THEN the Admin_Dashboard SHALL show downloads by product
3. WHEN displaying download stats THEN the Admin_Dashboard SHALL show average downloads per order
4. THE Analytics_Service SHALL calculate downloads from the downloadsUsed field in order items

### Requirement 7: Dashboard Access Control

**User Story:** As a system administrator, I want the dashboard to be restricted to admin users, so that sensitive business data is protected.

#### Acceptance Criteria

1. WHEN a non-admin user attempts to access the dashboard THEN the Admin_Dashboard SHALL deny access
2. WHEN an admin user accesses the dashboard THEN the Admin_Dashboard SHALL display all metrics
3. THE Admin_Dashboard SHALL use Payload's built-in access control for authorization
