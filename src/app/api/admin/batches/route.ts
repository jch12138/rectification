import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const batches = await prisma.importBatch.findMany({
      include: {
        tasks: {
          select: {
            county: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Process statistics
    const result = batches.map(batch => {
      const statsByCounty: Record<string, { total: number; submitted: number }> = {};
      
      batch.tasks.forEach(task => {
        if (!statsByCounty[task.county]) {
          statsByCounty[task.county] = { total: 0, submitted: 0 };
        }
        statsByCounty[task.county].total++;
        if (task.status === 'submitted') {
          statsByCounty[task.county].submitted++;
        }
      });

      return {
        ...batch,
        tasks: undefined, // Remove raw tasks to reduce payload
        stats: statsByCounty,
        totalTasks: batch.tasks.length
      };
    });

    return NextResponse.json({ batches: result });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}
