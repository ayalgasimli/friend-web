import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Users, Link2, Heart, Star, TrendingUp, Award } from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const startValue = 0;
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = startValue + (endValue - startValue) * easeOutQuart;

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref}>
      {typeof value === 'number' ? Math.round(count) : count.toFixed(1)}
    </span>
  );
};

const StatsPanel = ({ nodes, links }) => {
    const stats = useMemo(() => {
        // Calculate connections per person
        const connectionCount = {};
        nodes.forEach(n => { connectionCount[n.id] = 0; });
        links.forEach(l => {
            const sourceId = l.source?.id || l.source;
            const targetId = l.target?.id || l.target;
            connectionCount[sourceId] = (connectionCount[sourceId] || 0) + 1;
            connectionCount[targetId] = (connectionCount[targetId] || 0) + 1;
        });

        // Sort people by connections
        const sortedNodes = [...nodes].sort((a, b) => {
            const connA = connectionCount[a.id] || 0;
            const connB = connectionCount[b.id] || 0;
            return connB - connA;
        });

        const topSocialites = sortedNodes.slice(0, 5);

        // Vibe analysis
        const vibeCounts = {};
        nodes.forEach(n => {
            if (n.vibe) {
                // Normalize vibe (lowercase, trim)
                const v = n.vibe.trim();
                vibeCounts[v] = (vibeCounts[v] || 0) + 1;
            }
        });

        const sortedVibes = Object.entries(vibeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8); // Top 8 vibes

        // Relationship type breakdown
        const typeBreakdown = {};
        links.forEach(l => {
            typeBreakdown[l.type] = (typeBreakdown[l.type] || 0) + 1;
        });

        // Average connections
        const avgConnections = nodes.length > 0
            ? (links.length * 2 / nodes.length).toFixed(1)
            : 0;

        return {
            totalPeople: nodes.length,
            totalBonds: links.length,
            topSocialites,
            sortedVibes,
            connectionCount, // specific count map for lookups
            maxConnections: topSocialites[0] ? connectionCount[topSocialites[0].id] : 0,
            typeBreakdown,
            avgConnections
        };
    }, [nodes, links]);

    const typeColors = {
        lover: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
        friend: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
        colleague: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        acquaintance: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans overflow-auto relative">
            <div className="absolute inset-0 bg-gradient-mesh pointer-events-none animate-gradient-shift" />

            <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent relative z-10 pt-12 animate-fade-scale-in">
                Network Statistics
            </h1>

            <div className="max-w-4xl mx-auto relative z-10 space-y-6">

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card glass-card-hover p-6 rounded-2xl animate-slide-up-stagger stagger-1 group">
                        <Users className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 group-hover:animate-bounce-slow transition" />
                        <p className="text-3xl font-bold text-white"><AnimatedCounter value={stats.totalPeople} /></p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">People</p>
                    </div>
                    <div className="glass-card glass-card-hover p-6 rounded-2xl animate-slide-up-stagger stagger-2 group">
                        <Link2 className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 group-hover:animate-bounce-slow transition" />
                        <p className="text-3xl font-bold text-white"><AnimatedCounter value={stats.totalBonds} /></p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Bonds</p>
                    </div>
                    <div className="glass-card glass-card-hover p-6 rounded-2xl animate-slide-up-stagger stagger-3 group">
                        <TrendingUp className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 group-hover:animate-bounce-slow transition" />
                        <p className="text-3xl font-bold text-white"><AnimatedCounter value={stats.avgConnections} /></p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Avg Connections</p>
                    </div>
                    <div className="glass-card glass-card-hover p-6 rounded-2xl animate-slide-up-stagger stagger-4 group">
                        <Award className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 group-hover:animate-bounce-slow transition" />
                        <p className="text-3xl font-bold text-white"><AnimatedCounter value={stats.maxConnections} /></p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Most Connections</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Leaderboard */}
                    <div className="glass-card p-6 rounded-2xl animate-slide-up-stagger stagger-5">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-400" /> Top Socialites
                        </h2>
                        <div className="space-y-4">
                            {stats.topSocialites.map((person, index) => (
                                <div key={person.id} className="flex items-center gap-4 group hover:bg-white/5 p-2 rounded-lg transition cursor-default">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-transform group-hover:scale-110 ${index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                                        {index + 1}
                                    </div>
                                    <img
                                        src={person.img || `https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`}
                                        className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-white/10 group-hover:border-blue-500/50 group-hover:scale-110 transition"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-white group-hover:text-blue-400 transition">{person.name}</p>
                                            <span className="text-xs font-mono text-gray-500"><AnimatedCounter value={stats.connectionCount[person.id]} /> bonds</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
                                            <div
                                                style={{ width: `${(stats.connectionCount[person.id] / (stats.maxConnections || 1)) * 100}%` }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vibe Cloud */}
                    <div className="glass-card p-6 rounded-2xl animate-slide-up-stagger stagger-6">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Star size={16} className="text-purple-400 animate-spin-slow" /> Vibe Check
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {stats.sortedVibes.length === 0 ? <p className="text-gray-500 italic">No vibes detected yet.</p> :
                                stats.sortedVibes.map(([vibe, count], i) => (
                                    <span
                                        key={vibe}
                                        className="animate-slide-up-stagger px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 flex items-center gap-2 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition cursor-default"
                                        style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
                                    >
                                        {vibe}
                                        <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-1.5 py-0.5 rounded-md text-xs text-gray-400">{count}</span>
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Relationship Breakdown */}
                <div className="glass-card p-6 rounded-2xl animate-slide-up-stagger stagger-7">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Relationship Types</h2>
                    {Object.keys(stats.typeBreakdown).length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No relationships yet</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(stats.typeBreakdown).map(([type, count], index) => {
                                const colors = typeColors[type] || typeColors.acquaintance;
                                return (
                                    <div
                                        key={type}
                                        className={`${colors.bg} ${colors.border} border rounded-xl p-4 hover:scale-105 hover:shadow-lg transition cursor-default animate-slide-up-stagger`}
                                        style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                                    >
                                        <p className={`text-2xl font-bold ${colors.text}`}><AnimatedCounter value={count} /></p>
                                        <p className="text-xs text-gray-400 capitalize">{type.replace('_', ' ')}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Visual Bar Chart */}
                {stats.totalBonds > 0 && (
                    <div className="glass-card p-6 rounded-2xl animate-slide-up-stagger stagger-8">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Distribution</h2>
                        <div className="space-y-3">
                            {Object.entries(stats.typeBreakdown)
                                .sort((a, b) => b[1] - a[1])
                                .map(([type, count], index) => {
                                    const percentage = (count / stats.totalBonds) * 100;
                                    const colors = typeColors[type] || typeColors.acquaintance;
                                    return (
                                        <div key={type} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                                                <span className="text-gray-500"><AnimatedCounter value={percentage} duration={1500} />%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${colors.bg.replace('/20', '')} transition-all duration-1000 ease-out hover:shadow-lg`}
                                                    style={{ width: '0%' }}
                                                    onLoad={(e) => setTimeout(() => e.target.style.width = `${percentage}%`, 100 + index * 100)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {stats.totalPeople === 0 && (
                    <div className="bg-white/5 backdrop-blur-xl p-12 rounded-2xl border border-white/10 text-center">
                        <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No data yet</h2>
                        <p className="text-gray-500">Add some people and connections to see stats!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsPanel;
