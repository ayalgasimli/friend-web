import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import GraphView from './pages/GraphView';
import AdminPanel from './pages/AdminPanel';
import StatsPanel from './pages/StatsPanel';
import { supabase } from './supabase';
import { Network, Settings, Loader2, BarChart3 } from 'lucide-react';
import { generateImplicitLinks } from './utils/graphUtils';

function App() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase on load
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
    fetchData();

    // Realtime subscription (Auto-update when someone adds/removes)
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-white/50 text-sm">Loading your network...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/friend-web">
      <nav className="fixed top-0 right-0 z-50 p-4 flex gap-2">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all">
          <Network size={16} />
          <span className="hidden sm:inline">Graph</span>
        </Link>
        <Link to="/stats" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all">
          <BarChart3 size={16} />
          <span className="hidden sm:inline">Stats</span>
        </Link>
        <Link to="/admin" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all">
          <Settings size={16} />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<GraphView nodes={nodes} links={generateImplicitLinks(nodes, links)} onRefresh={fetchData} />} />
        <Route path="/stats" element={<StatsPanel nodes={nodes} links={links} />} />
        <Route path="/admin" element={<AdminPanel nodes={nodes} links={links} refreshData={fetchData} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;