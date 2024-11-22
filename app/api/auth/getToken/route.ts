import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getToken } = auth();
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "Token non disponible" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Erreur lors de la récupération du token:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du token" },
      { status: 500 }
    );
  }
} 