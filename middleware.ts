import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
    publicRoutes: [
        "/",  
        "/api/(.*)",
        "/login",
        "/register",
        "/dashboard"
    ],
    afterAuth(auth, req, evt) {
        const path = new URL(req.url).pathname;

        if (path.startsWith('/api/')) {
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
        '/((?!.+\\.[\\w]+$|_next).*)',
        '/',
        '/(api|trpc)(.*)'
    ],
};