import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get('county');
  const batchId = searchParams.get('batchId');

  const where: any = {};
  if (county) where.county = county;
  if (batchId) where.batchId = Number(batchId);

  const tasks = await prisma.task.findMany({
    where,
    include: { batch: true }
  });

  const exportData = tasks.map((task: any) => {
    const ref = JSON.parse(task.reference_json || '{}');
    const sub = task.submission_json ? JSON.parse(task.submission_json) : {};

    return {
      'Task ID': task.id,
      'County': task.county,
      'Status': task.status === 'submitted' ? '已提交' : task.status === 'rejected' ? '已退回' : '待处理',
      'Submitted At': task.submittedAt ? new Date(task.submittedAt).toLocaleString() : '',
      ...ref,
      ...sub
    };
  });

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tasks');

  if (exportData.length > 0) {
    // Collect all unique keys
    const allKeys = new Set<string>();
    // Ensure fixed order for standard columns
    const fixedKeys = ['Task ID', 'County', 'Status', 'Submitted At'];
    fixedKeys.forEach(k => allKeys.add(k));

    exportData.forEach((item: any) => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    worksheet.columns = Array.from(allKeys).map(key => ({
      header: key,
      key: key,
      width: key.length < 10 ? 15 : 25
    }));

    worksheet.addRows(exportData);
  }

  const buf = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Disposition': 'attachment; filename="tasks_export.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
