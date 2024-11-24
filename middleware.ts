import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
    publicRoutes: [
        "/",  
        "/api/(.*)",  // Permet tous les appels API
        "/login",
        "/register",
        "/dashboard",
        "/_next/static/(.*)",  // Permet l'accès aux ressources statiques
        "/favicon.ico",
        "/api/auth/(.*)",      // Routes d'authentification
        "/api/webhook/(.*)"    // Webhooks
    ],
    ignoredRoutes: [
        "/api/auth/(.*)",      // Ignore le middleware pour ces routes
        "/api/webhook/(.*)",
        "/_next/static/(.*)",
        "/favicon.ico"
    ],
    afterAuth(auth, req, evt) {
        const path = new URL(req.url).pathname;
        const isApiRoute = path.startsWith('/api/');

        // Ne pas rediriger les appels API
        if (isApiRoute) {
            return;
        }

        if (!auth.userId && !path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/')) {
            return Response.redirect(new URL('/login', req.url));
        }

        if (auth.userId && (path.startsWith('/login') || path.startsWith('/register'))) {
            return Response.redirect(new URL('/dashboard', req.url));
        }
    }
});

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/",
        "/(api|trpc)(.*)",
    ],
};
