// ─── Plans ────────────────────────────────────────────────────────────────────
export type Plan = 'free' | 'pro' | 'lifetime'

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  display_name: string | null
  plan: Plan
  is_admin: boolean
  is_founding_member: boolean
  saved_niches: string[]
  lemonsqueezy_customer_id: string | null
  lemonsqueezy_subscription_id: string | null
  plan_expires_at: string | null
  created_at: string
  updated_at: string
}

// ─── Niche ────────────────────────────────────────────────────────────────────
export type CompetitionLevel = 'Low' | 'Medium' | 'High'
export type GrowthTrend = 'rising' | 'stable' | 'declining'

export type CategoryName =
  | 'Autos & Vehicles'
  | 'Comedy'
  | 'Education'
  | 'Entertainment'
  | 'Film & Animation'
  | 'Gaming'
  | 'How-to & Style'
  | 'Music'
  | 'News & Politics'
  | 'Nonprofits & Activism'
  | 'People & Blogs'
  | 'Pets & Animals'
  | 'Science & Technology'
  | 'Sports'
  | 'Travel & Events'
  | 'Health & Fitness'
  | 'Beauty & Fashion'
  | 'Food & Cooking'
  | 'Finance & Business'
  | 'Spirituality & Religion'
  | 'Kids & Family'
  | 'Documentaries'
  | 'Motivation & Self-help'
  | 'Language Learning'
  | 'Architecture & Design'
  | 'Paranormal & Mystery'

export interface ScriptHook {
  label: string
  text: string
}

export interface Niche {
  id: string
  name: string
  slug: string
  category: string
  channel_name: string | null
  channel_url: string | null
  estimated_earning: string | null
  cpm_min: number
  cpm_max: number
  competition_level: CompetitionLevel
  growth_trend: GrowthTrend
  avg_views: string | null
  best_upload_day: string | null
  ideal_video_length: string | null
  top_audience: string | null
  age_group: string | null
  audience_size: string | null
  video_ideas: string[]
  script_hooks: ScriptHook[]
  title_templates: string[]
  thumbnail_prompts: string[]
  content_calendar: ContentCalendar
  is_premium: boolean
  published: boolean
  // Channel-level fields
  subscribers: string | null
  views_day: string | null
  total_videos: string | null
  total_views: string | null
  channel_age: string | null
  is_hot: boolean
  thumbnail_url_1: string | null
  thumbnail_url_2: string | null
  thumbnail_url_3: string | null
  category_slug: string | null
  content_type: string | null
  created_at: string
  updated_at: string
}

// ─── Content Calendar ─────────────────────────────────────────────────────────
export interface ContentCalendar {
  weeks: Week[]
}

export interface Week {
  week_number: number
  label: string
  days: CalendarDay[]
}

export interface CalendarDay {
  day: number
  title: string
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author: string
  author_id: string | null
  author_name: string
  author_avatar: string
  category: string
  read_time: number
  is_featured: boolean
  views: number
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}

// ─── LemonSqueezy ─────────────────────────────────────────────────────────────
export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: LemonSqueezyEvent
    custom_data?: Record<string, string>
  }
  data: {
    id: string
    type: string
    attributes: LemonSqueezyOrderAttributes | LemonSqueezySubscriptionAttributes
  }
}

export type LemonSqueezyEvent =
  | 'order_created'
  | 'order_refunded'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_paused'
  | 'subscription_unpaused'

export interface LemonSqueezyOrderAttributes {
  store_id: number
  customer_id: number
  identifier: string
  order_number: number
  user_name: string
  user_email: string
  status: string
  status_formatted: string
  total: number
  total_formatted: string
  first_order_item: {
    product_name: string
    variant_name: string
  }
}

export interface LemonSqueezySubscriptionAttributes {
  store_id: number
  customer_id: number
  user_name: string
  user_email: string
  status: string
  status_formatted: string
  product_name: string
  variant_name: string
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface NicheFilters {
  category: string
  competition: CompetitionLevel | 'All'
  search: string
  cpmRange: string
  content_type: string
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
export interface PricingPlan {
  id: string
  name: string
  price: number
  period: 'month' | 'year' | 'once'
  description: string
  features: string[]
  cta: string
  highlighted: boolean
  lemon_variant_id: string
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  external?: boolean
}

// ─── HandPick Niches ──────────────────────────────────────────────────────────
export interface HandpickNiche {
  id: string
  channel_name: string
  image_url: string
  channel_url: string
  category: string
  monthly_earning_range: string
  niche_tags: string[]
  subscribers: string
  channel_age: string
  is_hot: boolean
  is_pro_only: boolean
  published: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface HandpickNicheForm {
  channel_name: string
  image_url: string
  channel_url: string
  category: string
  monthly_earning_range: string
  niche_tags: string[]
  subscribers: string
  channel_age: string
  is_hot: boolean
  is_pro_only: boolean
  published: boolean
}

// ─── Dynamic Prompt Fields ────────────────────────────────────────────────────
export interface PromptField {
  id: string
  name: string
  slug: string
  placeholder: string
  show_to_users: boolean
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PromptFieldValue {
  id: string
  niche_prompt_id: string
  field_id: string
  value: string
  field?: PromptField
}

export interface NichePromptRecord {
  id: string
  channel_name: string
  channel_url: string
  published: boolean
  created_at: string
  updated_at: string
  field_values?: PromptFieldValue[]
}

// ─── Prompt Editor ────────────────────────────────────────────────────────────
export interface PromptSubtab {
  id: string
  step_id: string
  label: string
  title: string
  subtitle: string
  content: string
  position: number
  created_at: string
  updated_at: string
}

export interface PromptStep {
  id: string
  label: string
  icon: string
  position: number
  subtabs: PromptSubtab[]
  created_at: string
  updated_at: string
}

// ─── CTA Settings ─────────────────────────────────────────────────────────────
export interface CTASetting {
  id: string
  page: string
  is_active: boolean
  heading: string
  subheading: string
  button_text: string
  button_url: string
  button_secondary_text: string
  button_secondary_url: string
  background_color: string
  created_at: string
  updated_at: string
}

// ─── Saved HandPick Niches ────────────────────────────────────────────────────
export interface SavedHandpickNiche {
  id: string
  user_id: string
  handpick_id: string
  created_at: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number
  pro_users: number
  lifetime_users: number
  total_niches: number
  total_blog_posts: number
}


// ─── YouTube ──────────────────────────────────────────────────────────────────
export interface YouTubeVideoData {
  video_id: string
  title: string
  channel_title: string
  channel_id: string
  thumbnail_url: string
  view_count: string
  like_count: string
  duration: string
  subscriber_count: string
  published_at: string
}

// ─── Niche Requests ───────────────────────────────────────────────────────────
export type RequestStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'completed'
  | 'rejected'

export interface NicheRequest {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  reason: string | null
  status: RequestStatus
  votes_count: number
  admin_note: string | null
  linked_niche_id: string | null
  created_at: string
  updated_at: string
  has_voted?: boolean
  user_email?: string
}

export interface NicheRequestVote {
  id: string
  request_id: string
  user_id: string
  created_at: string
}

export type RequestSortBy = 'votes' | 'newest' | 'oldest'
export type RequestFilter = 'all' | RequestStatus
