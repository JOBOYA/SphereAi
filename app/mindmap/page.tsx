'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ReactFlowProvider } from 'reactflow'
import { Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-10"
        >
          {/* En-tête */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Mindmap Creator
              </h1>
              <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Donnez vie à vos idées avec des cartes mentales élégantes
              </p>
            </motion.div>
          </div>

          {/* Zone de saisie */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Décrivez votre sujet avec précision..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-12 pl-4 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
              
              <Button 
                onClick={handleGenerateMindmap}
                disabled={loading || !topic}
                className="h-12 px-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Générer</span>
                  </div>
                )}
              </Button>
            </div>
          </Card>

          {/* Message d'erreur */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-600"
            >
              {error}
            </motion.div>
          )}

          {/* ��tat de chargement */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card className="p-10 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl" />
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-4" />
                <p className="text-slate-600 font-medium">Création de votre mindmap en cours...</p>
                <p className="text-slate-500 text-sm mt-2">Nous analysons votre sujet avec soin</p>
              </Card>
            </motion.div>
          )}

          {/* Affichage de la Mindmap */}
          {(nodes.length > 0 || edges.length > 0) && (
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl" 
                  style={{ height: '70vh' }}>
              <ReactFlowProvider>
                <Mindmap initialNodes={nodes} initialEdges={edges} />
              </ReactFlowProvider>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
} 