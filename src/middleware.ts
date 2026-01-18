import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isOnLogin = req.nextUrl.pathname.startsWith('/login');

    // Redirect logged-in users away from login page
    if (isOnLogin && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    // Redirect non-logged-in users to login page for protected routes
    if (isOnDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
