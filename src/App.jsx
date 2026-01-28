import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import GraphView from './pages/GraphView';
import AdminPanel from './pages/AdminPanel';
// ... existing imports

function App() {
  // ... existing code ...

  return (
    <HashRouter>
      <nav className="fixed top-0 right-0 z-50 p-4 flex gap-2">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all">
          <NetworkIcon size={16} />
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
    </HashRouter>
  );
}

export default App;