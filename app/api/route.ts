// app/api/user-data/route.ts
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') // Récupère l'userId depuis l'URL

    if (!userId) {
        return NextResponse.json({ error: 'userId est requis dans les paramètres de l’URL' })
    }

    try {
        const user = await clerkClient.users.getUser(userId)
        return NextResponse.json({ userId: user.id, privateMetadata: user.privateMetadata })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération des informations utilisateur' })
    }
}
