'use client'

import ReactFlow, { Background, Controls } from 'reactflow';
import { CustomNode } from './CustomNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  default: CustomNode,
};

export default function Mindmap({ nodes, edges }: { nodes: any, edges: any }) {
  return (
    <div className="w-full h-full bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#e2e8f0',
            strokeWidth: 1,
            strokeDasharray: '4,4'
          }
        }}
        className="font-sans"
      >
        <Background 
          gap={24}
          size={1}
          color="#f1f5f9"
          className="opacity-50"
        />
      </ReactFlow>
    </div>
  );
} 