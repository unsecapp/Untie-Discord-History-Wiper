import { useState } from 'react';
import { Unlink, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../App';

export default function LoginPage() {
  const { login } = useAuth();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError('');
    try {
      await login(token.trim());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to connect. Check your token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mb-5">
            <Unlink size={28} className="text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Untie</h1>
          <p className="text-text-muted text-sm mt-2">Discord Activity Eraser</p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-1">Connect</h2>
          <p className="text-sm text-text-muted mb-6">
            Enter your Discord user token to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your user token..."
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 animate-slide-down">
                <AlertCircle size={14} className="text-danger shrink-0" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Connect</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-[11px] text-text-muted text-center leading-relaxed">
              Your token is stored in browser session memory and sent only to the local backend. It is cleared when you close the tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
