import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/session';
import { getSupporters } from '@/lib/admin/supporters';

function isValidDate(value: string | null) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCsvCell(value: string | number | null) {
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
  const minAmount = toNumber(searchParams.get('minAmount'));
  const maxAmount = toNumber(searchParams.get('maxAmount'));

  if (startDate && endDate && startDate > endDate) {
    return new NextResponse('날짜 범위가 올바르지 않습니다.', { status: 400 });
  }

  const supporters = await getSupporters({
    search: search || null,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  });

  const rows = [
    ['이름', '금액', '후원일', '메모', '등록일'].map(toCsvCell).join(','),
    ...supporters.map((supporter) =>
      [
        supporter.name,
        supporter.amount,
        supporter.supportedOn,
        supporter.memo ?? '',
        supporter.createdAt,
      ]
        .map(toCsvCell)
        .join(','),
    ),
  ];

  const bom = '\ufeff';
  const csv = `${bom}${rows.join('\r\n')}`;

  const filename = `supporters-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
