/**
 * Friends of St Johns Pl — shared care log + adoption approvals
 *
 * Web app backing friends-of-st-johns-pl.github.io.
 *  - POST {type:'care', ...}   → appends a check-in row to the "Care Log" tab
 *  - POST {type:'adopt', ...}  → appends a request row to the "Adoptions" tab
 *  - POST {type:'rodent', ...} → appends a row to the "Rodent Reports" tab
 *  - GET → JSON {care:[...], adopted:{treeId: initials}}
 *
 * RODENT REPORTS: neighbors file their own 311 complaint on the NYC311 site,
 * then log the complaint number through the website form. Run
 * draftRodentDigest() to draft an email of the new numbers to the Council
 * Member's office. See the notes above that function.
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

/* One spreadsheet for everything — tabs: "Care Log", "Adoptions", "Signups" */
const SHEET_ID = '1eIuY-l-IZfyZCnQWvkK20isJqXawGv9cD6HoWcuB1bw';
const EVENT_SHEET_ID = SHEET_ID;
const CARE_HEADERS = ['Timestamp', 'Tree ID', 'Walk #', 'Species', 'Address', 'Action', 'By'];
const ADOPT_HEADERS = ['Timestamp', 'Tree ID', 'Walk #', 'Species', 'Address',
                       'Name', 'Email', 'Phone', 'Initials', 'Approved?'];
const EVENT_HEADERS = ['Timestamp', 'Event', 'Name', 'Email', 'Phone', 'Activities', 'Party size'];
const RODENT_HEADERS = ['Timestamp', 'Address', '311 Complaint #', 'Observed', 'When seen',
                        'Note', 'Reported by', 'Email', 'Sent to council?'];

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
  } else if (d.type === 'rodent') {
    if (!d.address || !d.name) throw new Error('missing fields');
    tab_('Rodent Reports', RODENT_HEADERS).appendRow([
      new Date(), s(d.address, 120), s(d.sr, 40), s(d.observed, 200), s(d.when, 60),
      s(d.note, 300), s(d.name, 80), s(d.email, 80), '']);
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

/**
 * Rodent digest for the Council Member's office.
 *
 * Run this from the Apps Script editor whenever you want to send an update:
 * Select "draftRodentDigest" in the function dropdown and click Run.
 *
 * It gathers every row in "Rodent Reports" that has a 311 complaint number and
 * an empty "Sent to council?" cell, then creates a GMAIL DRAFT addressed to the
 * council office. It does NOT send. Open Gmail, read it, and hit send yourself.
 * Rows are only marked as sent after the draft is created, so nothing is
 * reported twice.
 *
 * To send automatically instead, swap GmailApp.createDraft for GmailApp.sendEmail
 * below. Only do that if you are comfortable with mail leaving without review.
 */
const COUNCIL_EMAIL = 'mmorehead@council.nyc.gov';
const GROUP_NAME = 'Friends of St Johns Place';

function draftRodentDigest() {
  const sh = tab_('Rodent Reports', RODENT_HEADERS);
  const rows = sh.getDataRange().getValues();
  const pending = [];
  for (let i = 1; i < rows.length; i++) {
    const sr = String(rows[i][2]).trim();
    const sent = String(rows[i][8]).trim();
    if (sr && !sent) pending.push({ row: i + 1, date: rows[i][0], addr: rows[i][1], sr: sr, saw: rows[i][3], when: rows[i][4] });
  }
  if (!pending.length) {
    SpreadsheetApp.getUi().alert('Nothing new to send. Every complaint number has already gone to the council office.');
    return;
  }

  const tz = Session.getScriptTimeZone();
  const fmt = function (d) { return d instanceof Date ? Utilities.formatDate(d, tz, 'MMM d, yyyy') : String(d); };
  let body = 'Hi Maddie,\n\n'
    + 'Here are ' + pending.length + ' new 311 complaint number'
    + (pending.length === 1 ? '' : 's') + ' from neighbors on St Johns Place between Underhill '
    + 'and Washington Avenues. Please pass these along to the Department of Health.\n\n';
  pending.forEach(function (p) {
    body += '311 complaint ' + p.sr + '\n'
      + '  Address: ' + p.addr + '\n'
      + '  Observed: ' + p.saw + '\n'
      + '  Seen: ' + (p.when || 'not specified') + '\n'
      + '  Logged: ' + fmt(p.date) + '\n\n';
  });
  body += 'We are collecting these through a form on our website so neighbors have one place to '
    + 'report and we can keep the numbers organized for your office. Happy to change the format '
    + 'if something else is easier for you.\n\nThank you,\n' + GROUP_NAME + '\n';

  const subject = 'St Johns Place rodent complaints: ' + pending.length + ' new 311 number'
    + (pending.length === 1 ? '' : 's');
  GmailApp.createDraft(COUNCIL_EMAIL, subject, body);

  const stamp = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  pending.forEach(function (p) { sh.getRange(p.row, 9).setValue('drafted ' + stamp); });
  SpreadsheetApp.getUi().alert('Draft created in Gmail with ' + pending.length
    + ' complaint number' + (pending.length === 1 ? '' : 's') + '. Open Gmail to review and send.');
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
