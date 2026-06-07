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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      intro_requests: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          message: string | null
          startup_id: string
          status: Database["public"]["Enums"]["intro_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          message?: string | null
          startup_id: string
          status?: Database["public"]["Enums"]["intro_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          message?: string | null
          startup_id?: string
          status?: Database["public"]["Enums"]["intro_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intro_requests_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_favorites: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          startup_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          startup_id: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          startup_id?: string
        }
        Relationships: []
      }
      investor_list_items: {
        Row: {
          added_at: string
          id: string
          list_id: string
          startup_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          list_id: string
          startup_id: string
        }
        Update: {
          added_at?: string
          id?: string
          list_id?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "investor_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_lists: {
        Row: {
          color: string
          created_at: string
          id: string
          investor_id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          investor_id: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          investor_id?: string
          name?: string
        }
        Relationships: []
      }
      investor_profiles: {
        Row: {
          created_at: string
          full_name: string
          fund_name: string
          id: string
          linkedin_url: string
          max_ticket: number
          min_ticket: number
          preferred_industries: string[]
          role_title: string
          target_stages: string[]
          thesis: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          fund_name: string
          id?: string
          linkedin_url: string
          max_ticket?: number
          min_ticket?: number
          preferred_industries?: string[]
          role_title: string
          target_stages?: string[]
          thesis: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          fund_name?: string
          id?: string
          linkedin_url?: string
          max_ticket?: number
          min_ticket?: number
          preferred_industries?: string[]
          role_title?: string
          target_stages?: string[]
          thesis?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      startup_existing_investors: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_lead: boolean
          name: string
          round: string | null
          startup_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          is_lead?: boolean
          name: string
          round?: string | null
          startup_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_lead?: boolean
          name?: string
          round?: string | null
          startup_id?: string
        }
        Relationships: []
      }
      startup_fund_allocations: {
        Row: {
          category: Database["public"]["Enums"]["allocation_category"]
          id: string
          percentage: number
          startup_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["allocation_category"]
          id?: string
          percentage?: number
          startup_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["allocation_category"]
          id?: string
          percentage?: number
          startup_id?: string
        }
        Relationships: []
      }
      startup_labels: {
        Row: {
          color: string
          created_at: string
          id: string
          investor_id: string
          label: string
          startup_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          investor_id: string
          label: string
          startup_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          investor_id?: string
          label?: string
          startup_id?: string
        }
        Relationships: []
      }
      startup_media: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          sort_order: number
          startup_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          sort_order?: number
          startup_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          sort_order?: number
          startup_id?: string
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      startup_profile_views: {
        Row: {
          id: string
          investor_id: string
          session_key: string
          startup_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          session_key: string
          startup_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          session_key?: string
          startup_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      startup_profiles: {
        Row: {
          annual_revenue: number
          business_model: string
          created_at: string
          demo_url: string
          founded_year: number
          founder_name: string
          growth_rate: number
          hq_location: string
          hq_region: string | null
          id: string
          industry: string
          intro_video_url: string | null
          linkedin_url: string
          logo_url: string | null
          monthly_burn: number
          mrr: number
          raise_amount: number
          revenue_verified: boolean
          runway_months: number
          stage: string
          startup_name: string
          tagline: string
          team_size: number
          total_users: number
          traction_description: string
          updated_at: string
          use_of_funds: string
          user_id: string
        }
        Insert: {
          annual_revenue?: number
          business_model: string
          created_at?: string
          demo_url: string
          founded_year: number
          founder_name: string
          growth_rate?: number
          hq_location: string
          hq_region?: string | null
          id?: string
          industry: string
          intro_video_url?: string | null
          linkedin_url: string
          logo_url?: string | null
          monthly_burn?: number
          mrr?: number
          raise_amount?: number
          revenue_verified?: boolean
          runway_months?: number
          stage: string
          startup_name: string
          tagline: string
          team_size?: number
          total_users?: number
          traction_description: string
          updated_at?: string
          use_of_funds: string
          user_id: string
        }
        Update: {
          annual_revenue?: number
          business_model?: string
          created_at?: string
          demo_url?: string
          founded_year?: number
          founder_name?: string
          growth_rate?: number
          hq_location?: string
          hq_region?: string | null
          id?: string
          industry?: string
          intro_video_url?: string | null
          linkedin_url?: string
          logo_url?: string | null
          monthly_burn?: number
          mrr?: number
          raise_amount?: number
          revenue_verified?: boolean
          runway_months?: number
          stage?: string
          startup_name?: string
          tagline?: string
          team_size?: number
          total_users?: number
          traction_description?: string
          updated_at?: string
          use_of_funds?: string
          user_id?: string
        }
        Relationships: []
      }
      startup_revenue_proofs: {
        Row: {
          created_at: string
          file_url: string
          id: string
          label: string | null
          startup_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          label?: string | null
          startup_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          label?: string | null
          startup_id?: string
        }
        Relationships: []
      }
      startup_team_members: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          linkedin_url: string | null
          name: string
          photo_url: string | null
          sort_order: number
          startup_id: string
          title: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          sort_order?: number
          startup_id: string
          title: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          sort_order?: number
          startup_id?: string
          title?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      allocation_category:
        | "Product Development"
        | "Hiring"
        | "Marketing"
        | "Operations"
        | "Other"
      intro_status: "pending" | "accepted" | "declined"
      media_kind: "image" | "pdf" | "video"
      user_role: "founder" | "investor"
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
  public: {
    Enums: {
      allocation_category: [
        "Product Development",
        "Hiring",
        "Marketing",
        "Operations",
        "Other",
      ],
      intro_status: ["pending", "accepted", "declined"],
      media_kind: ["image", "pdf", "video"],
      user_role: ["founder", "investor"],
    },
  },
} as const
