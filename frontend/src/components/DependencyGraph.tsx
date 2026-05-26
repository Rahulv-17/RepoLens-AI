import { useEffect, useRef, useState, useCallback } from 'react';
import { type Node, type Edge } from '@xyflow/react';

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface DependencyGraphProps {
  graphData: GraphData | null;
}

interface CanvasNode {
  id: string;
  name: string;
  type: 'Entry' | 'Service' | 'Utility';
  ext: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  incoming: number;
  outgoing: number;
}

interface CanvasEdge {
  source: string;
  target: string;
}

interface SelectedNodeInfo {
  name: string;
  type: string;
  ext: string;
  incoming: number;
  outgoing: number;
  x: number;
  y: number;
}

const THEME = {
  Entry:      '#00f0ff',
  Service:    '#d0bcff',
  Utility:    '#849495',
  background: '#050a0a',
  surface:    '#121a1b',
};

function getNodeType(node: Node): CanvasNode['type'] {
  const id = (node.id || '').toLowerCase();
  if (id.includes('main') || id.includes('index') || id.includes('app')) return 'Entry';
  if (id.includes('service') || id.includes('api') || id.includes('controller') || id.includes('model')) return 'Service';
  return 'Utility';
}

function getExt(id: string): string {
  const parts = id.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase().substring(0, 2) : 'JS';
}

function buildCanvasData(graphData: GraphData, width: number, height: number): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.32;
  const n = graphData.nodes.length;

  const nodeMap = new Map<string, CanvasNode>();

  graphData.nodes.forEach((gn, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const spread = n === 1 ? 0 : r;
    const name = (gn.data?.label as string) || gn.id.split('/').pop() || gn.id;
    nodeMap.set(gn.id, {
      id: gn.id,
      name,
      type: getNodeType(gn),
      ext: getExt(gn.id),
      x: cx + (Math.random() - 0.5) * spread * 3,
      y: cy + (Math.random() - 0.5) * spread * 3,
      vx: 0,
      vy: 0,
      radius: 20,
      incoming: 0,
      outgoing: 0,
    });
  });

  const edges: CanvasEdge[] = graphData.edges.map(e => {
    const src = nodeMap.get(e.source);
    const tgt = nodeMap.get(e.target);
    if (src) src.outgoing++;
    if (tgt) tgt.incoming++;
    return { source: e.source, target: e.target };
  });

  // Filter out unimportant disconnected nodes
  const importantNodes = Array.from(nodeMap.values()).filter(n => n.incoming > 0 || n.outgoing > 0);

  // Boost size for highly connected nodes
  importantNodes.forEach(n => {
    n.radius = 18 + Math.min(n.incoming + n.outgoing, 10) * 1.5;
    if (n.type === 'Entry') n.radius += 4;
  });

  return { nodes: importantNodes, edges };
}

export function DependencyGraph({ graphData }: DependencyGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const physicsRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const nodesRef = useRef<CanvasNode[]>([]);
  const edgesRef = useRef<CanvasEdge[]>([]);
  const transformRef = useRef({ x: 0, y: 0, scale: 0.85 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef<CanvasNode | null>(null);
  const selectedRef = useRef<CanvasNode | null>(null);
  const searchRef = useRef('');

  const [selectedInfo, setSelectedInfo] = useState<SelectedNodeInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dims, setDims] = useState({ w: 800, h: 500 });

  const getNodeAt = useCallback((mouseX: number, mouseY: number) => {
    const t = transformRef.current;
    const { w, h } = dims;
    const wx = (mouseX - w / 2 - t.x) / t.scale + w / 2;
    const wy = (mouseY - h / 2 - t.y) / t.scale + h / 2;
    return nodesRef.current.find(n => Math.hypot(n.x - wx, n.y - wy) < n.radius + 12) ?? null;
  }, [dims]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = dims;
    const dpr = window.devicePixelRatio || 1;
    const t = transformRef.current;
    const hovered = hoveredRef.current;
    const selected = selectedRef.current;
    const search = searchRef.current;

    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(w / 2 + t.x, h / 2 + t.y);
    ctx.scale(t.scale, t.scale);
    ctx.translate(-w / 2, -h / 2);

    // ── Handle Empty State ──
    if (nodesRef.current.length === 0) {
      ctx.fillStyle = '#849495';
      ctx.font = '500 16px Geist, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No dependency connections detected.', w / 2, h / 2);
      ctx.fillStyle = '#4f5d5e';
      ctx.font = '400 13px Geist, sans-serif';
      ctx.fillText('Try deleting the scan from the dashboard and re-scanning the repo!', w / 2, h / 2 + 24);
      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
      return;
    }

    // ── Draw Edges ──
    edgesRef.current.forEach(edge => {
      const s = nodesRef.current.find(n => n.id === edge.source);
      const tg = nodesRef.current.find(n => n.id === edge.target);
      if (!s || !tg) return;

      const isRelated = (selected && (selected.id === s.id || selected.id === tg.id)) ||
                        (hovered && (hovered.id === s.id || hovered.id === tg.id));

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      const cp1x = s.x + (tg.x - s.x) / 2;
      const cp2x = cp1x;
      ctx.bezierCurveTo(cp1x, s.y, cp2x, tg.y, tg.x, tg.y);

      const grad = ctx.createLinearGradient(s.x, s.y, tg.x, tg.y);
      if (isRelated) {
        grad.addColorStop(0, 'rgba(0,240,255,0.35)');
        grad.addColorStop(1, 'rgba(0,240,255,0.05)');
      } else {
        grad.addColorStop(0, 'rgba(255,255,255,0.04)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = isRelated ? 1.2 : 0.7;
      ctx.stroke();
    });

    // ── Draw Nodes ──
    nodesRef.current.forEach(node => {
      const isSelected = selected?.id === node.id;
      const isHovered = hovered?.id === node.id;
      const isMatch = search && node.name.toLowerCase().includes(search);
      const active = isSelected || isHovered || isMatch;

      ctx.save();
      ctx.translate(node.x, node.y);

      // Glow halo
      if (active) {
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, node.radius + 28);
        glow.addColorStop(0, isSelected ? 'rgba(0,240,255,0.18)' : 'rgba(255,255,255,0.06)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, node.radius + 28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pill shape
      const pw = 112, ph = 36, pr = 10;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-pw / 2, -ph / 2, pw, ph, pr);
      } else {
        const x = -pw / 2, y = -ph / 2;
        ctx.moveTo(x + pr, y);
        ctx.lineTo(x + pw - pr, y);
        ctx.quadraticCurveTo(x + pw, y, x + pw, y + pr);
        ctx.lineTo(x + pw, y + ph - pr);
        ctx.quadraticCurveTo(x + pw, y + ph, x + pw - pr, y + ph);
        ctx.lineTo(x + pr, y + ph);
        ctx.quadraticCurveTo(x, y + ph, x, y + ph - pr);
        ctx.lineTo(x, y + pr);
        ctx.quadraticCurveTo(x, y, x + pr, y);
        ctx.closePath();
      }

      ctx.fillStyle = active ? 'rgba(25,33,34,0.97)' : 'rgba(13,21,21,0.72)';
      ctx.fill();

      ctx.strokeStyle = isSelected ? 'rgba(0,240,255,0.55)' :
                        isHovered  ? 'rgba(255,255,255,0.28)' :
                        isMatch    ? 'rgba(0,240,255,0.35)' :
                                     'rgba(255,255,255,0.07)';
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.stroke();

      // Type dot
      ctx.beginPath();
      ctx.arc(-pw / 2 + 18, 0, 9, 0, Math.PI * 2);
      ctx.fillStyle = THEME[node.type];
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Ext label
      ctx.fillStyle = '#050a0a';
      ctx.font = 'bold 7px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.ext.substring(0, 2), -pw / 2 + 18, 0.5);

      // Node name
      if (t.scale > 0.5 || active) {
        ctx.fillStyle = active ? '#ffffff' : 'rgba(220,228,229,0.45)';
        ctx.font = active ? '600 11px Geist, sans-serif' : '400 10px Geist, sans-serif';
        ctx.textAlign = 'left';
        const label = node.name.length > 14 ? node.name.substring(0, 13) + '…' : node.name;
        ctx.fillText(label, -pw / 2 + 34, 1);
      }

      ctx.restore();
    });

    ctx.restore();
    animRef.current = requestAnimationFrame(draw);
  }, [dims]);

  const runPhysics = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const { w, h } = dims;

    nodes.forEach(n1 => {
      // Repulsion
      nodes.forEach(n2 => {
        if (n1.id === n2.id) return;
        const dx = n1.x - n2.x, dy = n1.y - n2.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const minD = Math.max(60, 250 - nodes.length);
        if (dist < minD) {
          const force = (minD - dist) / 700;
          n1.vx += (dx / dist) * force;
          n1.vy += (dy / dist) * force;
        }
      });

      // Attraction along edges
      edges.forEach(e => {
        if (e.source !== n1.id && e.target !== n1.id) return;
        const other = nodes.find(n => n.id === (e.source === n1.id ? e.target : e.source));
        if (!other) return;
        const dx = other.x - n1.x, dy = other.y - n1.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const idealDist = 220;
        const force = (dist - idealDist) / 2000;
        n1.vx += (dx / dist) * force;
        n1.vy += (dy / dist) * force;
      });

      // Center pull
      n1.vx += (w / 2 - n1.x) * 0.00015;
      n1.vy += (h / 2 - n1.y) * 0.00015;

      n1.x += n1.vx;
      n1.y += n1.vy;
      n1.vx *= 0.82;
      n1.vy *= 0.82;
    });

    physicsRef.current = setTimeout(runPhysics, 16);
  }, [dims]);

  // Resize handler
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const el = entries[0];
      if (el) {
        const { width, height } = el.contentRect;
        setDims({ w: Math.max(width, 400), h: Math.max(height, 400) });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Init / re-init when graphData changes
  useEffect(() => {
    if (!graphData) return;
    const { nodes, edges } = buildCanvasData(graphData, dims.w, dims.h);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [graphData, dims]);

  // Canvas DPR sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width = dims.w + 'px';
    canvas.style.height = dims.h + 'px';
  }, [dims]);

  // Start animation + physics
  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    runPhysics();
    return () => {
      cancelAnimationFrame(animRef.current);
      if (physicsRef.current) clearTimeout(physicsRef.current);
    };
  }, [draw, runPhysics]);

  // Mouse handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const found = getNodeAt(mx, my);
    if (found) {
      selectedRef.current = found;
      setSelectedInfo({ name: found.name, type: found.type, ext: found.ext, incoming: found.incoming, outgoing: found.outgoing, x: e.clientX, y: e.clientY });
    } else {
      selectedRef.current = null;
      setSelectedInfo(null);
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [getNodeAt]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    hoveredRef.current = getNodeAt(mx, my);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveredRef.current ? 'pointer' : isDraggingRef.current ? 'grabbing' : 'grab';
    }
    if (isDraggingRef.current) {
      transformRef.current.x += e.clientX - lastMouseRef.current.x;
      transformRef.current.y += e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [getNodeAt]);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.93 : 1.07;
    transformRef.current.scale = Math.min(Math.max(transformRef.current.scale * delta, 0.15), 3.5);
  }, []);

  const recenter = () => { transformRef.current = { x: 0, y: 0, scale: 0.85 }; };

  const zoomIn = () => { transformRef.current.scale = Math.min(transformRef.current.scale * 1.2, 3.5); };
  const zoomOut = () => { transformRef.current.scale = Math.max(transformRef.current.scale * 0.83, 0.15); };

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="w-full h-full min-h-96 flex flex-col items-center justify-center text-center rounded-2xl"
        style={{ border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(8,15,16,0.6)' }}>
        <span className="material-symbols-outlined text-4xl mb-3" style={{ color: '#849495' }}>hub</span>
        <p style={{ color: '#849495', fontSize: '14px' }}>No dependency data available.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{ background: '#050a0a', border: '1px solid rgba(255,255,255,0.06)', minHeight: '500px' }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 fine-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 dot-overlay pointer-events-none" />

      {/* Canvas */}
      <canvas ref={canvasRef}
        style={{ width: '100%', height: '100%', cursor: 'grab', display: 'block' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      />

      {/* ── Floating Search ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <div className="glass-panel-heavy rounded-2xl px-5 py-2.5 flex items-center gap-3 transition-all"
          onFocusCapture={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08), 0 4px 24px rgba(0,0,0,0.5)')}
          onBlurCapture={e => ((e.currentTarget as HTMLElement).style.boxShadow = '')}
        >
          <span className="material-symbols-outlined text-lg" style={{ color: 'rgba(0,240,255,0.5)' }}>filter_list</span>
          <input
            type="text"
            placeholder="Filter by module or file extension..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); searchRef.current = e.target.value.toLowerCase(); }}
            className="bg-transparent border-none outline-none flex-1 text-sm"
            style={{ color: '#dce4e5', fontFamily: 'Inter, sans-serif' }}
          />
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '10px', color: 'rgba(132,148,149,0.4)', fontFamily: 'monospace' }}>MAP VIEW</span>
          </div>
        </div>
      </div>

      {/* ── Zoom Controls ── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
        <div className="glass-panel-heavy rounded-2xl p-1.5 flex flex-col gap-0.5"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { icon: 'add', action: zoomIn, title: 'Zoom In' },
            { icon: 'remove', action: zoomOut, title: 'Zoom Out' },
          ].map((btn, i) => (
            <div key={btn.icon}>
              {i === 1 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2px 8px' }} />}
              <button
                onClick={btn.action}
                title={btn.title}
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                style={{ color: '#849495' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#00f0ff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#849495';
                }}
              >
                <span className="material-symbols-outlined">{btn.icon}</span>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={recenter}
          title="Recenter Map"
          className="w-10 h-10 glass-panel-heavy flex items-center justify-center rounded-2xl transition-all"
          style={{ color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.1)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
        >
          <span className="material-symbols-outlined">filter_center_focus</span>
        </button>
      </div>

      {/* ── Legend Panel ── */}
      <div className="absolute bottom-6 left-6 glass-panel-heavy rounded-2xl p-5 w-72 z-20 overflow-hidden">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(to right, rgba(0,240,255,0.4), transparent)' }} />
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#dce4e5', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Geist, sans-serif' }}>
            Graph Overview
          </h3>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', fontSize: '9px', color: '#00f0ff', fontWeight: 700, fontFamily: 'Geist, sans-serif', letterSpacing: '0.08em' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00f0ff' }} />
            LIVE
          </span>
        </div>

        <div className="space-y-2.5 mb-4">
          {[
            { color: THEME.Entry, label: 'Entry Points', count: nodesRef.current.filter(n => n.type === 'Entry').length },
            { color: THEME.Service, label: 'Services', count: nodesRef.current.filter(n => n.type === 'Service').length },
            { color: THEME.Utility, label: 'Utilities', count: nodesRef.current.filter(n => n.type === 'Utility').length },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                <span style={{ fontSize: '12px', color: '#b9cacb', fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
              </div>
              <span style={{ fontSize: '10px', color: '#849495', fontFamily: 'JetBrains Mono, monospace' }}>
                {String(item.count).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { label: 'Nodes', value: nodesRef.current.length },
            { label: 'Edges', value: edgesRef.current.length },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: '#849495', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#dce4e5', fontFamily: 'Geist, sans-serif' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Node Info HUD ── */}
      {selectedInfo && (
        <div
          className="absolute z-30 glass-panel-heavy rounded-3xl overflow-hidden"
          style={{ top: '24px', right: '24px', width: '280px', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(0,240,255,0.5), rgba(208,188,255,0.3), transparent)' }} />
          <div className="p-5" style={{ background: 'rgba(35,43,44,0.5)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(8,15,16,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: '#00f0ff' }}>description</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#dce4e5', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedInfo.name}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Geist, sans-serif' }}>
                    {selectedInfo.type}
                  </span>
                </div>
              </div>
              <button onClick={() => { setSelectedInfo(null); selectedRef.current = null; }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#849495' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Dependants', value: selectedInfo.incoming },
                { label: 'Dependencies', value: selectedInfo.outgoing },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-2.5"
                  style={{ background: 'rgba(8,15,16,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '9px', color: '#849495', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#dce4e5', fontFamily: 'Geist, sans-serif' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="p-3 rounded-xl"
              style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm" style={{ color: '#00f0ff', fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <span style={{ fontSize: '9px', color: '#00f0ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Geist, sans-serif' }}>AI Intelligence</span>
              </div>
              <p style={{ fontSize: '11px', color: '#b9cacb', lineHeight: 1.5 }}>
                {selectedInfo.incoming > 5
                  ? `High coupling detected. Refactoring recommended to improve test isolation.`
                  : selectedInfo.outgoing > 5
                  ? `This module has many dependencies. Consider splitting into smaller units.`
                  : `This module appears well-scoped with manageable coupling.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
