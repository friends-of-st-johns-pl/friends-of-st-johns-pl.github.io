/**
 * Friends of St Johns Pl — shared care log
 *
 * Web app backing the "Record care" buttons on friends-of-st-johns-pl.github.io.
 * POST appends a check-in row to the sheet; GET returns all check-ins as JSON.
 *
 * Setup (one time, ~2 minutes, from the Google Sheet):
 *  1. Extensions → Apps Script, delete any starter code, paste this file.
 *  2. Deploy → New deployment → type: Web app.
 *  3. "Execute as": Me. "Who has access": Anyone.
 *  4. Deploy, authorize, and copy the Web app URL (ends in /exec).
 *  5. Put that URL in CARE_API in index.html.
 */

const SHEET_ID = '1pRPoAeNzxIz72kwsld8zjTGHKZFKVgq4czUoBJ0Sgi8';
const HEADERS = ['Timestamp', 'Tree ID', 'Walk #', 'Species', 'Address', 'Action', 'By'];

function sheet_() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const action = String(d.action || '').slice(0, 80);
  const by = String(d.by || '').slice(0, 60);
  if (!d.treeId || !action) throw new Error('missing fields');
  sheet_().appendRow([new Date(), String(d.treeId), d.walk || '', String(d.species || '').slice(0, 60),
                      String(d.addr || '').slice(0, 80), action, by]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const rows = sheet_().getDataRange().getValues();
  const out = rows.slice(1).map(function (r) {
    return { t: r[0], id: String(r[1]), walk: r[2], action: r[5], by: r[6] };
  });
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}
