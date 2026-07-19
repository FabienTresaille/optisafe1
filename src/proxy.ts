import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me-in-production'
);

const COOKIE_NAME = 'optisafe-token';

// Routes publiques (pas d'authentification requise)
const PUBLIC_ROUTES = [
  '/',           // Landing page
  '/login',
  '/register',
];

// Préfixes de routes publiques
const PUBLIC_PREFIXES = [
  '/api/auth/',  // Auth API routes
  '/_next/',     // Next.js internal
  '/fonts/',     // Static fonts
  '/images/',    // Static images
  '/favicon',    // Favicon
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les routes publiques
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Laisser passer les préfixes publics
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Vérifier le token JWT
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // Rediriger vers le login pour les pages, 401 pour les API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Token invalide ou expiré
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Token invalide' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    // Supprimer le cookie invalide
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
