'use client'

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const UnitsPage = dynamic(() => import('@/components/UnitsPage').then(mod => ({ default: mod.UnitsPage })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

export default function Units() {
  return <UnitsPage />
}