export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bundle_products: {
        Row: {
          bundle_id: string
          product_id: string
        }
        Insert: {
          bundle_id: string
          product_id: string
        }
        Update: {
          bundle_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_products_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          created_at: string | null
          description: string | null
          hero_image_url: string | null
          id: string
          lemon_product_id: string
          lemon_variant_id: string
          price: number | null
          slug: string
          status: Database["public"]["Enums"]["bundle_status"]
          tagline: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          lemon_product_id: string
          lemon_variant_id: string
          price?: number | null
          slug: string
          status?: Database["public"]["Enums"]["bundle_status"]
          tagline?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          lemon_product_id?: string
          lemon_variant_id?: string
          price?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["bundle_status"]
          tagline?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          slug: string
          status: Database["public"]["Enums"]["category_status"]
          tagline: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          slug: string
          status?: Database["public"]["Enums"]["category_status"]
          tagline?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["category_status"]
          tagline?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          active: boolean | null
          cta_text: string | null
          cta_url: string | null
          end_date: string | null
          id: string
          image_url: string
          start_date: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          cta_text?: string | null
          cta_url?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          start_date?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          cta_text?: string | null
          cta_url?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          start_date?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_id: number | null
          discount_total: number | null
          id: number
          identifier: string | null
          order_number: number | null
          product_id: number | null
          product_name: string | null
          receipt_url: string | null
          refunded: boolean | null
          status: string | null
          store_id: number | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string | null
          user_email: string | null
          user_name: string | null
          variant_id: number | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_id?: number | null
          discount_total?: number | null
          id: number
          identifier?: string | null
          order_number?: number | null
          product_id?: number | null
          product_name?: string | null
          receipt_url?: string | null
          refunded?: boolean | null
          status?: string | null
          store_id?: number | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          variant_id?: number | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_id?: number | null
          discount_total?: number | null
          id?: number
          identifier?: string | null
          order_number?: number | null
          product_id?: number | null
          product_name?: string | null
          receipt_url?: string | null
          refunded?: boolean | null
          status?: string | null
          store_id?: number | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          variant_id?: number | null
          variant_name?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          caption: string | null
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          details: Json | null
          id: string
          is_physical: boolean | null
          lemon_product_id: string
          lemon_variant_id: string
          price: number | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          subcategory_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          details?: Json | null
          id?: string
          is_physical?: boolean | null
          lemon_product_id: string
          lemon_variant_id: string
          price?: number | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          details?: Json | null
          id?: string
          is_physical?: boolean | null
          lemon_product_id?: string
          lemon_variant_id?: string
          price?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          slug: string
          tagline: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          slug: string
          tagline?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          tagline?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bundle_status: "active" | "draft" | "archived"
      category_status: "active" | "archived"
      product_status: "active" | "draft" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bundle_status: ["active", "draft", "archived"],
      category_status: ["active", "archived"],
      product_status: ["active", "draft", "archived"],
    },
  },
} as const
