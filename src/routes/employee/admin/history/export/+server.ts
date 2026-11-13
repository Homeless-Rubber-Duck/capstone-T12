import ExcelJS from 'exceljs';
import type { RequestHandler } from './$types';
import { requireAdmin } from '../../../../../lib/server/requireAdmin';
import { getOrderReport, summarizeOrders } from '../../../../../lib/server/orderReporting';

export const GET: RequestHandler = async ({ cookies }) => {
  requireAdmin(cookies);
  const orders = getOrderReport();
  const summary = summarizeOrders(orders);
  const workbook = new ExcelJS.Workbook();

  const orderSheet = workbook.addWorksheet('Orders', { views: [{ state: 'frozen', ySplit: 1 }] });
  orderSheet.columns = [
    { header: 'Order #', width: 12 }, { header: 'Placed', width: 24 },
    { header: 'Pickup', width: 24 }, { header: 'Customer', width: 28 },
    { header: 'Status', width: 18 }, { header: 'Order total', width: 17 }
  ];
  orderSheet.getColumn(6).numFmt = '"$"#,##0.00';

  const itemSheet = workbook.addWorksheet('Order Items', { views: [{ state: 'frozen', ySplit: 1 }] });
  itemSheet.columns = [
    { header: 'Order #', width: 12 }, { header: 'Menu item', width: 36 },
    { header: 'Quantity', width: 12 }, { header: 'Base price per item', width: 22 },
    { header: 'Modifiers per item', width: 22 }, { header: 'Line total', width: 17 }
  ];
  for (const column of [4, 5, 6]) itemSheet.getColumn(column).numFmt = '"$"#,##0.00';

  for (const order of orders) {
    orderSheet.addRow([order.id, order.placedAt, order.pickup, order.customer, order.status, order.total]);
    for (const item of order.items) {
      const lineTotal = Math.round((item.unitPrice + item.modifierTotal) * 100) * item.quantity / 100;
      itemSheet.addRow([order.id, item.name, item.quantity, item.unitPrice, item.modifierTotal, lineTotal]);
    }
  }

  const statusSheet = workbook.addWorksheet('Status Summary');
  statusSheet.columns = [{ header: 'Status', width: 25 }, { header: 'Order count', width: 16 }];
  for (const { status, count } of summary.byStatus) statusSheet.addRow([status, count]);
  for (const sheet of [orderSheet, itemSheet, statusSheet]) sheet.getRow(1).font = { bold: true };

  return new Response(new Uint8Array(await workbook.xlsx.writeBuffer()), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="heritage-cafe-order-history.xlsx"',
      'Cache-Control': 'private, no-store'
    }
  });
};
