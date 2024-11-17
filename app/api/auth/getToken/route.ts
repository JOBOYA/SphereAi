import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headersList = headers();
    // ... reste du code
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération du token' }, { status: 500 });
  }
} 