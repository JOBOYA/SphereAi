import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: "Token d'authentification manquant" },
        { status: 401 }
      )
    }

    const response = await fetch('https://appai.charlesagostinelli.com/api/chatMistral/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        message: prompt,
        conversation_id: Date.now().toString(),
        type: 'mindmap',
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      if (response.status === 503) {
        const data = await response.json()
        const estimatedTime = Math.ceil(data.estimated_time || 20)
        return NextResponse.json(
          { error: `Le modèle se charge, veuillez patienter environ ${estimatedTime} secondes` },
          { status: 503 }
        )
      }

      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || `Erreur API: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: `Erreur API: ${error instanceof Error ? error.message : '500'}` },
      { status: 500 }
    )
  }
} 