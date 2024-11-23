import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
    publicRoutes: [
        "/",  
        "/api/auth/getToken",
        "/sign-in",
        "/sign-up"   
    ],
    afterAuth(auth, req, evt) {
        // Obtenir le chemin de l'URL
        const path = new URL(req.url).pathname;

        // Si l'utilisateur n'est pas connecté et essaie d'accéder à /dashboard
        if (!auth.userId && path.startsWith('/dashboard')) {
            return Response.redirect(new URL('/sign-in', req.url));
        }

        // Si l'utilisateur est connecté et essaie d'accéder aux pages de connexion
        if (auth.userId && (path.startsWith('/sign-in') || path.startsWith('/sign-up'))) {
            return Response.redirect(new URL('/dashboard', req.url));
        }
    }
});

export const config = {
    matcher: [
        '/((?!.+\\.[\\w]+$|_next).*)',
        '/',
        '/(api|trpc)(.*)',
        '/api/chat',
        '/api/user-conversations',
        '/transcription',
        '/api/transcription'
    ],
};
