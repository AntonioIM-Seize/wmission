export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'member' | 'admin';
export type ProfileStatus = 'pending' | 'approved' | 'rejected' | 'blocked';
export type PrayerReactionType = 'amen' | 'together';
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          status: ProfileStatus;
          full_name: string;
          phone: string | null;
          join_reason: string | null;
          approved_at: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          status?: ProfileStatus;
          full_name?: string;
          phone?: string | null;
          join_reason?: string | null;
          approved_at?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          status?: ProfileStatus;
          full_name?: string;
          phone?: string | null;
          join_reason?: string | null;
          approved_at?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      devotions: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          scripture_ref: string;
      scripture_text: string | null;
      body: string;
      views: number;
      published_at: string;
      updated_at: string;
      image_url: string | null;
    };
    Insert: {
      id?: string;
      author_id: string;
      title: string;
      scripture_ref: string;
      scripture_text?: string | null;
      body: string;
      views?: number;
      published_at?: string;
      updated_at?: string;
      image_url?: string | null;
    };
    Update: {
      id?: string;
      author_id?: string;
      title?: string;
      scripture_ref?: string;
      scripture_text?: string | null;
      body?: string;
      views?: number;
      published_at?: string;
      updated_at?: string;
      image_url?: string | null;
    };
        Relationships: [
          {
            foreignKeyName: 'devotions_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      prayers: {
        Row: {
          id: string;
          author_id: string;
      content: string;
      is_answered: boolean;
      answered_at: string | null;
      created_at: string;
      updated_at: string;
      image_url: string | null;
    };
    Insert: {
      id?: string;
      author_id: string;
      content: string;
      is_answered?: boolean;
      answered_at?: string | null;
      created_at?: string;
      updated_at?: string;
      image_url?: string | null;
    };
    Update: {
      id?: string;
      author_id?: string;
      content?: string;
      is_answered?: boolean;
      answered_at?: string | null;
      created_at?: string;
      updated_at?: string;
      image_url?: string | null;
    };
        Relationships: [
          {
            foreignKeyName: 'prayers_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      prayer_reactions: {
        Row: {
          id: string;
          prayer_id: string;
          member_id: string;
          reaction_type: PrayerReactionType;
          created_at: string;
        };
        Insert: {
          id?: string;
          prayer_id: string;
          member_id: string;
          reaction_type: PrayerReactionType;
          created_at?: string;
        };
        Update: {
          id?: string;
          prayer_id?: string;
          member_id?: string;
          reaction_type?: PrayerReactionType;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'prayer_reactions_member_id_fkey';
            columns: ['member_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prayer_reactions_prayer_id_fkey';
            columns: ['prayer_id'];
            referencedRelation: 'prayers';
            referencedColumns: ['id'];
          },
        ];
      };
      supporters: {
        Row: {
          id: string;
          name: string;
          amount: number;
          supported_on: string;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          amount: number;
          supported_on: string;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          amount?: number;
          supported_on?: string;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          verse_ref: string;
          verse_text: string;
          main_prayer: string;
          bank_name: string;
          bank_account: string;
          bank_holder: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          verse_ref: string;
          verse_text: string;
          main_prayer: string;
          bank_name: string;
          bank_account: string;
          bank_holder: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          verse_ref?: string;
          verse_text?: string;
          main_prayer?: string;
          bank_name?: string;
          bank_account?: string;
          bank_holder?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      devotion_views: {
        Row: {
          devotion_id: string;
          viewer_id: string;
          first_viewed_at: string;
          last_viewed_at: string;
        };
        Insert: {
          devotion_id: string;
          viewer_id: string;
          first_viewed_at?: string;
          last_viewed_at?: string;
        };
        Update: {
          devotion_id?: string;
          viewer_id?: string;
          first_viewed_at?: string;
          last_viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'devotion_views_devotion_id_fkey';
            columns: ['devotion_id'];
            referencedRelation: 'devotions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'devotion_views_viewer_id_fkey';
            columns: ['viewer_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_devotion_views: {
        Args: { devotion_id: string };
        Returns: void;
      };
      is_admin: {
        Args: { check_id?: string | null };
        Returns: boolean;
      };
      is_authenticated: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_profile_approved: {
        Args: { check_id?: string | null };
        Returns: boolean;
      };
      touch_updated_at: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      profile_status: ProfileStatus;
      prayer_reaction: PrayerReactionType;
    };
  };
}
