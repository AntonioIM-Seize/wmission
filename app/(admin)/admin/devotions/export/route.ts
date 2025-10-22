import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/session';
import { getDevotionsForExport, type DevotionListFilters } from '@/lib/data/devotion';

function isValidDate(value: string | null) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseHasImage(value: string | null): DevotionListFilters['hasImage'] {
  if (value === 'with' || value === 'without') {
    return value;
  }
  return 'all';
}

function toCsvCell(value: string | number | boolean | null) {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}

export async function GET(request: Request) {
  await requireRole('admin');

  const { searchParams } = new URL(request.url);

  const search = searchParams.get('q')?.trim() ?? '';
  const startDate = isValidDate(searchParams.get('startDate')) ? searchParams.get('startDate') : null;
  const endDate = isValidDate(searchParams.get('endDate')) ? searchParams.get('endDate') : null;
  const hasImage = parseHasImage(searchParams.get('hasImage'));

  if (startDate && endDate && startDate > endDate) {
    return new NextResponse('날짜 범위가 올바르지 않습니다.', { status: 400 });
  }

  const filters: DevotionListFilters = {
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    hasImage,
  };

  const rows = await getDevotionsForExport(filters);

  const header = ['ID', '제목', '성경 구절', '게시일', '작성자', '조회수', '이미지 여부'];
  const csvRows = [
    header.map(toCsvCell).join(','),
    ...rows.map((row) =>
      [
        row.id,
        row.title,
        row.scriptureRef,
        row.publishedAt,
        row.authorName,
        row.views,
        row.hasImage ? 'Y' : 'N',
      ]
        .map(toCsvCell)
        .join(','),
    ),
  ];

  const bom = '\ufeff';
  const csv = `${bom}${csvRows.join('\r\n')}`;
  const filename = `devotions-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
