
import React, { useState, useMemo } from 'react';
import { X, Book, Film, MapPin, Users, Calendar } from 'lucide-react';
import { KinbakushiNode, KinbakushiEdge } from '../types';
import { INITIAL_KINBAKUSHI_NODES, INITIAL_KINBAKUSHI_EDGES } from '../constants';

interface KinbakushiModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ru' | 'en';
  t: any;
}

// Internal interface for calculated layout
interface LayoutNode extends KinbakushiNode {
  x: number;
  y: number;
  colIndex: number;
}

const COLUMN_WIDTH = 280;
const COLUMN_GAP = 100;
const CARD_HEIGHT = 90;
const CARD_GAP = 20;
const HEADER_HEIGHT = 80;
const PADDING_X = 40;
const PADDING_Y = 40;

const ERAS_KEYS = [
    'pre_1800', 
    '1800s', 
    '1900s', 
    '1950s', 
    '1970s', 
    '1980s', 
    '1990s', 
    '2000s'
];

const TRANSLATIONS = {
  ru: {
    graph_view: "Граф",
    legend_direct: "Прямая связь",
    legend_influence: "Влияние",
    legend_work: "Авторство",
    eras: {
      pre_1800: "До 1800 / Эдо",
      '1800s': "1800-е",
      '1900s': "1900 - 1940",
      '1950s': "1950-е",
      '1970s': "1970-е",
      '1980s': "1980-е",
      '1990s': "1990-е",
      '2000s': "2000-е / Сейчас"
    } as Record<string, string>,
    types: {
      concept: "Концепт",
      era_context: "Контекст",
      work: "Произведение",
      magazine: "Журнал",
      group: "Группа",
      'genre/studio': "Жанр/Студия",
      person: "Персона",
      place: "Место",
      master: "Мастер"
    } as Record<string, string>
  },
  en: {
    graph_view: "Graph View",
    legend_direct: "Direct",
    legend_influence: "Influence",
    legend_work: "Work",
    eras: {
      pre_1800: "Pre-1800 / Edo",
      '1800s': "1800s",
      '1900s': "1900s - 1940s",
      '1950s': "1950s",
      '1970s': "1970s",
      '1980s': "1980s",
      '1990s': "1990s",
      '2000s': "2000s / Current"
    } as Record<string, string>,
    types: {
      concept: "Concept",
      era_context: "Context",
      work: "Work",
      magazine: "Magazine",
      group: "Group",
      'genre/studio': "Genre/Studio",
      person: "Person",
      place: "Place",
      master: "Master"
    } as Record<string, string>
  }
};

const getEraIndex = (eraString?: string): number => {
    if (!eraString) return 0;
    const lower = eraString.toLowerCase();
    if (lower.includes('1600') || lower.includes('pre')) return 0;
    if (lower.includes('1800')) return 1;
    if (lower.includes('1900')) return 2;
    if (lower.includes('1950')) return 3;
    if (lower.includes('1970')) return 4;
    if (lower.includes('1980')) return 5;
    if (lower.includes('1990')) return 6;
    if (lower.includes('2000') || lower.includes('current')) return 7;
    return 0; // Fallback
};

const KinbakushiModal: React.FC<KinbakushiModalProps> = ({ isOpen, onClose, lang, t }) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const T = TRANSLATIONS[lang];

  // --- Calculate Layout (Memoized) ---
  const { layoutNodes, containerWidth, containerHeight } = useMemo(() => {
      const nodesByColumn: LayoutNode[][] = Array(ERAS_KEYS.length).fill(null).map(() => []);
      
      // 1. Group nodes into columns
      INITIAL_KINBAKUSHI_NODES.forEach(node => {
          const colIndex = getEraIndex(node.era);
          const newNode: LayoutNode = { ...node, x: 0, y: 0, colIndex };
          nodesByColumn[colIndex].push(newNode);
      });

      // 2. Assign X and Y coordinates
      const calculatedNodes: LayoutNode[] = [];
      let maxRows = 0;

      nodesByColumn.forEach((columnNodes, colIndex) => {
          // Sort nodes within column
          columnNodes.sort((a, b) => {
              // Put people first, then places, then works
              const typeScore = (type?: string) => {
                  if (!type || type === 'person' || type === 'master') return 0;
                  if (type === 'group') return 1;
                  if (type === 'place') return 2;
                  return 3; 
              };
              return typeScore(a.type) - typeScore(b.type);
          });

          columnNodes.forEach((node, rowIndex) => {
              node.x = PADDING_X + (colIndex * (COLUMN_WIDTH + COLUMN_GAP));
              node.y = PADDING_Y + HEADER_HEIGHT + (rowIndex * (CARD_HEIGHT + CARD_GAP));
              calculatedNodes.push(node);
          });
          if (columnNodes.length > maxRows) maxRows = columnNodes.length;
      });

      const totalW = PADDING_X * 2 + (ERAS_KEYS.length * (COLUMN_WIDTH + COLUMN_GAP));
      const totalH = PADDING_Y * 2 + HEADER_HEIGHT + (maxRows * (CARD_HEIGHT + CARD_GAP));

      return { layoutNodes: calculatedNodes, containerWidth: totalW, containerHeight: totalH };
  }, []);

  const renderConnection = (edge: KinbakushiEdge) => {
      const startNode = layoutNodes.find(n => n.id === edge.source);
      const endNode = layoutNodes.find(n => n.id === edge.target);

      if (!startNode || !endNode) return null;

      // Connect Right side of Source to Left side of Target
      const x1 = startNode.x + COLUMN_WIDTH; 
      const y1 = startNode.y + (CARD_HEIGHT / 2);
      const x2 = endNode.x;
      const y2 = endNode.y + (CARD_HEIGHT / 2);

      // Bezier Logic
      const dist = Math.abs(x2 - x1);
      // If jump is huge, curve more
      const controlOffset = dist * 0.5;

      const d = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

      let strokeColor = '#525252'; 
      let strokeDash = '';
      let strokeWidth = 1;
      let markerId = 'arrowhead-default';
      let opacity = 0.3;

      if (edge.type === 'direct_relationship') {
          strokeColor = '#ffffff'; 
          strokeWidth = 1.5;
          markerId = 'arrowhead-direct';
          opacity = 0.6;
      } else if (edge.type === 'work_published') {
          strokeColor = '#3b82f6'; 
          strokeWidth = 1.5;
          markerId = 'arrowhead-work';
          opacity = 0.5;
      } else if (edge.type === 'important_influence') {
          strokeColor = '#3b82f6';
          strokeDash = '4,4';
          strokeWidth = 1;
          markerId = 'arrowhead-influence';
          opacity = 0.4;
      }

      // Highlight connections if node selected
      const isRelated = activeNodeId && (edge.source === activeNodeId || edge.target === activeNodeId);
      if (activeNodeId) {
          if (isRelated) {
              opacity = 1;
              strokeWidth = 3;
              strokeColor = '#ef4444'; // Red highlight
              markerId = 'arrowhead-highlight';
          } else {
              opacity = 0.05; // Fade others
          }
      }

      return (
          <g key={`${edge.source}-${edge.target}`}>
              <path 
                d={d} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth} 
                fill="none" 
                strokeDasharray={strokeDash}
                markerEnd={`url(#${markerId})`}
                className="transition-all duration-300 pointer-events-none"
                style={{ opacity }}
              />
          </g>
      );
  };

  const getNodeIcon = (type?: string) => {
      switch(type) {
          case 'magazine': return <Book className="w-4 h-4 text-blue-400" />;
          case 'work': return <Book className="w-4 h-4 text-pink-400" />;
          case 'place': return <MapPin className="w-4 h-4 text-green-400" />;
          case 'group': return <Users className="w-4 h-4 text-purple-400" />;
          case 'genre/studio': return <Film className="w-4 h-4 text-yellow-400" />;
          default: return null;
      }
  };

  const getNodeStyle = (node: KinbakushiNode) => {
      let baseStyle = "bg-[#1a1a1a] border-neutral-800";
      
      if (node.type === 'work' && node.category === 'Fundamental work') {
          baseStyle = "bg-pink-900/10 border-pink-500/30";
      } else if (node.type === 'place') {
          baseStyle = "bg-green-900/10 border-green-500/30";
      } else if (node.type === 'magazine') {
          baseStyle = "bg-blue-900/10 border-blue-500/30";
      } else if (node.type === 'era_context') {
          baseStyle = "bg-transparent border-dashed border-neutral-700 text-neutral-500";
      }

      return baseStyle;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] animate-in fade-in duration-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="shrink-0 h-16 bg-neutral-900 border-b border-white/10 flex justify-between items-center px-4 md:px-6 z-20 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    {t.kinbakushi} <span className="text-[10px] bg-neutral-800 px-2 py-1 rounded text-neutral-400 font-normal border border-white/5">{T.graph_view}</span>
                </h2>
                
                {/* Legend */}
                <div className="hidden md:flex gap-4 text-[10px] font-bold text-neutral-500">
                     <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-white"></span> {T.legend_direct}</span>
                     <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 border-b border-dashed"></span> {T.legend_influence}</span>
                     <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500"></span> {T.legend_work}</span>
                </div>
            </div>
            
            <button onClick={onClose} className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-500 transition-colors"><X className="w-5 h-5"/></button>
        </div>

        {/* Scrollable Canvas Area */}
        <div className="flex-1 overflow-auto bg-[#050505] relative custom-scrollbar">
            <div 
                className="relative"
                style={{ 
                    width: Math.max(containerWidth, 100) + 'px', 
                    height: Math.max(containerHeight, 100) + 'px',
                    minWidth: '100%',
                    minHeight: '100%'
                }}
            >
                 {/* Column Headers (Fixed top of content) */}
                 {ERAS_KEYS.map((eraKey, idx) => (
                     <div 
                        key={eraKey}
                        className="absolute top-0 bottom-0 border-r border-white/5 flex flex-col items-center"
                        style={{
                            left: PADDING_X + (idx * (COLUMN_WIDTH + COLUMN_GAP)) - (COLUMN_GAP / 2),
                            width: COLUMN_WIDTH + COLUMN_GAP,
                        }}
                     >
                         <div className="w-full h-12 flex items-center justify-center border-b border-white/5 mt-4">
                             <span className="text-neutral-400 font-mono text-sm bg-neutral-900/80 px-3 py-1 rounded-full border border-white/5 backdrop-blur shadow-sm">
                                 {T.eras[eraKey]}
                             </span>
                         </div>
                     </div>
                 ))}

                 {/* SVG Lines Layer */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
                    <defs>
                        <marker id="arrowhead-direct" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#ffffff" />
                        </marker>
                        <marker id="arrowhead-influence" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                        </marker>
                        <marker id="arrowhead-work" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                        </marker>
                        <marker id="arrowhead-highlight" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
                        </marker>
                        <marker id="arrowhead-default" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#555" />
                        </marker>
                    </defs>
                    {INITIAL_KINBAKUSHI_EDGES.map(renderConnection)}
                 </svg>

                 {/* Nodes Layer */}
                 {layoutNodes.map(node => {
                     const isMaster = !node.type || node.type === 'person';
                     
                     // Text Color Logic
                     let titleColor = 'text-neutral-200 group-hover:text-white';
                     if (node.type === 'era_context') titleColor = 'text-neutral-500 uppercase tracking-widest text-xs'; 
                     else if (isMaster) titleColor = 'text-red-500 group-hover:text-red-400';
                     
                     // Text Size Logic
                     let titleSize = 'text-lg md:text-xl'; 
                     if (node.type === 'era_context') titleSize = 'text-xs';

                     // Type Localization
                     const typeLabel = node.type ? (T.types[node.type] || node.type) : '';

                     return (
                     <div
                        key={node.id}
                        className={`node-card absolute transition-all duration-300 rounded-lg flex flex-col p-3 cursor-pointer hover:z-50 group border shadow-lg
                        ${getNodeStyle(node)}
                        ${activeNodeId === node.id ? 'ring-2 ring-red-600 z-50 bg-black scale-105 shadow-red-900/20' : 'hover:border-neutral-500 hover:scale-105'}
                        ${activeNodeId && activeNodeId !== node.id ? 'opacity-40 grayscale' : 'opacity-100'}
                        `}
                        style={{
                            left: node.x,
                            top: node.y,
                            width: COLUMN_WIDTH,
                            height: CARD_HEIGHT,
                        }}
                        onClick={(e) => { e.stopPropagation(); setActiveNodeId(node.id === activeNodeId ? null : node.id); }}
                     >
                        <div className="flex gap-3 items-center h-full">
                            <div className="mt-0.5 shrink-0 p-2 bg-black/40 rounded-md border border-white/5">
                                {getNodeIcon(node.type) || <div className="w-4 h-4"/>}
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                                <h3 className={`font-bold leading-none mb-1 truncate ${titleSize} ${titleColor}`}>
                                    {node.label}
                                </h3>
                                <div className="flex justify-between items-center w-full">
                                    {node.dates && <p className="text-[10px] text-neutral-500 font-mono">{node.dates}</p>}
                                    {typeLabel && <p className="text-[9px] text-neutral-600 uppercase border border-neutral-800 px-1 rounded">{typeLabel}</p>}
                                </div>
                            </div>
                        </div>
                     </div>
                 )})}
            </div>
        </div>
    </div>
  );
};

export default KinbakushiModal;
    