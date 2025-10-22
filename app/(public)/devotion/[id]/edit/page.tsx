import { notFound, redirect } from 'next/navigation';

import { DevotionEditForm } from '@/components/forms/devotion-edit-form';
import { getDevotionById } from '@/lib/data/devotion';
import { getCurrentProfile } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/utils';

import type { DevotionUpdateValues } from '@/lib/validators/devotion';

type DevotionEditPageProps = {
  params: {
    id: string;
  };
};

export default async function DevotionEditPage({ params }: DevotionEditPageProps) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/login?redirectTo=/devotion/${params.id}/edit`);
  }

  const devotion = await getDevotionById(params.id);

  if (!devotion) {
    notFound();
  }

  if (devotion.authorId !== profile.id && !isAdmin(profile.role)) {
    redirect(`/devotion/${params.id}`);
  }

  const initialValues: DevotionUpdateValues = {
    id: devotion.id,
    title: devotion.title,
    scriptureRef: devotion.scriptureRef,
    scriptureText: devotion.scriptureText,
    body: devotion.body,
    imageUrl: devotion.imageUrl ?? '',
  };

  return <DevotionEditForm initialValues={initialValues} />;
}
