export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">App configuration</p>
      </div>

      <div className="card max-w-xl space-y-4">
        <h2 className="text-sm font-semibold text-white">About</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Social Media Tracker v1.0.0</p>
          <p>All data is stored locally in <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-gray-300">server/tracker.db</code></p>
          <p>Running at <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-gray-300">http://localhost:3000</code></p>
        </div>
      </div>

      <div className="card max-w-xl space-y-4">
        <h2 className="text-sm font-semibold text-white">Supported Platforms</h2>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
          {[
            { name: 'Instagram', features: 'Feed, Reels, Stories, Carousels' },
            { name: 'TikTok', features: 'Videos, Lives' },
            { name: 'Facebook', features: 'Posts, Reels, Stories, Lives' },
            { name: 'LinkedIn', features: 'Posts, Articles, Videos' },
          ].map(p => (
            <div key={p.name} className="bg-gray-800 rounded-lg p-3">
              <p className="font-medium text-white text-sm">{p.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.features}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card max-w-xl">
        <h2 className="text-sm font-semibold text-white mb-3">Data Management</h2>
        <p className="text-xs text-gray-500">
          Your data is stored in a local SQLite database at <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">social-media-tracker/server/tracker.db</code>.
          Back it up by copying that file. To reset all data, delete that file and restart the server.
        </p>
      </div>
    </div>
  );
}
