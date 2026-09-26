// Generated via Supabase MCP generate_typescript_types against ytniches-dev
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string;
          admin_id: string;
          created_at: string;
          id: string;
          idempotency_key: string | null;
          metadata: Json;
          status: string;
          target_id: string | null;
          target_type: string | null;
        };
        Insert: {
          action: string;
          admin_id: string;
          created_at?: string;
          id?: string;
          idempotency_key?: string | null;
          metadata?: Json;
          status?: string;
          target_id?: string | null;
          target_type?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string;
          created_at?: string;
          id?: string;
          idempotency_key?: string | null;
          metadata?: Json;
          status?: string;
          target_id?: string | null;
          target_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_entries: {
        Row: {
          assignee_id: string | null;
          channel_id: string | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          linked_prompts: string[];
          scheduled_for: string | null;
          status: Database["public"]["Enums"]["calendar_status"];
          title: string;
          updated_at: string;
          user_id: string;
          workspace_id: string | null;
        };
        Insert: {
          assignee_id?: string | null;
          channel_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          linked_prompts?: string[];
          scheduled_for?: string | null;
          status?: Database["public"]["Enums"]["calendar_status"];
          title: string;
          updated_at?: string;
          user_id: string;
          workspace_id?: string | null;
        };
        Update: {
          assignee_id?: string | null;
          channel_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          linked_prompts?: string[];
          scheduled_for?: string | null;
          status?: Database["public"]["Enums"]["calendar_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_entries_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_entries_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_entries_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      channels: {
        Row: {
          avatar_url: string | null;
          avg_views_recent: number | null;
          banner_url: string | null;
          classification_confidence: number | null;
          classified_at: string | null;
          country: string | null;
          created_at: string;
          description: string | null;
          discovered_at: string | null;
          discovered_via_seed: string | null;
          enriched_at: string | null;
          first_upload_at: string | null;
          handle: string | null;
          has_shorts: boolean | null;
          id: string;
          is_faceless: boolean | null;
          is_monetized: boolean | null;
          language: string | null;
          last_synced_at: string;
          likely_monetized: boolean | null;
          made_for_kids: boolean | null;
          name: string;
          niche_id: string | null;
          outlier_score: number | null;
          refresh_tier: string;
          subscriber_count: number;
          total_view_count: number;
          unavailable_since: string | null;
          updated_at: string;
          uploads_playlist_id: string | null;
          video_count: number;
          youtube_channel_id: string;
          youtube_created_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          avg_views_recent?: number | null;
          banner_url?: string | null;
          classification_confidence?: number | null;
          classified_at?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          discovered_at?: string | null;
          discovered_via_seed?: string | null;
          enriched_at?: string | null;
          first_upload_at?: string | null;
          handle?: string | null;
          has_shorts?: boolean | null;
          id?: string;
          is_faceless?: boolean | null;
          is_monetized?: boolean | null;
          language?: string | null;
          last_synced_at?: string;
          likely_monetized?: boolean | null;
          made_for_kids?: boolean | null;
          name: string;
          niche_id?: string | null;
          outlier_score?: number | null;
          refresh_tier?: string;
          subscriber_count?: number;
          total_view_count?: number;
          unavailable_since?: string | null;
          updated_at?: string;
          uploads_playlist_id?: string | null;
          video_count?: number;
          youtube_channel_id: string;
          youtube_created_at: string;
        };
        Update: {
          avatar_url?: string | null;
          avg_views_recent?: number | null;
          banner_url?: string | null;
          classification_confidence?: number | null;
          classified_at?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          discovered_at?: string | null;
          discovered_via_seed?: string | null;
          enriched_at?: string | null;
          first_upload_at?: string | null;
          handle?: string | null;
          has_shorts?: boolean | null;
          id?: string;
          is_faceless?: boolean | null;
          is_monetized?: boolean | null;
          language?: string | null;
          last_synced_at?: string;
          likely_monetized?: boolean | null;
          made_for_kids?: boolean | null;
          name?: string;
          niche_id?: string | null;
          outlier_score?: number | null;
          refresh_tier?: string;
          subscriber_count?: number;
          total_view_count?: number;
          unavailable_since?: string | null;
          updated_at?: string;
          uploads_playlist_id?: string | null;
          video_count?: number;
          youtube_channel_id?: string;
          youtube_created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "channels_discovered_via_seed_fkey";
            columns: ["discovered_via_seed"];
            isOneToOne: false;
            referencedRelation: "discovery_seeds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "channels_niche_id_fkey";
            columns: ["niche_id"];
            isOneToOne: false;
            referencedRelation: "niches";
            referencedColumns: ["id"];
          },
        ];
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
      discovery_seeds: {
        Row: {
          created_at: string;
          id: string;
          keyword: string;
          last_run_at: string | null;
          priority: number;
          source: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          keyword: string;
          last_run_at?: string | null;
          priority?: number;
          source: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          keyword?: string;
          last_run_at?: string | null;
          priority?: number;
          source?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      niche_snapshots: {
        Row: {
          accessibility: number | null;
          channel_count: number;
          created_at: string;
          demand: number | null;
          median_views: number | null;
          momentum: number | null;
          new_channels_30d: number;
          niche_id: string;
          opportunity_score: number;
          outlier_density: number | null;
          snapshot_date: string;
          supply: number | null;
          trend: number | null;
          why_chips: string[];
        };
        Insert: {
          accessibility?: number | null;
          channel_count?: number;
          created_at?: string;
          demand?: number | null;
          median_views?: number | null;
          momentum?: number | null;
          new_channels_30d?: number;
          niche_id: string;
          opportunity_score: number;
          outlier_density?: number | null;
          snapshot_date: string;
          supply?: number | null;
          trend?: number | null;
          why_chips?: string[];
        };
        Update: {
          accessibility?: number | null;
          channel_count?: number;
          created_at?: string;
          demand?: number | null;
          median_views?: number | null;
          momentum?: number | null;
          new_channels_30d?: number;
          niche_id?: string;
          opportunity_score?: number;
          outlier_density?: number | null;
          snapshot_date?: string;
          supply?: number | null;
          trend?: number | null;
          why_chips?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "niche_snapshots_niche_id_fkey";
            columns: ["niche_id"];
            isOneToOne: false;
            referencedRelation: "niches";
            referencedColumns: ["id"];
          },
        ];
      };
      niches: {
        Row: {
          created_at: string;
          description: string | null;
          embedding: string | null;
          id: string;
          name: string;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          embedding?: string | null;
          id?: string;
          name: string;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          embedding?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          digest_day_of_week: number;
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
          digest_day_of_week?: number;
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
          digest_day_of_week?: number;
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
      outliers_feed: {
        Row: {
          channel_id: string;
          created_at: string;
          detected_at: string;
          niche_id: string | null;
          outlier_multiple: number;
          updated_at: string;
          video_id: string;
        };
        Insert: {
          channel_id: string;
          created_at?: string;
          detected_at?: string;
          niche_id?: string | null;
          outlier_multiple: number;
          updated_at?: string;
          video_id: string;
        };
        Update: {
          channel_id?: string;
          created_at?: string;
          detected_at?: string;
          niche_id?: string | null;
          outlier_multiple?: number;
          updated_at?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outliers_feed_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outliers_feed_niche_id_fkey";
            columns: ["niche_id"];
            isOneToOne: false;
            referencedRelation: "niches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outliers_feed_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: true;
            referencedRelation: "videos";
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
          last_active_at: string | null;
          name: string | null;
          onboarding_skipped_at: string | null;
          onboarding_step: number;
          primary_goal: string | null;
          role: string;
          suspended_at: string | null;
          suspended_reason: string | null;
          theme_preference: string;
          time_zone: string;
          time_zone_source: string;
          updated_at: string;
          youtube_channel_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id: string;
          last_active_at?: string | null;
          name?: string | null;
          onboarding_skipped_at?: string | null;
          onboarding_step?: number;
          primary_goal?: string | null;
          role?: string;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          theme_preference?: string;
          time_zone?: string;
          time_zone_source?: string;
          updated_at?: string;
          youtube_channel_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          last_active_at?: string | null;
          name?: string | null;
          onboarding_skipped_at?: string | null;
          onboarding_step?: number;
          primary_goal?: string | null;
          role?: string;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          theme_preference?: string;
          time_zone?: string;
          time_zone_source?: string;
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
          kind: string;
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
          kind?: string;
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
          kind?: string;
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
          {
            foreignKeyName: "prompts_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          amount_cents: number | null;
          billing_interval: string | null;
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
          amount_cents?: number | null;
          billing_interval?: string | null;
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
          amount_cents?: number | null;
          billing_interval?: string | null;
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
      tasks: {
        Row: {
          assignee_id: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          linked_id: string | null;
          linked_type: string | null;
          status: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          assignee_id?: string | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          linked_id?: string | null;
          linked_type?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          assignee_id?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          linked_id?: string | null;
          linked_type?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          title?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
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
          {
            foreignKeyName: "tracked_channels_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
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
          outlier_multiple: number | null;
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
          outlier_multiple?: number | null;
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
          outlier_multiple?: number | null;
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
      webhook_events: {
        Row: {
          created_at: string;
          error: string | null;
          event_type: string;
          id: string;
          processed_at: string | null;
          provider: string;
          provider_event_id: string;
          raw_payload: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          event_type: string;
          id?: string;
          processed_at?: string | null;
          provider: string;
          provider_event_id: string;
          raw_payload: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          event_type?: string;
          id?: string;
          processed_at?: string | null;
          provider?: string;
          provider_event_id?: string;
          raw_payload?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_invitations: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role: Database["public"]["Enums"]["workspace_role"];
          token: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          role: Database["public"]["Enums"]["workspace_role"];
          token: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: Database["public"]["Enums"]["workspace_role"];
          token?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_members: {
        Row: {
          created_at: string;
          id: string;
          invited_by: string | null;
          joined_at: string;
          role: Database["public"]["Enums"]["workspace_role"];
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          joined_at?: string;
          role?: Database["public"]["Enums"]["workspace_role"];
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          joined_at?: string;
          role?: Database["public"]["Enums"]["workspace_role"];
          updated_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      workspaces: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          name: string;
          owner_id: string;
          slug: string;
          subscription_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          slug: string;
          subscription_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          slug?: string;
          subscription_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspaces_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_list_users: {
        Args: {
          p_from: string | null;
          p_limit: number;
          p_offset: number;
          p_search: string | null;
          p_status: string | null;
          p_tier: string | null;
          p_to: string | null;
        };
        Returns: {
          created_at: string;
          email: string;
          id: string;
          last_active_at: string | null;
          name: string | null;
          role: string;
          subscription_status: string | null;
          suspended_at: string | null;
          tier: string | null;
          total_count: number;
        }[];
      };
      admin_revoke_sessions: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      check_request: { Args: never; Returns: undefined };
      credit_balance: { Args: { p_user_id: string }; Returns: number };
      find_due_channel_ids: {
        Args: never;
        Returns: {
          channel_id: string;
        }[];
      };
      find_due_enrichment_channel_ids: {
        Args: { p_cold_days: number; p_hot_days: number; p_limit: number; p_warm_days: number };
        Returns: {
          channel_id: string;
        }[];
      };
      find_due_digest_user_ids: {
        Args: never;
        Returns: {
          cadence: string;
          user_id: string;
        }[];
      };
      get_co_member_profiles: {
        Args: { target_user_ids: string[] };
        Returns: {
          avatar_url: string;
          id: string;
          name: string;
        }[];
      };
      is_workspace_admin: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      is_workspace_contributor: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      is_workspace_member: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      is_workspace_owner: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      purge_stale_youtube_data: {
        Args: { p_max_age_days: number };
        Returns: {
          channels_deleted: number;
          channels_emptied: number;
          events_deleted: number;
          notifications_deleted: number;
          videos_deleted: number;
          videos_emptied: number;
        }[];
      };
      touch_last_active: { Args: never; Returns: undefined };
      match_niche: {
        Args: { p_embedding: string; p_min_similarity: number };
        Returns: {
          niche_id: string;
          similarity: number;
        }[];
      };
      niche_signal_inputs: {
        Args: {
          p_min_avg_views: number;
          p_new_channel_months: number;
          p_outlier_multiple: number;
          p_small_channel_subs: number;
        };
        Returns: {
          channel_count: number;
          median_views_90d: number | null;
          new_channels_30d: number;
          new_performing_count: number;
          niche_id: string;
          outlier_video_count: number;
          performing_count: number;
          recent_video_count: number;
          small_performing_count: number;
          uploads_30d: number;
        }[];
      };
      purge_stale_youtube_data: {
        Args: { p_keep_videos: number; p_snapshot_days: number; p_stale_days: number };
        Returns: Json;
      };
      shares_workspace_with: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
      workspace_has_no_members: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      calendar_status: "idea" | "scripted" | "filmed" | "edited" | "published";
      credit_event_type: "allocation" | "consumption" | "grant" | "refund" | "expiration";
      subscription_status: "active" | "trialing" | "past_due" | "cancelled" | "paused";
      subscription_tier: "free" | "starter" | "pro" | "team";
      task_status: "open" | "in_progress" | "done";
      tracked_event_type:
        "new_video" | "view_spike" | "cadence_change" | "subscriber_milestone" | "outlier_detected";
      workspace_role: "admin" | "editor" | "viewer";
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
      calendar_status: ["idea", "scripted", "filmed", "edited", "published"],
      credit_event_type: ["allocation", "consumption", "grant", "refund", "expiration"],
      subscription_status: ["active", "trialing", "past_due", "cancelled", "paused"],
      subscription_tier: ["free", "starter", "pro", "team"],
      task_status: ["open", "in_progress", "done"],
      tracked_event_type: [
        "new_video",
        "view_spike",
        "cadence_change",
        "subscriber_milestone",
        "outlier_detected",
      ],
      workspace_role: ["admin", "editor", "viewer"],
    },
  },
} as const;
