export const TOOL_STAGES = [
  { value: 'niche-research',        label: 'Niche & Idea Research',      icon: 'search' },
  { value: 'script-writing',        label: 'Script & Content Writing',   icon: 'file-text' },
  { value: 'ai-voiceover',          label: 'AI Voiceover & TTS',         icon: 'microphone' },
  { value: 'video-editing',         label: 'Video Editing & Production', icon: 'video' },
  { value: 'thumbnail-design',      label: 'Thumbnail Design',           icon: 'photo' },
  { value: 'seo-upload',            label: 'SEO & Upload',               icon: 'chart-bar' },
  { value: 'scheduling-automation', label: 'Scheduling & Automation',    icon: 'calendar' },
  { value: 'monetization',          label: 'Monetization Tools',         icon: 'currency-dollar' },
  { value: 'analytics',             label: 'Analytics & Tracking',       icon: 'trending-up' },
] as const

export const PRICING_TYPES = [
  { value: 'free',     label: 'Free',     color: 'green' },
  { value: 'freemium', label: 'Freemium', color: 'amber' },
  { value: 'paid',     label: 'Paid',     color: 'purple' },
] as const
