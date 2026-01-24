# API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Lemon Squeezy Admin Dashboard. All endpoints return JSON responses and follow RESTful conventions.

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://your-domain.vercel.app`

## Authentication

Most endpoints require authentication via session cookie. The session cookie is automatically set after successful OTP verification.

**Cookie Name:** `digiinsta_session` (configurable via `SESSION_COOKIE_NAME` env var)

**Session Duration:** 24 hours (configurable via `SESSION_DURATION_HOURS` env var)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication Endpoints

### Send OTP

Send a one-time password to the specified email address.

**Endpoint:** `POST /api/auth/send-otp`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "digiinstastore@gmail.com"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Email address to send OTP to |

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Email is required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Email address not authorized"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to send OTP"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"digiinstastore@gmail.com"}'
```

---

### Verify OTP

Verify the OTP code and create a session.

**Endpoint:** `POST /api/auth/verify-otp`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "digiinstastore@gmail.com",
  "otp": "123456"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Email address |
| otp | string | Yes | 6-digit OTP code |

**Success Response (200):**
```json
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Headers:**
```
Set-Cookie: digiinsta_session=<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Email and OTP are required"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired OTP"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"digiinstastore@gmail.com","otp":"123456"}'
```

---

### Check Session

Check if the current session is valid.

**Endpoint:** `GET /api/auth/session`

**Authentication:** Required (session cookie)

**Success Response (200):**
```json
{
  "valid": true,
  "email": "digiinstastore@gmail.com",
  "expiresAt": "2026-01-25T12:00:00.000Z"
}
```

**Invalid Session Response (200):**
```json
{
  "valid": false
}
```

**Example:**
```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: digiinsta_session=<token>"
```

---

### Logout

Invalidate the current session.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required (session cookie)

**Success Response (200):**
```json
{
  "success": true
}
```

**Response Headers:**
```
Set-Cookie: digiinsta_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: digiinsta_session=<token>"
```

---

### Refresh Session

Refresh the current session to extend its expiration.

**Endpoint:** `POST /api/auth/refresh-session`

**Authentication:** Required (session cookie)

**Success Response (200):**
```json
{
  "success": true,
  "expiresAt": "2026-01-25T12:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired session"
}
```

---

### Cleanup Expired Sessions

Remove expired sessions from the database (maintenance endpoint).

**Endpoint:** `POST /api/auth/cleanup-sessions`

**Authentication:** Not required (should be called by cron job)

**Success Response (200):**
```json
{
  "success": true,
  "deletedCount": 15
}
```

---

## Product Endpoints

### Sync Products

Synchronize products from Lemon Squeezy API to the database.

**Endpoint:** `POST /api/products/sync`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "newProductsCount": 5,
  "skippedProductsCount": 10,
  "errors": []
}
```

**Partial Success Response (200):**
```json
{
  "success": true,
  "newProductsCount": 3,
  "skippedProductsCount": 8,
  "errors": [
    "Failed to fetch images for product: Product Name"
  ]
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Authentication required. Please log in."
}
```

**Error Response (500):**
```json
{
  "success": false,
  "newProductsCount": 0,
  "skippedProductsCount": 0,
  "errors": [
    "Failed to connect to Lemon Squeezy API"
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products/sync \
  -H "Cookie: digiinsta_session=<token>"
```

---

### Get All Products

Retrieve all products with enhancement status.

**Endpoint:** `GET /api/products`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "lemonSqueezyId": "123456",
      "name": "Digital Planner 2024",
      "description": "A comprehensive digital planner",
      "price": 29.99,
      "currency": "USD",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "createdAt": "2026-01-20T10:00:00.000Z",
      "updatedAt": "2026-01-24T15:30:00.000Z",
      "isEnhanced": true
    }
  ]
}
```

**Product Object:**
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Product ID |
| lemonSqueezyId | string | Lemon Squeezy product ID |
| name | string | Product name |
| description | string \| null | Product description |
| price | number | Product price |
| currency | string | Currency code (USD, EUR, etc.) |
| images | string[] | Array of image URLs |
| createdAt | string (ISO 8601) | Creation timestamp |
| updatedAt | string (ISO 8601) | Last update timestamp |
| isEnhanced | boolean | Whether product has taxonomies |

**Example:**
```bash
curl http://localhost:3000/api/products
```

---

### Get Product by ID

Retrieve a single product with full taxonomy details.

**Endpoint:** `GET /api/products/:id`

**Authentication:** Not required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Product ID |

**Success Response (200):**
```json
{
  "success": true,
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "lemonSqueezyId": "123456",
    "name": "Digital Planner 2024",
    "description": "A comprehensive digital planner",
    "price": 29.99,
    "currency": "USD",
    "images": [
      "https://example.com/image1.jpg"
    ],
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-24T15:30:00.000Z",
    "productType": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Digital Product"
    },
    "formats": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "title": "PDF"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "title": "GoodNotes"
      }
    ],
    "occasion": {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "title": "New Year",
      "description": "Perfect for New Year planning",
      "imageUrl": "https://r2.example.com/occasion.jpg"
    },
    "collection": {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "title": "2024 Collection",
      "description": "Our 2024 product line",
      "imageUrl": "https://r2.example.com/collection.jpg"
    },
    "isEnhanced": true
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

**Example:**
```bash
curl http://localhost:3000/api/products/550e8400-e29b-41d4-a716-446655440000
```

---

### Enhance Product

Update a product's taxonomy associations.

**Endpoint:** `PUT /api/products/:id/enhance`

**Authentication:** Not required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Product ID |

**Request Body:**
```json
{
  "productTypeId": "660e8400-e29b-41d4-a716-446655440000",
  "formatIds": [
    "770e8400-e29b-41d4-a716-446655440000",
    "880e8400-e29b-41d4-a716-446655440000"
  ],
  "occasionId": "990e8400-e29b-41d4-a716-446655440000",
  "collectionId": "aa0e8400-e29b-41d4-a716-446655440000"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productTypeId | string (UUID) \| null | No | Product type ID |
| formatIds | string[] | No | Array of format IDs |
| occasionId | string (UUID) \| null | No | Occasion ID |
| collectionId | string (UUID) \| null | No | Collection ID |

**Success Response (200):**
```json
{
  "success": true,
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Digital Planner 2024",
    "productType": { ... },
    "formats": [ ... ],
    "occasion": { ... },
    "collection": { ... },
    "isEnhanced": true
  },
  "message": "Product successfully enhanced"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid taxonomy IDs provided"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/products/550e8400-e29b-41d4-a716-446655440000/enhance \
  -H "Content-Type: application/json" \
  -d '{
    "productTypeId": "660e8400-e29b-41d4-a716-446655440000",
    "formatIds": ["770e8400-e29b-41d4-a716-446655440000"],
    "occasionId": null,
    "collectionId": null
  }'
```

---

### Get Enhanced Product

Retrieve a product with all taxonomy details (alias for GET /api/products/:id).

**Endpoint:** `GET /api/products/:id/enhanced`

**Authentication:** Not required

**Response:** Same as GET /api/products/:id

---

## Taxonomy Endpoints

### Get Taxonomies by Type

Retrieve all taxonomies of a specific type.

**Endpoint:** `GET /api/taxonomies/:type`

**Authentication:** Not required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Taxonomy type: `product_type`, `format`, `occasion`, `collection` |

**Success Response (200):**

**Simple Taxonomy (product_type, format):**
```json
{
  "success": true,
  "taxonomies": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Digital Product",
      "createdAt": "2026-01-20T10:00:00.000Z"
    }
  ]
}
```

**Complex Taxonomy (occasion, collection):**
```json
{
  "success": true,
  "taxonomies": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "title": "New Year",
      "description": "Perfect for New Year planning",
      "imageUrl": "https://r2.example.com/occasion.jpg",
      "createdAt": "2026-01-20T10:00:00.000Z"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid taxonomy type"
}
```

**Example:**
```bash
curl http://localhost:3000/api/taxonomies/product_type
```

---

### Create Product Type

Create a new product type taxonomy.

**Endpoint:** `POST /api/taxonomies/product-types`

**Authentication:** Not required

**Request Body:**
```json
{
  "title": "Digital Product"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Product type title (unique) |

**Success Response (201):**
```json
{
  "success": true,
  "productType": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Digital Product",
    "createdAt": "2026-01-24T15:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Title is required"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": "Product type with this title already exists"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/taxonomies/product-types \
  -H "Content-Type: application/json" \
  -d '{"title":"Digital Product"}'
```

---

### Create Format

Create a new format taxonomy.

**Endpoint:** `POST /api/taxonomies/formats`

**Authentication:** Not required

**Request Body:**
```json
{
  "title": "PDF"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Format title (unique) |

**Success Response (201):**
```json
{
  "success": true,
  "format": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "title": "PDF",
    "createdAt": "2026-01-24T15:30:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/taxonomies/formats \
  -H "Content-Type: application/json" \
  -d '{"title":"PDF"}'
```

---

### Create Occasion

Create a new occasion taxonomy with image upload.

**Endpoint:** `POST /api/taxonomies/occasions`

**Authentication:** Not required

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Occasion title (unique) |
| description | string | Yes | Occasion description |
| image | File | Yes | Image file (JPEG, PNG, WebP, max 5MB) |

**Success Response (201):**
```json
{
  "success": true,
  "occasion": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "title": "New Year",
    "description": "Perfect for New Year planning",
    "imageUrl": "https://r2.example.com/occasions/uuid.jpg",
    "createdAt": "2026-01-24T15:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Title, description, and image are required"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid image format. Allowed: JPEG, PNG, WebP"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/taxonomies/occasions \
  -F "title=New Year" \
  -F "description=Perfect for New Year planning" \
  -F "image=@/path/to/image.jpg"
```

---

### Create Collection

Create a new collection taxonomy with image upload.

**Endpoint:** `POST /api/taxonomies/collections`

**Authentication:** Not required

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Collection title (unique) |
| description | string | Yes | Collection description |
| image | File | Yes | Image file (JPEG, PNG, WebP, max 5MB) |

**Success Response (201):**
```json
{
  "success": true,
  "collection": {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "title": "2024 Collection",
    "description": "Our 2024 product line",
    "imageUrl": "https://r2.example.com/collections/uuid.jpg",
    "createdAt": "2026-01-24T15:30:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/taxonomies/collections \
  -F "title=2024 Collection" \
  -F "description=Our 2024 product line" \
  -F "image=@/path/to/image.jpg"
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 500 | Internal Server Error |

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting for production use.

## CORS

CORS is configured to allow requests from the same origin. For cross-origin requests, update the Next.js configuration.

## Webhooks

Webhook support is not currently implemented but can be added for:
- Product updates from Lemon Squeezy
- Payment notifications
- Subscription changes

## Versioning

The API is currently unversioned. Future versions may use URL versioning (e.g., `/api/v2/products`).

## Support

For API support, contact: digiinstastore@gmail.com
