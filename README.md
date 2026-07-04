# Friends of St Johns Pl

An interactive field guide & poster for the street trees of St Johns Place
(between Underhill Ave & Washington Ave), Prospect Heights, Brooklyn.

- All 50 trees from the July 2026 block survey, with bed measurements, notes, and tree guards
- Live species/diameter data from the [NYC Tree Map](https://tree-map.nycgovparks.org/)
- Click a tree to name it, add notes, and log care (watering, mulching…) — saved in your browser
- Print-ready poster layout, and Export/Import for backing up notes

Just open `index.html` — it's a single self-contained file, no build or server needed.

## Adopt-a-tree: approving requests

Visitors can request to adopt a tree from its card. Requests are emailed to
**friendsofstjohnspl@gmail.com** (via [FormSubmit](https://formsubmit.co) — the very first
request triggers a one-time activation email; click the link in it once).

To approve a request, edit [`adoptions.json`](adoptions.json) (pencil icon on GitHub)
and add the line included in the request email, e.g.:

```json
{
  "2402587": "R.A."
}
```

Commit the change — the site updates within a minute and the tree shows
**💚 Adopted by R.A.** on the map, its card, and the printed poster.

## Shared care log (Google Sheet)

Care check-ins ("Watered", "Mulched"…) are shared block-wide via a Google Sheet
and a tiny Apps Script web app ([`apps-script/care-log.gs`](apps-script/care-log.gs)).

One-time setup from the Google Sheet (must be done by the sheet's owner):

1. **Extensions → Apps Script**, delete the starter code, paste in `care-log.gs`.
2. **Deploy → New deployment → Web app**, "Execute as" **Me**, "Who has access" **Anyone**.
3. Authorize, copy the Web app URL (ends in `/exec`), and paste it into
   `const CARE_API` in `index.html`.

Every check-in appends a row (timestamp, tree, action, who); the site shows the
latest check-ins on each tree's card under "Block activity". The sheet itself
can stay private — the web app is the only public doorway.
