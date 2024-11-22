import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
<<<<<<< Updated upstream
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1];

=======
    const { getToken } = auth();
    const token = await getToken({ template: "access" });
    
>>>>>>> Stashed changes
    if (!token) {
      return NextResponse.json({ error: 'Token non fourni' }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 