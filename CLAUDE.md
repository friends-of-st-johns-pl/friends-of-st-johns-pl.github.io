# Friends of St Johns Place: project context

Context for any AI assistant working on this project, in Claude Code, Claude in
Chrome, or anywhere else. Read this first.

## Who we are

Friends of St Johns Place is a volunteer neighborhood group caring for the 51
street trees on **St Johns Place between Underhill Avenue and Washington Avenue**
in Prospect Heights, Brooklyn. Community District 8, Council District 35, council
member Crystal Hudson.

- Formed 2026. Not a 501(c)(3), a volunteer association.
- Email: friendsofstjohnspl@gmail.com
- Site: https://friends-of-st-johns-pl.github.io
- Instagram: https://www.instagram.com/friendsofstjohnspl/
- Newsletter: https://groups.google.com/g/friendsofstjohnspl
- WhatsApp group: https://chat.whatsapp.com/KCA3CQHuaLtBGasIB9OqvF
- Fundraiser (Kindbee): https://kindbee.com/fundraisers/keep-st-johns-place-green-trees-plants-and-neighbors

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

- the **first button is the default tab**, currently the Halloween tab
- reordering the buttons reorders the site
- commenting a button out hides that tab cleanly
- unknown or hidden hashes fall back to the first tab

Current tabs, in order:

| Tab | URL | Contents |
|---|---|---|
| Halloween Trick-or-streets | `#halloween-volunteer` (`#halloween` redirects here) | Help shifts for the pumpkin painting and candy corner. The 5 to 9pm volunteer hours card is commented out inside `#hwVolunteerView`, uncomment it to bring it back |
| Rat on Rats | `#rats` | 311 complaint reporting, then a tactical list of what you can do about rats |
| Free Stuff & Deadlines | `#resources` | Grants, free compost, courses, deadlines |
| Native Plant Guide | `#plant-guide` | Embedded Google Doc of native and pollinator friendly tree bed plants |
| Our 51 Trees | `#trees` | Interactive map and per tree care log |
| Past Events | `#past` | Archive |
| About Us | `#about` | Mission, goals, how to become an organizer |

The Trash Cleanup Days tab is commented out, no cleanup is scheduled. The
St Johns Plants Together tab is commented out and archived, the event happened
on October 3, 2026, and its `#plantingView` markup is still in the file.
Uncomment either button to bring that tab back. Archive a tab the morning after
its event, and move the next event's button to first so it becomes the landing
page.

The Native Plant Guide tab embeds a Google Doc by iframe. **That doc's sharing
must stay set to "Anyone with the link, Viewer"**, or the embed shows a
permission error to visitors instead of the guide.

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
| Signups | any event form, `type:'event'` | Timestamp, Event, Name, Email, Phone, Address, Activities, Party size, Note |
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
| Sat Oct 31, 5 to 9pm | Halloween Trick-o-streets | Block, pending street closure permit. Needs 32 volunteer hours committed |
| Sat Oct 31, 4 to 6pm | Pumpkin painting and decorating, part of Trick-o-streets | St Johns Place and Underhill Avenue corner. Sugar pie pumpkins, Posca markers, stickers and googly eyes, plus a limited number of fairy houses to decorate. Anyone can drop in. Candy handed out there until 8pm. Help shifts are setup 3 to 4pm, candy 4 to 8pm come and go, breakdown 8 to 9pm. Candy is bring your own, about one large bag per person, with $10 to the fundraiser as the alternative. |

## The rat campaign

Council Member Hudson's office told us plainly that **volume of 311 complaints**
is what gets the Health Department to send an inspector, and that several
complaints about the same address beat single complaints spread around. We
collect complaint numbers and forward them to the district office.

The September 12, 2026 rat meetup produced the seven action list on the Rats
tab. Keep that list tactical, things a neighbor can actually do, not background
facts about rat biology. SCRAM runs monthly rat walks and is a possible partner.
NYC Rat Academy training is free and open to anyone.

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

`TREES` in `index.html` holds the 50 trees from the July 2026 field survey plus
the Canadian serviceberry we planted on October 3, 2026: species, trunk
diameter, bed dimensions in inches, existing tree guards, notes, coordinates.
The survey is the source for grant applications, so numbers quoted anywhere
should trace back to it.

The map is north up and drawn from real coordinates, no basemap tiles. The
avenue bars lean to meet St Johns at a right angle, since the block runs at
bearing 104 degrees. Rotating the whole projection to put the street horizontal
was measured and rejected: it changes the scale from 2.69 to 2.60 px per metre,
so it costs a true north map and buys nothing.

Every tree's `side` field was inverted in the original survey data, and was
corrected on October 4, 2026. Odd addresses (325 to 433) are the **north** side,
even addresses (326 to 440) are the **south** side. This was verified by fitting
a centerline to all 51 coordinate pairs: the trees formerly labelled N sit 8.3 m
south of it. If side ever looks wrong again, re-run that check rather than
trusting a single address.

The quick care buttons (Watered, Mulched, and the rest) were removed on
October 4, 2026 because nobody used them, and the private "My notes" box went
with them, since the code overwrote whatever was typed there with the survey
note on every page load. A tree card now holds a name, a box to post a note to
the whole block, the block log for that tree, and the adopt button.

The block log shows, newest first, notes neighbors posted, the old care
check-ins, and last the `note` field from the July 2026 survey, marked "block
survey, Jul 2026". A tree with none of the three shows no log at all.

The note box posts `type:'care'` with the note text as the Action and the
neighbor's name as By, so block notes and the old check-ins live in the same
Care Log tab and show in the same list. Notes are capped at 200 characters in
the browser, and `care-log.gs` allows 300. **That limit only takes effect once a
new version of the Apps Script is deployed** (Deploy, Manage deployments, pencil,
Version: New version). Until then the live script still truncates the Action
column at 80 characters, so longer notes land cut off in the sheet.

An adopted tree with no guard in the survey shows "makeshift tree guard" on its
card and in the map tooltip, because adopters put up steel posts and rope. This
is display only, `guardLabel()` in `index.html`. The `guard` field in `TREES`
still says what the July survey found, and that is what grant applications count
off, so never flip it because a bed was adopted.

NYC moved the tree map in 2026. A per tree link is now
`https://www.nycgovparks.org/tree-map/tree/<id>`. The old
`tree-map.nycgovparks.org/tree-map/tree/<id>` redirects to the new host but
keeps the old path on the end, so it lands on `/tree-map/tree-map/tree/<id>`
and shows Not Found. If tree links break again, check for that doubled path
before suspecting the ids.

The serviceberry is `#24.5`, id `"sjp-24-5"`, in what had been the empty tree
pit at 326 St Johns Place. Its id is a string, not a number, because the tree is
too new to be on the NYC Tree Map. The tree card and the adoption email both
check `/^\d+$/` against the id and skip the Tree Map link when it does not
match. Give it the real numeric id once NYC adds it.

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
- Check phone width, 390px, for horizontal overflow after any layout change. On
  phones the map is a scroll strip: the svg keeps `min-width:880px` and
  `.mapwrap` carries `width:100%;max-width:100%;min-width:0` so the swipe
  scrolls the strip. Drop those three and the wrapper grows to 880px and drags
  the whole page sideways.
- Do not put private contact details of neighbors into the repo.
