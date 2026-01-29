import React, { useState, useRef, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { supabase } from '../supabase';
import { Trash2, Menu, X } from 'lucide-react';

const GraphView = ({ nodes, links, onRefresh, session }) => {
  const [selected, setSelected] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [sidebarPeople, setSidebarPeople] = useState([]);
  const graphRef = useRef();
  const imageCache = useRef({});
  const isMobile = windowSize.width < 768;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Auto-open sidebar on desktop, auto-close on mobile
      if (width >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset delete confirmation when selection changes
  useEffect(() => {
    setDeleteConfirmation(false);
  }, [selected]);

  // Preload images
  useEffect(() => {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        if (imageCache.current[src]) {
          resolve(imageCache.current[src]);
          return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCache.current[src] = img;
          resolve(img);
        };
        img.onerror = () => {
          // Still cache even on error so we don't keep trying
          imageCache.current[src] = img;
          resolve(img);
        };
        img.src = src;
      });
    };

    const loadAllImages = async () => {
      const promises = nodes.map(node => {
        const imgSrc = node.img || `https://api.dicebear.com/7.x/initials/svg?seed=${node.name}`;
        return loadImage(imgSrc);
      });

      try {
        await Promise.all(promises);
        // Force a re-render after images are loaded
        if (graphRef.current) {
          graphRef.current.refresh();
        }
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadAllImages();
  }, [nodes]);

  // Update sidebar people with stagger animation
  useEffect(() => {
    setSidebarPeople(nodes.map((n, i) => ({ ...n, staggerDelay: i * 50 })));
  }, [nodes]);

  // Configure Physics
  useEffect(() => {
    if (graphRef.current) {
      // Physics disabled for fixed Circular Layout
      graphRef.current.d3Force('charge', null);
      graphRef.current.d3Force('link', null);
      graphRef.current.d3Force('center', null);
    }
  }, [nodes.length]);

  const relColors = {
    lover: '#EF4444',
    friend: '#3B82F6',
    colleague: '#EAB308',
    acquaintance: '#64748B'
  };

  const handleDelete = async (person) => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      return;
    }

    console.log('Attempting to delete:', person.name);
    console.log('Deleting relationships for:', person.id);

    const { error: relError } = await supabase
      .from('relationships')
      .delete()
      .or(`source.eq.${person.id},target.eq.${person.id}`);

    if (relError) {
      console.error('Error deleting relationships:', relError);
    }

    console.log('Deleting profile:', person.id);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', person.id);

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

  // Calculate graph dimensions
  const leftSidebarWidth = isMobile ? 0 : (isSidebarOpen ? 250 : 0);
  const rightSidebarWidth = isMobile ? 0 : (selected ? 350 : 0);
  const graphWidth = windowSize.width - leftSidebarWidth - rightSidebarWidth;
  const graphHeight = windowSize.height;

  // Memoize graph data to prevent recalculation on mobile
  const graphData = useMemo(() => {
    const count = nodes.length;
    const minDim = Math.min(windowSize.width, windowSize.height);
    const layoutRadius = Math.max(120, minDim * 0.3);

    return {
      nodes: nodes.map((node, i) => {
        const angle = (i / count) * 2 * Math.PI;
        return {
          ...node,
          x: layoutRadius * Math.cos(angle),
          y: layoutRadius * Math.sin(angle),
          val: isMobile ? 10 : 14
        };
      }),
      links: links.map(link => ({ ...link }))
    };
  }, [nodes, links, windowSize.width, windowSize.height]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#050505',
      position: 'relative',
      display: 'flex',
      overflow: 'hidden'
    }}>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 60,
          background: 'rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          padding: 10,
          borderRadius: 8,
          cursor: 'pointer',
          display: isMobile || !isSidebarOpen ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* LEFT SIDEBAR - PEOPLE LIST */}
      <div style={{
        width: isMobile ? '85vw' : 250,
        maxWidth: isMobile ? 320 : 250,
        background: 'rgba(0,0,0,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        padding: 20,
        overflowY: 'auto',
        zIndex: 55,
        position: isMobile ? 'fixed' : 'relative',
        height: '100%',
        left: 0,
        top: 0,
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: isMobile && isSidebarOpen ? '2px 0 10px rgba(0,0,0,0.5)' : 'none'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15,
          borderBottom: '2px solid #3B82F6',
          paddingBottom: 10
        }}>
          <h2 style={{ color: 'white', fontSize: 18, margin: 0, fontWeight: 600 }}>
            People ({nodes.length})
          </h2>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 5
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {sidebarPeople.map((node, index) => (
          <div
            key={node.id}
            onClick={() => {
              setSelected(node);
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="animate-slide-up-stagger"
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
              gap: 10,
              animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
              opacity: 0,
              animationFillMode: 'forwards'
            }}
            onMouseEnter={!isMobile ? (e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.transform = 'translateX(5px)';
            } : undefined}
            onMouseLeave={!isMobile ? (e) => {
              e.currentTarget.style.background = selected?.id === node.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateX(0)';
            } : undefined}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={node.img || `https://api.dicebear.com/7.x/initials/svg?seed=${node.name}`}
                style={{ width: 35, height: 35, borderRadius: '50%', objectFit: 'cover' }}
                alt={node.name}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {node.name}
              </div>
              {node.vibe && (
                <div style={{
                  color: '#888',
                  fontSize: 11,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {node.vibe}
                </div>
              )}
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
          <h3 style={{
            color: '#888',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 12,
            fontWeight: 600
          }}>
            Bond Types
          </h3>
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
      <div style={{
        flex: 1,
        position: 'relative',
        width: graphWidth,
        height: graphHeight,
        background: 'radial-gradient(circle at center, #0a0a1a 0%, #050505 100%)',
        zIndex: 10
      }}>
        {graphData && graphData.nodes && graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            width={graphWidth}
            height={graphHeight}
            graphData={graphData}
            nodeLabel="name"
            nodeAutoColorBy="id"
            nodeRelSize={15}
            nodeCanvasObjectMode={() => 'replace'}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const size = 15;
              const isSelected = selected?.id === node.id;

              try {
                if (isSelected) {
                  ctx.shadowColor = '#60A5FA';
                  ctx.shadowBlur = 20;
                } else {
                  ctx.shadowColor = 'transparent';
                  ctx.shadowBlur = 0;
                }

                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = isSelected ? '#1e293b' : '#0f172a';
                ctx.fill();

                ctx.shadowBlur = 0;

                // Draw image
                const imgSrc = node.img || `https://api.dicebear.com/7.x/initials/svg?seed=${node.name}`;
                const img = imageCache.current[imgSrc];

                if (img) {
                  ctx.save();
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                  ctx.clip();
                  try {
                    ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
                  } catch (e) {
                    // Image draw failed, show colored circle
                  }
                  ctx.restore();
                }

                // Draw border
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.lineWidth = (isSelected ? 3 : 2) / globalScale;
                ctx.strokeStyle = isSelected ? '#60A5FA' : 'rgba(255,255,255,0.3)';
                ctx.stroke();

                // Draw label
                const label = node.name;
                const fontSize = 14 / globalScale;
                ctx.font = `600 ${fontSize}px "Inter", sans-serif`;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isSelected ? '#60A5FA' : 'white';
                ctx.fillText(label, node.x, node.y + size + fontSize);
              } catch (e) {
                console.error('Canvas rendering error:', e);
              }
            }}
            linkColor={link => {
              const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              };

              if (link.category === 2) return 'rgba(147, 51, 234, 0.85)';
              if (link.category === 3) return 'rgba(234, 179, 8, 0.65)';

              const color = relColors[link.type] || '#64748B';
              return hexToRgba(color, 0.6);
            }}
            linkWidth={link => {
              if (link.category === 1) return 2;
              if (link.category === 2) return 1.5;
              return 1;
            }}
            linkLineDash={link => {
              if (link.category === 2) return [8, 3];
              if (link.category === 3) return [4, 4];
              return null;
            }}
            backgroundColor="rgba(0,0,0,0)"
            cooldownTicks={0}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            minZoom={0.1}
            maxZoom={5}
            onNodeClick={(node) => {
              setSelected(node);
              if (isMobile) setIsSidebarOpen(false);
            }}
            onNodeRightClick={() => false}
            onBackgroundClick={() => {
              setSelected(null);
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No people in the network yet</p>
            <p style={{ fontSize: '14px' }}>Add people using the Admin panel</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR - PROFILE */}
      {selected && (
        <div
          className="animate-fade-scale-in"
          style={{
            position: 'fixed',
            bottom: isMobile ? 0 : 'auto',
            top: isMobile ? 'auto' : 0,
            right: 0,
            left: isMobile ? 0 : 'auto',
            width: isMobile ? '100%' : 350,
            height: isMobile ? 'auto' : '100vh',
            maxHeight: isMobile ? '85vh' : '100vh',
            background: 'rgba(10, 10, 10, 0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
            padding: isMobile ? '20px 20px 30px' : 24,
            zIndex: 1000,
            overflowY: 'auto',
            borderRadius: isMobile ? '24px 24px 0 0' : 0,
            boxShadow: isMobile ? '0 -4px 20px rgba(0,0,0,0.5)' : 'none',
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginBottom: 20
          }}>
            {session && (
              <button
                onClick={() => handleDelete(selected)}
                style={{
                  background: deleteConfirmation ? 'rgba(220, 38, 38, 0.4)' : 'rgba(239, 68, 68, 0.2)',
                  border: deleteConfirmation ? '1px solid #EF4444' : '1px solid rgba(239, 68, 68, 0.5)',
                  color: deleteConfirmation ? '#FECACA' : '#FCA5A5',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: deleteConfirmation ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                <Trash2 size={14} /> {deleteConfirmation ? 'Sure?' : 'Delete'}
              </button>
            )}

            <button
              onClick={() => setSelected(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 15 }}>
              {selected.emoji && (
                <span
                  className="animate-float"
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    fontSize: isMobile ? 28 : 35,
                    zIndex: 1
                  }}
                >
                  {selected.emoji}
                </span>
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                  animation: 'pulse-glow 2s infinite',
                  zIndex: 0
                }}
              />
              <img
                src={selected.img || `https://api.dicebear.com/7.x/initials/svg?seed=${selected.name}`}
                style={{
                  width: isMobile ? 100 : 120,
                  height: isMobile ? 100 : 120,
                  borderRadius: '50%',
                  border: '4px solid #3B82F6',
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
                  objectFit: 'cover',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.3s ease'
                }}
                alt={selected.name}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>

            <h2 style={{
              margin: '10px 0 5px',
              fontSize: isMobile ? 24 : 28,
              fontWeight: 'bold',
              color: 'white'
            }}>
              {selected.name}
            </h2>

            {selected.vibe && (
              <p style={{
                color: '#60A5FA',
                fontSize: 12,
                margin: '8px 0',
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '6px 15px',
                borderRadius: 20,
                display: 'inline-block',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                {selected.vibe}
              </p>
            )}

            {selected.bio && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <p style={{
                  color: '#ccc',
                  fontSize: 13,
                  fontStyle: 'italic',
                  padding: 15,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  lineHeight: 1.6,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  "{selected.bio}"
                </p>
              </div>
            )}

            <div style={{
              marginTop: 20,
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              {selected.birthday && (
                <div style={{
                  fontSize: 13,
                  color: '#aaa',
                  padding: 10,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  🎂 {new Date(selected.birthday).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              )}
              {selected.location && (
                <div style={{
                  fontSize: 13,
                  color: '#aaa',
                  padding: 10,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  📍 {selected.location}
                </div>
              )}
            </div>

            {(selected.instagram || selected.twitter) && (
              <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      fontSize: 13,
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      transition: 'all 0.2s'
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
                      fontSize: 13,
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    🐦 @{selected.twitter}
                  </a>
                )}
              </div>
            )}

            <div style={{ marginTop: 25, textAlign: 'left' }}>
              <h3 style={{
                fontSize: 11,
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: 2,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 10,
                marginBottom: 15,
                fontWeight: 600
              }}>
                Connections ({links.filter(l =>
                  (l.source?.id || l.source) === selected.id ||
                  (l.target?.id || l.target) === selected.id
                ).length})
              </h3>

              {links.filter(l =>
                (l.source?.id || l.source) === selected.id ||
                (l.target?.id || l.target) === selected.id
              ).map((link, i) => {
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
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderLeft: `4px solid ${relColors[link.type] || '#64748B'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                    onClick={() => setSelected(other)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <img
                      src={other?.img || `https://api.dicebear.com/7.x/initials/svg?seed=${other?.name}`}
                      style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                      alt={other?.name}
                    />
                    <span style={{ flex: 1, fontWeight: 500, color: 'white' }}>
                      {other?.name || 'Unknown'}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: '#888',
                      background: 'rgba(0,0,0,0.4)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      textTransform: 'capitalize'
                    }}>
                      {link.type?.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}

              {links.filter(l =>
                (l.source?.id || l.source) === selected.id ||
                (l.target?.id || l.target) === selected.id
              ).length === 0 && (
                  <p style={{
                    color: '#666',
                    textAlign: 'center',
                    padding: 20,
                    fontSize: 13,
                    fontStyle: 'italic'
                  }}>
                    No connections yet
                  </p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 54
          }}
        />
      )}
    </div>
  );
};

export default GraphView;