"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MediJournalApp from '@/components/health-sync-app';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
  }
  
  return <MediJournalApp />;
}
