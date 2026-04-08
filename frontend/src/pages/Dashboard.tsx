import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, MessageCircle, Users, ArrowRight, Activity } from 'lucide-react';
import { getGuilds, getDMs, getGroupChats, Guild, DM, GroupChat } from '../api';
import { useAuth } from '../App';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [dms, setDMs] = useState<DM[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getGuilds().then((r) => setGuilds(r.data)),
      getDMs().then((r) => setDMs(r.data)),
      getGroupChats().then((r) => setGroupChats(r.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Servers', value: guilds.length, icon: Server, color: 'text-accent' },
    { label: 'DMs', value: dms.length, icon: MessageCircle, color: 'text-emerald-400' },
    { label: 'Group Chats', value: groupChats.length, icon: Users, color: 'text-amber-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.username}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your Discord activity across all servers, DMs, and group chats.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="bg-bg-secondary border border-border rounded-xl p-5 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={18} className={stat.color} />
              <Activity size={14} className="text-text-muted" />
            </div>
            <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Servers Grid */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Server size={14} />
          Servers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {guilds.map((guild, i) => (
            <button
              key={guild.id}
              onClick={() => navigate(`/guild/${guild.id}`)}
              className="group bg-bg-secondary border border-border rounded-xl p-4 text-left hover:border-accent/40 hover:bg-bg-hover transition-all animate-slide-up"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <div className="flex items-center gap-3">
                {guild.icon ? (
                  <img
                    src={guild.icon}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-sm font-semibold text-text-secondary">
                    {guild.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {guild.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {guild.member_count?.toLocaleString() || '?'} members
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DMs */}
      {dms.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <MessageCircle size={14} />
            Direct Messages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dms.slice(0, 12).map((dm, i) => (
              <button
                key={dm.id}
                onClick={() => navigate(`/channel/${dm.id}`)}
                className="group bg-bg-secondary border border-border rounded-xl p-4 text-left hover:border-accent/40 hover:bg-bg-hover transition-all animate-slide-up"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className="flex items-center gap-3">
                  {dm.recipient?.avatar ? (
                    <img
                      src={dm.recipient.avatar}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-sm font-semibold text-text-secondary">
                      {dm.recipient?.username?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {dm.recipient?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-text-muted">Direct Message</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Group Chats */}
      {groupChats.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={14} />
            Group Chats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupChats.slice(0, 12).map((gc, i) => (
              <button
                key={gc.id}
                onClick={() => navigate(`/channel/${gc.id}`)}
                className="group bg-bg-secondary border border-border rounded-xl p-4 text-left hover:border-accent/40 hover:bg-bg-hover transition-all animate-slide-up"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center">
                    <Users size={16} className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {gc.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {gc.recipient_count} members
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
