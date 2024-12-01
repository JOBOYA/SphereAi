'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import ReactFlow, { 
  Background, 
  Controls, 
  BackgroundVariant as ReactFlowBackgroundVariant 
} from 'reactflow';
import { Card } from '@/components/ui/card';
import { Node, Edge, BackgroundVariant } from '@/app/types/mindmap';

const transformResponseToMindmap = (response: string): { nodes: Node[], edges: Edge[] } => {
  try {
    // Nettoyer la réponse
    let jsonStr = response;
    
    // Retirer le tag [Mindmap] et tout ce qui précède le premier JSON
    jsonStr = jsonStr.replace(/[\s\S]*?(\{[\s\S]*\})/g, '$1');
    
    // Trouver tous les objets JSON valides
    const jsonMatches = jsonStr.match(/\{[\s\S]*?\}/g);
    if (!jsonMatches) {
      throw new Error('Aucun JSON valide trouvé');
    }

    // Tester chaque JSON pour trouver le premier valide
    let data = null;
    for (const jsonMatch of jsonMatches) {
      try {
        const parsed = JSON.parse(jsonMatch);
        // Vérifier si c'est un JSON de mindmap valide
        if (parsed["Concept Central"]) {
          data = parsed;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!data) {
      throw new Error('Aucun JSON de mindmap valide trouvé');
    }

    console.log("JSON valide trouvé:", data);

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const radius = 300;

    // Ajouter le nœud central
    const centralConcept = "Concept Central";
    nodes.push({
      id: 'central',
      position: { x: 0, y: 0 },
      data: { label: data[centralConcept] },
      type: 'default',
      style: { 
        background: '#fff',
        border: '1px solid #ddd',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        fontWeight: 'bold',
        width: 'auto',
        minWidth: '150px',
        textAlign: 'center'
      }
    });

    // Filtrer les concepts (exclure le concept central)
    const concepts = Object.entries(data).filter(([key]) => key !== centralConcept);
    const conceptsCount = concepts.length;

    // Ajouter les concepts et sous-concepts
    concepts.forEach(([concept, subConcepts], index) => {
      const angle = ((2 * Math.PI) / conceptsCount) * index;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const conceptId = `concept-${index}`;
      nodes.push({
        id: conceptId,
        position: { x, y },
        data: { label: concept },
        type: 'default',
        style: {
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: 8,
          borderRadius: 4,
          fontSize: 14,
          width: 'auto',
          minWidth: '120px',
          textAlign: 'center'
        }
      });

      edges.push({
        id: `edge-central-${conceptId}`,
        source: 'central',
        target: conceptId,
        type: 'smoothstep',
        animated: false,
        className: 'stroke-gray-400'
      });

      if (Array.isArray(subConcepts)) {
        const subConceptRadius = radius * 0.6;
        const subConceptsCount = subConcepts.length;

        subConcepts.forEach((subConcept, subIndex) => {
          const subAngle = angle - (Math.PI / 4) + ((Math.PI / 2) / Math.max(subConceptsCount - 1, 1)) * subIndex;
          const subX = x + Math.cos(subAngle) * subConceptRadius;
          const subY = y + Math.sin(subAngle) * subConceptRadius;

          const subConceptId = `${conceptId}-sub-${subIndex}`;
          nodes.push({
            id: subConceptId,
            position: { x: subX, y: subY },
            data: { label: subConcept },
            type: 'default',
            style: {
              background: '#fff',
              border: '1px solid #e2e8f0',
              padding: 6,
              borderRadius: 3,
              fontSize: 12,
              width: 'auto',
              minWidth: '100px',
              textAlign: 'center'
            }
          });

          edges.push({
            id: `edge-${conceptId}-${subConceptId}`,
            source: conceptId,
            target: subConceptId,
            type: 'smoothstep',
            animated: false,
            className: 'stroke-gray-300'
          });
        });
      }
    });

    return { nodes, edges };
  } catch (error) {
    console.error('Erreur de transformation:', error);
    return {
      nodes: [
        {
          id: 'error',
          position: { x: 0, y: 0 },
          data: { label: "Erreur de chargement" },
          type: 'default'
        }
      ],
      edges: []
    };
  }
};

export default function MindmapHistoryPage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMindmap = async () => {
      if (!accessToken || !params.id) return;

      try {
        const formattedToken = accessToken.startsWith('Bearer ') 
          ? accessToken 
          : `Bearer ${accessToken}`;

        console.log("🔄 Récupération de la mindmap:", params.id);
        
        const response = await fetch(`/api/mindmap/${params.id}`, {
          headers: {
            'Authorization': formattedToken
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Erreur API:", errorData);
          throw new Error(errorData.error || 'Erreur lors de la récupération de la mindmap');
        }

        const data = await response.json();
        console.log("📥 Données reçues:", data);

        if (!data.messages || !data.messages[0]) {
          throw new Error('Format de données invalide');
        }

        const content = data.messages[0].content;
        console.log("📝 Contenu à transformer:", content);

        const mindmapData = transformResponseToMindmap(content);
        console.log("🎯 Données transformées:", mindmapData);

        setNodes(mindmapData.nodes);
        setEdges(mindmapData.edges);
      } catch (error) {
        console.error('🚨 Erreur complète:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    };

    fetchMindmap();
  }, [accessToken, params.id]);

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Card className="p-0 overflow-hidden" style={{ height: '80vh', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{
              padding: 0.5,
              maxZoom: 2,
              minZoom: 0.1,
            }}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            zoomOnScroll={true}
            panOnScroll={true}
            panOnDrag={true}
            className="bg-slate-50"
            minZoom={0.1}
            maxZoom={4}
            attributionPosition="bottom-right"
          >
            <Controls 
              className="bg-white shadow-lg rounded-lg"
              showInteractive={true}
              position="bottom-right"
            />
            <Background 
              color="#94a3b8" 
              gap={16} 
              size={1}
              variant={'dots' as ReactFlowBackgroundVariant}
            />
          </ReactFlow>
        </Card>
      )}
    </div>
  );
} 
