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

export default function MindmapPage() {
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

  const transformResponseToMindmap = (response: string): { nodes: Node[], edges: Edge[] } => {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response;
      const data = JSON.parse(jsonStr);

      const nodes: Node[] = [];
      const edges: Edge[] = [];
      
      // Ajouter le nœud central
      const centralConcept = Object.keys(data)[0];
      nodes.push({
        id: 'central',
        position: { x: 0, y: 0 },
        data: { label: data[centralConcept] },
        type: 'default'
      });

      // Ajouter les concepts et sous-concepts
      Object.entries(data).forEach(([concept, subConcepts], index) => {
        if (concept === centralConcept) return;

        const angle = (2 * Math.PI * index) / (Object.keys(data).length - 1);
        const radius = 200;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Ajouter le nœud du concept
        const conceptId = `concept-${index}`;
        nodes.push({
          id: conceptId,
          position: { x, y },
          data: { label: concept },
          type: 'default'
        });

        // Connecter au concept central
        edges.push({
          id: `edge-central-${conceptId}`,
          source: 'central',
          target: conceptId,
          type: 'default'
        });

        // Ajouter les sous-concepts
        if (Array.isArray(subConcepts)) {
          subConcepts.forEach((subConcept, subIndex) => {
            const subAngle = angle + (subIndex - (subConcepts.length - 1) / 2) * 0.5;
            const subRadius = radius + 150;
            const subX = Math.cos(subAngle) * subRadius;
            const subY = Math.sin(subAngle) * subRadius;

            const subConceptId = `${conceptId}-sub-${subIndex}`;
            nodes.push({
              id: subConceptId,
              position: { x: subX, y: subY },
              data: { label: subConcept },
              type: 'default'
            });

            edges.push({
              id: `edge-${conceptId}-${subConceptId}`,
              source: conceptId,
              target: subConceptId,
              type: 'default'
            });
          });
        }
      });

      return { nodes, edges };
    } catch (error) {
      console.error('Erreur de transformation:', error);
      return { nodes: [], edges: [] };
    }
  };

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Mindmap Creator</h1>
          <p className="text-gray-600">Créez facilement des cartes mentales avec l'aide de l'IA</p>
        </div>

        <Card className="p-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Sur quel sujet voulez-vous créer une mindmap ?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            
            <Button 
              onClick={handleGenerateMindmap}
              disabled={loading || !prompt}
              className="md:w-auto"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  Génération...
                </>
              ) : (
                'Générer'
              )}
            </Button>
          </div>
        </Card>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {loading && (
          <Card className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200 mb-4"></div>
            <p className="text-gray-600">Génération de votre mindmap en cours...</p>
          </Card>
        )}

        {(nodes.length > 0 || edges.length > 0) && (
          <Card className="p-0 overflow-hidden" style={{ height: '70vh' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              className="bg-slate-50"
            >
              <Controls className="bg-white shadow-lg rounded-lg" />
              <Background color="#94a3b8" gap={16} size={1} />
            </ReactFlow>
          </Card>
        )}
      </div>
    </div>
  )
} 