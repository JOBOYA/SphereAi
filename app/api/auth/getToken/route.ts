import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { getToken } = auth();
  
  try {
    const token = await getToken();
    return new NextResponse(token || '', {
      status: 200,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return new NextResponse('', {
      status: 401,
    });
  }
} 