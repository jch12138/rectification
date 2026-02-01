import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
    include: { batch: true }
  });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ task });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { submission } = body;

    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        submission_json: JSON.stringify(submission),
        status: 'submitted',
        rejectionReason: null, // Clear rejection reason on resubmit
        submittedAt: new Date(),
        updatedAt: new Date(),
        logs: {
          create: {
            action: 'submit',
            operator: 'user', // In a real app, get from session
          }
        }
      }
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Failed to submit task:', error);
    return NextResponse.json({ error: 'Failed to submit task' }, { status: 500 });
  }
}
