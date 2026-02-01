import { Suspense, use } from 'react';
import TaskDetailContent from './client';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskDetailContent id={id} />
    </Suspense>
  );
}
