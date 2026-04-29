import { useEffect, useState } from 'react';
import { clientsApi, metricsApi } from '../utils/api';
import type { Client, Metrics, Platform } from '../types';
import { PLATFORM_COLORS, PLATFORMS, formatNumber } from '../utils/helpers';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import PlatformIcon from '../components/PlatformIcon';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#06b6d4', '#3b82f6'];

export default function Analytics() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | ''>('');
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { clientsApi.list().then(setClients); }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedClient) params.client_id = selectedClient;
    if (selectedPlatform) params.platform = selectedPlatform;
    metricsApi.list(params).then(m => { setMetrics(m); setLoading(false); });
  }, [selectedClient, selectedPlatform]);

  const sortedMetrics = [...metrics].sort((a, b) => a.recorded_date.localeCompare(b.recorded_date));

  const viewsTrend = sortedMetrics.map(m => ({
    date: format(parseISO(m.recorded_date), 'MMM d'),
    views: m.views,
    platform: m.platform,
    followers: m.followers,
    engagement: m.engagement_rate,
  }));

  const platformTotals = PLATFORMS.map(p => {
    const pMetrics = metrics.filter(m => m.platform === p);
    return {
      platform: p,
      views: pMetrics.reduce((s, m) => s + m.views, 0),
      followers: pMetrics.length ? Math.max(...pMetrics.map(m => m.followers)) : 0,
      avg_engagement: pMetrics.length ? pMetrics.reduce((s, m) => s + m.engagement_rate, 0) / pMetrics.length : 0,
    };
  }).filter(p => p.views > 0 || p.followers > 0);

  const clientSummary = clients.map((c, i) => {
    const cMetrics = metrics.filter(m => m.client_id === c.id);
    return {
      name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
      views: cMetrics.reduce((s, m) => s + m.views, 0),
      color: COLORS[i % COLORS.length],
    };
  }).filter(c => c.views > 0).sort((a, b) => b.views - a.views).slice(0, 10);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{formatNumber(p.value)}</strong></p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cross-client performance insights</p>
        </div>
        <div className="flex gap-3">
          <select className="input w-44 text-sm" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input w-36 text-sm" value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value as Platform | '')}>
            <option value="">All Platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading metrics…</div>}

      {!loading && metrics.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-sm">No metrics data yet. Go to a client and log some metrics.</p>
        </div>
      )}

      {!loading && metrics.length > 0 && (
        <>
          {/* Platform comparison */}
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4">Platform Comparison — Total Views</h2>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {PLATFORMS.map(p => {
                const pData = platformTotals.find(t => t.platform === p);
                return (
                  <div key={p} className="bg-gray-800 rounded-lg p-3 text-center">
                    <PlatformIcon platform={p} size={20} className="mx-auto mb-1" />
                    <p className="text-xs text-gray-400 capitalize mb-0.5">{p}</p>
                    <p className="text-lg font-bold text-white">{formatNumber(pData?.views || 0)}</p>
                    <p className="text-xs text-gray-500">{(pData?.avg_engagement || 0).toFixed(2)}% eng</p>
                  </div>
                );
              })}
            </div>

            {platformTotals.length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={platformTotals} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="platform" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={formatNumber} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                    {platformTotals.map(entry => (
                      <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform as Platform]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Views trend */}
          {viewsTrend.length > 1 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-white mb-4">Views Over Time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={viewsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={formatNumber} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="followers" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-indigo-500" /><span className="text-xs text-gray-500">Views</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-green-500" /><span className="text-xs text-gray-500">Followers</span></div>
              </div>
            </div>
          )}

          {/* Engagement rate trend */}
          {viewsTrend.length > 1 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-white mb-4">Engagement Rate Trend (%)</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={viewsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="engagement" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Client breakdown */}
          {clientSummary.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h2 className="text-sm font-semibold text-white mb-4">Views by Client</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={clientSummary} dataKey="views" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#6B7280', strokeWidth: 1 }}>
                      {clientSummary.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h2 className="text-sm font-semibold text-white mb-4">Top Clients by Views</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={clientSummary} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={formatNumber} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                      {clientSummary.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
