# Ara Tax Services LLC — crypto tax filing site (sample build)

Static site. No build step, no framework, no dependencies, no third-party requests.
Open `index.html` in a browser and it works.

**Live preview:** https://paulblack6522.github.io/ara-crypto-tax/

---

## What this is

A site about filing US federal tax reporting on cryptocurrency activity. The home page is
a single screen that says what the service is and opens the filing form with one button;
the form itself asks five short sets of questions about the shape of your activity. The
visual language is the **U.S. Web Design System**,
which is in the public domain — that is what gives federal sites their plain, boxy,
high-contrast look, and it is legitimately usable by a private firm.

> **Changed 2026-08-11.** Two things. The five-step **"Start your filing"** page
> (`file.html` + `assets/js/wizard.js`) was restored, exactly as originally built, and
> it is now the main route: every "Start your filing" CTA on the site opens it.
> And **`index.html` is now a one-screen splash** — the firm, one sentence, three
> facts and a **Get started** button. It does not scroll. The short six-question
> callback form moved from the home page to **`request.html`**.
>
> **Changed 2026-08-05.** The short qualifying form that lived at `lander-2.html` became
> `index.html`. Question 5 changed from *"Do you have your transaction records?"* to
> *"Which exchanges or wallets did you use?"*, with an **Other: please specify** box.

Every element that would imply government affiliation has been deliberately left out:
no `.gov` banner, no "official website of the United States government" line, no flag,
no seal, no eagle-and-scales, and no "IRS" in the brand, wordmark, title or domain.

## Pages

| File | Purpose |
|---|---|
| `index.html` | **Home** — one screen, no scroll, **Get started** &rarr; `file.html` |
| `file.html` | **Start your filing** — the five-step form, the main route |
| `request.html` | **Request a callback** — six questions + callback booking |
| `how-it-works.html` | The engagement, step by step |
| `forms.html` | Guide to the IRS forms a crypto return involves |
| `what-you-need.html` | Document checklist |
| `faq.html` | 16 questions, accordion |
| `about.html` | Who we are, and what we are not |
| `contact.html` | Contact details + short message form |
| `privacy.html` · `terms.html` · `accessibility.html` | Legal |
| `thanks.html` · `404.html` | Confirmation, not-found |

`_system/` holds the build spec: the design tokens, the copy rules, and `FACTS.md` —
the researched, IRS-sourced statements the site is allowed to make. **No tax claim
should be added to any page unless it is supported by a line in `FACTS.md`.**

---

## The funnel — `index.html` &rarr; `file.html`

`index.html` is a **one-screen splash**: masthead, headline, one sentence, three facts, a
**Get started** button, and the two mandatory disclosures. It must not scroll — the CSS
comment above `.us-splash-body` in `site.css` explains the height budget and the order in
which content is dropped as the viewport shrinks. Get started opens `file.html`, and every
"Start your filing" button elsewhere on the site opens the same page.

### The second form — `request.html`

For visitors who would rather talk before filling anything in. Six qualifying questions +
contact + a **callback booking**, then a confirmation. It asks only what predicts the fee
and flags a lead. Linked from the splash, from the footer, and from `contact.html`.

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
