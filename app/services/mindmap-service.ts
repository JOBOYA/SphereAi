import { Node, Edge } from '@/app/types/mindmap';
import dagre from '@dagrejs/dagre';

interface MindmapNode {
  level: number;
  text: string;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100,
          y: nodeWithPosition.y - 25
        }
      };
    }),
    edges
  };
};

export const mindmapService = {
  generateMindmap: async (topic: string, token: string) => {
    try {
      const response = await fetch('/api/mindmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) throw new Error('Erreur lors de la génération de la mindmap');

      const data = await response.json();
      if (!data.content) throw new Error('Format de réponse invalide');

      let nodes: Node[] = [];
      let edges: Edge[] = [];

      // Nœud central
      nodes.push({
        id: 'root',
        type: 'mindmap',
        position: { x: 0, y: 0 },
        data: { 
          label: topic,
          type: 'main'
        }
      });

      // Parser et créer les nœuds
      const lines = data.content.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string): MindmapNode => ({
          level: line.startsWith('-') ? 1 : 2,
          text: line.replace(/^[-*]\s+/, '').trim()
        }));

      // Créer les nœuds et les connexions
      lines.forEach((node: MindmapNode, index: number) => {
        const nodeId = `node-${index}`;
        nodes.push({
          id: nodeId,
          type: 'mindmap',
          position: { x: 0, y: 0 }, // Position temporaire
          data: {
            label: node.text,
            type: node.level === 1 ? 'sub' : 'leaf'
          }
        });

        // Créer les connexions
        if (node.level === 1) {
          edges.push({
            id: `edge-root-${nodeId}`,
            source: 'root',
            target: nodeId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#6366f1' }
          });
        } else {
          const parentIndex = Math.floor((index - 1) / 2);
          const parentId = `node-${parentIndex}`;
          edges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#818cf8' }
          });
        }
      });

      // Appliquer le layout automatique
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        'LR' // Layout horizontal
      );

      return { 
        nodes: layoutedNodes, 
        edges: layoutedEdges 
      };
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  }
}; 