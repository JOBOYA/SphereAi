'use client'

import { useCallback, useRef, KeyboardEvent } from 'react';
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
          position="bottom-right" 
          className="bg-white/30 backdrop-blur-sm border border-white/50 shadow-sm rounded-xl p-3 m-4 transition-opacity duration-300 opacity-50 hover:opacity-100"
        >
          <div className="text-gray-600">
            <ul className="text-xs space-y-1.5">
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
        </Panel>
      </ReactFlow>
    </div>
  );
} 