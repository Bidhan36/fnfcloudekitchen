import { useEffect, useState } from 'react';
import { Users, BarChart2, ListChecks, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../utils/api';
import type { DashboardData } from '../types';
import StatCard from '../components/StatCard';
import PlatformIcon from '../components/PlatformIcon';
import { formatNumber, STATUS_COLORS, STATUS_LABELS, CONTENT_TYPE_ICONS, PLATFORM_BG } from '../utils/helpers';
import type { Platform, ContentStatus, ContentType } from '../types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.get().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading dashboard…</div>
    </div>
  );

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-red-400 text-sm">Failed to load. Is the server running?</div>
    </div>
  );

  const totalViews = data.recentMetrics.reduce((s, m) => s + (m.views || 0), 0);
  const avgEngagement = data.recentMetrics.length
    ? data.recentMetrics.reduce((s, m) => s + (m.engagement_rate || 0), 0) / data.recentMetrics.length
    : 0;

  const pipelineMap = Object.fromEntries(data.pipelineSummary.map(p => [p.status, p.count]));

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of all clients and platforms</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Clients"
          value={data.totalClients}
          sub="tracked accounts"
          icon={<Users size={18} className="text-indigo-400" />}
        />
        <StatCard
          label="Social Accounts"
          value={data.totalAccounts}
          sub="across 4 platforms"
          icon={<BarChart2 size={18} className="text-purple-400" />}
          color="bg-purple-500/10"
        />
        <StatCard
          label="Total Views"
          value={formatNumber(totalViews)}
          sub="across all accounts"
          icon={<TrendingUp size={18} className="text-emerald-400" />}
          color="bg-emerald-500/10"
        />
        <StatCard
          label="Avg Engagement"
          value={`${avgEngagement.toFixed(2)}%`}
          sub="all platforms"
          icon={<ListChecks size={18} className="text-yellow-400" />}
          color="bg-yellow-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Platform breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Platform Breakdown</h2>
          <div className="space-y-3">
            {data.platformCounts.map(({ platform, count }) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={platform as Platform} size={16} />
                  <span className="text-sm text-gray-300 capitalize">{platform}</span>
                </div>
                <span className={`badge border ${PLATFORM_BG[platform as Platform]}`}>{count} accounts</span>
              </div>
            ))}
            {data.platformCounts.length === 0 && <p className="text-xs text-gray-600">No accounts yet</p>}
          </div>
        </div>

        {/* Pipeline status */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Content Pipeline</h2>
          <div className="space-y-2">
            {(['idea','brief','in_production','ready','scheduled','posted'] as ContentStatus[]).map(s => (
              <div key={s} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{STATUS_LABELS[s]}</span>
                <span className={`badge ${STATUS_COLORS[s]}`}>{pipelineMap[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content types */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Content Types</h2>
          <div className="space-y-2">
            {data.contentTypeSummary.map(({ content_type, count }) => (
              <div key={content_type} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {CONTENT_TYPE_ICONS[content_type as ContentType]} {content_type}
                </span>
                <span className="text-sm font-medium text-white">{count}</span>
              </div>
            ))}
            {data.contentTypeSummary.length === 0 && <p className="text-xs text-gray-600">No content yet</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top performers */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Top Performers by Views</h2>
          <div className="space-y-2">
            {data.topByViews.map((item, i) => (
              <div
                key={`${item.client_id}-${item.platform}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => navigate(`/clients/${item.client_id}`)}
              >
                <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: item.client_color }}
                >
                  {item.client_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{item.client_name}</p>
                  <div className="flex items-center gap-1">
                    <PlatformIcon platform={item.platform as Platform} size={11} />
                    <span className="text-xs text-gray-500">@{item.username}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white">{formatNumber(item.max_views || 0)}</p>
                  <p className="text-xs text-gray-500">{(item.engagement_rate || 0).toFixed(1)}% eng</p>
                </div>
              </div>
            ))}
            {data.topByViews.length === 0 && <p className="text-xs text-gray-600">No metrics recorded yet</p>}
          </div>
        </div>

        {/* Upcoming content */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Upcoming Content</h2>
          <div className="space-y-2">
            {data.upcomingContent.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => navigate('/pipeline')}>
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.client_color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{item.client_name}</span>
                    <PlatformIcon platform={item.platform as Platform} size={11} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {item.scheduled_date ? format(new Date(item.scheduled_date), 'MMM d') : '—'}
                  </p>
                  <span className="text-xs">
                    {CONTENT_TYPE_ICONS[item.content_type as ContentType]}
                  </span>
                </div>
              </div>
            ))}
            {data.upcomingContent.length === 0 && <p className="text-xs text-gray-600">No upcoming content scheduled</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
