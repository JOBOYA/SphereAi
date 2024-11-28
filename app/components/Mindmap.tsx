'use client'

import { useCallback, useRef, KeyboardEvent } from 'react';
import * as htmlToImage from 'html-to-image';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  ConnectionMode,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  OnConnect,
  NodeMouseHandler,
  getConnectedEdges
} from 'reactflow';
import { CustomNode } from './CustomNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  mindmap: CustomNode
};

export default function Mindmap({ initialNodes, initialEdges }: { 
  initialNodes: Node[], 
  initialEdges: Edge[] 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#818cf8' }
      }, eds));
    },
    [setEdges]
  );

  // Gérer la suppression des nœuds
  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (event, node) => {
      // Empêcher la suppression du nœud racine
      if (node.id === 'root') return;

      // Supprimer le nœud et ses connexions
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== node.id && edge.target !== node.id
      ));
    },
    [setNodes, setEdges]
  );

  // Gérer la suppression avec la touche Delete/Backspace
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((node) => node.selected && node.id !== 'root');
        if (selectedNodes.length > 0) {
          const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));
          setNodes((nds) => nds.filter((node) => !selectedNodeIds.has(node.id)));
          setEdges((eds) => eds.filter(
            (edge) => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)
          ));
        }
      }
    },
    [nodes, setNodes, setEdges]
  );

  // Ajouter la fonction d'exportation
  const exportImage = useCallback(async (type: 'png' | 'jpg') => {
    if (reactFlowWrapper.current === null) return;

    const dataUrl = await htmlToImage.toBlob(reactFlowWrapper.current, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    if (dataUrl) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataUrl);
      link.download = `mindmap.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-[#ffeef7] via-white to-[#f5eeff]"
      ref={reactFlowWrapper}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.5}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 2,
          }
        }}
      >
        <Background gap={20} color="#f1f5f9" className="opacity-40" />
        <Controls className="bg-white/80 border border-gray-100 shadow-sm rounded-xl" />
        <Panel 
          position="top-left"
          className="bg-white/30 backdrop-blur-sm border border-white/50 shadow-sm rounded-xl p-2 m-4 transition-all duration-300 hover:bg-white/40"
        >
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer list-none text-gray-600 font-medium text-sm">
              <svg 
                className="w-4 h-4 transition-transform group-open:rotate-180" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Menu
            </summary>
            
            <div className="mt-3 space-y-4">
              {/* Section Raccourcis */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Raccourcis</h3>
                <ul className="text-xs space-y-1.5 pl-2">
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/50 rounded text-gray-500 text-[10px] font-medium">double-click</kbd>
                    <span>Supprimer un nœud</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/50 rounded text-gray-500 text-[10px] font-medium">delete</kbd>
                    <span>Supprimer la sélection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/50 rounded text-gray-500 text-[10px] font-medium">drag</kbd>
                    <span>Déplacer les nœuds</span>
                  </li>
                </ul>
              </div>

              {/* Section Export avec séparateur */}
              <div className="pt-3 border-t border-white/50">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Exporter</h3>
                <div className="space-y-2 pl-2">
                  <button
                    onClick={() => exportImage('png')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 bg-white/50 hover:bg-white/80 rounded-lg text-gray-600 text-xs font-medium transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    PNG
                  </button>
                  <button
                    onClick={() => exportImage('jpg')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 bg-white/50 hover:bg-white/80 rounded-lg text-gray-600 text-xs font-medium transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    JPG
                  </button>
                </div>
              </div>
            </div>
          </details>
        </Panel>
      </ReactFlow>
    </div>
  );
} 