/**
 * Supabase ILIKE 검색 시 %, _ 등 메타문자를 이스케이프합니다.
 */
export function escapeIlikePattern(input: string) {
  return input.replace(/[%_]/g, (match) => `\\${match}`);
}
