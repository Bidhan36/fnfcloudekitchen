const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const today = () => new Date().toISOString().slice(0, 10);

// ── Clients ──────────────────────────────────────────────────────────────────

app.get('/api/clients', (req, res) => {
  const clients = db.find('clients', c => c.active !== 0).sort((a, b) => a.name.localeCompare(b.name));
  const result = clients.map(c => ({
    ...c,
    accounts: db.find('accounts', a => a.client_id === c.id && a.active !== 0),
  }));
  res.json(result);
});

app.get('/api/clients/:id', (req, res) => {
  const client = db.findOne('clients', c => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json({ ...client, accounts: db.find('accounts', a => a.client_id === client.id && a.active !== 0) });
});

app.post('/api/clients', (req, res) => {
  const { name, industry, contact_name, contact_email, notes, color, avatar } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const record = { id: uuidv4(), name, industry: industry || null, contact_name: contact_name || null, contact_email: contact_email || null, notes: notes || null, color: color || '#6366f1', avatar: avatar || null, active: 1, created_at: now() };
  db.insert('clients', record);
  res.json(record);
});

app.put('/api/clients/:id', (req, res) => {
  const { name, industry, contact_name, contact_email, notes, color, avatar, active } = req.body;
  const updated = db.update('clients', c => c.id === req.params.id, () => ({ name, industry: industry || null, contact_name: contact_name || null, contact_email: contact_email || null, notes: notes || null, color: color || '#6366f1', avatar: avatar || null, active: active !== undefined ? active : 1 }));
  res.json(updated);
});

app.delete('/api/clients/:id', (req, res) => {
  db.update('clients', c => c.id === req.params.id, () => ({ active: 0 }));
  res.json({ success: true });
});

// ── Social Accounts ───────────────────────────────────────────────────────────

app.get('/api/accounts', (req, res) => {
  const { client_id, platform } = req.query;
  const accounts = db.find('accounts', a =>
    a.active !== 0 &&
    (!client_id || a.client_id === client_id) &&
    (!platform || a.platform === platform)
  );
  res.json(accounts);
});

app.post('/api/accounts', (req, res) => {
  const { client_id, platform, username, profile_url } = req.body;
  if (!client_id || !platform || !username) return res.status(400).json({ error: 'client_id, platform and username required' });
  const record = { id: uuidv4(), client_id, platform, username, profile_url: profile_url || null, active: 1, created_at: now() };
  db.insert('accounts', record);
  res.json(record);
});

app.put('/api/accounts/:id', (req, res) => {
  const { username, profile_url, active } = req.body;
  const updated = db.update('accounts', a => a.id === req.params.id, () => ({ username, profile_url: profile_url || null, active: active !== undefined ? active : 1 }));
  res.json(updated);
});

app.delete('/api/accounts/:id', (req, res) => {
  db.update('accounts', a => a.id === req.params.id, () => ({ active: 0 }));
  res.json({ success: true });
});

// ── Metrics ───────────────────────────────────────────────────────────────────

app.get('/api/metrics', (req, res) => {
  const { account_id, client_id, platform, from, to, latest } = req.query;

  const accounts = db.find('accounts', a => a.active !== 0);
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  const clients = db.find('clients', c => c.active !== 0);
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  if (latest && account_id) {
    const rows = db.find('metrics', m => m.account_id === account_id).sort((a, b) => b.recorded_date.localeCompare(a.recorded_date));
    return res.json(rows[0] || null);
  }

  let rows = db.find('metrics', m => {
    const acc = accountMap[m.account_id];
    if (!acc) return false;
    if (account_id && m.account_id !== account_id) return false;
    if (client_id && acc.client_id !== client_id) return false;
    if (platform && acc.platform !== platform) return false;
    if (from && m.recorded_date < from) return false;
    if (to && m.recorded_date > to) return false;
    return true;
  });

  rows = rows.map(m => {
    const acc = accountMap[m.account_id];
    const client = acc ? clientMap[acc.client_id] : null;
    return { ...m, platform: acc?.platform, username: acc?.username, client_id: acc?.client_id, client_name: client?.name, client_color: client?.color };
  });

  rows.sort((a, b) => b.recorded_date.localeCompare(a.recorded_date));
  res.json(rows);
});

app.post('/api/metrics', (req, res) => {
  const { account_id, recorded_date, followers, views, likes, comments, shares, saves, impressions, reach, engagement_rate, notes } = req.body;
  if (!account_id || !recorded_date) return res.status(400).json({ error: 'account_id and recorded_date required' });
  const record = { id: uuidv4(), account_id, recorded_date, followers: followers || 0, views: views || 0, likes: likes || 0, comments: comments || 0, shares: shares || 0, saves: saves || 0, impressions: impressions || 0, reach: reach || 0, engagement_rate: engagement_rate || 0, notes: notes || null, created_at: now() };
  db.insert('metrics', record);
  res.json(record);
});

app.put('/api/metrics/:id', (req, res) => {
  const { recorded_date, followers, views, likes, comments, shares, saves, impressions, reach, engagement_rate, notes } = req.body;
  const updated = db.update('metrics', m => m.id === req.params.id, () => ({ recorded_date, followers: followers || 0, views: views || 0, likes: likes || 0, comments: comments || 0, shares: shares || 0, saves: saves || 0, impressions: impressions || 0, reach: reach || 0, engagement_rate: engagement_rate || 0, notes: notes || null }));
  res.json(updated);
});

app.delete('/api/metrics/:id', (req, res) => {
  db.remove('metrics', m => m.id === req.params.id);
  res.json({ success: true });
});

// ── Content Pipeline ──────────────────────────────────────────────────────────

app.get('/api/pipeline', (req, res) => {
  const { client_id, account_id, platform, status, content_type } = req.query;
  const accounts = db.find('accounts', a => a.active !== 0);
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  const clients = db.find('clients', c => c.active !== 0);
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  let items = db.find('pipeline', i =>
    (!client_id || i.client_id === client_id) &&
    (!account_id || i.account_id === account_id) &&
    (!platform || i.platform === platform) &&
    (!status || i.status === status) &&
    (!content_type || i.content_type === content_type)
  );

  items = items.map(i => {
    const acc = accountMap[i.account_id];
    const client = clientMap[i.client_id];
    return { ...i, username: acc?.username, client_name: client?.name, client_color: client?.color };
  });

  items.sort((a, b) => {
    if (a.scheduled_date && b.scheduled_date) return a.scheduled_date.localeCompare(b.scheduled_date);
    if (a.scheduled_date) return -1;
    if (b.scheduled_date) return 1;
    return b.created_at.localeCompare(a.created_at);
  });

  res.json(items);
});

app.post('/api/pipeline', (req, res) => {
  const { account_id, client_id, title, description, content_type, status, platform, scheduled_date, caption, hashtags, notes, priority } = req.body;
  if (!account_id || !client_id || !title || !content_type || !platform) return res.status(400).json({ error: 'Missing required fields' });
  const record = { id: uuidv4(), account_id, client_id, title, description: description || null, content_type, status: status || 'idea', platform, scheduled_date: scheduled_date || null, posted_date: null, posted_views: 0, posted_likes: 0, posted_comments: 0, posted_shares: 0, posted_engagement_rate: 0, caption: caption || null, hashtags: hashtags || null, notes: notes || null, priority: priority || 'medium', created_at: now(), updated_at: now() };
  db.insert('pipeline', record);
  res.json(record);
});

app.put('/api/pipeline/:id', (req, res) => {
  const { title, description, content_type, status, platform, scheduled_date, posted_date, posted_views, posted_likes, posted_comments, posted_shares, posted_engagement_rate, caption, hashtags, notes, priority } = req.body;
  const updated = db.update('pipeline', i => i.id === req.params.id, () => ({
    title, description: description || null, content_type, status, platform,
    scheduled_date: scheduled_date || null, posted_date: posted_date || null,
    posted_views: posted_views || 0, posted_likes: posted_likes || 0,
    posted_comments: posted_comments || 0, posted_shares: posted_shares || 0,
    posted_engagement_rate: posted_engagement_rate || 0,
    caption: caption || null, hashtags: hashtags || null,
    notes: notes || null, priority: priority || 'medium',
    updated_at: now(),
  }));
  res.json(updated);
});

app.delete('/api/pipeline/:id', (req, res) => {
  db.remove('pipeline', i => i.id === req.params.id);
  res.json({ success: true });
});

// ── Dashboard ─────────────────────────────────────────────────────────────────

app.get('/api/dashboard', (req, res) => {
  const clients = db.find('clients', c => c.active !== 0);
  const accounts = db.find('accounts', a => a.active !== 0);
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a]));

  const platformCounts = {};
  accounts.forEach(a => { platformCounts[a.platform] = (platformCounts[a.platform] || 0) + 1; });

  const allPipeline = db.find('pipeline');
  const pipelineStatusCounts = {};
  allPipeline.forEach(i => { pipelineStatusCounts[i.status] = (pipelineStatusCounts[i.status] || 0) + 1; });

  const contentTypeCounts = {};
  allPipeline.forEach(i => { contentTypeCounts[i.content_type] = (contentTypeCounts[i.content_type] || 0) + 1; });

  const allMetrics = db.find('metrics');
  const recentMetrics = allMetrics
    .map(m => {
      const acc = accountMap[m.account_id];
      const client = acc ? clientMap[acc.client_id] : null;
      if (!client || client.active === 0) return null;
      return { ...m, platform: acc?.platform, username: acc?.username, client_id: acc?.client_id, client_name: client?.name, client_color: client?.color };
    })
    .filter(Boolean)
    .sort((a, b) => b.recorded_date.localeCompare(a.recorded_date))
    .slice(0, 20);

  // top by views per account (latest metrics per account)
  const latestByAccount = {};
  allMetrics.forEach(m => {
    if (!latestByAccount[m.account_id] || m.recorded_date > latestByAccount[m.account_id].recorded_date) {
      latestByAccount[m.account_id] = m;
    }
  });

  const topByViews = Object.values(latestByAccount)
    .map(m => {
      const acc = accountMap[m.account_id];
      const client = acc ? clientMap[acc.client_id] : null;
      if (!acc || !client || client.active === 0) return null;
      return { ...m, max_views: m.views, platform: acc.platform, username: acc.username, client_name: client.name, client_color: client.color, client_id: client.id };
    })
    .filter(Boolean)
    .sort((a, b) => (b.max_views || 0) - (a.max_views || 0))
    .slice(0, 10);

  const todayStr = today();
  const upcomingContent = allPipeline
    .filter(i => ['scheduled', 'ready'].includes(i.status) && i.scheduled_date && i.scheduled_date >= todayStr)
    .map(i => {
      const acc = accountMap[i.account_id];
      const client = clientMap[i.client_id];
      return { ...i, username: acc?.username, client_name: client?.name, client_color: client?.color };
    })
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
    .slice(0, 15);

  res.json({
    totalClients: clients.length,
    totalAccounts: accounts.length,
    platformCounts: Object.entries(platformCounts).map(([platform, count]) => ({ platform, count })),
    pipelineSummary: Object.entries(pipelineStatusCounts).map(([status, count]) => ({ status, count })),
    contentTypeSummary: Object.entries(contentTypeCounts).map(([content_type, count]) => ({ content_type, count })).sort((a, b) => b.count - a.count),
    recentMetrics,
    topByViews,
    upcomingContent,
  });
});

app.listen(PORT, () => {
  console.log(`Social Media Tracker API → http://localhost:${PORT}`);
});
