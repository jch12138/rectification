import { Suspense } from 'react';
import BatchesContent from './client';

export default function BatchesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BatchesContent />
    </Suspense>
  );
}

