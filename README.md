# Ara Tax Services LLC — crypto tax filing site

Static site. **No build step, no framework, no package manager, no dependencies, no
third-party requests.** Unzip it, open `index.html` in a browser, and the whole site
works — including with no network connection.

To deploy: copy these files to the web root. There is nothing to compile.

**Live preview:** https://paulblack6522.github.io/ara-crypto-tax/

---

## Read these three files, in this order

| File | What it tells you |
|---|---|
| **`README.md`** (this file) | What the site is, how it is laid out, why it is built this way |
| **`DEV-HANDOVER.md`** | **The work list.** The three forms, the exact line to hook each one, and what must not be broken |
| **`PLACEHOLDERS.md`** | Every stand-in value — phone, email, address, site URL — with a per-file count |

## The layout

Every page is a plain `.html` file at the top level. There is no routing, no partials
system and no templating: what you open is what the browser gets.

```
index.html          Home. What the service is, how it works, what we handle,
                    Form 1099-DA. Its buttons open file.html.
file.html           "Start your filing" — the five-step form. The main route.
request.html        "Request a callback" — six questions + a callback time.
how-it-works.html   The engagement, step by step
what-you-need.html  Document checklist
forms.html          Guide to the IRS forms a crypto return involves
faq.html            16 questions
about.html          Who the firm is, and what it is not
contact.html        Contact details + a short message form
privacy.html        Privacy policy — REAL CCPA/CPRA section, read before wiring forms
terms.html          Terms of service
accessibility.html  Accessibility statement
thanks.html         Confirmation page (nothing links to it — it is there for a
                    POST-redirect-GET once the forms are wired)
404.html            Not found

assets/css/site.css All styles. One file. USWDS-derived, public domain.
assets/js/site.js   Shared behaviour: nav drawer, modals, focus management
assets/js/wizard.js Drives file.html          <- FORM HOOK
assets/js/lander2.js Drives request.html      <- FORM HOOK
assets/img/         Wordmark and favicon (SVG)

favicon.ico  apple-touch-icon.png
robots.txt  sitemap.xml  sitemap.xsl  llms.txt

_system/            Editorial reference, NOT served content. FACTS.md holds the
                    IRS-sourced statements the site is allowed to make; COPY-RULES.md
                    holds the copy rules; PARTIALS.html holds the shared header,
                    footer and modal markup. Safe to leave out of the web root.
```

## Where do I edit…?

| …this | …in this file |
|---|---|
| The phone number, email or address | everywhere — see `PLACEHOLDERS.md` |
| Any colour, spacing or type size | `assets/css/site.css` (design tokens are in `:root` at the top) |
| What a form does when submitted | `assets/js/wizard.js`, `assets/js/lander2.js`, or the inline script at the bottom of `contact.html` — see `DEV-HANDOVER.md` §2 |
| The header, footer or nav | each page carries its own copy; `_system/PARTIALS.html` is the canonical version to copy from |
| A factual claim about tax treatment | `_system/FACTS.md` first — **no tax claim goes on a page unless a line in `FACTS.md` supports it** |

---

## What this is

A site about filing US federal tax reporting on cryptocurrency activity. The home page
explains what the service is and opens the filing form; the form asks five short sets of
questions about the shape of your activity. The visual language is the
**U.S. Web Design System**,
which is in the public domain — that is what gives federal sites their plain, boxy,
high-contrast look, and it is legitimately usable by a private firm.

> **Changed 2026-08-11.** Two things. The five-step **"Start your filing"** page
> (`file.html` + `assets/js/wizard.js`) was restored, exactly as originally built, and
> it is now the main route: every "Start your filing" CTA on the site opens it.
> **`index.html` is the original informational home page**, restored from before the
> 05 Aug restructure: what the service is, how it works in three steps, what we handle,
> Form 1099-DA, and a closing call to action. The short six-question callback form moved
> off the home page to **`request.html`**.
> **Every callout box is gone site-wide** — 8 pale-blue summary boxes and 1 info alert
> were unwrapped, keeping the wording as ordinary prose. Do not add a coloured panel
> back; the only alerts left are the form's error summary, its confirmation, and the
> `<noscript>` fallbacks.
>
> **Changed 2026-08-05.** The short qualifying form that lived at `lander-2.html` became
> `index.html`. Question 5 changed from *"Do you have your transaction records?"* to
> *"Which exchanges or wallets did you use?"*, with an **Other: please specify** box.

Every element that would imply government affiliation has been deliberately left out:
no `.gov` banner, no "official website of the United States government" line, no flag,
no seal, no eagle-and-scales, and no "IRS" in the brand, wordmark, title or domain.

---

## The funnel — `index.html` &rarr; `file.html`

`index.html` explains the service in plain sections — no callout boxes, no marketing
furniture — and both of its **Start your filing** buttons open `file.html`, as does every
"Start your filing" button elsewhere on the site.

### The second form — `request.html`

For visitors who would rather talk before filling anything in. Six qualifying questions +
contact + a **callback booking**, then a confirmation. It asks only what predicts the fee
and flags a lead. Linked from the footer and from `contact.html`.

The six: the tax years · the kinds of activity · roughly how many transactions · how many
exchanges and wallets · **which exchanges and wallets, by name** · what was reported in
prior years.

⚠ Question 5 asks **which platforms, by name only**. It does **not** ask for wallet
balances, holdings values, a login, an API key or a recovery phrase, and it must never be
extended to. Asking which platform is scoping — a preparer has to know which records exist
and in what format. Asking what sits on it is a holdings harvest, which is precisely the
structure of the impersonation lander that was declined on 2026-08-01 (see the project
`CLAUDE.md`). The named options are plain text tickboxes: no logos, no brand marks, no
ranking, no implied partnership.

### The callback picker

Five "next available" slots are generated in the browser, anchored to the **firm's**
business hours (Mon–Fri, 09:00–17:00 America/Los_Angeles) so a booked call never lands
when the office is closed. A sixth option, "Another time", reveals a date + time field.
No fake scarcity — the slots change only because time moves forward. The confirmation
echoes the chosen time back. Times roll past weekends automatically.

**Timezone is chosen by the visitor, never auto-detected** — a US-zone selector
(Eastern / Central / Mountain / Pacific), defaulting to Eastern. Changing it re-labels the
same slots into that zone (the underlying appointment instants do not move). This is a
deliberate rule; do not add browser timezone detection.

### "Call me now"

An immediate-callback request beside the scheduler: it validates the contact details (not
the slot), then shows a green "assigning a preparer" overlay with a spinner, which after a
short wait resolves to a plain confirmation that a preparer will call the number given.
**It is a placeholder for a real telephony / click-to-call back end — in this build no call
is placed, and it never claims a live call connected.** A real deployment drives the
connected state from the telephony provider. The staff are called "preparers", not
"experts" — a new firm cannot substantiate a credential/skill claim.

## The forms send nothing

All three forms — "Start your filing", the callback form on `request.html`, and the
contact form — are demonstration only. There is no `action`, no `method`, no `fetch`, and `onsubmit`
is blocked, so **no native submission path exists even with JavaScript disabled**. Nothing
is transmitted and nothing is stored server-side. The only browser storage anywhere on the
site is `sessionStorage` on `file.html`, which holds the visitor's progress through the five
steps on their own device and is cleared when the tab closes. No `localStorage`, no cookies.

This is deliberate: no real taxpayer's details should land in an inbox before the
client has approved how that data is handled.

### Wiring the form up for real

**See `DEV-HANDOVER.md` — it is the full brief for this, with the hook points.** In short:

1. Replace the body of `submit()` in `assets/js/lander2.js` with a `POST` to the firm's own
   server over HTTPS, do the same for the `DEMO BUILD` block in `assets/js/wizard.js`, and
   again in the inline script at the bottom of `contact.html`.
2. They carry the same guard: `type="button"` send, `onsubmit="return false"`, and a
   `<noscript>` fallback — so there is no native submission path even with JS off. Keep it.
3. **Do not log the payload.**
4. **Update `privacy.html` first.** It currently states — truthfully — that the site
   sets no cookies, runs no analytics, writes nothing to browser storage except the
   five-step form's own progress, and transmits nothing. Adding an endpoint or analytics makes that page false. There is a visible
   comment at the top of the file saying so.

---

## Going live

This preview is **noindex** on purpose, so it cannot be indexed under the client's real
business name or compete with their live site.

To launch on the client's own domain:

1. Every page: change `<meta name="robots" content="noindex, nofollow">` to
   `index, follow, max-image-preview:large`.
2. `robots.txt`: replace with the production block commented at the bottom of that file.
3. Replace the base URL `https://paulblack6522.github.io/ara-crypto-tax/` in the
   `<link rel="canonical">` of each page, in the JSON-LD, and in `sitemap.xml`.
4. Swap the **placeholder contact details** everywhere — `(925) 555-0148`,
   `hello@aratax-example.com`, and "San Ramon, California" with no street. Google Ads
   requires a real, reachable phone number and address at launch.
5. Publish real opening hours, or remove the Hours card on `contact.html`.

---

## Rules that must not be broken

These are not style preferences. Each one maps to a Google Ads policy or to US rules on
tax preparers, and breaking one risks the ad account or a letter from the IRS.

**Never add:**
- Anything implying government affiliation — "official", "government website",
  "IRS-authorized", "IRS-approved", "IRS partner", a `.gov` banner, a flag or a seal.
- Fabricated credentials or history — "CPA on staff", "Enrolled Agent", years in
  business, client counts, testimonials, star ratings, `AggregateRating` or `Review`
  markup, award badges.
- Tax-relief or debt-settlement positioning — "settle your IRS debt", "pennies on the
  dollar", "remove penalties", "tax relief". That is a separate restricted category.
- Outcome promises — "maximize your refund", "guaranteed", "audit-proof", "save $X".
  Describe the work, never the outcome.
- Turnaround or response-time promises. The firm has no staffing basis for an SLA yet,
  and an unsubstantiated service claim falls under Google's Misrepresentation policy.
- Prices, `priceRange` in the JSON-LD, struck-through anchors, countdowns, fake scarcity.
- Investment or trading content of any kind, or links to exchanges as recommendations.

**Never collect** — not even as optional, not even behind a "you can skip this":
SSN, ITIN, EIN, date of birth, seed or recovery phrase, private key, exchange password,
exchange API key or secret, bank or routing number, card details, or a file upload.

**Always keep**, verbatim, in the footer of every page:
- the non-affiliation statement, and
- the free-alternative disclosure ("You can file your own federal tax return directly
  with the IRS at no cost to you, including through IRS Free File if you are eligible…").

That second line is what keeps the site inside Google's **Government documents and
official services** policy. It costs a little conversion and it is not optional.

---

## Verified before handover

Driven in a real browser (Chromium, Playwright), not by inspection:

- All six questions validate; an empty required group is blocked and announced
- **"Other: please specify" reveals its box, is required while ticked, and clears when
  unticked** — so a stale value cannot be submitted
- Submit fires `preventDefault`, opens an accessible modal (focus trapped, Escape
  closes, focus returns) — **zero network requests leave the page**
- No native submit path with JavaScript disabled, on either form
- WCAG AA contrast across every page, with ancestor `opacity` compounded
- Focus ring clears 3:1 on every surface (two-tone: blue ring + white halo)
- All controls ≥ 44×44 px
- No horizontal overflow at 360 px · zero console errors · zero external requests
- Both mandatory disclosures present on every page; no banned term; valid JSON-LD
  with no review or price markup

---

© 2026 Ara Tax Services LLC. Sample build — not deployed to a production domain.
