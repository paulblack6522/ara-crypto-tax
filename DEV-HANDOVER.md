# Developer handover — Ara Tax Services LLC website

Static site. **No build step, no framework, no package manager, no third-party requests.**
Unzip, open `index.html` in a browser, and the whole site works — including offline.

Deploy = copy these files to the web root. Nothing to compile.

Live reference build: https://paulblack6522.github.io/ara-crypto-tax/

---

## 1. What you need to do

| # | Job | Files |
|---|---|---|
| 1 | Wire the **3 forms** to a real endpoint (POST + email) | `assets/js/wizard.js`, `assets/js/lander2.js`, `contact.html` |
| 2 | Wire **"Call me now"** to real telephony (or remove it) | `assets/js/lander2.js` |
| 3 | **Update `privacy.html` BEFORE the forms go live** | `privacy.html` |
| 4 | Swap **placeholder phone / email / address** | all pages |
| 5 | Flip **noindex → index** and update canonicals + sitemap | all pages, `robots.txt`, `sitemap.xml` |

Details for each are below.

---

## 2. The three forms — exact hook points

All three send **nothing** today. Each one has the same deliberate guard, and **the guard
must stay**: the send control is `type="button"` (not `submit`), the `<form>` carries
`onsubmit="return false"`, and there is a `<noscript>` fallback. That combination means
there is no native browser submission even with JavaScript disabled — without it, a
JS-disabled browser does a native `GET` and puts the taxpayer's **name, email and phone
into the URL query string**, into server logs, browser history and the outbound `Referer`.
That exact bug was found and fixed in QA. Do not undo it.

### 2.1 Intake wizard — `file.html`

**File:** `assets/js/wizard.js`
**Line ~616** — `form.addEventListener('submit', …)`, under a comment block that begins
`DEMO BUILD — THIS HANDLER SENDS NOTHING.`

Validation for all 5 steps runs first; the send point is after `if (firstBad) { … return; }`.
Replace the two lines `clearSaved(); show(confirmation); openConfirmation();` with your
POST, and call them on success.

```js
// after validation passes:
fetch('/api/intake', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
  body: JSON.stringify(payload)
}).then(function (r) {
  if (!r.ok) { throw new Error('bad status'); }
  clearSaved();            // keep — wipes sessionStorage
  show(confirmation);
  openConfirmation();      // keep — accessible modal, focus-trapped
}).catch(function () {
  /* show an inline error. Do NOT clearSaved() on failure —
     the visitor loses 5 steps of answers. */
});
```

⚠ `clearSaved()` deletes the visitor's saved progress from `sessionStorage`. Only call it
**after** the server has confirmed receipt.

### 2.2 Paid-traffic lander — `lander-2.html`

**File:** `assets/js/lander2.js`
**Line ~370** — `function submit()`. Same pattern: `validateAll()` runs first, then POST,
then `window.AraSite.openModal('callback-confirm')` on success.

The callback slot fields are `callback_slot` (a chosen slot), or `callback_date` +
`callback_time` when the visitor picks "Another time", plus `timezone`.

⚠ **The slots are anchored to the FIRM's hours — Mon–Fri 09:00–17:00 America/Los_Angeles** —
and re-labelled into the US timezone the visitor selects. The underlying appointment instant
does not move when they change the selector. When you store a booking, **store it as a UTC
instant**, not as the displayed local string.

⚠ **Timezone is chosen by the visitor, never auto-detected.** Do not add
`Intl.DateTimeFormat().resolvedOptions().timeZone`. This is a client rule, not a preference.

### 2.3 Contact form — `contact.html`

**Inline `<script>` at the bottom of the file, line ~347** — the `sendBtn` click handler.
`form.reportValidity()` runs first, then the modal opens.

⚠ This modal currently says **"Nothing was sent"** because the build is a demo. Once you wire
the endpoint, that wording becomes false — update the modal copy on `contact.html` in the
same change.

### 2.4 Fields each form posts

Read them off the `name` attributes; nothing is renamed in JS.

- **`contact.html`** — `name`, `email`, `phone`, `message`, `consent`
- **`lander-2.html`** — `full_name`, `email`, `phone`, `contact_method`, `tax_years`,
  `activities`, `tx_volume`, `venue_count`, `records`, `prior_reporting`, `timezone`,
  `callback_slot` / `callback_date` + `callback_time`, `consent`
- **`file.html`** — ~55 fields across the 5 steps (filing basics, jurisdictions, activity
  types, records/prior filings, contact). Serialize the whole form; do not hand-pick.

---

## 3. Handling the payload — non-negotiable

This is **tax return information**. Treat it as such from the first keystroke.

1. **HTTPS only**, HSTS on. First-party endpoint on the firm's own domain — not a
   third-party form service, not a webhook relay.
2. **Do not log the payload.** Not in access logs, not in error reports, not in an APM
   trace, not in a plain-text notification email. If you email the firm, email a
   *notification with a link* into an authenticated admin view — do not put the answers in
   the mail body.
3. **CSRF token + server-side validation.** Client-side validation is a convenience, never
   a control. Re-validate everything server-side.
4. **Rate-limit** the endpoint and add a spam control that is not a third-party script
   (a honeypot field and a timing check work and add no external requests — see §7).
5. **Never add a field that collects:** Social Security number, ITIN, EIN, date of birth,
   seed or recovery phrase, private key, exchange password, exchange API key or secret,
   bank/routing number, card details, or a file upload. Not optionally, not behind a "you
   can skip this". The site tells visitors in a visible box that no one legitimate will ask
   for their seed phrase — adding any of these breaks that promise and the compliance
   posture the whole build rests on.

---

## 4. "Call me now" (`lander-2.html`)

`initCallNow()` in `assets/js/lander2.js`, **line ~390**. Today it validates the contact
details, shows an "assigning a preparer" overlay, and after 3.5s resolves to a plain
confirmation that a preparer will call the number given.

**It is a placeholder for real telephony / click-to-call. No call is placed.**

If you wire it to a real provider, drive the overlay's "done" state from the provider's
callback — and keep the copy honest: it must **never** say a live call has *connected*
unless it actually has. A fake connection state is a deceptive pattern and is an ad-account
risk. If telephony is not being built, remove the button rather than leaving a simulation
in production.

Note the wording: staff are called **"preparers"**, not "experts" or "specialists with N
years". See §6.

---

## 5. `privacy.html` — edit this FIRST

`privacy.html` currently states, **truthfully**, that the site sets no cookies, runs no
analytics, and transmits nothing anywhere. There is a visible comment at the top of the file
saying so.

The moment you add a form endpoint — or analytics, or a tag manager, or a chat widget — that
page becomes false. **Update it in the same commit as the endpoint, not after.** It has a
real CCPA/CPRA section that needs the new data flow described: what is collected, where it
is sent, who processes it, how long it is kept.

Same for `terms.html` if you change what the service does.

---

## 6. Rules that must not be broken

These are not style preferences. Each maps to a Google Ads policy or to US rules on paid tax
preparers. The client will run Google Ads to this site; breaking one risks the ad account.

**Never add:**
- Anything implying government affiliation — "official", "government website",
  "IRS-authorized", "IRS-approved", "IRS partner", a `.gov` banner, a US flag, a federal
  seal, an eagle-and-scales mark, or "IRS" in the brand, wordmark, `<title>` or domain.
  (Referring to *"the IRS"* factually in body copy is fine and necessary.)
- Fabricated credentials or history — "CPA on staff", "Enrolled Agent", years in business,
  client counts, testimonials, star ratings, `AggregateRating` / `Review` markup, award
  badges. **The firm is new. Nothing about a track record may be invented.**
- Tax-relief or debt-settlement positioning — "settle your IRS debt", "pennies on the
  dollar", "remove penalties". That is a separate restricted ad category.
- Outcome promises — "maximize your refund", "guaranteed", "audit-proof", "save $X".
  Describe the work, never the outcome.
- Turnaround or response-time promises ("within one business day"). No staffing basis exists
  for an SLA; an unsubstantiated service claim is Google Ads Misrepresentation.
- Prices, `priceRange` in the JSON-LD, struck-through anchors, countdowns, fake scarcity.
- Investment or trading content, or exchange links presented as recommendations.

**Always keep, verbatim, in the footer of every page — including any new page you add:**
1. the **non-affiliation** statement ("We are not the IRS…"), and
2. the **free-alternative disclosure** — *"You can file your own federal tax return directly
   with the IRS at no cost to you, including through IRS Free File if you are eligible…"*

That second line is what keeps the site inside Google's **Government documents and official
services** policy. It costs a little conversion and it is **not optional**.

**No tax claim goes on a page unless a line in `_system/FACTS.md` supports it.** That file is
the researched, IRS-sourced set of statements this site is allowed to make.
`_system/COPY-RULES.md` and `_system/PARTIALS.html` hold the copy rules and the shared
header/footer/modal markup.

---

## 7. Zero external requests — please keep it

The site currently makes **no** third-party request at all: no web fonts, no CDN, no
analytics, no trackers, no chat widget, no captcha. It renders fully offline. That is
deliberate — it is part of what makes the privacy page true and the page fast.

If the client wants analytics, that is their call, but: **edit `privacy.html` first**, and
prefer a first-party option. A reCAPTCHA/Turnstile drop-in also breaks the "no external
requests" property — a honeypot field plus a submit-timing check is usually enough for a
form at this volume and costs nothing.

---

## 8. Going live on the real domain

The bundled build is a **noindex sample** on purpose, so a preview carrying the client's real
business name cannot get indexed and later compete with their live site.

1. Every page: change `<meta name="robots" content="noindex, nofollow">` to
   `index, follow, max-image-preview:large`.
2. `robots.txt` — replace the contents with the production block that is commented out at the
   bottom of that same file (it allows everything, disallows `/thanks.html`, and points at
   the sitemap).
3. Replace the base URL `https://paulblack6522.github.io/ara-crypto-tax/` everywhere it
   appears: `<link rel="canonical">` on each page, the JSON-LD `url`/`@id` fields, every
   `<loc>` in `sitemap.xml`, and the `Sitemap:` line in the new `robots.txt`.
4. Swap the **placeholder contact details** site-wide — `(925) 555-0148`,
   `hello@aratax-example.com`, and "San Ramon, California" with no street address. **Google
   Ads requires a real, reachable phone number and address at launch.**
5. Publish real opening hours, or remove the Hours card on `contact.html`. The callback
   scheduler in `lander-2.html` assumes **Mon–Fri 09:00–17:00 Pacific** — if the firm's real
   hours differ, change them in `assets/js/lander2.js` and keep the two consistent.

---

## 9. Two funnels — don't retire one by accident

- **`lander-2.html`** — short: six qualifying questions + contact + callback booking. This is
  the **paid-traffic destination**. Its header CTA is an in-page `#request` anchor.
- **`file.html`** — the detailed self-serve 5-step wizard, for visitors who prefer to fill
  everything in themselves. The other pages' header CTA points here.

Both are intentionally live. Compare them on real numbers before dropping either.

⚠ **Wizard validation is per-step via `data-required` on the field *group*, not `required` on
the individual input.** Remember this when you test — a group of checkboxes is validated as a
group. Grep `data-required` before you change any validation logic.

---

## 10. Accessibility — verified, please don't regress

Driven in a real browser (Chromium/Playwright), not by inspection: 21/21 functional and
accessibility checks pass. WCAG AA contrast across every page **with ancestor `opacity`
compounded**; focus ring clears 3:1 on every surface; all controls ≥ 44×44 px; no horizontal
overflow at 360 px; zero console errors; modal focus-trapped with Escape and focus return;
nav drawer uses `inert` + Tab wrap + scroll lock.

Known trap in this CSS: a broad `a` colour rule once painted navy text on the navy CTA
button (1.0:1, invisible). It is fixed with `:not(.us-button)` — **if you add a link rule,
exclude buttons.**

Re-run a contrast check after any colour change, and test both forms **with JavaScript
disabled** after any form change.

---

## 11. File map

```
index.html            Home
lander-2.html         Short qualifying form + callback booking (paid-traffic destination)
file.html             5-step intake wizard
how-it-works.html     The engagement, step by step
what-you-need.html    Document checklist
forms.html            Guide to the IRS forms a crypto return involves
faq.html              16 questions, accordion + FAQPage JSON-LD
about.html            Who we are, and what we are not
contact.html          Contact details + short message form
privacy.html          Real CCPA/CPRA section — EDIT BEFORE WIRING FORMS
terms.html            Terms
accessibility.html    Accessibility statement
thanks.html           Confirmation
404.html              Not found
ads.html              Internal: the Google Ads campaign build sheet (noindex, not linked
                      from the site nav — remove it before production if you prefer)

assets/css/site.css   All styles (USWDS-derived, public domain)
assets/js/site.js     Shared: nav drawer, modals, focus management
assets/js/wizard.js   file.html — 5-step wizard  ← FORM HOOK ~line 616
assets/js/lander2.js  lander-2.html — qualifying form, scheduler, call-now
                                              ← FORM HOOK ~line 370, call-now ~line 390
assets/img/           Wordmark + favicon (SVG)
favicon.ico  apple-touch-icon.png
robots.txt  sitemap.xml  sitemap.xsl  llms.txt

_system/FACTS.md      IRS-sourced statements the site may make + the intake field list
_system/COPY-RULES.md Copy rules
_system/PARTIALS.html Shared header / footer / modal markup
README.md             Fuller background on the build
```

`_system/` is documentation for whoever edits the copy — it is not served content and can be
left out of the production web root if you prefer.

---

## 12. Design provenance

The visual language is the **U.S. Web Design System**, which is **public domain (CC0)** —
that is the design system federal sites are built on, which is why the plain, boxy,
high-contrast look is legitimately usable here. Every government-affiliation signal was
stripped deliberately (see §6). Keep it that way: the look is allowed, the *claim* is not.

---

© 2026 Ara Tax Services LLC.
