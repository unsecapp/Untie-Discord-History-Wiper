import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { connect as apiConnect, disconnect as apiDisconnect, getToken, clearToken, User } from './api'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import GuildDetail from './pages/GuildDetail'
import ChannelDetail from './pages/ChannelDetail'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'

interface AuthContextType {
  user: User | null;
  isConnected: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isConnected: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply saved theme on mount
    const savedAccent = localStorage.getItem('untie_accent') || '#7c5cfc';
    const savedAccentHover = localStorage.getItem('untie_accent_hover') || '#9478ff';
    const savedTheme = localStorage.getItem('untie_theme') || 'dark';
    
    const root = document.documentElement;
    root.style.setProperty('--color-accent', savedAccent);
    root.style.setProperty('--color-accent-hover', savedAccentHover);

    const themeColors: Record<string, Record<string, string>> = {
      dark: {
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#141414',
        'bg-tertiary': '#1f1f1f',
        'bg-hover': '#2a2a2a',
        'border': '#2a2a2a',
        'text-primary': '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
      },
      blue: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-tertiary': '#1a1a26',
        'bg-hover': '#22222e',
        'border': '#2a2a3a',
        'text-primary': '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
      },
      light: {
        'bg-primary': '#ffffff',
        'bg-secondary': '#f9fafb',
        'bg-tertiary': '#f3f4f6',
        'bg-hover': '#e5e7eb',
        'border': '#e5e7eb',
        'text-primary': '#18181b',
        'text-secondary': '#52525b',
        'text-muted': '#71717a',
      },
    };

    const colors = themeColors[savedTheme] || themeColors.dark;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    const savedToken = getToken();
    if (savedToken) {
      apiConnect(savedToken)
        .then((res) => {
          setUser(res.data.user);
          setIsConnected(true);
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string) => {
    const res = await apiConnect(token);
    setUser(res.data.user);
    setIsConnected(true);
  };

  const logout = async () => {
    await apiDisconnect();
    setUser(null);
    setIsConnected(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isConnected, loading, login, logout }}>
      {!isConnected ? (
        <LoginPage />
      ) : (
        <div className="flex min-h-screen bg-bg-primary">
          <Sidebar />
          <main className="flex-1 ml-72">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/guild/:guildId" element={<GuildDetail />} />
              <Route path="/channel/:channelId" element={<ChannelDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export default App
