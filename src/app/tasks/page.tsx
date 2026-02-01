import { Suspense } from 'react';
import TasksContent from './client';

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksContent />
    </Suspense>
  );
}

