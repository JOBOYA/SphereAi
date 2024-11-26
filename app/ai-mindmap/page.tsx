'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import { mindmapService } from '@/app/services/mindmap-service'
import { Node, Edge } from '@/app/types/mindmap'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AIMindmapPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuth()
  const router = useRouter()

  const handleGenerateMindmap = async () => {
    if (!prompt.trim() || loading) return;

    if (!accessToken) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const formattedToken = accessToken.startsWith('Bearer ') 
        ? accessToken 
        : `Bearer ${accessToken}`

      const data = await mindmapService.generateMindmap({
        prompt: `Génère une mindmap sur le sujet: "${prompt}".
                Structure ta réponse en JSON avec ce format exact:
                {
                  "Concept Central": "${prompt}",
                  "Concept 1": ["Sous-concept 1.1", "Sous-concept 1.2"],
                  "Concept 2": ["Sous-concept 2.1", "Sous-concept 2.2"],
                  "Concept 3": ["Sous-concept 3.1", "Sous-concept 3.2"]
                }`,
        conversation_id: Date.now().toString(),
        accessToken: formattedToken
      });

      console.log("Réponse de l'API:", data);

      if (data.api_response) {
        const mindmapData = transformResponseToMindmap(data.api_response);
        setNodes(mindmapData.nodes);
        setEdges(mindmapData.edges);
      }

    } catch (error) {
      console.error('Erreur lors de la génération:', error)
      setError('Erreur lors de la génération de la mindmap')
    } finally {
      setLoading(false)
    }
  }

  const transformResponseToMindmap = (response: string) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 1;
    
    // Ajuster le calcul du centre en tenant compte de la sidebar
    const sidebarWidth = 300; // Largeur de la sidebar
    const availableWidth = window.innerWidth - sidebarWidth;
    const centerX = availableWidth / 2;  // Centre basé sur l'espace disponible
    const centerY = 350;  // Position verticale ajustée
    const radius = 200;   // Distance des nœuds principaux légèrement réduite
    const subRadius = 100; // Distance des sous-nœuds ajustée

    const createNodeId = () => (nodeId++).toString();

    try {
      const cleanResponse = response.replace(/```json\n|\n```/g, '');
      const data = JSON.parse(cleanResponse);
      
      // Nœud central
      const mainNodeId = createNodeId();
      nodes.push({
        id: mainNodeId,
        position: { x: centerX, y: centerY },
        data: { label: data["Concept Central"] },
        style: {
          background: '#f0f9ff',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          minWidth: '150px',
          textAlign: 'center'
        }
      });

      // Traitement des concepts principaux
      Object.entries(data).forEach(([key, value], index) => {
        if (key !== "Concept Central" && typeof value === 'object') {
          const angle = index * (2 * Math.PI / (Object.keys(data).length - 1));
          const conceptId = createNodeId();

          // Position ajustée avec centerX et centerY
          nodes.push({
            id: conceptId,
            position: {
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius
            },
            data: { label: key },
            style: {
              background: '#f8fafc',
              border: '1px solid #60a5fa',
              borderRadius: '6px',
              padding: '8px',
              minWidth: '120px',
              textAlign: 'center'
            }
          });

          edges.push({
            id: `e-${mainNodeId}-${conceptId}`,
            source: mainNodeId,
            target: conceptId,
            type: 'smoothstep',
            animated: true
          });

          // Sous-concepts avec positions ajustées
          const subConcepts = value as string[];
          subConcepts.forEach((subConcept, subIndex) => {
            const subAngle = angle + (subIndex - 1) * 0.5;
            const subId = createNodeId();

            nodes.push({
              id: subId,
              position: {
                x: centerX + Math.cos(angle) * radius + Math.cos(subAngle) * subRadius,
                y: centerY + Math.sin(angle) * radius + Math.sin(subAngle) * subRadius
              },
              data: { label: subConcept },
              style: {
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
                padding: '6px',
                fontSize: '12px'
              }
            });

            edges.push({
              id: `e-${conceptId}-${subId}`,
              source: conceptId,
              target: subId,
              type: 'smoothstep'
            });
          });
        }
      });

      return { nodes, edges };
    } catch (error) {
      console.error('Erreur lors de la transformation:', error);
      return { nodes: [], edges: [] };
    }
  };

  return (
    <SidebarProvider>
      <div className="relative flex h-screen overflow-hidden">
        <AppSidebar className="w-[300px] shrink-0 border-r" />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">AI Mindmap Creator</h1>
            
            <Card className="p-6">
              <div className="space-y-4">
                <Input
                  placeholder="Sur quel sujet voulez-vous créer une mindmap ?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full"
                />
                
                <Button 
                  onClick={handleGenerateMindmap}
                  disabled={loading || !prompt}
                  className="w-full"
                >
                  {loading ? 'Génération en cours...' : 'Générer la Mindmap'}
                </Button>
              </div>
            </Card>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {loading && (
              <div className="mt-8 p-4 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Génération de la mindmap en cours...</p>
              </div>
            )}

            {(nodes.length > 0 || edges.length > 0) && (
              <div className="mt-8 border rounded-xl bg-white" style={{ height: '70vh' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                  className="bg-slate-50"
                >
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
} 