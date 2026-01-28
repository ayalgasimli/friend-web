import React, { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { supabase } from '../supabase';
import { Trash2 } from 'lucide-react';

const GraphView = ({ nodes, links, onRefresh }) => {
  const [selected, setSelected] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [hasZoomedOnce, setHasZoomedOnce] = useState(false);
  const graphRef = useRef();
  const imageCache = useRef({});

  // Focus on selected person
  useEffect(() => {
    if (graphRef.current) {
      if (selected) {
        // Zoom in and center on the person
        graphRef.current.centerAt(selected.x, selected.y, 1000);
        graphRef.current.zoom(8, 2000);
      } else {
        // Zoom out to see everyone when closed
        graphRef.current.zoomToFit(1000, 50);
      }
    }
    setDeleteConfirmation(false);
  }, [selected]);

  // Preload images
  useEffect(() => {
    nodes.forEach(node => {
      const imgSrc = node.img || `https://api.dicebear.com/7.x/initials/svg?seed=${node.name}`;
      if (!imageCache.current[imgSrc]) {
        const img = new Image();
        img.src = imgSrc;
        imageCache.current[imgSrc] = img;
      }
    });
  }, [nodes]);

  // Configure Physics
  useEffect(() => {
    if (graphRef.current) {
      // Physics disabled for fixed Circular Layout
      graphRef.current.d3Force('charge', null);
      graphRef.current.d3Force('link', null);
      graphRef.current.d3Force('center', null);

      // Zoom to fit on initial load (after a delay for sim to settle)
      setTimeout(() => {
        graphRef.current?.zoomToFit(400, 50);
      }, 500);
    }
  }, []);

  const relColors = {
    lover: '#EF4444',
    friend: '#3B82F6',
    colleague: '#EAB308',
    acquaintance: '#64748B'
  };

  const handleDelete = async (person) => {
    // If confirmation is not yet true, set it to true and return
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      return;
    }

    console.log('Attempting to delete:', person.name);

    console.log('Deleting relationships for:', person.id);
    // Delete relationships first
    const { error: relError } = await supabase.from('relationships').delete().or(`source.eq.${person.id},target.eq.${person.id}`);

    if (relError) {
      console.error('Error deleting relationships:', relError);
    }

    console.log('Deleting profile:', person.id);
    // Delete profile
    const { error } = await supabase.from('profiles').delete().eq('id', person.id);

    if (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting: ' + error.message);
    } else {
      console.log('Deletion successful');
      setSelected(null);
      if (onRefresh) {
        console.log('Triggering data refresh');
        onRefresh();
      } else {
        console.warn('onRefresh callback not provided to GraphView');
      }
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative', display: 'flex' }}>

      {/* LEFT SIDEBAR - CLICKABLE PEOPLE LIST */}
      <div style={{ width: 250, background: 'rgba(0,0,0,0.9)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: 20, overflowY: 'auto', zIndex: 5 }}>
        <h2 style={{ color: 'white', fontSize: 18, marginBottom: 15, borderBottom: '2px solid #3B82F6', paddingBottom: 10 }}>People ({nodes.length})</h2>
        {nodes.map(node => (
          <div
            key={node.id}
            onClick={() => setSelected(node)}
            style={{
              cursor: 'pointer',
              padding: 12,
              marginBottom: 8,
              background: selected?.id === node.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              borderLeft: selected?.id === node.id ? '3px solid #3B82F6' : '3px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = selected?.id === node.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)'}
          >
            <img src={node.img || `https://api.dicebear.com/7.x/initials/svg?seed=${node.name}`} style={{ width: 35, height: 35, borderRadius: '50%' }} alt={node.name} />
            <div>
              <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{node.name}</div>
              {node.vibe && <div style={{ color: '#888', fontSize: 11 }}>{node.vibe}</div>}
            </div>
          </div>
        ))}

        {/* LEGEND */}
        <div style={{
          marginTop: 20,
          padding: 15,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Bond Types</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 4, background: '#3B82F6', borderRadius: 2 }} />
              <span style={{ color: '#aaa', fontSize: 12 }}>Friend (1st)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 4, background: 'linear-gradient(90deg, #9333EA 70%, transparent 30%)', backgroundSize: '8px 4px', borderRadius: 2 }} />
              <span style={{ color: '#aaa', fontSize: 12 }}>2nd Degree</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 4, background: 'linear-gradient(90deg, #EAB308 70%, transparent 30%)', backgroundSize: '4px 4px', borderRadius: 2 }} />
              <span style={{ color: '#aaa', fontSize: 12 }}>3rd Degree</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: 20, height: 4, background: '#EF4444', borderRadius: 2 }} />
              <span style={{ color: '#aaa', fontSize: 12 }}>Lover</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 4, background: '#EAB308', borderRadius: 2 }} />
              <span style={{ color: '#aaa', fontSize: 12 }}>Colleague</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 4, background: '#64748B', borderRadius: 2 }} />
              <span style={{ color: '#aaa', fontSize: 12 }}>Acquaintance</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRAPH */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ForceGraph2D
          ref={graphRef}
          width={window.innerWidth - 250 - (selected ? 350 : 0)}
          height={window.innerHeight}
          graphData={{
            nodes: nodes.map((node, i) => {
              // "Round Table" Layout
              const count = nodes.length;
              const radius = Math.max(300, count * 30); // Dynamic radius based on population
              const angle = (i / count) * 2 * Math.PI;

              return {
                ...node,
                // Fix position to circle
                fx: radius * Math.cos(angle),
                fy: radius * Math.sin(angle)
              };
            }),
            links: links.map(link => ({ ...link }))   // Shallow copy to prevent mutation of state
          }}
          nodeLabel="name"
          nodeAutoColorBy="id"
          nodeRelSize={10}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const size = 12;
            const isSelected = selected?.id === node.id;

            // Draw Glow / Selection Effect
            if (isSelected) {
              ctx.shadowColor = '#60A5FA';
              ctx.shadowBlur = 20;
            } else {
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }

            // Draw circle background
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.fillStyle = isSelected ? '#1e293b' : '#0f172a';
            ctx.fill();

            // Reset shadow for image to stay crisp
            ctx.shadowBlur = 0;

            // Draw Image
            const imgSrc = node.img || `https://api.dicebear.com/7.x/initials/svg?seed=${node.name}`;
            const img = imageCache.current[imgSrc];
            if (img && img.complete && img.naturalHeight !== 0) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
              ctx.clip();
              ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
              ctx.restore();
            }

            // Draw Ring
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.lineWidth = isSelected ? 3 / globalScale : 1.5 / globalScale;
            ctx.strokeStyle = isSelected ? '#60A5FA' : 'rgba(255,255,255,0.2)';
            ctx.stroke();

            // Draw Label only if zoomed in or hovered/selected
            // Simplistic LOD: always show for now, but style it better
            const label = node.name;
            const fontSize = 14 / globalScale;
            ctx.font = `600 ${fontSize}px "Inter", sans-serif`; // Use a nice font

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text Shadow for readability without box
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.lineWidth = 3 / globalScale;
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.strokeText(label, node.x, node.y + size + fontSize);

            ctx.fillStyle = isSelected ? '#60A5FA' : 'white';
            ctx.fillText(label, node.x, node.y + size + fontSize);

            ctx.shadowBlur = 0; // Reset again for other elements
          }}
          linkColor={link => {
            // Helper for alpha
            const hexToRgba = (hex, alpha) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };

            if (link.category === 2) return 'rgba(147, 51, 234, 0.85)'; // Purple, very bright
            if (link.category === 3) return 'rgba(234, 179, 8, 0.65)';  // Yellow, bright

            // Cat 1: dampen the "glow"
            const color = relColors[link.type] || '#64748B';
            return hexToRgba(color, 0.6); // Slightly transparent to kill neon glow
          }}
          linkWidth={link => {
            if (link.category === 1) return 2;
            if (link.category === 2) return 1.5;
            return 1;
          }}
          linkLineDash={link => {
            if (link.category === 2) return [8, 3]; // More solid
            if (link.category === 3) return [4, 4]; // Distinct dots
            return null;
          }}
          backgroundColor="rgba(0,0,0,0)"
          cooldownTicks={100}
          enableNodeDrag={false}
          onEngineStop={() => {
            if (!hasZoomedOnce && graphRef.current) {
              graphRef.current.zoomToFit(400, 50);
              setHasZoomedOnce(true);
            }
          }}
        />
      </div>

      {/* RIGHT SIDEBAR - PROFILE */}
      {selected && (
        <div className="fixed bottom-0 left-0 w-full md:top-0 md:right-0 md:left-auto md:w-[350px] md:h-screen bg-[#0a0a0a]/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 p-6 z-50 transition-all duration-300 shadow-2xl rounded-t-3xl md:rounded-none md:rounded-l-3xl max-h-[80vh] md:max-h-screen overflow-y-auto pt-16 md:pt-6">
          <button
            onClick={() => setSelected(null)}
            style={{
              float: 'right',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '8px 15px',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              marginLeft: 10
            }}
          >
            ✕ Close
          </button>

          <button
            onClick={() => handleDelete(selected)}
            style={{
              float: 'right',
              background: deleteConfirmation ? 'rgba(220, 38, 38, 0.4)' : 'rgba(239, 68, 68, 0.2)',
              border: deleteConfirmation ? '1px solid #EF4444' : '1px solid rgba(239, 68, 68, 0.5)',
              color: deleteConfirmation ? '#FECACA' : '#FCA5A5',
              padding: '8px 15px',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: deleteConfirmation ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            <Trash2 size={14} /> {deleteConfirmation ? 'Are you sure?' : 'Delete'}
          </button>

          <div style={{ clear: 'both', marginTop: 40, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {selected.emoji && <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 35 }}>{selected.emoji}</span>}
              <img
                src={selected.img || `https://api.dicebear.com/7.x/initials/svg?seed=${selected.name}`}
                style={{ width: 120, height: 120, borderRadius: '50%', border: '4px solid #3B82F6', boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
                alt={selected.name}
              />
            </div>

            <h2 style={{ margin: '15px 0 5px', fontSize: 28, fontWeight: 'bold' }}>{selected.name}</h2>
            {selected.vibe && <p style={{ color: '#60A5FA', fontSize: 13, margin: '5px 0', background: 'rgba(59, 130, 246, 0.2)', padding: '6px 15px', borderRadius: 20, display: 'inline-block' }}>{selected.vibe}</p>}

            {selected.bio && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <p style={{ color: '#ccc', fontSize: 14, fontStyle: 'italic', padding: 15, background: 'rgba(255,255,255,0.05)', borderRadius: 10, lineHeight: 1.6 }}>
                  "{selected.bio}"
                </p>
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selected.birthday && (
                <div style={{ fontSize: 14, color: '#aaa', padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  🎂 {new Date(selected.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}
              {selected.location && (
                <div style={{ fontSize: 14, color: '#aaa', padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  📍 {selected.location}
                </div>
              )}
            </div>

            {(selected.instagram || selected.twitter) && (
              <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selected.instagram && (
                  <a
                    href={`https://instagram.com/${selected.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#EC4899',
                      textDecoration: 'none',
                      background: 'rgba(236, 72, 153, 0.15)',
                      padding: 12,
                      borderRadius: 8,
                      display: 'block',
                      textAlign: 'center',
                      fontWeight: 500,
                      border: '1px solid rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    📸 @{selected.instagram}
                  </a>
                )}
                {selected.twitter && (
                  <a
                    href={`https://twitter.com/${selected.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#3B82F6',
                      textDecoration: 'none',
                      background: 'rgba(59, 130, 246, 0.15)',
                      padding: 12,
                      borderRadius: 8,
                      display: 'block',
                      textAlign: 'center',
                      fontWeight: 500,
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    🐦 @{selected.twitter}
                  </a>
                )}
              </div>
            )}

            <div style={{ marginTop: 25, textAlign: 'left' }}>
              <h3 style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 15 }}>
                Connections ({links.filter(l => (l.source?.id || l.source) === selected.id || (l.target?.id || l.target) === selected.id).length})
              </h3>

              {links.filter(l => (l.source?.id || l.source) === selected.id || (l.target?.id || l.target) === selected.id).map((link, i) => {
                const sId = link.source?.id || link.source;
                const otherId = sId === selected.id ? (link.target?.id || link.target) : sId;
                const other = nodes.find(n => n.id === otherId);
                return (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderLeft: `4px solid ${relColors[link.type] || '#64748B'}`,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelected(other)}
                  >
                    <img src={other?.img || `https://api.dicebear.com/7.x/initials/svg?seed=${other?.name}`} style={{ width: 30, height: 30, borderRadius: '50%' }} alt={other?.name} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{other?.name || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: '#888', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 4 }}>
                      {link.type?.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}

              {links.filter(l => (l.source?.id || l.source) === selected.id || (l.target?.id || l.target) === selected.id).length === 0 && (
                <p style={{ color: '#666', textAlign: 'center', padding: 20, fontSize: 14, fontStyle: 'italic' }}>No connections yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphView;