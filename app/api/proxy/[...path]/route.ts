import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { SignJWT } from 'jose';

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { getToken, userId } = auth();
    const clerkToken = await getToken();
    
    if (!clerkToken || !userId) {
      return NextResponse.json(
        { error: "Token d'authentification non disponible" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const path = params.path.join("/");
    
    // Récupérer le token d'autorisation de la requête
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: "Token d'autorisation manquant" },
        { status: 401 }
      );
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // Utiliser le token de la requête
      "Accept": "application/json"
    };

    const apiUrl = `${process.env.API_BASE_URL}/${path}/`;
    console.log("🌐 URL API:", apiUrl);
    console.log("🔑 Token utilisé:", token.slice(0, 20) + '...');
    console.log("📤 Corps de la requête final:", body);

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    // Ajout de logs pour déboguer
    console.log("📥 Status API:", apiResponse.status);
    console.log("📥 Headers API:", Object.fromEntries(apiResponse.headers.entries()));
    
    // Récupérer le texte brut de la réponse d'abord
    const responseText = await apiResponse.text();
    console.log("📥 Réponse brute:", responseText);

    // Essayer de parser le JSON avec plus de sécurité
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError);
      console.error("❌ Contenu reçu:", responseText);
      return NextResponse.json(
        { 
          error: "Impossible de parser la réponse",
          rawResponse: responseText.slice(0, 500) // Limiter la taille pour le log
        },
        { status: 500 }
      );
    }

    if (!apiResponse.ok) {
      console.error("❌ Erreur API:", {
        status: apiResponse.status,
        path: path,
        data: data,
        requestBody: body,
        headers: {
          ...headers,
          "Authorization": "Bearer [MASKED]"
        }
      });
      return NextResponse.json(data, { status: apiResponse.status });
    }

    console.log("✅ Réponse API réussie:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("🚨 Erreur proxy:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return NextResponse.json({ error: "Méthode non supportée" }, { status: 405 });
}