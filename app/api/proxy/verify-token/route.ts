import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
    try {
        const { getToken, userId } = auth();
        const clerkToken = await getToken();
        
        if (!clerkToken || !userId) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.API_BASE_URL}/verify-user/`, {
            headers: {
                "Authorization": `Bearer ${clerkToken}`
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur de vérification" },
            { status: 500 }
        );
    }
} 