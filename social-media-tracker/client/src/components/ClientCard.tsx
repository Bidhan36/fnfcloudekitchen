import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Client } from '../types';
import PlatformIcon from './PlatformIcon';
import type { Platform } from '../types';

interface Props {
  client: Client;
}

export default function ClientCard({ client }: Props) {
  const navigate = useNavigate();
  const initial = client.name.charAt(0).toUpperCase();

  return (
    <button
      onClick={() => navigate(`/clients/${client.id}`)}
      className="card w-full text-left hover:border-gray-700 hover:bg-gray-800/50 transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: client.color }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white text-sm truncate">{client.name}</h3>
            <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
          </div>
          {client.industry && <p className="text-xs text-gray-500 mt-0.5">{client.industry}</p>}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {client.accounts?.map(a => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 bg-gray-800 rounded-md px-2 py-1"
              >
                <PlatformIcon platform={a.platform as Platform} size={12} />
                <span className="text-xs text-gray-400 truncate max-w-[80px]">@{a.username}</span>
              </div>
            ))}
            {(!client.accounts || client.accounts.length === 0) && (
              <span className="text-xs text-gray-600">No accounts yet</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
