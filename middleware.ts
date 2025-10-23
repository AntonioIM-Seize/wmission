import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';

const APPROVED_ONLY_PATHS = ['/devotion/write'];
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const LOCAL_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

function logWarn(message: string, meta?: Record<string, unknown>) {
  console.warn(
    JSON.stringify({
      level: 'warn',
      message,
      meta,
      timestamp: new Date().toISOString(),
      source: 'middleware',
    }),
  );
}

export async function middleware(request: NextRequest) {
  const csrfViolation = enforceCsrf(request);
  if (csrfViolation) {
    return csrfViolation;
  }

  const response = NextResponse.next();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Admin 페이지 보호
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, status')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile || (profile as any).role !== 'admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      redirectUrl.searchParams.delete('redirectTo');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 승인된 사용자만 접근 가능한 경로
  if (APPROVED_ONLY_PATHS.includes(pathname)) {
    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile || (profile as any).status !== 'approved') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      redirectUrl.searchParams.set('notice', 'pending');
      return NextResponse.redirect(redirectUrl);
    }
  }

  applySecurityHeaders(response, request);
  return response;
}

// ✅ 수정된 부분: 모든 경로에서 middleware 실행
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에서 실행:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - public 폴더 파일들 (*.svg, *.png 등)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

function normalizeOrigin(value?: string | null) {
  if (!value) {
    return null;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return `https://${value}`;
}

function buildAllowedOrigins(request: NextRequest) {
  const allowedOrigins = new Set<string>();

  LOCAL_ORIGINS.forEach((origin) => allowedOrigins.add(origin));

  const siteUrl = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (siteUrl) {
    allowedOrigins.add(siteUrl);
  }

  const vercelUrl = normalizeOrigin(process.env.NEXT_PUBLIC_VERCEL_URL);
  if (vercelUrl) {
    allowedOrigins.add(vercelUrl);
  }

  const host = request.headers.get('host');
  if (host) {
    allowedOrigins.add(`${request.nextUrl.protocol}//${host}`);
  }

  return allowedOrigins;
}

function enforceCsrf(request: NextRequest) {
  if (SAFE_METHODS.has(request.method)) {
    return null;
  }

  const allowedOrigins = buildAllowedOrigins(request);
  const origin = request.headers.get('origin');

  if (origin && !allowedOrigins.has(origin)) {
    logWarn('차단된 교차 출처 요청', { origin, path: request.nextUrl.pathname, method: request.method });
    return new NextResponse('CSRF 보호에 의해 차단되었습니다.', { status: 403 });
  }

  if (!origin) {
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (!allowedOrigins.has(refererOrigin)) {
          logWarn('차단된 교차 출처 요청', {
            referer,
            path: request.nextUrl.pathname,
            method: request.method,
          });
          return new NextResponse('CSRF 보호에 의해 차단되었습니다.', { status: 403 });
        }
      } catch {
        logWarn('유효하지 않은 Referer 헤더로 인한 요청 차단', {
          referer,
          path: request.nextUrl.pathname,
          method: request.method,
        });
        return new NextResponse('CSRF 보호에 의해 차단되었습니다.', { status: 403 });
      }
    }
  }

  return null;
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('cross-origin-opener-policy', 'same-origin');

  const host = request.headers.get('host') ?? '';
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  if (request.nextUrl.protocol === 'https:' && !isLocalhost) {
    response.headers.set('strict-transport-security', 'max-age=63072000; includeSubDomains; preload');
  }
}