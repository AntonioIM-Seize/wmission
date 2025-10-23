import type { Metadata } from 'next';

import { MailIcon, MessagesSquareIcon, PhoneIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ContactForm } from '@/components/contact/contact-form';
import { getSiteSettings } from '@/lib/data/settings';

const TITLE = '문의하기 | 위루다 선교 공동체';
const DESCRIPTION = '선교 사역과 운영에 대한 궁금한 점을 남겨주세요. 팀원이 최대한 빠르게 연락드리겠습니다.';

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
      <section className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-sm">
        <div className="space-y-6">
          <Badge variant="secondary" className="w-fit">
            문의하기
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-snug text-slate-900 md:text-4xl">무엇이든 편하게 물어보세요</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              선교 사역 소개, 협력 제안, 기도 요청 등 언제든지 메시지를 남겨주세요. 팀원이 확인 후 최대 48시간 이내에
              답변드립니다.
            </p>
          </div>
          <Alert className="max-w-2xl border-emerald-200 bg-emerald-50">
            <AlertDescription>
              문의 접수 후 스팸함을 확인해주세요. 회신 메일이 자동으로 이동될 수 있습니다.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <ContactForm />
        <aside className="space-y-4">
          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MailIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">연락처</CardTitle>
                <p className="text-xs text-muted-foreground">메일과 전화로 빠르게 응답합니다.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide">이메일</p>
                <a
                  className="text-base text-primary underline-offset-4 hover:underline"
                  href={`mailto:${settings?.contactEmail ?? 'mission@wiruda.com'}`}
                >
                  {settings?.contactEmail ?? 'mission@wiruda.com'}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">전화/채널</p>
                <p className="text-base text-slate-900">{settings?.contactPhone ?? '010-0000-0000'}</p>
              </div>
              <Separator />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {settings?.contactNote ?? '평일 오전 10시부터 오후 6시 사이에 회신해드립니다.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MessagesSquareIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">자주 묻는 질문</CardTitle>
                <p className="text-xs text-muted-foreground">문의 전 참고해주세요.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-4">
                <li>사역 소개 자료는 요청 시 이메일로 보내드립니다.</li>
                <li>방문 예배 및 세미나 일정은 한 달 전 사전 조율이 필요합니다.</li>
                <li>공동 기도 제목이나 간증 제보도 환영합니다.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <PhoneIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">긴급 연락</CardTitle>
                <p className="text-xs text-muted-foreground">신속한 도움이 필요하신가요?</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>급한 상황이라면 전화나 카카오톡 채널을 통해 연락해주세요. 가능한 빠르게 응답해 드립니다.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
