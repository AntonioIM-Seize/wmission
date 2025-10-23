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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      devotion_views: {
        Row: {
          devotion_id: string
          first_viewed_at: string
          last_viewed_at: string
          viewer_id: string
        }
        Insert: {
          devotion_id: string
          first_viewed_at?: string
          last_viewed_at?: string
          viewer_id: string
        }
        Update: {
          devotion_id?: string
          first_viewed_at?: string
          last_viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotion_views_devotion_id_fkey"
            columns: ["devotion_id"]
            isOneToOne: false
            referencedRelation: "devotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotion_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devotions: {
        Row: {
          author_id: string
          body: string
          id: string
          image_url: string | null
          published_at: string
          scripture_ref: string
          scripture_text: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          body: string
          id?: string
          image_url?: string | null
          published_at?: string
          scripture_ref: string
          scripture_text?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          body?: string
          id?: string
          image_url?: string | null
          published_at?: string
          scripture_ref?: string
          scripture_text?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "devotions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_reactions: {
        Row: {
          created_at: string
          id: string
          member_id: string
          prayer_id: string
          reaction_type: Database["public"]["Enums"]["prayer_reaction"]
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          prayer_id: string
          reaction_type: Database["public"]["Enums"]["prayer_reaction"]
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          prayer_id?: string
          reaction_type?: Database["public"]["Enums"]["prayer_reaction"]
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_reactions_prayer_id_fkey"
            columns: ["prayer_id"]
            isOneToOne: false
            referencedRelation: "prayers"
            referencedColumns: ["id"]
          },
        ]
      }
      prayers: {
        Row: {
          answered_at: string | null
          author_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_answered: boolean
          updated_at: string
        }
        Insert: {
          answered_at?: string | null
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_answered?: boolean
          updated_at?: string
        }
        Update: {
          answered_at?: string | null
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_answered?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          created_at: string
          full_name: string
          id: string
          join_reason: string | null
          last_login_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          full_name?: string
          id: string
          join_reason?: string | null
          last_login_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          full_name?: string
          id?: string
          join_reason?: string | null
          last_login_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          main_prayer: string
          contact_email: string
          contact_phone: string
          contact_note: string
          updated_at: string
          verse_ref: string
          verse_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          main_prayer: string
          contact_email: string
          contact_phone: string
          contact_note: string
          updated_at?: string
          verse_ref: string
          verse_text: string
        }
        Update: {
          created_at?: string
          id?: string
          main_prayer?: string
          contact_email?: string
          contact_phone?: string
          contact_note?: string
          updated_at?: string
          verse_ref?: string
          verse_text?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_devotion_views: {
        Args: { devotion_id: string }
        Returns: undefined
      }
      is_admin: { Args: { check_id?: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
      is_profile_approved: { Args: { check_id?: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      inquiry_status: "pending" | "resolved"
      prayer_reaction: "amen" | "together"
      profile_status: "pending" | "approved" | "rejected" | "blocked"
      user_role: "member" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type UserRole = Database['public']['Enums']['user_role']
export type ProfileStatus = Database['public']['Enums']['profile_status']
export type PrayerReactionType = Database['public']['Enums']['prayer_reaction']
export type InquiryStatus = Database['public']['Enums']['inquiry_status']

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
      inquiry_status: ["pending", "resolved"],
      prayer_reaction: ["amen", "together"],
      profile_status: ["pending", "approved", "rejected", "blocked"],
      user_role: ["member", "admin"],
    },
  },
} as const
