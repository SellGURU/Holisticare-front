'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function useCoachAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'coach')) {
      // If not a coach, redirect to appropriate dashboard
      if (user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.role === 'client') {
        router.push('/client');
      } else {
        router.push('/login?role=coach');
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading, isCoach: user?.role === 'coach' };
}
