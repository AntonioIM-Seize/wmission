-- RLS 검증용 스크립트
-- 사용 전 아래 UUID를 실제 환경에 맞게 변경하세요.

-- 승인된 회원 (approved)
\set approved_user_uuid '00000000-0000-0000-0000-000000000001'

-- 승인 대기 회원 (pending)
\set pending_user_uuid '00000000-0000-0000-0000-000000000002'

-- 관리자 계정 (admin)
\set admin_user_uuid '00000000-0000-0000-0000-000000000003'

------------------------------------------------------------
-- 1. 승인 회원이 묵상글 작성 가능 여부 확인
------------------------------------------------------------
select set_config('request.jwt.claim.sub', :'approved_user_uuid', false);
select set_config('request.jwt.claim.role', 'authenticated', false);

-- 기대: 성공 (status = approved)
insert into devotions (author_id, title, scripture_ref, body)
values (
  auth.uid(),
  '테스트 묵상 제목',
  '요한복음 3:16',
  '하나님이 세상을 이처럼 사랑하사...'
);

-- 작성한 데이터 정리
delete from devotions where author_id = :'approved_user_uuid' and title = '테스트 묵상 제목';

------------------------------------------------------------
-- 2. 승인 대기 회원이 묵상글 작성 시 차단 확인
------------------------------------------------------------
select set_config('request.jwt.claim.sub', :'pending_user_uuid', false);
select set_config('request.jwt.claim.role', 'authenticated', false);

-- 기대: RLS with check 위반으로 실패
insert into devotions (author_id, title, scripture_ref, body)
values (
  auth.uid(),
  '작성 불가 테스트',
  '시편 23편',
  '여호와는 나의 목자시니...'
);

------------------------------------------------------------
-- 3. 관리자 문의 데이터 접근 확인
------------------------------------------------------------
select set_config('request.jwt.claim.sub', :'admin_user_uuid', false);
select set_config('request.jwt.claim.role', 'authenticated', false);

-- 기대: 조회 성공
select * from inquiries limit 1;

------------------------------------------------------------
-- 4. 일반 회원 문의 데이터 접근 차단 확인
------------------------------------------------------------
select set_config('request.jwt.claim.sub', :'approved_user_uuid', false);
select set_config('request.jwt.claim.role', 'authenticated', false);

-- 기대: 권한 오류
select * from inquiries limit 1;

------------------------------------------------------------
-- 5. 승인 대기 회원 기도 반응 허용 확인
------------------------------------------------------------
select set_config('request.jwt.claim.sub', :'pending_user_uuid', false);
select set_config('request.jwt.claim.role', 'authenticated', false);

-- 기대: 성공 (status != blocked)
insert into prayer_reactions (prayer_id, member_id, reaction_type)
values (
  -- 테스트용 prayer UUID 로 대체
  '00000000-0000-0000-0000-000000000010',
  auth.uid(),
  'amen'
)
on conflict do nothing;

delete from prayer_reactions
where prayer_id = '00000000-0000-0000-0000-000000000010'
  and member_id = :'pending_user_uuid';

------------------------------------------------------------
-- 6. 세션 리셋
------------------------------------------------------------
select set_config('request.jwt.claim.sub', null, false);
select set_config('request.jwt.claim.role', null, false);
