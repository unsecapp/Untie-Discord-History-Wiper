import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Trash2,
  Loader2,
  MessageSquare,
  Clock,
  Hash,
  Paperclip,
  AlertTriangle,
  CheckCircle2,
  X,
  DoorOpen,
} from 'lucide-react';
import { getGuilds, getGuildActivity, deleteGuildMessages, leaveGuild, Guild, Message } from '../api';

export default function GuildDetail() {
  const { guildId } = useParams<{ guildId: string }>();
  const navigate = useNavigate();

  const [guild, setGuild] = useState<Guild | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ deleted: number; failed: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Reset state when guild changes
    setMessages([]);
    setActivityLoaded(false);
    setActivityLoading(false);
    setDeleteResult(null);
    
    getGuilds()
      .then((r) => {
        const g = r.data.find((g) => g.id === guildId);
        setGuild(g || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [guildId]);

  // Auto-load activity when guild is loaded
  useEffect(() => {
    if (guild && !activityLoaded && !activityLoading) {
      loadActivity();
    }
  }, [guild]);

  const loadActivity = async () => {
    if (!guildId) return;
    setActivityLoading(true);
    try {
      const res = await getGuildActivity(guildId);
      setMessages(res.data.messages);
      setTotalResults(res.data.total);
      setActivityLoaded(true);
    } catch {
      setMessages([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!guildId) return;
    setShowConfirm(false);
    setDeleting(true);
    setDeleteResult(null);
    try {
      const res = await deleteGuildMessages(guildId);
      setDeleteResult(res.data);
      setMessages([]);
      setActivityLoaded(false);
    } catch {
      setDeleteResult({ deleted: 0, failed: -1 });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-muted">Server not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Back + Header */}
      <div className="animate-slide-up">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-8">
          {guild.icon ? (
            <img src={guild.icon} alt="" className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-bg-tertiary flex items-center justify-center text-xl font-bold text-text-secondary">
              {guild.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{guild.name}</h1>
            <p className="text-sm text-text-muted">
              {guild.member_count?.toLocaleString() || '?'} members
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <button
          onClick={loadActivity}
          disabled={activityLoading}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-2.5 px-5 rounded-xl transition-all text-sm"
        >
          {activityLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Eye size={16} />
          )}
          {activityLoading ? 'Scanning...' : 'Show Activity'}
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={deleting}
          className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger font-medium py-2.5 px-5 rounded-xl transition-all text-sm"
        >
          {deleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          {deleting ? 'Deleting...' : 'Delete All Messages'}
        </button>
        <button
          onClick={() => setShowLeaveConfirm(true)}
          disabled={leaving}
          className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-medium py-2.5 px-5 rounded-xl transition-all text-sm"
        >
          {leaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <DoorOpen size={16} />
          )}
          {leaving ? 'Leaving...' : 'Leave Server'}
        </button>
      </div>

      {/* Delete Result */}
      {deleteResult && (
        <div
          className={`flex items-center justify-between px-5 py-4 rounded-xl mb-6 border animate-slide-down ${
            deleteResult.failed === -1
              ? 'bg-danger/10 border-danger/20'
              : 'bg-success/10 border-success/20'
          }`}
        >
          <div className="flex items-center gap-3">
            {deleteResult.failed === -1 ? (
              <AlertTriangle size={18} className="text-danger" />
            ) : (
              <CheckCircle2 size={18} className="text-success" />
            )}
            <p className="text-sm">
              {deleteResult.failed === -1
                ? 'An error occurred while deleting messages.'
                : `Deleted ${deleteResult.deleted} messages. ${
                    deleteResult.failed > 0
                      ? `${deleteResult.failed} failed.`
                      : ''
                  }`}
            </p>
          </div>
          <button
            onClick={() => setDeleteResult(null)}
            className="text-text-muted hover:text-text-secondary"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-fade-in"
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-md w-full mx-4 animate-scale-in"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Delete All Messages</h3>
                <p className="text-xs text-text-muted">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              This will delete <strong>all your messages</strong> across every channel in{' '}
              <strong>{guild.name}</strong>. This may take a while depending on the number of
              messages.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:bg-bg-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-sm bg-danger hover:bg-danger-hover text-white font-medium transition-all"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirm Dialog */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-fade-in"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-md w-full mx-4 animate-scale-in"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <DoorOpen size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Leave Server</h3>
                <p className="text-xs text-text-muted">You can rejoin if you have an invite</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to leave <strong>{guild.name}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm text-text-secondary hover:bg-bg-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLeaveConfirm(false);
                  setLeaving(true);
                  try {
                    await leaveGuild(guildId!);
                    navigate('/');
                  } catch {
                    setLeaving(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all"
              >
                Leave Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      {activityLoaded && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={14} />
              Your Messages ({messages.length}{totalResults > messages.length ? ` of ${totalResults} total` : ''})
            </h2>
          </div>

          {messages.length === 0 ? (
            <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
              <MessageSquare size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm">No messages found in this server.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className="bg-bg-secondary border border-border rounded-xl p-4 hover:border-border/80 transition-all animate-slide-right"
                  style={{ animationDelay: `${Math.min(i * 20, 500)}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary break-words">
                        {msg.content || (
                          <span className="text-text-muted italic">
                            {msg.attachments.length > 0
                              ? `[${msg.attachments.length} attachment(s)]`
                              : msg.embeds > 0
                              ? `[${msg.embeds} embed(s)]`
                              : '[empty message]'}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Hash size={10} />
                          {msg.channel_name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock size={10} />
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                        {msg.attachments.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Paperclip size={10} />
                            {msg.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
