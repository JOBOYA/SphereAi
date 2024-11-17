import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Token non fourni' }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 