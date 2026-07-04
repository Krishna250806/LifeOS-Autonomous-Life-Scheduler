'use client';

import React, { useState } from 'react';
import { Network, Search, Info, FileText } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'goal' | 'task' | 'note' | 'habit';
  x: number;
  y: number;
  details: string;
}

interface Edge {
  source: string;
  target: string;
  relationship: string;
  inferred: boolean;
}

const initialNodes: Node[] = [
  { id: 'n1', label: 'LifeOS Product Vision', type: 'note', x: 250, y: 180, details: 'Autonomous life scheduler centered on natural-language intakes and dynamic, self-adjusting schedules.' },
  { id: 'n2', label: 'Complete LifeOS UI Prototype', type: 'goal', x: 450, y: 150, details: 'Construct primary interfaces including Chronological Ruler, Assistant sidebar, and review charts.' },
  { id: 'n3', label: 'Proportional Timeline Layout', type: 'task', x: 550, y: 280, details: 'Translate HH:MM blocks onto a vertical scale where 1 hour equals 80 pixels.' },
  { id: 'n4', label: 'Zustand Local State Engine', type: 'task', x: 380, y: 320, details: 'Build react hook state to manage schedule modifications and mock AI re-plans.' },
  { id: 'n5', label: 'Design System & Typography', type: 'note', x: 200, y: 350, details: 'Warm serif titles with clean grotesque body text and monospace dials. Muted paper colors.' },
  { id: 'n6', label: 'Spotify Focus Integration', type: 'task', x: 120, y: 230, details: 'API bridge that triggers study playlists when Focus Mode is activated.' },
  { id: 'n7', label: 'Morning Hydration & Hot Tea', type: 'habit', x: 300, y: 50, details: 'Daily morning habit that anchors energy recovery.' }
];

const initialEdges: Edge[] = [
  { source: 'n1', target: 'n2', relationship: 'defines', inferred: false },
  { source: 'n2', target: 'n3', relationship: 'requires', inferred: false },
  { source: 'n2', target: 'n4', relationship: 'requires', inferred: false },
  { source: 'n1', target: 'n5', relationship: 'dictates_aesthetic', inferred: true },
  { source: 'n4', target: 'n3', relationship: 'binds_data_to', inferred: false },
  { source: 'n6', target: 'n4', relationship: 'controlled_by', inferred: true },
  { source: 'n7', target: 'n1', relationship: 'supports_mindfulness', inferred: true }
];

export default function KnowledgeGraph() {
  const [nodes] = useState<Node[]>(initialNodes);
  const [edges] = useState<Edge[]>(initialEdges);
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(nodes[0]);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNodes = nodes.filter(n => {
    const matchesSearch = n.label.toLowerCase().includes(search.toLowerCase()) || 
                          n.details.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const matchingNodeIds = new Set(filteredNodes.map(n => n.id));

  return (
    <div className="flex flex-col lg:flex-row h-full bg-background relative select-none">
      
      {/* Visual Canvas (SVG) Panel */}
      <div className="flex-1 flex flex-col h-[60vh] lg:h-auto border-r border-border-custom relative overflow-hidden bg-background">
        
        {/* Search & Intake Control Bar */}
        <div className="p-4 border-b border-border-custom flex items-center space-x-2 bg-background/90 backdrop-blur-xs z-10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-custom" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Knowledge Nodes..."
              className="w-full py-1.5 pl-8 pr-3 border border-border-custom bg-card-custom/40 text-xs font-sans placeholder-muted-custom focus:outline-hidden"
            />
          </div>
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-1.5 px-3 border border-border-custom bg-background font-mono text-2xs text-muted-custom focus:outline-hidden rounded-xs"
          >
            <option value="all">All Elements</option>
            <option value="note">Notes</option>
            <option value="goal">Goals</option>
            <option value="task">Tasks</option>
            <option value="habit">Habits</option>
          </select>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 flex space-x-3 text-3xs font-mono bg-background/90 p-2 border border-border-custom">
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-accent-custom" />
            <span className="text-muted-custom">Goal</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-accent-blue" />
            <span className="text-muted-custom">Task</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            <span className="text-muted-custom">Note</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-muted-custom">Habit</span>
          </div>
        </div>

        {/* SVG Drawing Canvas */}
        <div className="flex-1 w-full relative">
          <svg className="w-full h-full min-h-[400px]">
            {/* Draw Links/Edges */}
            <g>
              {edges.map((edge, idx) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;

                const isHighlighted = matchingNodeIds.has(sourceNode.id) && matchingNodeIds.has(targetNode.id);

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? 'var(--muted-custom)' : 'var(--border-custom)'}
                      strokeWidth={edge.inferred ? 1 : 1.5}
                      strokeDasharray={edge.inferred ? '4 4' : 'none'}
                      opacity={isHighlighted ? 0.8 : 0.25}
                    />
                    {/* Tiny relationship label in middle of line */}
                    {isHighlighted && (
                      <text
                        x={(sourceNode.x + targetNode.x) / 2}
                        y={(sourceNode.y + targetNode.y) / 2 - 4}
                        fill="var(--muted-custom)"
                        fontSize="8"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                      >
                        {edge.relationship}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Draw Nodes */}
            <g>
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isMatching = matchingNodeIds.has(node.id);

                return (
                  <g 
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Shadow Outer Ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 16 : 10}
                      fill="none"
                      stroke={
                        node.type === 'goal' ? 'var(--accent-custom)' :
                        node.type === 'task' ? 'var(--accent-blue)' :
                        node.type === 'habit' ? '#10b981' : '#d97706'
                      }
                      strokeWidth={1}
                      opacity={isMatching ? (isSelected ? 0.4 : 0.15) : 0.05}
                      className="transition-all duration-300"
                    />

                    {/* Main Node Dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 8 : 6}
                      fill={
                        node.type === 'goal' ? 'var(--accent-custom)' :
                        node.type === 'task' ? 'var(--accent-blue)' :
                        node.type === 'habit' ? '#10b981' : '#d97706'
                      }
                      opacity={isMatching ? 1 : 0.15}
                      className="transition-all duration-300 hover:scale-125"
                    />

                    {/* Node Text Label */}
                    <text
                      x={node.x}
                      y={node.y - (isSelected ? 18 : 12)}
                      textAnchor="middle"
                      fill={isSelected ? 'var(--foreground)' : 'var(--muted-custom)'}
                      fontSize={isSelected ? '11' : '9'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="var(--font-sans)"
                      opacity={isMatching ? 1 : 0.2}
                      className="transition-all duration-300"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

      </div>

      {/* Selected Node Details Sidebar (Right) */}
      <div className="w-full lg:w-80 p-6 bg-card-custom/10 border-t lg:border-t-0 border-border-custom flex flex-col justify-between">
        
        {selectedNode ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4 text-muted-custom" />
              <span className="font-mono text-2xs uppercase tracking-widest text-muted-custom">
                Node Properties // {selectedNode.type}
              </span>
            </div>

            <div>
              <h2 className="font-serif text-xl font-medium leading-tight">
                {selectedNode.label}
              </h2>
              <p className="font-mono text-2xs text-muted-custom mt-1">
                ID: {selectedNode.id}
              </p>
            </div>

            <div className="space-y-2 border-t border-border-custom/50 pt-4">
              <span className="font-mono text-3xs text-muted-custom uppercase tracking-widest block">Details</span>
              <p className="font-sans text-sm font-light leading-relaxed text-foreground">
                {selectedNode.details}
              </p>
            </div>

            {/* Simulated Semantic/Inferred Connections list */}
            <div className="space-y-2 pt-2">
              <span className="font-mono text-3xs text-muted-custom uppercase tracking-widest block">Connected Neighbors</span>
              <div className="space-y-2">
                {edges
                  .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map((e, idx) => {
                    const otherId = e.source === selectedNode.id ? e.target : e.source;
                    const otherNode = nodes.find(n => n.id === otherId);
                    if (!otherNode) return null;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedNode(otherNode)}
                        className="p-2 border border-border-custom/40 bg-background hover:bg-card-custom transition cursor-pointer text-xs flex justify-between items-center"
                      >
                        <span className="font-serif font-medium truncate">{otherNode.label}</span>
                        <span className={`font-mono text-3xs px-1 rounded-sm border ${
                          e.inferred 
                            ? 'bg-amber-500/5 text-amber-600 border-amber-500/20' 
                            : 'bg-accent-blue/5 text-accent-blue border-accent-blue/20'
                        }`}>
                          {e.inferred ? 'Inferred' : 'Stated'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-custom py-12">
            <Info className="w-6 h-6 mb-2" />
            <p className="text-xs">Click a node on the network canvas to view semantic context attributes.</p>
          </div>
        )}

        <div className="border-t border-border-custom/50 pt-4 mt-6">
          <div className="flex items-center space-x-2 text-2xs text-muted-custom font-mono">
            <FileText className="w-3.5 h-3.5" />
            <span>Memory Graph Auto-linked</span>
          </div>
        </div>

      </div>

    </div>
  );
}
