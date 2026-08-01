# Ara Tax Services LLC — crypto tax filing site (sample build)

Static site. No build step, no framework, no dependencies, no third-party requests.
Open `index.html` in a browser and it works.

**Live preview:** https://paulblack6522.github.io/ara-crypto-tax/

---

## What this is

A 12-page site for filing US federal tax reporting on cryptocurrency activity, with a
5-step intake wizard. The visual language is the **U.S. Web Design System**, which is in
the public domain — that is what gives federal sites their plain, boxy, high-contrast
look, and it is legitimately usable by a private firm.

Every element that would imply government affiliation has been deliberately left out:
no `.gov` banner, no "official website of the United States government" line, no flag,
no seal, no eagle-and-scales, and no "IRS" in the brand, wordmark, title or domain.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home |
| `file.html` | The 5-step intake wizard |
| `how-it-works.html` | The engagement, step by step |
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

## The forms send nothing

Both forms are demonstration only. There is no `action`, no `method`, no `fetch`, and
`onsubmit` is blocked, so **no native submission path exists even with JavaScript
disabled**. Nothing is transmitted and nothing is stored server-side. Wizard progress
is kept in `sessionStorage` on the visitor's own device and cleared on submit.

This is deliberate: no real taxpayer's details should land in an inbox before the
client has approved how that data is handled.

### Wiring the form up for real

1. Replace the submit handler in `assets/js/wizard.js` (marked with a comment) with a
   `POST` to the firm's own server, over HTTPS.
2. Do the same for the handler at the bottom of `contact.html`.
3. **Do not log the payload.**
4. **Update `privacy.html` first.** It currently states — truthfully — that the site
   sets no cookies, runs no analytics, and transmits nothing. Adding an endpoint or
   analytics makes that page false. There is a visible comment at the top of the file
   saying so.

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

- 21/21 functional and accessibility checks pass
- All 5 wizard steps walk end to end; per-step validation blocks an empty required group
- Submit fires `preventDefault`, opens an accessible modal (focus trapped, Escape
  closes, focus returns), clears `sessionStorage` — **zero network requests leave the page**
- No native submit path with JavaScript disabled, on either form
- WCAG AA contrast across all 12 pages, with ancestor `opacity` compounded
- Focus ring clears 3:1 on every surface (two-tone: blue ring + white halo)
- All controls ≥ 44×44 px
- No horizontal overflow at 360 px · zero console errors · zero external requests
- Both mandatory disclosures present on all 12 pages; no banned term; valid JSON-LD
  with no review or price markup

---

© 2026 Ara Tax Services LLC. Sample build — not deployed to a production domain.
