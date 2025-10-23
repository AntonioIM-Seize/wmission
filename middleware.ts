import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    
    // 기본 보안 헤더만 적용
    response.headers.set('x-content-type-options', 'nosniff');
    response.headers.set('x-frame-options', 'DENY');
    response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    // 미들웨어 전체 에러 처리
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};