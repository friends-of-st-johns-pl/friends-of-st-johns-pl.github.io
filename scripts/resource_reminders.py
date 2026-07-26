#!/usr/bin/env python3
"""Season-based reminders for the Free Stuff & Deadlines tab.

Reads the RESOURCES list out of index.html (single source of truth with the
website), works out what opens, is open, or closes this month, and emails a
digest to the group. Sends nothing when there is nothing to say.

Env:
  GMAIL_USER          sending Gmail address
  GMAIL_APP_PASSWORD  16-char app password (not the account password)
  MAIL_TO             recipient (default friendsofstjohnspl@gmail.com)
  MAIL_CC             comma-separated cc list (default rabia1082@gmail.com)
  DRY_RUN             set to 1 to print the email instead of sending
"""

import os
import re
import sys
import json
import html
import smtplib
from datetime import date
from email.message import EmailMessage

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, os.pardir, "index.html")
SITE = "https://friends-of-st-johns-pl.github.io/#resources"

MONTHS = ["", "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]


def load_resources(path=INDEX):
    """Pull the RESOURCES array out of index.html and parse it as JSON."""
    with open(path, encoding="utf-8") as fh:
        src = fh.read()
    m = re.search(r"const RESOURCES = (\[.*?\n\]);", src, re.S)
    if not m:
        raise SystemExit("Could not find the RESOURCES array in index.html")
    body = m.group(1)
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)          # strip comments
    body = re.sub(r"(\{|,)\s*([A-Za-z_]\w*)\s*:", r'\1"\2":', body)  # quote keys
    body = re.sub(r",(\s*[\]\}])", r"\1", body)                # trailing commas
    return json.loads(body)


def in_window(month, start, end):
    """Month windows may wrap the year, e.g. December to January."""
    if start <= end:
        return start <= month <= end
    return month >= start or month <= end


def classify(resources, month):
    """Bucket resources by what the group should act on this month."""
    opening, closing, open_now, next_month = [], [], [], []
    nxt = month % 12 + 1
    for r in resources:
        win = r.get("open")
        if not win:
            continue                      # rolling: nothing time-sensitive
        start, end = win
        if start == month:
            opening.append(r)
        elif in_window(month, start, end):
            (closing if end == month else open_now).append(r)
        elif start == nxt:
            next_month.append(r)
    return opening, closing, open_now, next_month


def render(month, year, opening, closing, open_now, next_month):
    name = MONTHS[month]

    def block(title, items, blurb):
        if not items:
            return "", ""
        rows_h = "".join(
            '<li style="margin:0 0 10px"><a href="{u}" style="color:#2f5c07;font-weight:600">{n}</a>'
            '<br><span style="color:#5c5648;font-size:13px">{d}</span>'
            '<br><span style="color:#8a8272;font-size:12px">{w}</span></li>'.format(
                u=html.escape(r["u"]), n=html.escape(r["n"]),
                d=html.escape(r["d"]), w=html.escape(r["w"]))
            for r in items)
        h = ('<h3 style="font-family:Georgia,serif;color:#26221b;margin:22px 0 4px">{t}</h3>'
             '<p style="color:#8a8272;font-size:13px;margin:0 0 10px">{b}</p>'
             '<ul style="padding-left:18px;margin:0">{r}</ul>').format(
                 t=html.escape(title), b=html.escape(blurb), r=rows_h)
        t = "\n{}\n{}\n".format(title.upper(), "-" * len(title))
        for r in items:
            t += "\n* {}\n  {}\n  {}\n  {}\n".format(r["n"], r["d"], r["w"], r["u"])
        return h, t

    sections = [
        ("Opening now in " + name, opening, "Applications usually open this month. Worth checking today."),
        ("Closing at the end of " + name, closing, "Last call — these windows usually shut this month."),
        ("Already open", open_now, "In season right now."),
        ("Coming next month", next_month, "Get ready, these usually open in " + MONTHS[month % 12 + 1] + "."),
    ]

    body_h = body_t = ""
    for title, items, blurb in sections:
        h, t = block(title, items, blurb)
        body_h += h
        body_t += t

    head_h = (
        '<div style="font-family:-apple-system,Arial,sans-serif;max-width:640px;margin:0 auto;padding:18px">'
        '<h2 style="font-family:Georgia,serif;color:#2f5c07;margin:0 0 4px">Free Stuff &amp; Deadlines</h2>'
        '<p style="color:#8a8272;margin:0 0 6px">What is open for Friends of St Johns Pl in {m} {y}</p>'
        '<hr style="border:0;border-top:1px solid #e6e0d4">'.format(m=name, y=year))
    foot_h = (
        '<hr style="border:0;border-top:1px solid #e6e0d4;margin-top:24px">'
        '<p style="color:#8a8272;font-size:12px">Seasons are typical, not guaranteed — click through and confirm '
        'this year\'s dates. Full list: <a href="{s}" style="color:#2f5c07">{s}</a><br>'
        'Rolling programs (Super Steward, PECAN, Love Your Block, free compost) are always open and are not '
        'repeated here.</p></div>'.format(s=SITE))

    text = "FREE STUFF & DEADLINES\nWhat is open in {} {}\n{}\n{}\nFull list: {}\n".format(
        name, year, body_t, "-" * 40, SITE)
    return head_h + body_h + foot_h, text


def main():
    today = date.today()
    resources = load_resources()
    opening, closing, open_now, next_month = classify(resources, today.month)

    if not (opening or closing or next_month):
        print("Nothing time-sensitive for {} — no email sent.".format(MONTHS[today.month]))
        return

    html_body, text_body = render(today.month, today.year,
                                  opening, closing, open_now, next_month)

    n = len(opening) + len(closing) + len(next_month)
    subject = "Greening deadlines: {} thing{} to check in {}".format(
        n, "" if n == 1 else "s", MONTHS[today.month])

    if os.environ.get("DRY_RUN") == "1":
        print("SUBJECT:", subject)
        print(text_body)
        return

    user = os.environ.get("GMAIL_USER")
    password = os.environ.get("GMAIL_APP_PASSWORD")
    if not user or not password:
        sys.exit("GMAIL_USER and GMAIL_APP_PASSWORD must be set")

    to = os.environ.get("MAIL_TO", "friendsofstjohnspl@gmail.com")
    cc = os.environ.get("MAIL_CC", "rabia1082@gmail.com")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to
    if cc:
        msg["Cc"] = cc
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(user, password)
        s.send_message(msg)
    print("Sent '{}' to {}{}".format(subject, to, " (cc " + cc + ")" if cc else ""))


if __name__ == "__main__":
    main()
