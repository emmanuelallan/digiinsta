# Taxonomy Edit Functionality

## Overview
The taxonomy system now supports full CRUD operations (Create, Read, Update, Delete) for all taxonomy types:
- Product Types
- Formats
- Occasions
- Collections

## Features

### 1. Edit Mode in Dialog
The `TaxonomyDialog` component now supports both create and edit modes:
- **Create Mode**: Add new taxonomies with all required fields
- **Edit Mode**: Update existing taxonomies with pre-filled data
  - For complex taxonomies (occasions/collections), images are optional in edit mode
  - If no new image is uploaded, the existing image is retained

### 2. Edit Buttons in Selectors
The `TaxonomySelector` component now shows an edit button (pencil icon) when:
- A taxonomy is selected
- The selector is in single-select mode (not multiple)
- The `onEdit` callback is provided

### 3. API Endpoints

#### GET Endpoints (Fetch single taxonomy)
- `GET /api/taxonomies/product-types/[id]`
- `GET /api/taxonomies/formats/[id]`
- `GET /api/taxonomies/occasions/[id]`
- `GET /api/taxonomies/collections/[id]`

#### PUT Endpoints (Update taxonomy)
- `PUT /api/taxonomies/product-types/[id]` - JSON body: `{ title: string }`
- `PUT /api/taxonomies/formats/[id]` - JSON body: `{ title: string }`
- `PUT /api/taxonomies/occasions/[id]` - FormData: `title`, `description`, `image` (optional)
- `PUT /api/taxonomies/collections/[id]` - FormData: `title`, `description`, `image` (optional)

#### DELETE Endpoints (Delete taxonomy)
- `DELETE /api/taxonomies/product-types/[id]`
- `DELETE /api/taxonomies/formats/[id]`
- `DELETE /api/taxonomies/occasions/[id]`
- `DELETE /api/taxonomies/collections/[id]`

## Usage

### In Admin Product Page

1. **Select a taxonomy** from the dropdown
2. **Click the edit button** (pencil icon) next to the selector
3. **Update the fields** in the dialog
4. **Upload a new image** (optional for occasions/collections)
5. **Click "Update"** to save changes

### Component Props

#### TaxonomyDialog
```typescript
interface TaxonomyDialogProps {
  type: TaxonomyType
  mode?: 'create' | 'edit'  // Default: 'create'
  initialData?: {
    id: string
    title: string
    description?: string
    imageUrl?: string
  }
  isOpen: boolean
  onClose: () => void
  onSave: (data: SimpleTaxonomyInput | ComplexTaxonomyInput, id?: string) => Promise<void>
}
```

#### TaxonomySelector
```typescript
interface TaxonomySelectorProps {
  type: TaxonomyType
  label: string
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: TaxonomyOption[]
  multiple?: boolean
  onAddNew: () => void
  onEdit?: (id: string) => void  // New optional prop
  className?: string
}
```

## Service Layer

### TaxonomyService Methods

#### Update Simple Taxonomy
```typescript
async updateSimpleTaxonomy(
  type: 'product_type' | 'format',
  id: string,
  title: string
): Promise<SimpleTaxonomy>
```

#### Update Complex Taxonomy
```typescript
async updateComplexTaxonomy(
  type: 'occasion' | 'collection',
  id: string,
  data: ComplexTaxonomyInput & { keepExistingImage?: boolean }
): Promise<ComplexTaxonomy>
```

#### Delete Taxonomy
```typescript
async deleteTaxonomy(
  type: TaxonomyType,
  id: string
): Promise<void>
```

## Repository Layer

### TaxonomyRepository Methods

#### Update Simple Taxonomy
```typescript
async updateSimpleTaxonomy(
  type: 'product_type' | 'format',
  id: string,
  title: string
): Promise<SimpleTaxonomy>
```

#### Update Complex Taxonomy
```typescript
async updateComplexTaxonomy(
  type: 'occasion' | 'collection',
  id: string,
  data: { title: string; description: string; imageUrl?: string }
): Promise<ComplexTaxonomy>
```

#### Delete Taxonomy
```typescript
async deleteTaxonomy(
  type: TaxonomyType,
  id: string
): Promise<void>
```

## Notes

- Edit buttons only appear for single-select taxonomies (Product Type, Occasion, Collection)
- Multiple-select taxonomies (Formats) don't show edit buttons to avoid confusion
- When editing complex taxonomies without uploading a new image, the existing image is preserved
- All changes are immediately reflected in the UI and cached
- Toast notifications confirm successful operations
