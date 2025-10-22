# 위루다 선교 기도 공동체 웹 서비스

선교지 소식과 기도 제목을 공유하는 Next.js 15 기반 웹 서비스입니다.  
Supabase(Postgres) + Tailwind CSS + shadcn/ui 스택을 사용하며, 다국어 소통은 **브라우저 자동 번역 기능**을 활용하는 것을 기본 원칙으로 합니다.

## 현재 구현 현황

- Supabase 스키마 및 전 테이블 RLS 정책 적용
- 회원가입/로그인/로그아웃 흐름과 승인 상태 안내 UI
- 비한국어 사용자 안내를 위한 브라우저 자동 번역 가이드 UI
- 메인 페이지: 오늘의 말씀, 주요 기도, 최근 묵상/기도 카드와 브라우저 번역 안내
- 묵상 목록/상세/작성, 기도 목록/상세 및 반응(아멘·함께 기도) 기능 구현
- 후원 안내 페이지와 사이트 설정(기도 제목/계좌 정보) 편집 기능
- 관리자 전용 미들웨어, 회원 관리 대시보드(승인/역할 변경) 기본 구현
- 관리자 묵상/기도 관리 페이지(목록·상세·삭제/응답 처리)와 설정/후원자 섹션 뼈대 마련
- 관리자 후원자 CRUD 및 사이트 설정 편집 기능

## 개발 환경 준비

1. **필수 도구**
   - Node.js 20.x 이상
   - npm 10.x 이상
   - Supabase CLI (`brew install supabase/tap/supabase` 또는 [설치 가이드](https://supabase.com/docs/guides/cli))

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**  
   `.env.example` 파일을 복사해 `.env.local`을 생성한 뒤 값을 채워주세요.
   ```bash
   cp .env.example .env.local
   ```

   | 변수 | 설명 |
   | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서비스 롤 키 (서버 전용) |
| `NEXT_PUBLIC_SITE_URL` | 배포/로컬 접속 도메인 (예: `http://localhost:3000`) |
| `NEXT_PUBLIC_VERCEL_URL` (선택) | Vercel이 제공하는 배포 URL (예: `https://<project>.vercel.app`) – CSRF 허용 도메인에 자동 포함됩니다. |

## Supabase 설정

1. **프로젝트 초기화**
   ```bash
   supabase init
   ```

2. **로컬 DB 실행(선택)**
   ```bash
   supabase start
   ```

3. **마이그레이션 적용**
   ```bash
   supabase db reset --seed
   # 또는 기존 DB에 적용
   supabase db push
   ```

  아래 마이그레이션이 순차적으로 적용됩니다.
  - `0001_initial_schema.sql`: 기본 스키마 및 RLS 정책 정의
  - `0002_update_prayer_reaction_policy.sql`: 기도 반응 정책 갱신(차단 계정 제한)
  - `0003_add_media_columns.sql`: 묵상/기도 테이블 이미지 URL 컬럼 추가
  - `0004_harden_content_policies.sql`: 차단 계정의 묵상/기도 수정·삭제 차단

4. **원격 프로젝트에 동기화**
  ```bash
  supabase db push --remote <project-ref>
  ```

### 필수 RLS 점검

- 관리자 계정은 `profiles.role = 'admin'`이며 `status != 'blocked'` 이어야 합니다.
- `blocked` 상태로 변경된 계정은 새 묵상/기도 작성뿐 아니라 기존 글 수정·삭제도 불가하도록 정책이 강화되어 있습니다.
- 정책 변경 후에는 `supabase db reset --seed` 또는 테스트 계정으로 실제 제약이 동작하는지 확인하세요.

## 브라우저 자동 번역 안내

- 본 서비스는 한국어 원문을 기준으로 콘텐츠를 제공합니다.
- 다국어 사용자는 크롬, 엣지, 사파리 등 주요 브라우저의 **페이지 번역 기능**을 사용해 원하는 언어로 즉시 번역할 수 있습니다.
- 관리자와 작성자는 번역 품질 검수나 추가 비용 없이 콘텐츠를 유지관리할 수 있으며, 별도의 번역 플랫폼이나 API 통합이 필요하지 않습니다.
- 주요 작성 화면과 공용 페이지에는 브라우저 자동 번역 사용을 권장하는 안내가 포함되어 있습니다.

## 애플리케이션 실행

```bash
npm run dev
```

- 개발 서버: http://localhost:3000
- Turbopack 기반으로 빠른 HMR을 지원합니다.

### 품질 점검

```bash
npm run verify  # lint 포함 QA 스크립트
```

배포 전 최소한의 정적 검사(lint)를 통과하는지 확인하세요.

### 수동 QA 체크리스트

- [ ] **접근성**: 첫 번째 Tab 키 입력 시 `본문으로 바로가기` 링크가 노출되고, 엔터 시 주요 콘텐츠로 포커스가 이동하는지 확인합니다.
- [ ] **로딩/오류 UI**: DevTools > Network를 `Offline` 으로 전환 후 `/devotion`, `/prayer`, `/admin/devotions` 페이지가 사용자 친화적인 오류 안내를 노출하는지 확인합니다.
- [ ] **모바일 반응형**: iPhone SE / iPad / Galaxy Fold 등 스몰 브레이크포인트에서 헤더, 카드, 필터 폼이 겹치지 않는지 살펴봅니다.
- [ ] **다국어 안내**: 주요 페이지 상단의 자동 번역 안내 문구가 노출되고, 관리자 설정/묵상 페이지에서도 동일 정책이 유지되는지 검토합니다.
- [ ] **CSV 내보내기**: `후원자`, `묵상` 관리자 페이지에서 필터 조합별로 CSV 다운로드가 정상 동작하는지, 파일 인코딩이 UTF-8(BOM)인지 확인합니다.
- [ ] **브라우저 번역**: 크롬 번역 기능을 활성화해 한/영 변환 시 레이아웃이 깨지지 않는지 살펴봅니다.

## 보안 & 모니터링 설정

- **CSRF 보호**: `middleware.ts`가 POST/PUT/DELETE 요청의 `Origin/Referer`를 확인합니다. `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_VERCEL_URL` 값을 실제 배포 도메인으로 맞춘 뒤, 다른 도메인에서 `curl -X POST https://<도메인>/devotion/write` 등을 호출했을 때 `403`이 반환되는지 확인하세요.
- **공격 표면 최소화**: 미들웨어가 `Strict-Transport-Security`, `X-Frame-Options`, `Permissions-Policy` 등 기본 보안 헤더를 추가합니다. 배포 후 아래 명령으로 헤더가 노출되는지 확인합니다.
  ```bash
  curl -I https://mission.wiruda.com | grep -i 'strict-transport-security'
  ```
- **구조화 로그**: `lib/monitoring/logger.ts`를 통해 서버/클라이언트 에러가 JSON 형태로 출력됩니다. Vercel Log Drains, Supabase Log Explorer, Datadog 등 원하는 로그 수집 플랫폼과 연동하면 장애 모니터링을 쉽게 자동화할 수 있습니다.
- **경고 알림**: Log Drains 또는 Vercel Webhook을 활용해 `level=error` 이벤트를 Slack/Teams로 전달하면 실시간 대응이 가능합니다. (Sentry, Logtail 등 APM/SIEM 연동도 권장됩니다.)

## 배포 체크리스트

1. **환경 변수 구성**  
   Vercel 프로젝트에 아래 값을 설정합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (예: `https://mission.wiruda.com`)
   - `SUPABASE_SERVICE_ROLE_KEY` (Edge/서버 전용, Vercel 환경에서만 사용)

2. **Supabase 원격 마이그레이션**  
   ```bash
   supabase db push --remote <project-ref>
   ```

3. **스토리지 버킷 준비**  
   `content-images` (또는 `NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET` 환경 변수로 지정한 이름) 버킷을 생성하고 **Public** 권한을 부여합니다.

4. **도메인 연결**  
   - Vercel에서 `mission.wiruda.com` 커스텀 도메인을 연결합니다.
   - DNS가 전파된 뒤 `NEXT_PUBLIC_SITE_URL` 값을 실제 도메인으로 갱신합니다.

5. **보안 확인**  
   - 관리자 계정으로 로그인해 `/admin` 이하 페이지 접근을 확인합니다.
   - 승인 대기/거절/차단 계정으로 로그인을 시도해 RLS/미들웨어가 기대대로 동작하는지 검증합니다.
    - 배포 URL에 `curl -I`를 수행해 `Strict-Transport-Security`, `X-Frame-Options` 헤더가 추가됐는지 확인합니다.
    - 서로 다른 도메인에서 CSRF 시도를 했을 때 `403` 응답이 내려오는지 테스트합니다.
6. **모니터링 연동**  
   - Vercel Log Drains 또는 원하는 로그 파이프라인을 연결해 JSON 로그(`level=info|warn|error`)가 수집되는지 확인합니다.
   - 필요 시 Sentry/Logtail 등 외부 APM을 연결해 에러 알림을 자동화합니다.

## 주요 디렉터리 구조

```
app/                     Next.js App Router 라우트
  (auth)/                로그인/회원가입 등 인증 관련 페이지
components/              재사용 가능한 UI 및 폼 컴포넌트
context/                 React Context (언어 등)
lib/                     Supabase, 인증, 검증 유틸리티
supabase/                SQL 마이그레이션, Edge Functions
types/                   Supabase DB 타입 정의
```

## 권한 및 보안 메모

- Supabase Row Level Security 정책이 모든 테이블에 적용되어 있습니다.
- 승인된 회원(`status=approved`)만 묵상/기도 작성이 가능하며, 본인 콘텐츠만 수정·삭제할 수 있습니다.
- 관리자만 `/admin` 영역과 후원자 정보에 접근할 수 있도록 정책 및 미들웨어가 설계됩니다.
- 브라우저 저장소(localStorage/sessionStorage)를 사용하지 않고 Supabase 세션 쿠키 기반 인증을 사용합니다.

## 향후 구현 우선순위

1. 이미지 업로드 워크플로우 개선 및 파일 삭제 정책 도입
2. 관리자 대시보드 통계 그래프/Export 기능 고도화
3. E2E 테스트 및 모니터링 연동, 알림(이메일/웹훅) 자동화

## 문의

요구사항이나 구현 방향에 대해 추가로 필요한 사항이 있다면 언제든지 알려주세요. 함께 멋진 선교 플랫폼을 만들어갑시다! 🙌
