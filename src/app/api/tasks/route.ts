import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get('county');
  const batchId = searchParams.get('batchId');

  if (!county) {
    return NextResponse.json({ error: 'County required' }, { status: 400 });
  }

  const where: any = { county };
  if (batchId) {
    where.batchId = Number(batchId);
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { batch: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ tasks });
}
