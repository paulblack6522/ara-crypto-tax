# Developer handover — Ara Tax Services LLC website

Static site. **No build step, no framework, no package manager, no third-party requests.**
Unzip, open `index.html` in a browser, and the whole site works — including offline.

Deploy = copy these files to the web root. Nothing to compile.

Live reference build: https://paulblack6522.github.io/ara-crypto-tax/

> **Changed 2026-08-05.** The long five-step intake wizard (`file.html`) and its script
> (`assets/js/wizard.js`) were **deleted** at the client's instruction. The short
> request form that used to live at `lander-2.html` is now **`index.html`** — the home
> page *is* the form. Question 5 changed from *"Do you have your transaction records?"*
> to *"Which exchanges or wallets did you use?"*, with an **Other: please specify** box.
> Every yellow callout was removed site-wide, the demo notices were removed, and the
> body copy on every page was cut back by roughly 40% overall.
> **Read §2.2a before you deploy anything.**
> If you are looking at an older copy of this file, this one supersedes it.

---

## 1. What you need to do

| # | Job | Files |
|---|---|---|
| 1 | Wire the **2 forms** to a real endpoint (POST + email) | `assets/js/lander2.js`, `contact.html` |
| 2 | Wire **"Call me now"** to real telephony (or remove it) | `assets/js/lander2.js` |
| 3 | **Update `privacy.html` BEFORE the forms go live** | `privacy.html` |
| 4 | Swap **placeholder phone / email / address** | all pages |
| 5 | Flip **noindex → index** and update canonicals + sitemap | all pages, `robots.txt`, `sitemap.xml` |

Details for each are below.

---

## 2. The two forms — exact hook points

Both send **nothing** today. Each has the same deliberate guard, and **the guard must
stay**: the send control is `type="button"` (not `submit`), the `<form>` carries
`onsubmit="return false"`, and there is a `<noscript>` fallback. That combination means
there is no native browser submission even with JavaScript disabled — without it, a
JS-disabled browser does a native `GET` and puts the taxpayer's **name, email and phone
into the URL query string**, into server logs, browser history and the outbound `Referer`.
That exact bug was found and fixed in QA. Do not undo it.

> The file is still called `lander2.js` after the rename to `index.html`. Renaming it is
> safe if you prefer — it is referenced once, in `index.html`'s `<head>`.

### 2.1 Request form — `index.html` (the home page)

**File:** `assets/js/lander2.js`
**`function submit()`** — search for `/* 3. Scheduled submit — demo only`.

`validateAll()` runs first; replace the modal call with your POST and open the modal on
success.

```js
function submit() {
  if (!validateAll()) { return; }
  fetch('/api/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
    body: JSON.stringify(payload)
  }).then(function (r) {
    if (!r.ok) { throw new Error('bad status'); }
    var when = $('[data-confirm-when]');
    if (when) { when.textContent = chosenWhen(); }
    window.AraSite.openModal('callback-confirm');   // keep — accessible, focus-trapped
  }).catch(function () {
    /* show an inline error. Do not clear the form. */
  });
}
```

**Callback slot fields:** `callback_slot` (a chosen slot, value = an ISO instant), or
`callback_date` + `callback_time` when the visitor picks "Another time", plus `timezone`.

⚠ **The slots are anchored to the FIRM's hours — Mon–Fri 09:00–17:00 America/Los_Angeles**
— and re-labelled into the US timezone the visitor selects. The underlying appointment
instant does not move when they change the selector. **Store the booking as a UTC instant**,
never as the displayed local string.

⚠ **Timezone is chosen by the visitor, never auto-detected.** Do not add
`Intl.DateTimeFormat().resolvedOptions().timeZone`. This is a client rule, not a preference.

### 2.2 Contact form — `contact.html`

**Inline `<script>` at the bottom of the file** — the `sendBtn` click handler.
`form.reportValidity()` runs first, then the modal opens.

### ⚠️ 2.2a BOTH CONFIRMATION MODALS NOW CLAIM SUCCESS — WIRE THE ENDPOINT BEFORE THIS IS PUBLIC

On 2026-08-05 the client asked for the demo notices to be removed, because the build is
reviewed behind a watermark rather than shown to the public. So:

- `index.html` → **"Your callback is requested… A preparer will call you"**
- `contact.html` → **"Thank you. We have your message and a preparer will reply"**

**Neither is true until you connect a real endpoint.** Nothing is transmitted today. That is
fine for a watermarked internal review and it is **not** fine on a live domain: a page that
tells a taxpayer their details were received when they were not is a deceptive pattern and
an ad-account risk.

**So treat these two as blocking:** the endpoint must be live *before* the site is, and the
modal must only open on a successful response (see the `.then(...)` / `.catch(...)` split in
§2.1). If for any reason the site has to go public before the endpoint exists, put the
"nothing was sent" wording back first.

### 2.3 Question 5 — "Other: please specify"

Question 5 asks **which** exchanges and wallets were used. Seven named tickboxes, then a
last option **"Other: please specify"** which reveals a free-text box.

- Checkboxes post as `venues` (repeated); the free-text box posts as `venues_other`.
- The reveal lives in `initVenueOther()` in `assets/js/lander2.js`. Unticking "Other"
  **clears** the text, so a stale value can never be submitted.
- Validation is in `problemWith()`, under `if (name === 'venues')`: at least one tickbox,
  and if "Other" is ticked the box has to be filled in.
- Serialize `venues` as an **array**. If "other" is among the values, `venues_other` holds
  what they typed.

⚠ **This question asks for platform names only.** It must never grow a field for what is
held there, what it is worth, a login, an API key or a recovery phrase. See §6.

### 2.4 Fields each form posts

Read them off the `name` attributes; nothing is renamed in JS.

- **`contact.html`** — `name`, `email`, `phone`, `message`, `consent`
- **`index.html`** — `tax_years`, `activities`, `tx_volume`, `venue_count`, `venues`,
  `venues_other`, `prior_reporting`, `full_name`, `email`, `phone`, `contact_method`,
  `timezone`, `callback_slot` / `callback_date` + `callback_time`, `consent`

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
   bank or routing number, card details, a wallet balance or holdings value, or a file
   upload. Not optionally, not behind a "you can skip this". The site states in the
   paragraph above the form that none of these are asked for, and question 5's own hint
   promises we never ask for a login, an API key or a recovery phrase.

---

## 4. "Call me now" (`index.html`)

`initCallNow()` in `assets/js/lander2.js`. Today it validates the contact details, shows an
"assigning a preparer" overlay, and after 3.5s resolves to a plain confirmation that a
preparer will call the number given.

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
analytics, writes nothing to browser storage, and transmits nothing anywhere. There is a
visible comment at the top of the file saying so.

The moment you add a form endpoint — or analytics, or a tag manager, or a chat widget, or
anything that writes to `sessionStorage`/`localStorage` — that page becomes false.
**Update it in the same commit as the endpoint, not after.** It has a real CCPA/CPRA
section that needs the new data flow described: what is collected, where it is sent, who
processes it, how long it is kept.

> The storage claim changed on 2026-08-05: deleting the wizard removed the only
> `sessionStorage` use on the site, so the page now says there is none. If you add any,
> that line goes back.

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
- Investment or trading content, or exchange links presented as recommendations. **The
  exchange names in question 5 are a plain tickbox list of platforms the visitor may have
  used — no logos, no brand marks, no ranking, no recommendation, and no implication that
  any of those companies is a partner. Keep it that way.**

**Always keep, verbatim, in the footer of every page — including any new page you add:**
1. the **non-affiliation** statement ("We are not the IRS…"), and
2. the **free-alternative disclosure** — *"You can file your own federal tax return directly
   with the IRS at no cost to you, including through IRS Free File if you are eligible…"*

That second line is what keeps the site inside Google's **Government documents and official
services** policy. It costs a little conversion and it is **not optional**.

**No tax claim goes on a page unless a line in `_system/FACTS.md` supports it.** That file is
the researched, IRS-sourced set of statements this site is allowed to make.
`_system/COPY-RULES.md` and `_system/PARTIALS.html` hold the copy rules and the shared
header/footer/modal markup. (Both carry a RETIRED banner over the sections that described
the deleted wizard — the research is kept, the spec no longer applies.)

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
   scheduler on `index.html` assumes **Mon–Fri 09:00–17:00 Pacific** — if the firm's real
   hours differ, change `FIRM_TZ` and `isFirmHour()` in `assets/js/lander2.js` and keep the
   two consistent.

---

## 9. One funnel

Every "Start your filing" / "Request a callback" button on the site now points at
**`index.html#request`** — the request form on the home page. There is no second form path.

⚠ **Validation is per-question via `data-required` on the field *group*, not `required` on
the individual input.** Remember this when you test — a group of checkboxes is validated as a
group, by `problemWith()` in `lander2.js`. Grep `data-required` before you change any
validation logic.

---

## 10. Accessibility — verified, please don't regress

Driven in a real browser (Chromium/Playwright), not by inspection. WCAG AA contrast across
every page **with ancestor `opacity` compounded**; focus ring clears 3:1 on every surface;
all controls ≥ 44×44 px; no horizontal overflow at 360 px; zero console errors; modal
focus-trapped with Escape and focus return; nav drawer uses `inert` + Tab wrap + scroll lock.

Known trap in this CSS: a broad `a` colour rule once painted navy text on the navy CTA
button (1.0:1, invisible). It is fixed with `:not(.us-button)` — **if you add a link rule,
exclude buttons.**

Re-run a contrast check after any colour change, and test both forms **with JavaScript
disabled** after any form change.

---

## 11. File map

```
index.html            HOME — and the request form itself (#request).
                      Six questions + contact + callback booking.
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
assets/js/lander2.js  index.html — the request form, the "Other: please specify" reveal,
                      the callback scheduler and "Call me now"
                          ← FORM HOOK: function submit()
                          ← call-now: initCallNow()
assets/img/           Wordmark + favicon (SVG)
favicon.ico  apple-touch-icon.png
robots.txt  sitemap.xml  sitemap.xsl  llms.txt

_system/FACTS.md      IRS-sourced statements the site may make; §8 has the LIVE field
                      table, above the retired wizard's field list
_system/COPY-RULES.md Copy rules (§4 = retired wizard spec, kept as research)
_system/PARTIALS.html Shared header / footer / modal markup
README.md             Fuller background on the build
```

`_system/` is documentation for whoever edits the copy — it is not served content and can be
left out of the production web root if you prefer.

**Deleted on 2026-08-05:** `file.html` and `assets/js/wizard.js` (the five-step intake
wizard), and the previous marketing home page. They are in the repository history if anyone
needs them back.

---

## 12. Design provenance

The visual language is the **U.S. Web Design System**, which is **public domain (CC0)** —
that is the design system federal sites are built on, which is why the plain, boxy,
high-contrast look is legitimately usable here. Every government-affiliation signal was
stripped deliberately (see §6). Keep it that way: the look is allowed, the *claim* is not.

---

© 2026 Ara Tax Services LLC.
