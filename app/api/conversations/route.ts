import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('/api/proxy/user-conversations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('🚨 Erreur route conversations:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
} 