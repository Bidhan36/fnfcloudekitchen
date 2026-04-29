import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { pipelineApi, clientsApi, accountsApi } from '../utils/api';
import type { ContentPipeline, Client, SocialAccount, Platform, ContentType, ContentStatus, Priority } from '../types';
import Modal from '../components/Modal';
import PlatformIcon from '../components/PlatformIcon';
import {
  PLATFORMS, CONTENT_TYPES, CONTENT_STATUSES,
  STATUS_COLORS, STATUS_LABELS, CONTENT_TYPE_ICONS, PLATFORM_BG,
  PRIORITY_COLORS,
} from '../utils/helpers';
import { format } from 'date-fns';

function PipelineForm({ clients, initial, onSave, onClose }: {
  clients: Client[];
  initial?: Partial<ContentPipeline>;
  onSave: (data: Partial<ContentPipeline>) => Promise<void>;
  onClose: () => void;
}) {
  const [clientId, setClientId] = useState(initial?.client_id || clients[0]?.id || '');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [form, setForm] = useState({
    account_id: initial?.account_id || '',
    platform: (initial?.platform || 'instagram') as Platform,
    title: initial?.title || '',
    description: initial?.description || '',
    content_type: (initial?.content_type || 'still') as ContentType,
    status: (initial?.status || 'idea') as ContentStatus,
    scheduled_date: initial?.scheduled_date || '',
    caption: initial?.caption || '',
    hashtags: initial?.hashtags || '',
    notes: initial?.notes || '',
    priority: (initial?.priority || 'medium') as Priority,
    posted_views: initial?.posted_views?.toString() || '',
    posted_likes: initial?.posted_likes?.toString() || '',
    posted_comments: initial?.posted_comments?.toString() || '',
    posted_shares: initial?.posted_shares?.toString() || '',
    posted_engagement_rate: initial?.posted_engagement_rate?.toString() || '',
    posted_date: initial?.posted_date || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientId) {
      accountsApi.list({ client_id: clientId }).then(accs => {
        setAccounts(accs);
        if (!initial?.account_id && accs.length > 0) {
          setForm(f => ({ ...f, account_id: accs[0].id, platform: accs[0].platform }));
        }
      });
    }
  }, [clientId, initial?.account_id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const n = (v: string) => v === '' ? 0 : Number(v);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.account_id || !clientId) return;
    setSaving(true);
    await onSave({
      ...form,
      client_id: clientId,
      posted_views: n(form.posted_views),
      posted_likes: n(form.posted_likes),
      posted_comments: n(form.posted_comments),
      posted_shares: n(form.posted_shares),
      posted_engagement_rate: n(form.posted_engagement_rate),
      scheduled_date: form.scheduled_date || undefined,
      posted_date: form.posted_date || undefined,
    });
    setSaving(false);
  }

  const selectedAccount = accounts.find(a => a.id === form.account_id);

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Client *</label>
          <select className="input" value={clientId} onChange={e => setClientId(e.target.value)}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Account *</label>
          <select className="input" value={form.account_id} onChange={e => {
            const acc = accounts.find(a => a.id === e.target.value);
            setForm(f => ({ ...f, account_id: e.target.value, platform: acc?.platform || f.platform }));
          }}>
            <option value="">— Select account —</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.platform} · @{a.username}</option>)}
          </select>
          {selectedAccount && (
            <div className="mt-1 flex items-center gap-1">
              <PlatformIcon platform={selectedAccount.platform} size={12} />
              <span className="text-xs text-gray-500">@{selectedAccount.username}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Content title or brief description" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.content_type} onChange={e => set('content_type', e.target.value)}>
            {CONTENT_TYPES.map(t => <option key={t} value={t}>{CONTENT_TYPE_ICONS[t]} {t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            {CONTENT_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {(['low','medium','high','urgent'] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Scheduled Date</label>
          <input className="input" type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
        </div>
        <div>
          <label className="label">Posted Date</label>
          <input className="input" type="date" value={form.posted_date} onChange={e => set('posted_date', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Caption</label>
        <textarea className="input resize-none" rows={2} value={form.caption} onChange={e => set('caption', e.target.value)} placeholder="Post caption…" />
      </div>

      <div>
        <label className="label">Hashtags</label>
        <input className="input" value={form.hashtags} onChange={e => set('hashtags', e.target.value)} placeholder="#hashtag1 #hashtag2" />
      </div>

      {form.status === 'posted' && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">Posted Performance</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['posted_views', 'Views'],
              ['posted_likes', 'Likes'],
              ['posted_comments', 'Comments'],
              ['posted_shares', 'Shares'],
              ['posted_engagement_rate', 'Eng. Rate (%)'],
            ].map(([k, label]) => (
              <div key={k}>
                <label className="label">{label}</label>
                <input className="input" type="number" min="0" step={k === 'posted_engagement_rate' ? '0.01' : '1'}
                  value={form[k as keyof typeof form]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving || !form.account_id}>
          {saving ? 'Saving…' : 'Save Content'}
        </button>
      </div>
    </form>
  );
}

const PIPELINE_COLUMNS: ContentStatus[] = ['idea', 'brief', 'in_production', 'ready', 'scheduled', 'posted'];

export default function Pipeline() {
  const [items, setItems] = useState<ContentPipeline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<ContentPipeline | null>(null);
  const [filterClient, setFilterClient] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const load = useCallback(() => {
    pipelineApi.list().then(setItems);
  }, []);

  useEffect(() => {
    load();
    clientsApi.list().then(setClients);
  }, [load]);

  const filtered = items.filter(i =>
    (!filterClient || i.client_id === filterClient) &&
    (!filterPlatform || i.platform === filterPlatform) &&
    (!filterType || i.content_type === filterType)
  );

  async function handleAdd(data: Partial<ContentPipeline>) {
    await pipelineApi.create(data);
    setShowAdd(false);
    load();
  }

  async function handleEdit(data: Partial<ContentPipeline>) {
    if (!editItem) return;
    await pipelineApi.update(editItem.id, data);
    setEditItem(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this content item?')) return;
    await pipelineApi.delete(id);
    load();
  }

  async function quickStatus(item: ContentPipeline, status: ContentStatus) {
    await pipelineApi.update(item.id, { ...item, status });
    load();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Content Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} items</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode(v => v === 'board' ? 'list' : 'board')} className="btn-secondary text-xs">
              {viewMode === 'board' ? 'List View' : 'Board View'}
            </button>
            <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Content
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={13} className="text-gray-500" />
          <select className="input w-40 text-xs py-1.5" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input w-36 text-xs py-1.5" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
            <option value="">All Platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input w-36 text-xs py-1.5" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {CONTENT_TYPES.map(t => <option key={t} value={t}>{CONTENT_TYPE_ICONS[t]} {t}</option>)}
          </select>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-3 min-w-max h-full">
            {PIPELINE_COLUMNS.map(col => {
              const colItems = filtered.filter(i => i.status === col);
              return (
                <div key={col} className="w-64 flex flex-col">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${STATUS_COLORS[col]}`}>{STATUS_LABELS[col]}</span>
                    </div>
                    <span className="text-xs text-gray-600">{colItems.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {colItems.map(item => (
                      <div key={item.id} className="card-sm hover:border-gray-700 transition-all group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs">{CONTENT_TYPE_ICONS[item.content_type]}</span>
                            <PlatformIcon platform={item.platform} size={12} />
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditItem(item)} className="p-0.5 text-gray-500 hover:text-gray-300"><Pencil size={11} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-0.5 text-gray-500 hover:text-red-400"><Trash2 size={11} /></button>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-white line-clamp-2 mb-2">{item.title}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.client_color }} />
                            <span className="text-xs text-gray-500 truncate max-w-[80px]">{item.client_name}</span>
                          </div>
                          {item.scheduled_date && (
                            <span className="text-xs text-gray-500">{format(new Date(item.scheduled_date), 'MMM d')}</span>
                          )}
                        </div>
                        <div className={`text-xs mt-1.5 font-medium ${PRIORITY_COLORS[item.priority]}`}>
                          {item.priority !== 'medium' ? `● ${item.priority}` : ''}
                        </div>
                        {col !== 'posted' && (
                          <div className="mt-2 flex gap-1">
                            {PIPELINE_COLUMNS.filter(c => c !== col).slice(0, 3).map(s => (
                              <button key={s} onClick={() => quickStatus(item, s)}
                                className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[s]} opacity-60 hover:opacity-100 transition-opacity`}>
                                → {STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {colItems.length === 0 && (
                      <div className="text-center py-6 text-gray-700 text-xs">Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filtered.map(item => (
              <div key={item.id} className="card-sm flex items-center gap-4 hover:border-gray-700 transition-all group">
                <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: item.client_color }} />
                <span className="text-base flex-shrink-0">{CONTENT_TYPE_ICONS[item.content_type]}</span>
                <PlatformIcon platform={item.platform} size={14} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.client_name} · @{item.username}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[item.status]} flex-shrink-0`}>{STATUS_LABELS[item.status]}</span>
                {item.scheduled_date && (
                  <span className="text-xs text-gray-500 flex-shrink-0">{format(new Date(item.scheduled_date), 'MMM d, yyyy')}</span>
                )}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditItem(item)} className="p-1 text-gray-500 hover:text-gray-300"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">No content items yet</div>
            )}
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add Content" onClose={() => setShowAdd(false)} size="xl">
          <PipelineForm clients={clients} onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {editItem && (
        <Modal title="Edit Content" onClose={() => setEditItem(null)} size="xl">
          <PipelineForm clients={clients} initial={editItem} onSave={handleEdit} onClose={() => setEditItem(null)} />
        </Modal>
      )}
    </div>
  );
}
