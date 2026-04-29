import type { Platform, ContentType, ContentStatus, Priority } from '../types';

export const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: '#E1306C',
  tiktok: '#69C9D0',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
};

export const PLATFORM_BG: Record<Platform, string> = {
  instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  tiktok: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  linkedin: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

export const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: 'bg-gray-500/20 text-gray-400',
  brief: 'bg-yellow-500/20 text-yellow-400',
  in_production: 'bg-orange-500/20 text-orange-400',
  ready: 'bg-green-500/20 text-green-400',
  scheduled: 'bg-indigo-500/20 text-indigo-400',
  posted: 'bg-emerald-500/20 text-emerald-400',
  archived: 'bg-gray-600/20 text-gray-500',
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  brief: 'Brief',
  in_production: 'In Production',
  ready: 'Ready',
  scheduled: 'Scheduled',
  posted: 'Posted',
  archived: 'Archived',
};

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  still: '🖼️',
  video: '🎬',
  graphic: '🎨',
  reel: '🎞️',
  story: '⭕',
  carousel: '📸',
  live: '🔴',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatEngagement(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

export const CLIENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#a855f7', '#84cc16',
];

export const PLATFORMS: Platform[] = ['instagram', 'tiktok', 'facebook', 'linkedin'];
export const CONTENT_TYPES: ContentType[] = ['still', 'video', 'graphic', 'reel', 'story', 'carousel', 'live'];
export const CONTENT_STATUSES: ContentStatus[] = ['idea', 'brief', 'in_production', 'ready', 'scheduled', 'posted', 'archived'];
