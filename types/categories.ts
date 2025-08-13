export interface Category {
    id: string
    title: string
    slug: string
    description?: string
    image_url?: string
    status: "active" | "inactive"
    created_at: string
    updated_at: string
  }
  
  export interface CreateCategoryData {
    title: string
    slug: string
    description?: string
    image_url?: string
    status?: "active" | "inactive"
  }
  
  export interface UpdateCategoryData extends Partial<CreateCategoryData> {
    id: string
  }
  