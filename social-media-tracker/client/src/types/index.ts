export type Platform = 'instagram' | 'tiktok' | 'facebook' | 'linkedin';
export type ContentType = 'still' | 'video' | 'graphic' | 'reel' | 'story' | 'carousel' | 'live';
export type ContentStatus = 'idea' | 'brief' | 'in_production' | 'ready' | 'scheduled' | 'posted' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Client {
  id: string;
  name: string;
  industry?: string;
  contact_name?: string;
  contact_email?: string;
  notes?: string;
  color: string;
  avatar?: string;
  active: number;
  created_at: string;
  accounts?: SocialAccount[];
}

export interface SocialAccount {
  id: string;
  client_id: string;
  platform: Platform;
  username: string;
  profile_url?: string;
  active: number;
  created_at: string;
}

export interface Metrics {
  id: string;
  account_id: string;
  recorded_date: string;
  followers: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  impressions: number;
  reach: number;
  engagement_rate: number;
  notes?: string;
  created_at: string;
  platform?: Platform;
  username?: string;
  client_id?: string;
  client_name?: string;
  client_color?: string;
}

export interface ContentPipeline {
  id: string;
  account_id: string;
  client_id: string;
  title: string;
  description?: string;
  content_type: ContentType;
  status: ContentStatus;
  platform: Platform;
  scheduled_date?: string;
  posted_date?: string;
  posted_views: number;
  posted_likes: number;
  posted_comments: number;
  posted_shares: number;
  posted_engagement_rate: number;
  caption?: string;
  hashtags?: string;
  notes?: string;
  priority: Priority;
  created_at: string;
  updated_at: string;
  username?: string;
  client_name?: string;
  client_color?: string;
}

export interface DashboardData {
  totalClients: number;
  totalAccounts: number;
  platformCounts: { platform: Platform; count: number }[];
  pipelineSummary: { status: ContentStatus; count: number }[];
  contentTypeSummary: { content_type: ContentType; count: number }[];
  recentMetrics: Metrics[];
  topByViews: (Metrics & { client_name: string; client_color: string; client_id: string; username: string })[];
  upcomingContent: ContentPipeline[];
}
