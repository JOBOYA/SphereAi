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
    
    // Créer un JWT compatible avec Django REST framework JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const now = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({
      token_type: "access",
      exp: now + (60 * 60), // 1 heure
      orig_iat: now,
      clerk_id: userId,
      user_id: userId
    })
      .setProtectedHeader({ 
        alg: 'HS256',
        typ: 'JWT'
      })
      .setExpirationTime('1h')
      .setIssuedAt()
      .setNotBefore(now)
      .sign(secret);
    
    const body = await request.json();
    const path = params.path.join("/");
    
    console.log("👤 UserId:", userId);
    console.log("📍 Chemin API:", path);
    console.log("📦 Corps de la requête:", body);

    // Adapter le corps de la requête selon le endpoint
    let requestBody;
    if (path === "register") {
      requestBody = {
        email: body.email,
        clerk_id: userId,
        first_name: body.first_name || "",
        last_name: body.last_name || "",
      };
    } else if (path === "login") {
      requestBody = {
        email: body.email,
        clerk_id: userId,
        token_type: "access"
      };
    } else {
      requestBody = {
        ...body,
        clerk_id: userId
      };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `JWT ${token}`, // Utiliser JWT au lieu de Bearer
      "Accept": "application/json"
    };

    const apiUrl = `${process.env.API_BASE_URL}/${path}/`;
    console.log("🌐 URL API:", apiUrl);
    console.log("🔑 Token généré:", token);
    console.log("📤 Corps de la requête final:", requestBody);

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody)
    });

    // Vérifier si la réponse est JSON
    const contentType = apiResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Réponse non-JSON reçue:", await apiResponse.text());
      return NextResponse.json(
        { error: "Format de réponse invalide" },
        { status: 500 }
      );
    }

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("❌ Erreur API:", {
        status: apiResponse.status,
        path: path,
        data: data,
        requestBody: requestBody,
        headers: {
          ...headers,
          "Authorization": "JWT [MASKED]"
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