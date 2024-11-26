import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { userId, getToken } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    if (!process.env.API_BASE_URL) {
      console.error("API_BASE_URL non définie");
      return NextResponse.json(
        { error: "Configuration du serveur incorrecte" },
        { status: 500 }
      );
    }

    const path = params.path.join("/");
    const originalBody = await request.json();
    const isLoginRequest = path === 'login';
    
    const body = isLoginRequest
      ? { ...originalBody, clerk_id: userId }
      : originalBody;

    const apiUrl = `${process.env.API_BASE_URL}/${path}/`.replace(/\/+/g, '/');

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (!isLoginRequest) {
      const token = await getToken();
      if (!token) {
        return NextResponse.json(
          { error: "Token d'authentification non disponible" },
          { status: 401 }
        );
      }
      headers["Authorization"] = `Bearer ${token}`;
      headers["X-User-ID"] = userId;
    }

    try {
      console.log("URL de l'API:", apiUrl);
      console.log("Corps de la requête:", body);
      console.log("Headers:", {
        ...headers,
        "Authorization": headers.Authorization ? "Bearer [MASQUÉ]" : "Non envoyé"
      });
      
      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      console.log("Statut de la réponse:", apiResponse.status);
      
      const contentType = apiResponse.headers.get('content-type');
      let responseData;

      if (contentType?.includes('application/json')) {
        responseData = await apiResponse.json();
      } else {
        const text = await apiResponse.text();
        responseData = { data: text };
      }

      if (!apiResponse.ok) {
        console.error(`Erreur API (${apiResponse.status}):`, responseData);
        return NextResponse.json(responseData, { 
          status: apiResponse.status 
        });
      }

      return NextResponse.json(responseData, { 
        status: apiResponse.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (fetchError) {
      console.error("Erreur fetch:", fetchError);
      return NextResponse.json(
        { error: "Erreur de connexion à l'API" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Erreur proxy:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur", 
        details: error instanceof Error ? error.message : "Erreur inconnue" 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest, 
  { params }: { params: { path: string[] } }
) {
  return NextResponse.json(
    { error: "Méthode non supportée" }, 
    { status: 405 }
  );
}