import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { userId, getToken } = auth();
    console.log(" Début de la requête proxy");
    console.log("Auth info:", { userId });
    console.log("API_BASE_URL:", process.env.API_BASE_URL);
    
    const token = await getToken();
    console.log("Token:", {
        exists: !!token,
        userId: userId,
        url: process.env.API_BASE_URL
    });
    
    if (!userId) {
      console.log("❌ Pas d'userId");
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
    console.log("URL finale:", apiUrl);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (!isLoginRequest) {
      const token = await getToken({
        template: "default"
      });
      
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
      
      console.log("Requête vers:", apiUrl);
      console.log("Headers:", {
        ...headers,
        Authorization: headers.Authorization ? "Bearer [MASQUÉ]" : "Non défini"
      });
      
      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      console.log("Réponse complète:", {
        status: apiResponse.status,
        headers: Object.fromEntries(apiResponse.headers.entries()),
        url: apiResponse.url
      });
      
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
  try {
    const { userId, getToken } = auth();
    console.log("GET - Auth info:", { userId });
    console.log("GET - Path:", params.path);
    
    if (!userId) {
      console.log("GET - Pas d'userId");
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const token = await getToken();
    console.log("GET - Token obtenu:", token ? "Oui" : "Non");

    const path = params.path.join("/");
    const apiUrl = `${process.env.API_BASE_URL}/${path}/`.replace(/\/+/g, '/');

    console.log("GET - URL finale:", apiUrl);

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "X-User-ID": userId
    };

    console.log("GET - Headers envoyés:", {
      ...headers,
      Authorization: "Bearer [MASQUÉ]"
    });

    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers
    });

    console.log("GET - Réponse API:", {
      status: apiResponse.status,
      url: apiResponse.url,
      headers: Object.fromEntries(apiResponse.headers.entries())
    });

    const contentType = apiResponse.headers.get('content-type');
    let responseData;

    if (contentType?.includes('application/json')) {
      responseData = await apiResponse.json();
    } else {
      const text = await apiResponse.text();
      responseData = { data: text };
    }

    if (!apiResponse.ok) {
      console.error(`GET - Erreur API (${apiResponse.status}):`, responseData);
      return NextResponse.json(responseData, { status: apiResponse.status });
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("GET - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}