/**
 * Google Apps Script – VYBE_ORDERS_DATABASE
 * ==========================================
 *
 * SETUP INSTRUCTIONS
 * ------------------
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into the editor (replacing the default code)
 * 3. Click "Save" (Ctrl+S)
 * 4. Click "Deploy" → "New Deployment"
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click "Deploy" → copy the Web App URL
 * 6. Paste the URL into GOOGLE_APPS_SCRIPT_URL in server/.env
 *
 * SPREADSHEET STRUCTURE
 * ---------------------
 * The script auto-creates a sheet named "Orders" with these columns:
 *   A: OrderID          B: Timestamp        C: CustomerName
 *   D: Phone            E: Email            F: District
 *   G: Address          H: ProductName      I: ProductID
 *   J: Quantity         K: Price            L: Total
 *   M: PaymentMethod    N: OrderNotes       O: Status
 *   P: Courier          Q: TrackingID       R: IP
 *   S: UserAgent
 *
 * ENDPOINTS
 * ---------
 * POST (no action field)  → append new order row
 * POST { action: "update", orderId, status, courier, trackingId } → update row
 */

const SHEET_NAME      = 'Orders';
const SPREADSHEET_NAME = 'VYBE_ORDERS_DATABASE';

// Column header order — must match the order in appendRow()
const HEADERS = [
  'OrderID', 'Timestamp', 'CustomerName', 'Phone', 'Email',
  'District', 'Address', 'ProductName', 'ProductID',
  'Quantity', 'Price', 'Total', 'PaymentMethod', 'OrderNotes',
  'Status', 'Courier', 'TrackingID', 'IP', 'UserAgent'
];

/* ─── Utility: get or create sheet ─────────────────────────────────────── */
function getOrCreateSheet() {
  // Try to find the spreadsheet by name in the user's Drive
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  let ss;

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    // Create new spreadsheet
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  }

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add header row
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/* ─── Utility: find row by OrderID ─────────────────────────────────────── */
function findOrderRow(sheet, orderId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(orderId)) {
      return i + 1; // 1-based row number
    }
  }
  return -1;
}

/* ─── doPost – main entry point ─────────────────────────────────────────── */
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const sheet  = getOrCreateSheet();

    /* ── Update existing order ── */
    if (body.action === 'update') {
      const rowNum = findOrderRow(sheet, body.orderId);
      if (rowNum === -1) {
        return jsonResponse({ success: false, error: 'Order not found' });
      }

      // O=Status(15), P=Courier(16), Q=TrackingID(17)
      const colMap = { status: 15, courier: 16, trackingId: 17 };
      Object.entries(colMap).forEach(([key, col]) => {
        if (body[key] !== undefined) {
          sheet.getRange(rowNum, col).setValue(body[key]);
        }
      });

      return jsonResponse({ success: true, action: 'updated', orderId: body.orderId });
    }

    /* ── Append new order row ── */
    const row = [
      body.orderId      || '',
      body.timestamp    || new Date().toISOString(),
      body.customerName || '',
      body.phone        || '',
      body.email        || '',
      body.district     || '',
      body.address      || '',
      body.productName  || '',
      body.productId    || '',
      Number(body.quantity)  || 0,
      Number(body.price)     || 0,
      Number(body.total)     || 0,
      body.paymentMethod || '',
      body.orderNotes   || '',
      body.status       || 'Pending',
      body.courier      || '',
      body.trackingId   || '',
      body.ip           || '',
      body.userAgent    || '',
    ];

    sheet.appendRow(row);

    // Auto-resize columns for readability
    try { sheet.autoResizeColumns(1, HEADERS.length); } catch (_) {}

    return jsonResponse({ success: true, action: 'appended', orderId: body.orderId });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/* ─── doGet – health check ──────────────────────────────────────────────── */
function doGet() {
  return jsonResponse({ status: 'ok', service: 'VYBE_ORDERS_DATABASE' });
}

/* ─── Helper ────────────────────────────────────────────────────────────── */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
