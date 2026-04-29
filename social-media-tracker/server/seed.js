// Run: node server/seed.js
// Adds 5 sample clients with accounts and metrics for testing

const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const clients = [
  { name: 'Bloom Skincare', industry: 'Beauty & Wellness', color: '#ec4899', contact_name: 'Emma Rose', contact_email: 'emma@bloomskin.com' },
  { name: 'FitLife Studio', industry: 'Fitness', color: '#22c55e', contact_name: 'Marcus Chen', contact_email: 'marcus@fitlife.io' },
  { name: 'TechVault', industry: 'Technology', color: '#6366f1', contact_name: 'Sarah Kim', contact_email: 'sarah@techvault.co' },
  { name: 'Urban Eats', industry: 'Food & Beverage', color: '#f97316', contact_name: 'James Porto', contact_email: 'james@urbaneats.com' },
  { name: 'Voyage Travel', industry: 'Travel', color: '#06b6d4', contact_name: 'Lia Morales', contact_email: 'lia@voyage.travel' },
];

const platforms = ['instagram', 'tiktok', 'facebook', 'linkedin'];

clients.forEach(c => {
  const clientId = uuidv4();
  db.insert('clients', { id: clientId, ...c, notes: null, avatar: null, active: 1, created_at: now() });

  platforms.forEach(platform => {
    const slug = c.name.toLowerCase().replace(/\s+/g, '');
    const accountId = uuidv4();
    db.insert('accounts', {
      id: accountId, client_id: clientId, platform,
      username: `${slug}_${platform === 'instagram' ? 'ig' : platform === 'tiktok' ? 'tt' : platform === 'facebook' ? 'fb' : 'li'}`,
      profile_url: null, active: 1, created_at: now(),
    });

    // Add 3 months of metrics
    for (let i = 2; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const base = Math.floor(Math.random() * 50000) + 5000;
      db.insert('metrics', {
        id: uuidv4(), account_id: accountId, recorded_date: dateStr,
        followers: base + i * 500,
        views: Math.floor(base * (Math.random() * 3 + 1)),
        likes: Math.floor(base * 0.08),
        comments: Math.floor(base * 0.02),
        shares: Math.floor(base * 0.015),
        saves: Math.floor(base * 0.03),
        impressions: Math.floor(base * 4),
        reach: Math.floor(base * 2.5),
        engagement_rate: parseFloat((Math.random() * 5 + 1.5).toFixed(2)),
        notes: null, created_at: now(),
      });
    }

    // Add pipeline items
    const types = ['reel', 'still', 'story', 'graphic', 'video'];
    const statuses = ['idea', 'brief', 'in_production', 'ready', 'scheduled'];
    for (let j = 0; j < 3; j++) {
      const future = new Date();
      future.setDate(future.getDate() + j * 3 + 1);
      db.insert('pipeline', {
        id: uuidv4(), account_id: accountId, client_id: clientId,
        title: `${c.name} ${types[j % types.length]} content #${j + 1}`,
        description: null,
        content_type: types[j % types.length],
        status: statuses[j % statuses.length],
        platform,
        scheduled_date: j < 2 ? future.toISOString().slice(0, 10) : null,
        posted_date: null, posted_views: 0, posted_likes: 0, posted_comments: 0, posted_shares: 0,
        posted_engagement_rate: 0, caption: null, hashtags: null,
        priority: ['low', 'medium', 'high'][j % 3],
        notes: null, created_at: now(), updated_at: now(),
      });
    }
  });
});

console.log('✅ Seed data added — 5 clients, 20 accounts, metrics & pipeline items.');
