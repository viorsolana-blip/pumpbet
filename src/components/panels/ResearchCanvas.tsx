'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronRight, Plus, Grid, Trash2, Save, Folder, CheckCircle, Sparkles, X, Edit2, Link, ExternalLink, FileText, Lightbulb, AlertCircle, Search, MessageSquare } from 'lucide-react';
import { useStore } from '@/store';

interface Evidence {
  id: string;
  type: 'verified' | 'unverified' | 'reasoning' | 'question';
  content: string;
  source?: string;
  date: string;
}

interface CanvasNode {
  id: string;
  title: string;
  type: 'evidence' | 'market' | 'note' | 'question';
  children?: CanvasNode[];
  evidence?: Evidence[];
  marketId?: string;
  content?: string;
}

interface Canvas {
  id: string;
  name: string;
  nodes: CanvasNode[];
  createdAt: string;
  updatedAt: string;
}

const defaultCanvases: Canvas[] = [
  {
    id: 'canvas-1',
    name: 'Who is closest to AGI',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03',
    nodes: [
      {
        id: '1',
        title: 'Evidence',
        type: 'evidence',
        evidence: [
          {
            id: 'e1',
            type: 'verified',
            content: 'Google leads Chatbot Arena with 91.5% probability of #1 by Jan 2026',
            source: 'Polymarket',
            date: '2025-01-03',
          },
          {
            id: 'e2',
            type: 'verified',
            content: 'OpenAI only 1.4% chance to have #1 model by Jan 2026; trailing Google dramatically',
            source: 'Polymarket',
            date: '2025-01-03',
          },
          {
            id: 'e3',
            type: 'verified',
            content: "GPT-5 benchmark: 40%+ on Humanity's Last Exam required for 'Nothing Happens' No resolution",
            source: 'OpenAI Blog',
            date: '2025-01-03',
          },
        ],
      },
      {
        id: '2',
        title: 'Market Analysis',
        type: 'market',
        evidence: [
          {
            id: 'm1',
            type: 'reasoning',
            content: 'Current market implies 8.5% chance OpenAI has clear AGI advantage - seems underpriced given GPT-5 rumors',
            date: '2025-01-05',
          },
          {
            id: 'm2',
            type: 'unverified',
            content: 'Insider reports suggest GPT-5 internal benchmarks significantly exceed GPT-4o',
            source: 'Twitter/X',
            date: '2025-01-04',
          },
        ],
      },
      {
        id: '3',
        title: 'Key Questions',
        type: 'question',
        evidence: [
          {
            id: 'q1',
            type: 'question',
            content: 'What benchmark thresholds would constitute "AGI" for market resolution?',
            date: '2025-01-03',
          },
          {
            id: 'q2',
            type: 'question',
            content: 'How does compute scaling affect the timeline predictions?',
            date: '2025-01-04',
          },
        ],
      },
    ],
  },
];

export function ResearchCanvas() {
  const { markets } = useStore();
  const [canvases, setCanvases] = useState<Canvas[]>(defaultCanvases);
  const [activeCanvasId, setActiveCanvasId] = useState<string>('canvas-1');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3']));
  const [showAddNode, setShowAddNode] = useState(false);
  const [showCanvasList, setShowCanvasList] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeType, setNewNodeType] = useState<'evidence' | 'market' | 'note' | 'question'>('evidence');
  const [showAddEvidence, setShowAddEvidence] = useState<string | null>(null);
  const [newEvidenceContent, setNewEvidenceContent] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<'verified' | 'unverified' | 'reasoning' | 'question'>('verified');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCanvas = canvases.find(c => c.id === activeCanvasId) || canvases[0];

  // Load canvases from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('researchCanvases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCanvases(parsed);
      } catch (e) {
        console.error('Failed to parse canvases:', e);
      }
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSaveStatus('saving');
      localStorage.setItem('researchCanvases', JSON.stringify(canvases));
      setTimeout(() => setSaveStatus('saved'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [canvases]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const addNode = () => {
    if (!newNodeTitle.trim()) return;

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      title: newNodeTitle,
      type: newNodeType,
      evidence: [],
    };

    setCanvases(prev => prev.map(c =>
      c.id === activeCanvasId
        ? { ...c, nodes: [...c.nodes, newNode], updatedAt: new Date().toISOString() }
        : c
    ));

    setExpandedNodes(prev => new Set([...Array.from(prev), newNode.id]));
    setNewNodeTitle('');
    setShowAddNode(false);
    setSaveStatus('unsaved');
  };

  const deleteNode = (nodeId: string) => {
    setCanvases(prev => prev.map(c =>
      c.id === activeCanvasId
        ? { ...c, nodes: c.nodes.filter(n => n.id !== nodeId), updatedAt: new Date().toISOString() }
        : c
    ));
    setSaveStatus('unsaved');
  };

  const addEvidence = (nodeId: string) => {
    if (!newEvidenceContent.trim()) return;

    const newEvidence: Evidence = {
      id: `evidence-${Date.now()}`,
      type: newEvidenceType,
      content: newEvidenceContent,
      date: new Date().toISOString().split('T')[0],
    };

    setCanvases(prev => prev.map(c =>
      c.id === activeCanvasId
        ? {
            ...c,
            nodes: c.nodes.map(n =>
              n.id === nodeId
                ? { ...n, evidence: [...(n.evidence || []), newEvidence] }
                : n
            ),
            updatedAt: new Date().toISOString(),
          }
        : c
    ));

    setNewEvidenceContent('');
    setShowAddEvidence(null);
    setSaveStatus('unsaved');
  };

  const deleteEvidence = (nodeId: string, evidenceId: string) => {
    setCanvases(prev => prev.map(c =>
      c.id === activeCanvasId
        ? {
            ...c,
            nodes: c.nodes.map(n =>
              n.id === nodeId
                ? { ...n, evidence: n.evidence?.filter(e => e.id !== evidenceId) }
                : n
            ),
            updatedAt: new Date().toISOString(),
          }
        : c
    ));
    setSaveStatus('unsaved');
  };

  const createNewCanvas = () => {
    const newCanvas: Canvas = {
      id: `canvas-${Date.now()}`,
      name: 'New Research',
      nodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCanvases(prev => [...prev, newCanvas]);
    setActiveCanvasId(newCanvas.id);
    setShowCanvasList(false);
  };

  const updateCanvasName = (name: string) => {
    setCanvases(prev => prev.map(c =>
      c.id === activeCanvasId
        ? { ...c, name, updatedAt: new Date().toISOString() }
        : c
    ));
    setSaveStatus('unsaved');
  };

  const filteredNodes = searchQuery
    ? activeCanvas?.nodes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.evidence?.some(e => e.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : activeCanvas?.nodes;

  const totalNodes = activeCanvas?.nodes.reduce((acc, n) => acc + 1 + (n.evidence?.length || 0), 0) || 0;

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Animated texture accent bar */}
      <div
        className="w-full h-3 flex-shrink-0 animate-texture-scroll"
        style={{
          backgroundImage: 'url(/brand/pixel-texture.jpeg)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Research Canvas</span>
          <div className="relative">
            <button
              onClick={() => setShowCanvasList(!showCanvasList)}
              className="flex items-center gap-1 px-2 py-1 bg-[#0f0f0f] rounded-lg text-xs text-[#888] hover:bg-[#141414] transition-colors"
            >
              {activeCanvas?.name || 'Select'} <ChevronDown className="w-3 h-3" />
            </button>

            {/* Canvas Dropdown */}
            {showCanvasList && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in-down">
                <div className="p-2 border-b border-[#1a1a1a]">
                  <span className="text-xs text-[#555] uppercase tracking-wide">Your Canvases</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {canvases.map(canvas => (
                    <button
                      key={canvas.id}
                      onClick={() => { setActiveCanvasId(canvas.id); setShowCanvasList(false); }}
                      className={`w-full flex items-center justify-between p-3 hover:bg-[#141414] transition-colors ${
                        canvas.id === activeCanvasId ? 'bg-[#141414]' : ''
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-sm text-white">{canvas.name}</div>
                        <div className="text-xs text-[#555]">{canvas.nodes.length} nodes</div>
                      </div>
                      {canvas.id === activeCanvasId && (
                        <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={createNewCanvas}
                  className="w-full flex items-center gap-2 p-3 border-t border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#141414] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New Canvas</span>
                </button>
              </div>
            )}
          </div>
          <span className={`text-xs ${saveStatus === 'saved' ? 'text-[#22c55e]' : saveStatus === 'saving' ? 'text-[#f59e0b]' : 'text-[#555]'}`}>
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
          </span>
        </div>
        <Image
          src="/brand/icon.png"
          alt=""
          width={16}
          height={16}
          className="opacity-30"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-[#1a1a1a]">
        <div className="relative">
          <button
            onClick={() => setShowAddNode(!showAddNode)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-sm text-[#888] hover:bg-[#141414] hover:border-[#333] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>

          {/* Add Node Dropdown */}
          {showAddNode && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3 space-y-3">
                <input
                  type="text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  placeholder="Node title..."
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#333]"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  {(['evidence', 'market', 'note', 'question'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewNodeType(type)}
                      className={`px-2 py-1 rounded text-xs capitalize transition-colors ${
                        newNodeType === type
                          ? 'bg-white text-black'
                          : 'bg-[#1a1a1a] text-[#888] hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={addNode}
                    disabled={!newNodeTitle.trim()}
                    className="flex-1 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Node
                  </button>
                  <button
                    onClick={() => setShowAddNode(false)}
                    className="px-3 py-2 text-[#666] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#333]"
          />
        </div>

        <div className="flex-1" />
        <span className="text-xs text-[#555]">{totalNodes} items</span>
      </div>

      {/* Canvas Name Editor */}
      <div className="px-4 pt-3">
        <input
          type="text"
          value={activeCanvas?.name || ''}
          onChange={(e) => updateCanvasName(e.target.value)}
          className="text-lg font-medium text-white bg-transparent border-none outline-none w-full"
          placeholder="Canvas name..."
        />
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredNodes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Image
              src="/brand/mascot.png"
              alt=""
              width={80}
              height={112}
              className="opacity-20 mb-4 animate-float"
            />
            <p className="text-[#555] text-sm">
              {searchQuery ? 'No matching nodes' : 'Start building your research'}
            </p>
            <p className="text-[#444] text-xs mt-1">
              {searchQuery ? 'Try a different search term' : 'Add evidence, reasoning, and market data'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNodes?.map((node, idx) => (
              <CanvasNodeItem
                key={node.id}
                node={node}
                isExpanded={expandedNodes.has(node.id)}
                onToggle={() => toggleNode(node.id)}
                onDelete={() => deleteNode(node.id)}
                onAddEvidence={() => setShowAddEvidence(node.id)}
                onDeleteEvidence={(evidenceId) => deleteEvidence(node.id, evidenceId)}
                showAddEvidence={showAddEvidence === node.id}
                newEvidenceContent={newEvidenceContent}
                setNewEvidenceContent={setNewEvidenceContent}
                newEvidenceType={newEvidenceType}
                setNewEvidenceType={setNewEvidenceType}
                onSubmitEvidence={() => addEvidence(node.id)}
                onCancelAddEvidence={() => setShowAddEvidence(null)}
                animationDelay={idx * 50}
              />
            ))}

            {/* Add Node Button */}
            <button
              onClick={() => setShowAddNode(true)}
              className="flex items-center gap-2 p-3 border border-dashed border-[#1a1a1a] rounded-lg text-[#555] hover:text-white hover:border-[#333] transition-colors w-full"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add node</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="p-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-sm text-[#888] hover:text-white hover:border-[#333] transition-colors">
            <MessageSquare className="w-4 h-4" />
            Ask AI about this research
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg text-sm text-[#888] hover:text-white hover:border-[#333] transition-colors">
            <Link className="w-4 h-4" />
            Link to market
          </button>
          <div className="flex-1" />
          <span className="text-xs text-[#444]">Last updated: {activeCanvas?.updatedAt ? new Date(activeCanvas.updatedAt).toLocaleDateString() : 'Never'}</span>
        </div>
      </div>
    </div>
  );
}

function CanvasNodeItem({
  node,
  isExpanded,
  onToggle,
  onDelete,
  onAddEvidence,
  onDeleteEvidence,
  showAddEvidence,
  newEvidenceContent,
  setNewEvidenceContent,
  newEvidenceType,
  setNewEvidenceType,
  onSubmitEvidence,
  onCancelAddEvidence,
  animationDelay,
}: {
  node: CanvasNode;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddEvidence: () => void;
  onDeleteEvidence: (evidenceId: string) => void;
  showAddEvidence: boolean;
  newEvidenceContent: string;
  setNewEvidenceContent: (content: string) => void;
  newEvidenceType: 'verified' | 'unverified' | 'reasoning' | 'question';
  setNewEvidenceType: (type: 'verified' | 'unverified' | 'reasoning' | 'question') => void;
  onSubmitEvidence: () => void;
  onCancelAddEvidence: () => void;
  animationDelay: number;
}) {
  const getNodeIcon = () => {
    switch (node.type) {
      case 'evidence': return <Folder className="w-4 h-4 text-[#22c55e]" />;
      case 'market': return <Grid className="w-4 h-4 text-[#3b82f6]" />;
      case 'note': return <FileText className="w-4 h-4 text-[#f59e0b]" />;
      case 'question': return <Lightbulb className="w-4 h-4 text-[#a855f7]" />;
      default: return <Folder className="w-4 h-4 text-white" />;
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-[#22c55e]" />;
      case 'unverified':
        return <AlertCircle className="w-4 h-4 text-[#f59e0b]" />;
      case 'reasoning':
        return <Lightbulb className="w-4 h-4 text-[#3b82f6]" />;
      case 'question':
        return <MessageSquare className="w-4 h-4 text-[#a855f7]" />;
      default:
        return <FileText className="w-4 h-4 text-[#888]" />;
    }
  };

  const getEvidenceLabel = (type: string) => {
    switch (type) {
      case 'verified': return 'VERIFIED';
      case 'unverified': return 'UNVERIFIED';
      case 'reasoning': return 'REASONING';
      case 'question': return 'QUESTION';
      default: return 'NOTE';
    }
  };

  return (
    <div
      className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden hover:border-[#333] transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between p-3 hover:bg-[#0f0f0f] transition-colors">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#555]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#555]" />
          )}
          {getNodeIcon()}
          <span className="text-sm font-medium text-white">{node.title}</span>
          <span className="text-xs text-[#555]">({node.evidence?.length || 0})</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddEvidence}
            className="p-1.5 text-[#555] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-[#555] hover:text-[#ef4444] hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Node Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Add Evidence Form */}
          {showAddEvidence && (
            <div className="p-3 bg-[#050505] border border-[#1a1a1a] rounded-lg space-y-3 animate-fade-in">
              <textarea
                value={newEvidenceContent}
                onChange={(e) => setNewEvidenceContent(e.target.value)}
                placeholder="Add evidence, reasoning, or a question..."
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#333] resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center gap-2">
                {(['verified', 'unverified', 'reasoning', 'question'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setNewEvidenceType(type)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs capitalize transition-colors ${
                      newEvidenceType === type
                        ? 'bg-white text-black'
                        : 'bg-[#1a1a1a] text-[#888] hover:text-white'
                    }`}
                  >
                    {getEvidenceIcon(type)}
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSubmitEvidence}
                  disabled={!newEvidenceContent.trim()}
                  className="flex-1 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={onCancelAddEvidence}
                  className="px-3 py-2 text-[#666] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Evidence Items */}
          {node.evidence?.map((evidence, idx) => (
            <div
              key={evidence.id}
              className="group p-3 bg-[#050505] border border-[#1a1a1a] rounded-lg hover:border-[#222] transition-all duration-200"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getEvidenceIcon(evidence.type)}
                  <span className={`text-xs font-medium uppercase tracking-wide ${
                    evidence.type === 'verified' ? 'text-[#22c55e]' :
                    evidence.type === 'unverified' ? 'text-[#f59e0b]' :
                    evidence.type === 'reasoning' ? 'text-[#3b82f6]' :
                    'text-[#a855f7]'
                  }`}>
                    {getEvidenceLabel(evidence.type)}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteEvidence(evidence.id)}
                  className="p-1 text-[#333] hover:text-[#ef4444] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-white leading-relaxed">{evidence.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#555]">{evidence.date}</span>
                {evidence.source && (
                  <span className="flex items-center gap-1 text-xs text-[#666]">
                    <ExternalLink className="w-3 h-3" />
                    {evidence.source}
                  </span>
                )}
              </div>
            </div>
          ))}

          {(!node.evidence || node.evidence.length === 0) && !showAddEvidence && (
            <button
              onClick={onAddEvidence}
              className="flex items-center gap-2 p-3 border border-dashed border-[#1a1a1a] rounded-lg text-[#555] hover:text-white hover:border-[#333] transition-colors w-full text-sm"
            >
              <Plus className="w-4 h-4" />
              Add evidence to this node
            </button>
          )}
        </div>
      )}
    </div>
  );
}
