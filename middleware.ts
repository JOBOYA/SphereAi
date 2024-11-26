import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
    publicRoutes: [
        "/",  
        "/api/auth/getToken",
        "/login",
        "/register",
        "/dashboard",
        "/api/proxy"
    ],
    afterAuth(auth, req, evt) {
        const path = new URL(req.url).pathname;

        // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
        if (!auth.userId && !path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/')) {
            return Response.redirect(new URL('/login', req.url));
        }

        // Si l'utilisateur est connecté et sur une page d'authentification
        if (auth.userId && (path.startsWith('/login') || path.startsWith('/register'))) {
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
        '/api/transcription',
        '/api/proxy'
    ],
};