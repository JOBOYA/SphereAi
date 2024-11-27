'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import { mindmapService } from '@/app/services/mindmap-service'
import { Node, Edge } from '@/app/types/mindmap'
import Mindmap from '@/app/components/Mindmap'

export default function MindmapPage() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuth()
  const router = useRouter()

  const handleGenerateMindmap = async () => {
    if (!topic.trim()) {
      setError('Veuillez entrer un sujet')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { nodes: newNodes, edges: newEdges } = await mindmapService.generateMindmap(topic, accessToken!)
      setNodes(newNodes)
      setEdges(newEdges)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération')
      console.error('Erreur lors de la génération:', err)
    } finally {
      setLoading(false)
    }
  }

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
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1"
            />
            
            <Button 
              onClick={handleGenerateMindmap}
              disabled={loading || !topic}
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
            <ReactFlowProvider>
              <Mindmap nodes={nodes} edges={edges} />
            </ReactFlowProvider>
          </Card>
        )}
      </div>
    </div>
  )
} 