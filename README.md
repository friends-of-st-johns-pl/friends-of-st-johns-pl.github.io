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
