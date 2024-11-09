import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegment = params.path.join('/');
  const apiUrl = `https://appai.charlesagostinelli.com/api/${pathSegment}/`;

  console.log('🎯 URL appelée:', apiUrl);

  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    console.log('📦 Données envoyées:', body);
    console.log('🔑 Headers d\'autorisation présents:', !!authHeader);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('❌ Erreur API:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.message || `Erreur API: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Réponse reçue:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 Erreur proxy:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 