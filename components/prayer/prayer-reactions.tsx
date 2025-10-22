'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';

import { reactPrayerAction } from '@/app/(public)/prayer/actions';
import { Button } from '@/components/ui/button';

type PrayerReactionsProps = {
  prayerId: string;
  counts: {
    amen: number;
    together: number;
  };
  revalidatePaths?: string[];
};

export function PrayerReactions({ prayerId, counts, revalidatePaths }: PrayerReactionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (reaction: 'amen' | 'together') => {
    startTransition(async () => {
      const result = await reactPrayerAction({
        prayerId,
        reaction,
        revalidate: revalidatePaths,
      });

      if (result.status === 'error') {
        toast.error(result.message);
        return;
      }

      toast.success(reaction === 'amen' ? '아멘!' : '함께 기도합니다.');
    });
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() => handleClick('amen')}
      >
        아멘 ({counts.amen})
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => handleClick('together')}
      >
        함께 기도합니다 ({counts.together})
      </Button>
    </div>
  );
}
