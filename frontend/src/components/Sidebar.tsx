import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Server,
  MessageCircle,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  Unlink,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../App';
import { getGuilds, getDMs, getGroupChats, Guild, DM, GroupChat } from '../api';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [dms, setDMs] = useState<DM[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);

  const [guildsOpen, setGuildsOpen] = useState(true);
  const [dmsOpen, setDMsOpen] = useState(false);
  const [gcsOpen, setGCsOpen] = useState(false);

  useEffect(() => {
    getGuilds().then((r) => setGuilds(r.data)).catch(() => {});
    getDMs().then((r) => setDMs(r.data)).catch(() => {});
    getGroupChats().then((r) => setGroupChats(r.data)).catch(() => {});
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-bg-secondary border-r border-border flex flex-col z-50">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
            <Unlink size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-primary tracking-tight">Untie</h1>
            <p className="text-[11px] text-text-muted">Activity Eraser</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Home */}
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            isActive('/')
              ? 'bg-accent/15 text-accent'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          <Home size={16} />
          <span>Dashboard</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            isActive('/settings')
              ? 'bg-accent/15 text-accent'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          <SettingsIcon size={16} />
          <span>Settings</span>
        </button>

        {/* Servers */}
        <div className="pt-3">
          <button
            onClick={() => setGuildsOpen(!guildsOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
          >
            <span className="flex items-center gap-2">
              <Server size={12} />
              Servers ({guilds.length})
            </span>
            {guildsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {guildsOpen && (
            <div className="space-y-0.5 mt-1 animate-fade-in">
              {guilds.map((g) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/guild/${g.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isActive(`/guild/${g.id}`)
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  {g.icon ? (
                    <img
                      src={g.icon}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-bg-tertiary flex items-center justify-center text-[10px] font-medium">
                      {g.name[0]}
                    </div>
                  )}
                  <span className="truncate">{g.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DMs */}
        <div className="pt-2">
          <button
            onClick={() => setDMsOpen(!dmsOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageCircle size={12} />
              DMs ({dms.length})
            </span>
            {dmsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {dmsOpen && (
            <div className="space-y-0.5 mt-1 animate-fade-in">
              {dms.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => navigate(`/channel/${dm.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isActive(`/channel/${dm.id}`)
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  {dm.recipient?.avatar ? (
                    <img
                      src={dm.recipient.avatar}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-bg-tertiary flex items-center justify-center text-[10px] font-medium">
                      {dm.recipient?.username?.[0] || '?'}
                    </div>
                  )}
                  <span className="truncate">
                    {dm.recipient?.username || 'Unknown'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Group Chats */}
        <div className="pt-2">
          <button
            onClick={() => setGCsOpen(!gcsOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
          >
            <span className="flex items-center gap-2">
              <Users size={12} />
              Group Chats ({groupChats.length})
            </span>
            {gcsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {gcsOpen && (
            <div className="space-y-0.5 mt-1 animate-fade-in">
              {groupChats.map((gc) => (
                <button
                  key={gc.id}
                  onClick={() => navigate(`/channel/${gc.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isActive(`/channel/${gc.id}`)
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-bg-tertiary flex items-center justify-center text-[10px] font-medium">
                    <Users size={10} />
                  </div>
                  <span className="truncate">{gc.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent shrink-0">
                {user?.username?.[0] || '?'}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.username}
              </p>
              <p className="text-[11px] text-text-muted">#{user?.discriminator}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
            title="Disconnect"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
