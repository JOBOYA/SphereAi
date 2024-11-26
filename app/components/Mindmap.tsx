'use client'

import ReactFlow, { 
  Node, 
  Edge,
  Controls,
  Background 
} from 'reactflow'
import 'reactflow/dist/style.css'

interface MindmapProps {
  nodes: Node[]
  edges: Edge[]
}

export default function Mindmap({ nodes, edges }: MindmapProps) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
} 