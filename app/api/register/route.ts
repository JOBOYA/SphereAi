import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, clerkUserId } = body

        // Récupérer les informations détaillées de l'utilisateur depuis Clerk
        const clerkUser = await clerkClient.users.getUser(clerkUserId)
        
        // Préparer les données pour votre API
        const userData = {
            email: email,
            clerk_id: clerkUserId,
            first_name: clerkUser.firstName || "",
            last_name: clerkUser.lastName || "",
            clerk_token: body.clerk_token
        }

        // Appeler votre API d'inscription
        const response = await fetch("https://appai.charlesagostinelli.com/api/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.detail || "Erreur lors de l\"inscription")
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Erreur d\"inscription:", error)
        return NextResponse.json(
            { error: "Erreur lors de l\"inscription" },
            { status: 400 }
        )
    }
} 