export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      candidate_responses: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_id: string
          message: string | null
          responded_at: string
          response_type: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
          message?: string | null
          responded_at?: string
          response_type?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
          message?: string | null
          responded_at?: string
          response_type?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_responses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_responses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "crawled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          company: string | null
          created_at: string
          current_position: string | null
          education: Json | null
          email: string
          experience_years: number | null
          id: string
          last_synced_at: string | null
          linkedin_id: string | null
          linkedin_profile_url: string | null
          location: string | null
          name: string
          phone: string | null
          profile_completeness_score: number | null
          profile_picture_url: string | null
          skills: Json | null
          source_platform: string | null
          updated_at: string
          workable_candidate_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          current_position?: string | null
          education?: Json | null
          email: string
          experience_years?: number | null
          id?: string
          last_synced_at?: string | null
          linkedin_id?: string | null
          linkedin_profile_url?: string | null
          location?: string | null
          name: string
          phone?: string | null
          profile_completeness_score?: number | null
          profile_picture_url?: string | null
          skills?: Json | null
          source_platform?: string | null
          updated_at?: string
          workable_candidate_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          current_position?: string | null
          education?: Json | null
          email?: string
          experience_years?: number | null
          id?: string
          last_synced_at?: string | null
          linkedin_id?: string | null
          linkedin_profile_url?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          profile_completeness_score?: number | null
          profile_picture_url?: string | null
          skills?: Json | null
          source_platform?: string | null
          updated_at?: string
          workable_candidate_id?: string | null
        }
        Relationships: []
      }
      crawled_jobs: {
        Row: {
          company: string
          crawled_at: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          job_type: string | null
          location: string | null
          posted_date: string | null
          salary: string | null
          source: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          company: string
          crawled_at?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          job_type?: string | null
          location?: string | null
          posted_date?: string | null
          salary?: string | null
          source?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          company?: string
          crawled_at?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          job_type?: string | null
          location?: string | null
          posted_date?: string | null
          salary?: string | null
          source?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          api_rate_limit_remaining: number | null
          api_rate_limit_reset_at: string | null
          created_at: string
          id: string
          integration_type: string
          is_enabled: boolean | null
          last_sync_at: string | null
          settings: Json | null
          sync_frequency_hours: number | null
          updated_at: string
        }
        Insert: {
          api_rate_limit_remaining?: number | null
          api_rate_limit_reset_at?: string | null
          created_at?: string
          id?: string
          integration_type: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          settings?: Json | null
          sync_frequency_hours?: number | null
          updated_at?: string
        }
        Update: {
          api_rate_limit_remaining?: number | null
          api_rate_limit_reset_at?: string | null
          created_at?: string
          id?: string
          integration_type?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          settings?: Json | null
          sync_frequency_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          candidate_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          integration_type: string
          status: string
          sync_type: string
          synced_data: Json | null
        }
        Insert: {
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          integration_type: string
          status?: string
          sync_type: string
          synced_data?: Json | null
        }
        Update: {
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          integration_type?: string
          status?: string
          sync_type?: string
          synced_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_ad_accounts: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          linkedin_account_id: string
          name: string
          status: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          linkedin_account_id: string
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          linkedin_account_id?: string
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_campaigns: {
        Row: {
          budget_amount: number | null
          budget_currency: string | null
          campaign_type: string | null
          clicks: number | null
          conversions: number | null
          created_at: string
          end_date: string | null
          id: string
          impressions: number | null
          last_synced_at: string | null
          linkedin_campaign_id: string
          name: string
          objective_type: string | null
          spend: number | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_amount?: number | null
          budget_currency?: string | null
          campaign_type?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          impressions?: number | null
          last_synced_at?: string | null
          linkedin_campaign_id: string
          name: string
          objective_type?: string | null
          spend?: number | null
          start_date?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_amount?: number | null
          budget_currency?: string | null
          campaign_type?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          impressions?: number | null
          last_synced_at?: string | null
          linkedin_campaign_id?: string
          name?: string
          objective_type?: string | null
          spend?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_leads: {
        Row: {
          campaign_id: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string | null
          form_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          lead_data: Json | null
          linkedin_campaign_id: string | null
          linkedin_lead_id: string
          phone: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          form_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          lead_data?: Json | null
          linkedin_campaign_id?: string | null
          linkedin_lead_id: string
          phone?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          form_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          lead_data?: Json | null
          linkedin_campaign_id?: string | null
          linkedin_lead_id?: string
          phone?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "linkedin_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workable_users: {
        Row: {
          assigned_jobs: string[] | null
          created_at: string | null
          id: string
          permissions: Json | null
          updated_at: string | null
          user_id: string
          workable_email: string
          workable_role: Database["public"]["Enums"]["workable_role"]
          workable_user_id: string
        }
        Insert: {
          assigned_jobs?: string[] | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          updated_at?: string | null
          user_id: string
          workable_email: string
          workable_role?: Database["public"]["Enums"]["workable_role"]
          workable_user_id: string
        }
        Update: {
          assigned_jobs?: string[] | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string
          workable_email?: string
          workable_role?: Database["public"]["Enums"]["workable_role"]
          workable_user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_job: {
        Args: { _user_id: string; _job_shortcode: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_assigned_jobs: {
        Args: { _user_id: string }
        Returns: string[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      has_workable_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["workable_role"]
        }
        Returns: boolean
      }
      make_first_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      trigger_workable_sync: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      workable_role:
        | "admin"
        | "hiring_manager"
        | "recruiter"
        | "interviewer"
        | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      workable_role: [
        "admin",
        "hiring_manager",
        "recruiter",
        "interviewer",
        "viewer",
      ],
    },
  },
} as const
