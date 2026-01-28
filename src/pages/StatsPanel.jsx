import React, { useMemo } from 'react';
import { Users, Link2, Heart, Star, TrendingUp, Award } from 'lucide-react';

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

        // Find most connected person
        let mostConnected = null;
        let maxConnections = 0;
        nodes.forEach(n => {
            if (connectionCount[n.id] > maxConnections) {
                maxConnections = connectionCount[n.id];
                mostConnected = n;
            }
        });

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
            mostConnected,
            maxConnections,
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-black pointer-events-none" />

            <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent relative z-10 pt-12">
                Network Statistics
            </h1>

            <div className="max-w-4xl mx-auto relative z-10 space-y-6">

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <Users className="w-8 h-8 text-blue-400 mb-3" />
                        <p className="text-3xl font-bold text-white">{stats.totalPeople}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">People</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <Link2 className="w-8 h-8 text-red-400 mb-3" />
                        <p className="text-3xl font-bold text-white">{stats.totalBonds}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Bonds</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                        <p className="text-3xl font-bold text-white">{stats.avgConnections}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Avg Connections</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <Award className="w-8 h-8 text-yellow-400 mb-3" />
                        <p className="text-3xl font-bold text-white">{stats.maxConnections}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Most Connections</p>
                    </div>
                </div>

                {/* Most Connected Person */}
                {stats.mostConnected && (
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Most Connected</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] overflow-hidden">
                                <img
                                    src={stats.mostConnected.img || `https://api.dicebear.com/7.x/initials/svg?seed=${stats.mostConnected.name}`}
                                    className="w-full h-full object-cover bg-slate-800"
                                />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.mostConnected.name}</p>
                                <p className="text-sm text-gray-400">{stats.mostConnected.vibe || 'No vibe set'}</p>
                                <p className="text-xs text-yellow-400 mt-1">
                                    <Star className="w-3 h-3 inline mr-1" />
                                    {stats.maxConnections} connections
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Relationship Breakdown */}
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Relationship Types</h2>
                    {Object.keys(stats.typeBreakdown).length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No relationships yet</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(stats.typeBreakdown).map(([type, count]) => {
                                const colors = typeColors[type] || typeColors.acquaintance;
                                return (
                                    <div key={type} className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
                                        <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                                        <p className="text-xs text-gray-400 capitalize">{type.replace('_', ' ')}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Visual Bar Chart */}
                {stats.totalBonds > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Distribution</h2>
                        <div className="space-y-3">
                            {Object.entries(stats.typeBreakdown)
                                .sort((a, b) => b[1] - a[1])
                                .map(([type, count]) => {
                                    const percentage = (count / stats.totalBonds) * 100;
                                    const colors = typeColors[type] || typeColors.acquaintance;
                                    return (
                                        <div key={type} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                                                <span className="text-gray-500">{percentage.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${colors.bg.replace('/20', '')} transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
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
