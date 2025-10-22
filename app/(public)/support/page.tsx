import type { Metadata } from 'next';

import { MailIcon, MessageCircleHeartIcon, PiggyBankIcon } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getSiteSettings } from '@/lib/data/settings';

const TITLE = '후원 안내 | 위루다 선교 공동체';
const DESCRIPTION =
  '선교 사역을 위한 후원 계좌와 안내 문구를 확인하세요. 기도와 물질로 함께 동역해주시는 모든 분께 감사드립니다.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/support',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function SupportPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-rose-50 p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              후원 안내
            </Badge>
            <h1 className="text-3xl font-semibold leading-snug text-slate-900 md:text-4xl">선교 사역을 함께 세워주세요</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              후원금은 현지 선교사 지원, 기도 네트워크 운영, 현장 소식 제작에 사용됩니다. 기도와 물질로 함께 동역해주셔서 감사합니다.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/prayer">기도로 동역하기</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <PiggyBankIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">후원 계좌 정보</CardTitle>
              <p className="text-xs text-muted-foreground">국내 은행 계좌로 송금하실 수 있습니다.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {settings ? (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">은행</p>
                  <p className="text-base font-semibold text-slate-900">{settings.bankName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">계좌번호</p>
                  <p className="text-lg font-mono text-primary">{settings.bankAccount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">예금주</p>
                  <p className="text-base text-slate-900">{settings.bankHolder}</p>
                </div>
              </>
            ) : (
              <p>후원 계좌 정보가 준비 중입니다. 곧 업데이트될 예정입니다.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <MessageCircleHeartIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">주요 기도 제목</CardTitle>
              <p className="text-xs text-muted-foreground">매일 한 가지 기도 제목을 붙들고 기도해주세요.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {settings ? (
              <>
                <p className="text-base text-slate-900">{settings.mainPrayer}</p>
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription>기도 제목은 주기적으로 갱신됩니다. 소식을 받으시려면 이메일로 문의해주세요.</AlertDescription>
                </Alert>
              </>
            ) : (
              <p>기도 제목이 준비 중입니다.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">후원 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              <li>온라인 이체 시 “선교후원”이라고 메모를 남겨주세요.</li>
              <li>정기 후원을 원하시면 정해진 날짜에 자동이체를 설정해주세요.</li>
              <li>해외 송금이나 기업 후원에 대해서는 관리자에게 문의 바랍니다.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <MailIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">문의 연락처</CardTitle>
              <p className="text-xs text-muted-foreground">언제든지 연락주시면 감사 인사와 소식을 전해드릴게요.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">이메일</p>
              <a className="text-base text-primary underline-offset-4 hover:underline" href="mailto:mission@wiruda.com">
                mission@wiruda.com
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">전화</p>
              <p className="text-base text-slate-900">070-1234-5678</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
