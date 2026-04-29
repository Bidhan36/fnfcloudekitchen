import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, BarChart2 } from 'lucide-react';
import { clientsApi, accountsApi, metricsApi } from '../utils/api';
import type { Client, SocialAccount, Metrics, Platform } from '../types';
import PlatformIcon from '../components/PlatformIcon';
import Modal from '../components/Modal';
import { PLATFORMS, PLATFORM_BG, formatNumber, formatEngagement, CLIENT_COLORS } from '../utils/helpers';
import { format } from 'date-fns';

function AccountForm({ clientId, initial, onSave, onClose }: {
  clientId: string;
  initial?: Partial<SocialAccount>;
  onSave: (data: Partial<SocialAccount>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    platform: initial?.platform || 'instagram' as Platform,
    username: initial?.username || '',
    profile_url: initial?.profile_url || '',
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, client_id: clientId });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Platform *</label>
        <select className="input" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}>
          {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Username *</label>
        <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required placeholder="e.g. acmecorp (no @)" />
      </div>
      <div>
        <label className="label">Profile URL</label>
        <input className="input" value={form.profile_url} onChange={e => setForm(f => ({ ...f, profile_url: e.target.value }))} placeholder="https://..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Account'}</button>
      </div>
    </form>
  );
}

function MetricsForm({ accountId, initial, onSave, onClose }: {
  accountId: string;
  initial?: Partial<Metrics>;
  onSave: (data: Partial<Metrics>) => Promise<void>;
  onClose: () => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({
    recorded_date: initial?.recorded_date || today,
    followers: initial?.followers?.toString() || '',
    views: initial?.views?.toString() || '',
    likes: initial?.likes?.toString() || '',
    comments: initial?.comments?.toString() || '',
    shares: initial?.shares?.toString() || '',
    saves: initial?.saves?.toString() || '',
    impressions: initial?.impressions?.toString() || '',
    reach: initial?.reach?.toString() || '',
    engagement_rate: initial?.engagement_rate?.toString() || '',
    notes: initial?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const n = (v: string) => v === '' ? 0 : Number(v);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      account_id: accountId,
      recorded_date: form.recorded_date,
      followers: n(form.followers), views: n(form.views), likes: n(form.likes),
      comments: n(form.comments), shares: n(form.shares), saves: n(form.saves),
      impressions: n(form.impressions), reach: n(form.reach),
      engagement_rate: n(form.engagement_rate), notes: form.notes || undefined,
    });
    setSaving(false);
  }

  const field = (k: keyof typeof form, label: string, type = 'number') => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        value={form[k]}
        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
        min={type === 'number' ? '0' : undefined}
        step={k === 'engagement_rate' ? '0.01' : '1'}
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Date *</label>
        <input className="input" type="date" value={form.recorded_date} onChange={e => setForm(f => ({ ...f, recorded_date: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('followers', 'Followers')}
        {field('views', 'Views / Plays')}
        {field('likes', 'Likes')}
        {field('comments', 'Comments')}
        {field('shares', 'Shares')}
        {field('saves', 'Saves')}
        {field('impressions', 'Impressions')}
        {field('reach', 'Reach')}
      </div>
      {field('engagement_rate', 'Engagement Rate (%)')}
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Metrics'}</button>
      </div>
    </form>
  );
}

function AccountPanel({ account, clientId, onRefresh }: { account: SocialAccount; clientId: string; onRefresh: () => void }) {
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  const [editMetric, setEditMetric] = useState<Metrics | null>(null);
  const [showEditAccount, setShowEditAccount] = useState(false);

  const loadMetrics = useCallback(() => {
    metricsApi.list({ account_id: account.id }).then(setMetrics);
  }, [account.id]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  const latest = metrics[0];

  async function saveMetrics(data: Partial<Metrics>) {
    if (editMetric) {
      await metricsApi.update(editMetric.id, data);
      setEditMetric(null);
    } else {
      await metricsApi.create(data);
      setShowMetricsForm(false);
    }
    loadMetrics();
  }

  async function deleteMetric(id: string) {
    if (!confirm('Delete this metrics entry?')) return;
    await metricsApi.delete(id);
    loadMetrics();
  }

  async function deleteAccount() {
    if (!confirm(`Remove ${account.username} from this client?`)) return;
    await accountsApi.delete(account.id);
    onRefresh();
  }

  async function updateAccount(data: Partial<SocialAccount>) {
    await accountsApi.update(account.id, data);
    setShowEditAccount(false);
    onRefresh();
  }

  return (
    <div className={`card border ${PLATFORM_BG[account.platform]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={account.platform} size={18} />
          <div>
            <span className="font-semibold text-white text-sm">@{account.username}</span>
            <span className={`ml-2 badge border ${PLATFORM_BG[account.platform]} text-xs`}>{account.platform}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMetricsForm(true)} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
            <Plus size={12} /> Log Metrics
          </button>
          <button onClick={() => setShowEditAccount(true)} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={deleteAccount} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {latest && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Followers', value: formatNumber(latest.followers) },
            { label: 'Views', value: formatNumber(latest.views) },
            { label: 'Engagement', value: formatEngagement(latest.engagement_rate) },
            { label: 'Likes', value: formatNumber(latest.likes) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-black/20 rounded-lg p-2.5 text-center">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-base font-bold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {metrics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={13} className="text-gray-500" />
            <span className="text-xs text-gray-500">History ({metrics.length} entries)</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {metrics.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 group">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 w-24">{format(new Date(m.recorded_date), 'MMM d, yyyy')}</span>
                  <span className="text-xs text-white">{formatNumber(m.views)} views</span>
                  <span className="text-xs text-gray-400">{formatEngagement(m.engagement_rate)} eng</span>
                  <span className="text-xs text-gray-500">{formatNumber(m.followers)} followers</span>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditMetric(m)} className="p-1 text-gray-500 hover:text-gray-300"><Pencil size={11} /></button>
                  <button onClick={() => deleteMetric(m.id)} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics.length === 0 && (
        <p className="text-xs text-gray-600 text-center py-3">No metrics yet. Click "Log Metrics" to add data.</p>
      )}

      {(showMetricsForm || editMetric) && (
        <Modal title={editMetric ? 'Edit Metrics' : `Log Metrics — @${account.username}`} onClose={() => { setShowMetricsForm(false); setEditMetric(null); }} size="lg">
          <MetricsForm accountId={account.id} initial={editMetric || undefined} onSave={saveMetrics} onClose={() => { setShowMetricsForm(false); setEditMetric(null); }} />
        </Modal>
      )}

      {showEditAccount && (
        <Modal title="Edit Account" onClose={() => setShowEditAccount(false)}>
          <AccountForm clientId={clientId} initial={account} onSave={updateAccount} onClose={() => setShowEditAccount(false)} />
        </Modal>
      )}
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    clientsApi.get(id).then(c => { setClient(c); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addAccount(data: Partial<SocialAccount>) {
    await accountsApi.create(data);
    setShowAddAccount(false);
    load();
  }

  async function updateClient(data: Partial<Client>) {
    if (!id) return;
    await clientsApi.update(id, data);
    setShowEditClient(false);
    load();
  }

  async function deleteClient() {
    if (!id || !confirm('Archive this client?')) return;
    await clientsApi.delete(id);
    navigate('/clients');
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="text-gray-500 text-sm">Loading…</div></div>;
  if (!client) return <div className="flex-1 flex items-center justify-center"><div className="text-red-400 text-sm">Client not found</div></div>;

  const existingPlatforms = new Set(client.accounts?.map(a => a.platform) || []);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/clients')} className="text-gray-500 hover:text-gray-300 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: client.color }}
        >
          {client.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{client.name}</h1>
          {client.industry && <p className="text-sm text-gray-500">{client.industry}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs" onClick={() => setShowEditClient(true)}>Edit</button>
          <button className="btn-danger text-xs" onClick={deleteClient}>Archive</button>
        </div>
      </div>

      {(client.contact_name || client.contact_email || client.notes) && (
        <div className="card mb-5 flex gap-6">
          {client.contact_name && <div><p className="text-xs text-gray-500">Contact</p><p className="text-sm text-white font-medium mt-0.5">{client.contact_name}</p></div>}
          {client.contact_email && <div><p className="text-xs text-gray-500">Email</p><p className="text-sm text-white font-medium mt-0.5">{client.contact_email}</p></div>}
          {client.notes && <div className="flex-1"><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-300 mt-0.5">{client.notes}</p></div>}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300">Social Accounts ({client.accounts?.length || 0})</h2>
        {existingPlatforms.size < 4 && (
          <button className="btn-primary text-xs flex items-center gap-1.5" onClick={() => setShowAddAccount(true)}>
            <Plus size={12} /> Add Account
          </button>
        )}
      </div>

      {client.accounts && client.accounts.length > 0 ? (
        <div className="space-y-4">
          {client.accounts.map(a => (
            <AccountPanel key={a.id} account={a} clientId={client.id} onRefresh={load} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm mb-3">No social accounts yet</p>
          <button className="btn-primary" onClick={() => setShowAddAccount(true)}>Add First Account</button>
        </div>
      )}

      {showAddAccount && (
        <Modal title={`Add Account — ${client.name}`} onClose={() => setShowAddAccount(false)}>
          <AccountForm clientId={client.id} onSave={addAccount} onClose={() => setShowAddAccount(false)} />
        </Modal>
      )}

      {showEditClient && (
        <Modal title="Edit Client" onClose={() => setShowEditClient(false)}>
          <ClientForm initial={client} onSave={updateClient} onClose={() => setShowEditClient(false)} />
        </Modal>
      )}
    </div>
  );
}

function ClientForm({ initial, onSave, onClose }: {
  initial?: Partial<Client>;
  onSave: (data: Partial<Client>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    industry: initial?.industry || '',
    contact_name: initial?.contact_name || '',
    contact_email: initial?.contact_email || '',
    notes: initial?.notes || '',
    color: initial?.color || CLIENT_COLORS[0],
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Client Name *</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Industry</label>
          <input className="input" value={form.industry} onChange={e => set('industry', e.target.value)} />
        </div>
        <div>
          <label className="label">Contact Name</label>
          <input className="input" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Contact Email</label>
        <input className="input" type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {CLIENT_COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}
