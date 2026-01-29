import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import GraphView from './pages/GraphView';
import AdminPanel from './pages/AdminPanel';
import StatsPanel from './pages/StatsPanel';
import Login from './pages/Login';
import { supabase } from './supabase';
import { Network as NetworkIcon, Settings, Loader2, BarChart3, LogOut } from 'lucide-react';
import { generateImplicitLinks } from './utils/graphUtils';

// Navigation Item Component with enhanced effects
const NavItem = ({ to, icon: Icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 group ${
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-white/20 shadow-neon-blue'
          : 'text-white/60 bg-black/30 border-white/10 hover:text-white hover:bg-black/50 hover:border-white/20'
      }`}
    >
      <Icon size={16} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
      <span className={`hidden sm:inline transition-all ${isActive ? 'font-bold' : ''}`}>{label}</span>

      {/* Active indicator */}
      {isActive && (
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
      )}

      {/* Hover glow effect */}
      <span className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
    </Link>
  );
};

// App wrapper to handle location
function AppContent() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const location = useLocation();

  // Fetch data from Supabase on load
  const fetchData = async () => {
    try {
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
      if (profileError) throw profileError;

      const { data: rels, error: relError } = await supabase.from('relationships').select('*');
      if (relError) throw relError;

      if (profiles) setNodes(profiles);
      if (rels) setLinks(rels);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error loading data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Fetch Data
    fetchData();

    // 4. Realtime subscription (Auto-update when someone adds/removes)
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-purple-500/30 rounded-full animate-ping" />
          </div>
          <p className="text-white/50 text-sm animate-pulse">Loading your network...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <nav className="fixed top-0 right-0 z-50 p-4 flex gap-2 animate-slide-up">
        <NavItem to="/" icon={NetworkIcon} label="Graph" isActive={location.pathname === '/'} />
        <NavItem to="/stats" icon={BarChart3} label="Stats" isActive={location.pathname === '/stats'} />

        {session ? (
          <>
            <NavItem to="/admin" icon={Settings} label="Admin" isActive={location.pathname === '/admin'} />
            <button
              onClick={handleLogout}
              className="relative flex items-center gap-2 text-red-400/80 hover:text-red-400 text-sm font-medium bg-black/30 px-3 py-2 rounded-full backdrop-blur-xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group"
            >
              <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
            </button>
          </>
        ) : (
          <NavItem to="/login" icon={() => <span className="text-xs">🔐</span>} label="Login" isActive={location.pathname === '/login'} />
        )}
      </nav>
      <Routes>
        <Route path="/" element={<GraphView nodes={nodes} links={generateImplicitLinks(nodes, links)} onRefresh={fetchData} session={session} />} />
        <Route path="/stats" element={<StatsPanel nodes={nodes} links={links} />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/admin" />} />
        <Route path="/admin" element={session ? <AdminPanel nodes={nodes} links={links} refreshData={fetchData} /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;