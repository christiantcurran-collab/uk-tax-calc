import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/expenses', '/scan', '/mileage', '/ask', '/reports', '/settings'];
const ALLOWED_STATUSES = ['active', 'trialing'];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const isProtected = PROTECTED_PATHS.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  if (isProtected) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', session.user.id)
      .single();

    if (!profile || !ALLOWED_STATUSES.includes(profile.subscription_status)) {
      return NextResponse.redirect(
        new URL('/pricing?reason=subscription_required', req.url)
      );
    }
  }

  // Redirect logged-in users away from auth pages
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/expenses/:path*',
    '/scan/:path*',
    '/mileage/:path*',
    '/ask/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};

