# RLS 정책 스모크 테스트 가이드

다음 SQL을 Supabase CLI로 실행하여 주요 행위자에 대한 권한을 확인할 수 있습니다.

```bash
supabase db query < docs/sql/rls_smoke.sql
```

테스트는 아래 시나리오를 다룹니다.

- 비회원(익명) 조회 가능 범위 확인
- 승인된 회원의 묵상/기도 작성 허용 여부
- 승인 대기 회원의 작성 차단 여부
- 관리자의 후원자 데이터 접근 검증

추가 시나리오가 필요하다면 `docs/sql/rls_smoke.sql`을 확장해주세요.
