import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const { reason, operator } = await request.json();

  if (!reason) {
    return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        logs: {
          create: {
            action: 'reject',
            reason: reason,
            operator: operator || 'admin',
          },
        },
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Failed to reject task:', error);
    return NextResponse.json({ error: 'Failed to reject task' }, { status: 500 });
  }
}
