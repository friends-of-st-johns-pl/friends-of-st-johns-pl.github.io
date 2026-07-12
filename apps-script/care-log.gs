/**
 * Friends of St Johns Pl — shared care log + adoption approvals
 *
 * Web app backing friends-of-st-johns-pl.github.io.
 *  - POST {type:'care', ...}  → appends a check-in row to the "Care Log" tab
 *  - POST {type:'adopt', ...} → appends a request row to the "Adoptions" tab
 *  - GET → JSON {care:[...], adopted:{treeId: initials}}
 *
 * APPROVING AN ADOPTION: open the "Adoptions" tab and type  yes  in the
 * "Approved?" column of the request's row (edit the Initials cell if you
 * like). The website updates within a few minutes.
 *
 * Setup (one time, ~2 minutes, from the Google Sheet):
 *  1. Extensions → Apps Script, delete any starter code, paste this file.
 *  2. Deploy → New deployment → type: Web app.
 *  3. "Execute as": Me. "Who has access": Anyone.
 *  4. Deploy, authorize, and copy the Web app URL (ends in /exec).
 *  5. Put that URL in CARE_API in index.html.
 */

const SHEET_ID = '1OzP0Z029_jop_GPEi3uxPY_hjqY4kVI9kQkgJd4BLk0';
const EVENT_SHEET_ID = '1eIuY-l-IZfyZCnQWvkK20isJqXawGv9cD6HoWcuB1bw';
const CARE_HEADERS = ['Timestamp', 'Tree ID', 'Walk #', 'Species', 'Address', 'Action', 'By'];
const ADOPT_HEADERS = ['Timestamp', 'Tree ID', 'Walk #', 'Species', 'Address',
                       'Name', 'Email', 'Phone', 'Initials', 'Approved?'];
const EVENT_HEADERS = ['Timestamp', 'Event', 'Name', 'Email', 'Phone', 'Activities', 'Party size'];

function tab_(name, headers, sheetId) {
  const ss = SpreadsheetApp.openById(sheetId || SHEET_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const s = function (v, n) { return String(v == null ? '' : v).slice(0, n); };
  if (d.type === 'event') {
    if (!d.name) throw new Error('missing fields');
    tab_('Signups', EVENT_HEADERS, EVENT_SHEET_ID).appendRow([
      new Date(), s(d.event, 60), s(d.name, 80), s(d.email, 80), s(d.phone, 40),
      s(d.activities, 120), s(d.headcount, 10)]);
  } else if (d.type === 'adopt') {
    if (!d.treeId || !d.name) throw new Error('missing fields');
    tab_('Adoptions', ADOPT_HEADERS).appendRow([
      new Date(), String(d.treeId), d.walk || '', s(d.species, 60), s(d.addr, 80),
      s(d.name, 80), s(d.email, 80), s(d.phone, 40), s(d.initials, 12), '']);
  } else {
    if (!d.treeId || !d.action) throw new Error('missing fields');
    tab_('Care Log', CARE_HEADERS).appendRow([
      new Date(), String(d.treeId), d.walk || '', s(d.species, 60), s(d.addr, 80),
      s(d.action, 80), s(d.by, 60)]);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const care = tab_('Care Log', CARE_HEADERS).getDataRange().getValues().slice(1)
    .map(function (r) { return { t: r[0], id: String(r[1]), walk: r[2], action: r[5], by: r[6] }; });
  const adopted = {};
  tab_('Adoptions', ADOPT_HEADERS).getDataRange().getValues().slice(1).forEach(function (r) {
    const ok = String(r[9]).trim().toLowerCase();
    if (ok === 'yes' || ok === 'y' || ok === 'true' || ok === 'x' || ok === 'approved') {
      const initials = String(r[8]).trim() ||
        String(r[5]).trim().split(/\s+/).map(function (w) { return w[0]; }).join('.').toUpperCase() + '.';
      adopted[String(r[1])] = initials;
    }
  });
  return ContentService.createTextOutput(JSON.stringify({ care: care, adopted: adopted }))
    .setMimeType(ContentService.MimeType.JSON);
}
