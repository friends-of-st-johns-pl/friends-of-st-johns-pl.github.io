# Friends of St Johns Place: project context

Context for any AI assistant working on this project, in Claude Code, Claude in
Chrome, or anywhere else. Read this first.

## Who we are

Friends of St Johns Place is a volunteer neighborhood group caring for the 50
street trees on **St Johns Place between Underhill Avenue and Washington Avenue**
in Prospect Heights, Brooklyn. Community District 8, Council District 35, council
member Crystal Hudson.

- Formed 2026. Not a 501(c)(3), a volunteer association.
- Email: friendsofstjohnspl@gmail.com
- Site: https://friends-of-st-johns-pl.github.io
- Instagram: https://www.instagram.com/friendsofstjohnspl/
- Newsletter: https://groups.google.com/g/friendsofstjohnspl
- WhatsApp group: https://chat.whatsapp.com/KCA3CQHuaLtBGasIB9OqvF
- GoFundMe: https://www.gofundme.com/f/help-us-beautify-st-johns-pl-with-new-trees

## Writing style, applies to everything

**Never use a dash or an em dash** in website copy, emails, documents, or
messages written for this group. Rewrite the sentence instead. This applies to
anything a person will read, not to code.

Plain, warm, specific. Short sentences. No exclamation marks stacked up. Say what
happens and when.

## The website

One self contained file, `index.html`. No build step, no framework, no server.
Open it and it runs. Hosted on GitHub Pages from the `main` branch, so a push is
a deploy.

### Tabs

Tabs are driven by the buttons in `<nav class="tabs">`. Each carries
`data-tab="<name>"`, and optionally `data-hash="<slug>"` for a prettier URL.
The script reads the DOM, so:

- the **first button is the default tab**
- reordering the buttons reorders the site
- commenting a button out hides that tab cleanly
- unknown or hidden hashes fall back to the first tab

Current tabs, in order:

| Tab | URL | Contents |
|---|---|---|
| Rat on Rats & Training | `#rats` | Rat training signup, then 311 reporting |
| St Johns Plants Together, Oct 3rd | `#st-johns-plants-2026` | Planting day signup |
| Halloween Trick-o-streets | `#halloween` | Interest form |
| Free Stuff & Deadlines | `#resources` | Grants, free compost, courses, deadlines |
| Our 50 Trees | `#trees` | Interactive map and per tree care log |
| Past Events | `#past` | Archive |

The Trash Cleanup Days tab is commented out, no cleanup is scheduled. Uncomment
its button to bring it back.

### Forms

Every form posts to a Google Apps Script web app first, and falls back to a
FormSubmit email if that fails. **If you start getting FormSubmit emails for
everything, the Apps Script endpoint is broken**, usually because someone
created a new deployment and the URL changed.

`CARE_API` in `index.html` must match the live `/exec` URL. To ship new Apps
Script code without breaking it: Deploy, Manage deployments, pencil icon,
Version: New version. Never "New deployment", that mints a new URL.

## The Google Sheet

One spreadsheet, backed by `apps-script/care-log.gs`. Tabs:

| Tab | Written by | Columns |
|---|---|---|
| Signups | any event form, `type:'event'` | Timestamp, Event, Name, Email, Phone, Activities, Party size |
| Rodent Reports | 311 complaint form, `type:'rodent'` | Timestamp, 311 Complaint #, Name, Email, Phone, Newsletter?, WhatsApp?, Sent to council? |
| Adoptions | tree adoption requests | includes an Approved? column, type `yes` to approve |
| Care Log | per tree check ins | |

`Sent to council?` in Rodent Reports is **filled in by hand, never by the
script**. A draft that was never sent must not retire those complaint numbers.
`draftRodentDigest()` creates a Gmail draft of unsent numbers and does not send
it or touch the sheet.

## Upcoming events

| Date | Event | Where |
|---|---|---|
| Sat Sep 12, 11am | Rat Training | 365 St Johns Place backyard |
| Sat Oct 3, 9am to 2pm | St Johns Plants Together, our City of Forest Day 2026, lunch 1pm | Whole block, lunch at 365 St Johns Place backyard |
| Sat Oct 31 | Halloween Trick-o-streets | Block, pending street closure permit |

## The rat campaign

Council Member Hudson's office told us plainly that **volume of 311 complaints**
is what gets the Health Department to send an inspector, and that several
complaints about the same address beat single complaints spread around. We
collect complaint numbers and forward them to the district office.

NYC has **no public write API for 311**. The Content API is read only. Neighbors
file on the official NYC311 form and paste the number into our site.

Buildings flagged so far, all St Johns Place: 340, 356, 358, 372, 392, 394, 396,
398, 400, 402, 403, 404, 406, 417, 446, 448.

### NYC311 rat complaint form values, confirmed against the live form

Do not guess these. They were checked option by option.

- **Problem Detail**: Condition Attracting Rodents, Mouse Sighting, Rat Sighting, Signs of Rodents
- **Location Type**: 1-2 Family Dwelling, 1-2 Family Mixed Use Building, 3+ Family Apt. Building, 3+ Family Mixed Use Building, Catch Basin or Sewer, Commercial Building, Day Care or Nursery, Government Building, Hospital, Office Building, Parking Lot or Garage, Public Garden, Public Stairs, School, Vacant Building, Vacant Lot, Street, Sidewalk
- **Position**: NE/NW/SE/SW Corner Of, Exactly At, In Back Of, In Front Of, Next Door To, On The Side Of, Opposite To, Unknown, East, West, North, South

**Location Detail depends on Location Type:**

- 3+ Family Apt. Building and 1-2 Family Dwelling: Alley, Inside Apartment, Inside Building - Basement, Inside Building - Garbage Area, Inside Building - Hallway, Inside Building - Laundry, Inside Building - Lobby, Inside Building - Stairway, Outdoor Garbage Area, Yard
- Commercial Building: Alley, Basement, Indoor Garbage Area, Inside Building, Outdoor Garbage Area, Yard
- Vacant Lot: Alley, N/A
- Street and Sidewalk: N/A only

The quiz on the Rats tab maps its answers onto these. Every combination it can
produce has been checked against these lists. Vacant Building is deliberately
absent from the quiz because its Location Detail list has never been confirmed.

Rats are **not** seen in the tree beds on this block, do not write copy saying so.

## The tree data

`TREES` in `index.html` holds all 50 trees from the July 2026 field survey:
species, trunk diameter, bed dimensions in inches, existing tree guards, notes,
coordinates. This survey is the source for grant applications, so numbers quoted
anywhere should trace back to it.

## Open work

- **NYC Green Fund Grassroots grant**, fall 2026. Six Tree Time Style B steel
  guards at $1,525 each installed, tools, native plantings, total request $9,975.
  Needs a quote confirmed with Tree Time and a 311 request for the dead dawn
  redwood at 391 St Johns Place.
- Native plantings must be **straight species native to the New York City
  region**, no cultivars.
- Awesome Foundation microgrant, applications due August 14.

## Working conventions

- Push to `main`, that is the deploy.
- Test changes in a real browser before saying they work. The site is one file
  with inline JavaScript, so a typo breaks the whole page silently.
- Check phone width, 390px, for horizontal overflow after any layout change.
- Do not put private contact details of neighbors into the repo.
