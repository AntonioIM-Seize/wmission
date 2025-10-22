import { notFound, redirect } from 'next/navigation';

import { PrayerEditForm } from '@/components/forms/prayer-edit-form';
import { getPrayerById } from '@/lib/data/prayer';
import { getCurrentProfile } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/utils';

import type { PrayerUpdateValues } from '@/lib/validators/prayer';

type PrayerEditPageProps = {
  params: {
    id: string;
  };
};

export default async function PrayerEditPage({ params }: PrayerEditPageProps) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/login?redirectTo=/prayer/${params.id}/edit`);
  }

  const prayer = await getPrayerById(params.id);

  if (!prayer) {
    notFound();
  }

  if (prayer.authorId !== profile.id && !isAdmin(profile.role)) {
    redirect(`/prayer/${params.id}`);
  }

  const initialValues: PrayerUpdateValues = {
    id: prayer.id,
    content: prayer.content,
    imageUrl: prayer.imageUrl ?? '',
  };

  return <PrayerEditForm initialValues={initialValues} />;
}
