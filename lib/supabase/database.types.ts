// Generated via Supabase MCP generate_typescript_types against ytniches-dev
// (ossrqwoorqxbgyzzoosz). Regenerate after every migration (CLAUDE.md §4.1
// "Add a new DB table" step 5). Do not hand-edit.
//
// `pnpm supabase:types` needs `supabase login` / SUPABASE_ACCESS_TOKEN,
// neither available in this environment — it fails with
// LegacyPlatformAuthRequiredError and, because of the `>` redirect,
// overwrites this file with that error message. Until a token is
// configured, regenerate via the Supabase MCP's generate_typescript_types
// tool and apply the diff by hand instead of running that script.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      channels: {
        Row: {
          avatar_url: string | null;
          banner_url: string | null;
          country: string | null;
          created_at: string;
          description: string | null;
          handle: string | null;
          id: string;
          is_monetized: boolean | null;
          language: string | null;
          last_synced_at: string;
          name: string;
          subscriber_count: number;
          total_view_count: number;
          unavailable_since: string | null;
          updated_at: string;
          video_count: number;
          youtube_channel_id: string;
          youtube_created_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          banner_url?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          handle?: string | null;
          id?: string;
          is_monetized?: boolean | null;
          language?: string | null;
          last_synced_at?: string;
          name: string;
          subscriber_count?: number;
          total_view_count?: number;
          unavailable_since?: string | null;
          updated_at?: string;
          video_count?: number;
          youtube_channel_id: string;
          youtube_created_at: string;
        };
        Update: {
          avatar_url?: string | null;
          banner_url?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          handle?: string | null;
          id?: string;
          is_monetized?: boolean | null;
          language?: string | null;
          last_synced_at?: string;
          name?: string;
          subscriber_count?: number;
          total_view_count?: number;
          unavailable_since?: string | null;
          updated_at?: string;
          video_count?: number;
          youtube_channel_id?: string;
          youtube_created_at?: string;
        };
        Relationships: [];
      };
      credit_allocations: {
        Row: {
          created_at: string;
          credits_per_cycle: number;
          effective_from: string;
          effective_until: string | null;
          id: string;
          rollover_max: number;
          tier: Database["public"]["Enums"]["subscription_tier"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          credits_per_cycle: number;
          effective_from?: string;
          effective_until?: string | null;
          id?: string;
          rollover_max?: number;
          tier: Database["public"]["Enums"]["subscription_tier"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          credits_per_cycle?: number;
          effective_from?: string;
          effective_until?: string | null;
          id?: string;
          rollover_max?: number;
          tier?: Database["public"]["Enums"]["subscription_tier"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "credit_allocations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      credit_events: {
        Row: {
          amount: number;
          created_at: string;
          event_type: Database["public"]["Enums"]["credit_event_type"];
          id: string;
          idempotency_key: string | null;
          metadata: Json;
          reason: string;
          related_resource: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          event_type: Database["public"]["Enums"]["credit_event_type"];
          id?: string;
          idempotency_key?: string | null;
          metadata?: Json;
          reason: string;
          related_resource?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          event_type?: Database["public"]["Enums"]["credit_event_type"];
          id?: string;
          idempotency_key?: string | null;
          metadata?: Json;
          reason?: string;
          related_resource?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credit_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_channel_overrides: {
        Row: {
          channel_id: string;
          created_at: string;
          id: string;
          notifications_enabled: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          channel_id: string;
          created_at?: string;
          id?: string;
          notifications_enabled?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          channel_id?: string;
          created_at?: string;
          id?: string;
          notifications_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_channel_overrides_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_channel_overrides_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_preferences: {
        Row: {
          created_at: string;
          digest_cadence: string;
          email_enabled: boolean;
          id: string;
          in_app_enabled: boolean;
          notification_type: string;
          quiet_hours_end: string | null;
          quiet_hours_start: string | null;
          slack_enabled: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          digest_cadence?: string;
          email_enabled?: boolean;
          id?: string;
          in_app_enabled?: boolean;
          notification_type: string;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          slack_enabled?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          digest_cadence?: string;
          email_enabled?: boolean;
          id?: string;
          in_app_enabled?: boolean;
          notification_type?: string;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          slack_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          delivered_channels: string[];
          dismissed_at: string | null;
          id: string;
          notification_type: string;
          read_at: string | null;
          related_resource: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          delivered_channels?: string[];
          dismissed_at?: string | null;
          id?: string;
          notification_type: string;
          read_at?: string | null;
          related_resource?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          delivered_channels?: string[];
          dismissed_at?: string | null;
          id?: string;
          notification_type?: string;
          read_at?: string | null;
          related_resource?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          name: string | null;
          onboarding_skipped_at: string | null;
          onboarding_step: number;
          primary_goal: string | null;
          role: string;
          theme_preference: string;
          time_zone: string;
          updated_at: string;
          youtube_channel_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id: string;
          name?: string | null;
          onboarding_skipped_at?: string | null;
          onboarding_step?: number;
          primary_goal?: string | null;
          role?: string;
          theme_preference?: string;
          time_zone?: string;
          updated_at?: string;
          youtube_channel_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name?: string | null;
          onboarding_skipped_at?: string | null;
          onboarding_step?: number;
          primary_goal?: string | null;
          role?: string;
          theme_preference?: string;
          time_zone?: string;
          updated_at?: string;
          youtube_channel_id?: string | null;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          feedback_tags: string[];
          id: string;
          output: Json;
          regeneration_of: string | null;
          source_video_id: string;
          target_audience: string | null;
          tone: string;
          updated_at: string;
          user_id: string;
          workspace_id: string | null;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          feedback_tags?: string[];
          id?: string;
          output: Json;
          regeneration_of?: string | null;
          source_video_id: string;
          target_audience?: string | null;
          tone?: string;
          updated_at?: string;
          user_id: string;
          workspace_id?: string | null;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          feedback_tags?: string[];
          id?: string;
          output?: Json;
          regeneration_of?: string | null;
          source_video_id?: string;
          target_audience?: string | null;
          tone?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_regeneration_of_fkey";
            columns: ["regeneration_of"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompts_source_video_id_fkey";
            columns: ["source_video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          id: string;
          is_current: boolean;
          provider: string;
          provider_subscription_id: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          tier: Database["public"]["Enums"]["subscription_tier"];
          trial_ends_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          current_period_end: string;
          current_period_start: string;
          id?: string;
          is_current?: boolean;
          provider: string;
          provider_subscription_id?: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          tier: Database["public"]["Enums"]["subscription_tier"];
          trial_ends_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          id?: string;
          is_current?: boolean;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          tier?: Database["public"]["Enums"]["subscription_tier"];
          trial_ends_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tracked_channels: {
        Row: {
          channel_id: string;
          created_at: string;
          custom_label: string | null;
          id: string;
          notifications_enabled: boolean;
          refresh_cadence_hours: number;
          tracked_since: string;
          updated_at: string;
          user_id: string;
          workspace_id: string | null;
        };
        Insert: {
          channel_id: string;
          created_at?: string;
          custom_label?: string | null;
          id?: string;
          notifications_enabled?: boolean;
          refresh_cadence_hours?: number;
          tracked_since?: string;
          updated_at?: string;
          user_id: string;
          workspace_id?: string | null;
        };
        Update: {
          channel_id?: string;
          created_at?: string;
          custom_label?: string | null;
          id?: string;
          notifications_enabled?: boolean;
          refresh_cadence_hours?: number;
          tracked_since?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tracked_channels_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracked_channels_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tracked_events: {
        Row: {
          channel_id: string;
          created_at: string;
          detected_at: string;
          event_type: Database["public"]["Enums"]["tracked_event_type"];
          id: string;
          payload: Json;
          updated_at: string;
        };
        Insert: {
          channel_id: string;
          created_at?: string;
          detected_at?: string;
          event_type: Database["public"]["Enums"]["tracked_event_type"];
          id?: string;
          payload?: Json;
          updated_at?: string;
        };
        Update: {
          channel_id?: string;
          created_at?: string;
          detected_at?: string;
          event_type?: Database["public"]["Enums"]["tracked_event_type"];
          id?: string;
          payload?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracked_events_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
        ];
      };
      video_transcripts_cache: {
        Row: {
          created_at: string;
          fetched_at: string;
          id: string;
          language: string;
          source: string;
          transcript_text: string;
          updated_at: string;
          video_id: string;
        };
        Insert: {
          created_at?: string;
          fetched_at?: string;
          id?: string;
          language: string;
          source: string;
          transcript_text: string;
          updated_at?: string;
          video_id: string;
        };
        Update: {
          created_at?: string;
          fetched_at?: string;
          id?: string;
          language?: string;
          source?: string;
          transcript_text?: string;
          updated_at?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "video_transcripts_cache_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: true;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      videos: {
        Row: {
          channel_id: string;
          comment_count: number | null;
          created_at: string;
          description: string | null;
          duration_seconds: number;
          has_transcript: boolean;
          id: string;
          language: string | null;
          last_synced_at: string;
          like_count: number | null;
          published_at: string;
          tags: string[];
          thumbnail_url: string;
          title: string;
          unavailable_since: string | null;
          updated_at: string;
          view_count: number;
          youtube_video_id: string;
        };
        Insert: {
          channel_id: string;
          comment_count?: number | null;
          created_at?: string;
          description?: string | null;
          duration_seconds: number;
          has_transcript?: boolean;
          id?: string;
          language?: string | null;
          last_synced_at?: string;
          like_count?: number | null;
          published_at: string;
          tags?: string[];
          thumbnail_url: string;
          title: string;
          unavailable_since?: string | null;
          updated_at?: string;
          view_count?: number;
          youtube_video_id: string;
        };
        Update: {
          channel_id?: string;
          comment_count?: number | null;
          created_at?: string;
          description?: string | null;
          duration_seconds?: number;
          has_transcript?: boolean;
          id?: string;
          language?: string | null;
          last_synced_at?: string;
          like_count?: number | null;
          published_at?: string;
          tags?: string[];
          thumbnail_url?: string;
          title?: string;
          unavailable_since?: string | null;
          updated_at?: string;
          view_count?: number;
          youtube_video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "videos_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_due_channel_ids: {
        Args: never;
        Returns: {
          channel_id: string;
        }[];
      };
    };
    Enums: {
      credit_event_type: "allocation" | "consumption" | "grant" | "refund" | "expiration";
      subscription_status: "active" | "trialing" | "past_due" | "cancelled" | "paused";
      subscription_tier: "free" | "starter" | "pro" | "team";
      tracked_event_type:
        "new_video" | "view_spike" | "cadence_change" | "subscriber_milestone" | "outlier_detected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      credit_event_type: ["allocation", "consumption", "grant", "refund", "expiration"],
      subscription_status: ["active", "trialing", "past_due", "cancelled", "paused"],
      subscription_tier: ["free", "starter", "pro", "team"],
      tracked_event_type: [
        "new_video",
        "view_spike",
        "cadence_change",
        "subscriber_milestone",
        "outlier_detected",
      ],
    },
  },
} as const;
