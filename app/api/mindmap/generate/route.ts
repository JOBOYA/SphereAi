import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    const prompt = `Génère une mindmap sur le sujet "${topic}". 
    Format attendu: une liste hiérarchique avec des tirets (-) pour le premier niveau et des astérisques (*) pour le second niveau.
    Exemple:
    - Concept principal 1
    * Sous-concept 1.1
    * Sous-concept 1.2
    - Concept principal 2
    * Sous-concept 2.1
    * Sous-concept 2.2
    Ne pas inclure d'introduction ni de conclusion, uniquement la structure de la mindmap.`

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    const data = await response.json()
    return NextResponse.json({
      content: data.choices[0].message.content,
      status: 'success'
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 