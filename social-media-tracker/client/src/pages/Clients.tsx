import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { clientsApi } from '../utils/api';
import type { Client } from '../types';
import ClientCard from '../components/ClientCard';
import Modal from '../components/Modal';
import { CLIENT_COLORS } from '../utils/helpers';

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
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Acme Corp" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Industry</label>
          <input className="input" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. E-commerce" />
        </div>
        <div>
          <label className="label">Contact Name</label>
          <input className="input" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="e.g. Jane Doe" />
        </div>
      </div>
      <div>
        <label className="label">Contact Email</label>
        <input className="input" type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="jane@acme.com" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this client…" />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {CLIENT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Client'}
        </button>
      </div>
    </form>
  );
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => clientsApi.list().then(c => { setClients(c); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(data: Partial<Client>) {
    await clientsApi.create(data);
    setShowAdd(false);
    load();
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowAdd(true)}>
          <Plus size={15} />
          Add Client
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="input pl-9"
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">
            {search ? 'No clients match your search' : 'No clients yet. Add your first client!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => <ClientCard key={c.id} client={c} />)}
        </div>
      )}

      {showAdd && (
        <Modal title="Add New Client" onClose={() => setShowAdd(false)}>
          <ClientForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  );
}
