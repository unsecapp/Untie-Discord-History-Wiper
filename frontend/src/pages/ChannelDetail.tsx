import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Trash2,
  Loader2,
  MessageSquare,
  Clock,
  Paperclip,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
} from 'lucide-react';
import {
  getDMs,
  getGroupChats,
  getChannelActivity,
  deleteChannelMessages,
  DM,
  GroupChat,
  Message,
} from '../api';

type ChannelInfo = {
  id: string;
  name: string;
  type: 'dm' | 'group';
  avatar?: string | null;
};

export default function ChannelDetail() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();

  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ deleted: number; failed: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'all' | 'selected'>('all');

  useEffect(() => {
    // Reset state when channel changes
    setMessages([]);
    setSelectedIds(new Set());
    setActivityLoaded(false);
    setActivityLoading(false);
    setDeleteResult(null);
    
    Promise.all([getDMs(), getGroupChats()])
      .then(([dmsRes, gcsRes]) => {
        const dm = dmsRes.data.find((d: DM) => d.id === channelId);
        if (dm) {
          setChannel({
            id: dm.id,
            name: dm.recipient?.username || 'Unknown',
            type: 'dm',
            avatar: dm.recipient?.avatar,
          });
          return;
        }
        const gc = gcsRes.data.find((g: GroupChat) => g.id === channelId);
        if (gc) {
          setChannel({
            id: gc.id,
            name: gc.name,
            type: 'group',
            avatar: gc.icon,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [channelId]);

  // Auto-load activity when channel is loaded
  useEffect(() => {
    if (channel && !activityLoaded && !activityLoading) {
      loadActivity();
    }
  }, [channel]);

  const loadActivity = async () => {
    if (!channelId) return;
    setActivityLoading(true);
    try {
      const res = await getChannelActivity(channelId);
      setMessages(res.data);
      setActivityLoaded(true);
      setSelectedIds(new Set());
    } catch {
      setMessages([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.id)));
    }
  };

  const handleDelete = async () => {
    if (!channelId) return;
    setShowConfirm(false);
    setDeleting(true);
    setDeleteResult(null);
    try {
      const ids = deleteMode === 'selected' ? Array.from(selectedIds) : undefined;
      const res = await deleteChannelMessages(channelId, ids);
      setDeleteResult(res.data);
      if (deleteMode === 'all') {
        setMessages([]);
        setActivityLoaded(false);
      } else {
        setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
        setSelectedIds(new Set());
      }
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

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-muted">Channel not found.</p>
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
          {channel.avatar ? (
            <img src={channel.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-bg-tertiary flex items-center justify-center text-xl font-bold text-text-secondary">
              {channel.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{channel.name}</h1>
            <p className="text-sm text-text-muted capitalize">{channel.type === 'dm' ? 'Direct Message' : 'Group Chat'}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <button
          onClick={loadActivity}
          disabled={activityLoading}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-2.5 px-5 rounded-xl transition-all text-sm"
        >
          {activityLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
          {activityLoading ? 'Scanning...' : 'Show Activity'}
        </button>
        <button
          onClick={() => {
            setDeleteMode('all');
            setShowConfirm(true);
          }}
          disabled={deleting}
          className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger font-medium py-2.5 px-5 rounded-xl transition-all text-sm"
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          {deleting ? 'Deleting...' : 'Delete All Messages'}
        </button>
        {selectedIds.size > 0 && (
          <button
            onClick={() => {
              setDeleteMode('selected');
              setShowConfirm(true);
            }}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-medium py-2.5 px-5 rounded-xl transition-all text-sm"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedIds.size})
          </button>
        )}
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
                    deleteResult.failed > 0 ? `${deleteResult.failed} failed.` : ''
                  }`}
            </p>
          </div>
          <button onClick={() => setDeleteResult(null)} className="text-text-muted hover:text-text-secondary">
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
                <h3 className="font-semibold text-text-primary">
                  {deleteMode === 'all' ? 'Delete All Messages' : `Delete ${selectedIds.size} Messages`}
                </h3>
                <p className="text-xs text-text-muted">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              {deleteMode === 'all'
                ? `This will delete all your messages in this conversation with ${channel.name}.`
                : `This will delete ${selectedIds.size} selected message(s).`}
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
                Delete
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
              Your Messages ({messages.length})
            </h2>
            {messages.length > 0 && (
              <button
                onClick={selectAll}
                className="text-xs text-text-muted hover:text-accent transition-colors"
              >
                {selectedIds.size === messages.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
              <MessageSquare size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm">No messages found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  onClick={() => toggleSelect(msg.id)}
                  className={`bg-bg-secondary border rounded-xl p-4 cursor-pointer transition-all animate-slide-right ${
                    selectedIds.has(msg.id)
                      ? 'border-accent/50 bg-accent/5'
                      : 'border-border hover:border-border/80'
                  }`}
                  style={{ animationDelay: `${Math.min(i * 20, 500)}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                        selectedIds.has(msg.id)
                          ? 'bg-accent border-accent'
                          : 'border-border'
                      }`}
                    >
                      {selectedIds.has(msg.id) && <Check size={12} className="text-white" />}
                    </div>
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
