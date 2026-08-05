# COPY RULES — Ara Tax Services LLC

Read this before writing a single sentence of page copy. Everything here is
binding on all five page builders. Where a rule and a nice-sounding headline
conflict, the rule wins.

**The firm:** Ara Tax Services LLC, a private tax preparation firm in
San Ramon, California.
**The product:** preparing and filing United States federal tax reporting for
people who have cryptocurrency activity.
**The client is brand new to this business.** There is no history, no client
count, no track record, and no credential to describe. Nothing may be invented
to fill that gap.

---

## 1. Tone

- **Plain, procedural, unexcited.** Write the way an instruction booklet
  writes. Short declarative sentences. No exclamation marks.
- **Describe the work, never the outcome.** "We prepare Form 8949 from your
  transaction history" — not "we cut your crypto tax bill".
- **Second person for the reader, first person plural for the firm.** "You
  send us the exports. We reconcile them."
- **Say what we do not do**, plainly, wherever a reader might assume more. It
  is the fastest way to earn trust with no track record to point at.
- **No hedging fog.** If something is genuinely unsettled in the tax rules,
  say it is unsettled and say what we do about it. Do not paper over it and
  do not overstate it either.
- **No sales register at all.** No urgency, no scarcity, no "don't miss",
  no countdowns, no popups on exit, no "limited slots".
- **US English.** Numbers as digits. Dollar amounts with the dollar sign.
  Form names exactly as the IRS prints them (Form 8949, Schedule D, Schedule 1,
  Form 1099-DA, Form 1040-X, FinCEN Form 114).
- **Reading level:** aim for a general adult reader who owns crypto and does
  not know tax vocabulary. Define a term the first time it appears.
- One `<h1>` per page. Headings describe the section's content, not a benefit.

---

## 2. Banned words and phrases — grep for these before shipping

### 2.1 Government affiliation (any one of these is an instant suspension risk)

| Banned | Why |
|---|---|
| "official", "official site", "official website", "An official website of…" | Asserts a government property |
| "Here's how you know", ".gov website", "Official websites use .gov" | The USWDS .gov banner text, verbatim or paraphrased |
| "government website", "federal agency", "government portal", "filing center" | Same |
| "IRS-authorized", "IRS-approved", "IRS partner", "IRS-certified", "works with the IRS", "on behalf of the IRS" | Claims an endorsement that does not exist |
| "e-file provider", "Authorized IRS e-file Provider", "EFIN" | Unverified credential — do not claim it on this build |
| ".gov" anywhere in our own naming, domain, email or brand | Restricted TLD |
| "IRS" inside our brand name, logo, wordmark, page `<title>` brand segment, or domain | Prohibited |
| "USA.gov", "FOIA", "No FEAR Act", "Inspector General", "Performance reports", "21st Century IDEA" | Federal statutory artifacts — a private firm has none |

**Allowed:** referring to the IRS factually in body copy. "We file Form 8949
with the IRS." "The IRS treats digital assets as property." "IRS Free File"
inside the required footer disclosure. That is the whole permitted use.

**Also banned as imagery:** the US flag, any federal or Treasury seal, the IRS
eagle-and-scales logo, a padlock strip, an eagle, a shield outline that reads
as a seal, stars, laurel, or scales of justice.

### 2.2 Fabricated credentials and track record

Banned outright, with no exception: "CPA", "certified public accountant",
"CPA on staff", "Enrolled Agent", "EA", "certified", "licensed", "chartered
accountant", "registered accountant", "20 years experience", "since 2005",
"trusted by 4,000 filers", "thousands of returns", client counts, testimonials,
quotes from clients, star ratings, review widgets, review or AggregateRating
schema, award badges, "as seen in", partner logos, association marks, "#1",
"leading", "top-rated", "best".

Also banned: stock photos captioned as staff or clients, and any named
"team member" who has not been supplied by the client.

### 2.3 Tax relief and debt settlement positioning

Banned: "tax relief", "settle your IRS debt", "pennies on the dollar",
"remove penalties", "penalty abatement" as a marketed service, "stop wage
garnishment", "release a lien", "offer in compromise", "IRS debt forgiveness",
"fresh start program", "back taxes settled".

This is a heavily restricted Google Ads category that a for-profit preparer
cannot qualify for, and it is not what this firm does. Keep it off the pages
and out of the FAQ. *(Catching up on unfiled years and amending a filed return
are ordinary preparation work and may be described plainly — just never as
"relief", "settlement" or "forgiveness".)*

### 2.4 Outcome guarantees

Banned: "maximize your refund", "biggest refund", "bigger refund", "lower your
tax bill", "reduce what you owe", "save $X", "we cut your crypto taxes",
"guaranteed accuracy", "100% accurate", "audit-proof", "never pay a penalty",
"audit protection", "we guarantee", "risk-free", "no-risk".

Also banned: any statistic about refund or deduction amounts — averages,
aggregates, percentages, anonymised or not.

Also banned: fear-and-urgency framing built on arrest, prosecution, wage
garnishment, liens, bankruptcy or asset seizure.

**Write this instead:** "We reconcile every disposal we can see in your
records and report it on Form 8949." / "If your records are incomplete we tell
you what is missing before we start."

### 2.5 Pricing and dark patterns

Banned: invented prices, struck-through "was $499" anchors, countdown timers,
"3 slots left", "offer ends", exit-intent popups, chat widgets that mimic a
person, fake progress bars, pre-ticked consent boxes, and any fee that is only
revealed later.

**This build carries no prices.** Do not invent a fee, a range, a "from $X",
or an hourly rate. Where price would naturally appear, write that we quote
after we see the scope, and point at the intake form. If the client later
supplies a real fee schedule, it needs its own page plus a
responsible-for-third-party-costs line and a 30-day price-hold line — that is
out of scope for this build.

The word **"free"** may not be used to describe anything we sell. It appears
on this site only inside the required footer disclosure about filing directly
with the IRS at no cost.

### 2.6 Investment and trading content

Banned: price predictions, "best coin", "top altcoins", buy/sell/hold advice,
"invest in", portfolio recommendations, ticker widgets, price charts, market
commentary, yield comparisons, exchange or wallet comparison tables, "best
exchange" rankings, and any affiliate or referral link to an exchange, wallet,
broker or token.

Naming an exchange or wallet **as an example of a place a client may need to
export records from** is fine and necessary ("Coinbase, Kraken, MetaMask,
Ledger"). Ranking, recommending, rating or linking to them is not.

### 2.7 Data collection

The intake form must never contain a field for: Social Security number, ITIN,
EIN, date of birth, seed or recovery phrase, private key, exchange password,
exchange API key or secret, bank account or routing number, card number,
driver's licence, passport, or a document upload. Not optional. Not with a
"you can skip this" note. Not behind a "secure" label.

Treat everything a visitor types into the form as protected tax return
information from the first keystroke. No pixel, tag, session recorder or chat
widget may transmit field contents anywhere. This build ships with zero
third-party requests — keep it that way.

---

## 3. Required disclosures

### 3.1 Footer, every single page, verbatim

**A — non-affiliation:**

> Ara Tax Services LLC is a private tax preparation firm. We are not the IRS. We are not affiliated with, endorsed by, or acting on behalf of the Internal Revenue Service, the U.S. Department of the Treasury, or any government agency.

**B — free alternative:**

> You can file your own federal tax return directly with the IRS at no cost to you, including through IRS Free File if you are eligible. Our service is a paid, optional alternative in which we prepare your return for you.

Both live in `.us-footer__legal`, at 15px, 14.9:1 contrast. Never shrink,
grey, truncate, reword, collapse into an accordion, or move to a single
disclosures page. Copy them from `PARTIALS.html` — do not retype them.

### 3.2 ⚠ WITHDRAWN 2026-08-05 — the yellow security box

This section used to require the sentence *"We will never ask for your seed
phrase, private keys, exchange passwords, or API keys. No one legitimate ever
will."* in a yellow `.us-security-note` box above the first field.

**Every yellow callout has been removed from the site at the client's
instruction** — the `.us-security-note` boxes and the `.us-alert--warning`
blocks, on every page. `.us-security-note` is now dead CSS; **do not reinstate
it, and do not add a new yellow callout anywhere.** The only surviving
`.us-alert--warning` markup is inside the two `<noscript>` fallbacks, which no
visitor with JavaScript on ever sees.

**The substance was kept, only the box went.** The promise still appears as
ordinary prose:

- `index.html` — inside question 5's own hint: *"we never ask for a login, an
  API key or a recovery phrase"*, plus the paragraph above the form listing
  everything not collected.
- `privacy.html` §3 *"What we never ask for"* — full wording, including the
  impersonation warning.
- `what-you-need.html` — *"We never ask for keys or passwords"* section.
- `contact.html` — *"Do not send tax documents or account credentials by
  email"* section.

**The rule that no form may ever contain such a field is unchanged and is not
optional** (see `PARTIALS.html` and §2.7). What changed is the styling, not the
promise.

### 3.3 Contact details, footer of every page

Ara Tax Services LLC · San Ramon, California · (925) 555-0148 ·
hello@aratax-example.com

Plain text and live `tel:`/`mailto:` links, never an image, never behind a
hover or a click. Use these placeholder details consistently everywhere; the
phone is in the reserved 555-01xx range and the email domain is deliberately
not real, because this is a sample build.

### 3.4 Helper text required on the exchanges/wallets question

The question that asks **which** exchanges and wallets were used must carry, in
its hint, that we ask for **names only** and that we never ask for a login, an
API key or a recovery phrase. The live wording on `index.html` is:

> *"Tick all that apply, across every year. This tells a preparer which records
> exist and in what format. We do not ask what you hold on them, and we never
> ask for a login, an API key or a recovery phrase."*

The free-text box behind **"Other: please specify"** must say *names only* too.
Asking which platform is scoping. Asking what sits on it is a holdings harvest,
which is what the impersonation lander we declined on 2026-08-01 was built to do
— see the project `CLAUDE.md`. That line does not move.

---

## 4. The intake wizard — RETIRED 2026-08-05

> **This section no longer describes anything that is built.** The five-step
> wizard (`file.html`, `assets/js/wizard.js`) was deleted at the client's
> instruction, and the short request form — six questions plus a callback
> booking, formerly `lander-2.html` — became `index.html`. Kept as research;
> see the live field table in `FACTS.md` §8. Do not build to the spec below
> without checking with the client first.

## 4a. The retired wizard — five steps, fixed

Every builder must use these five step names, in this order, with this
numbering. They appear in the `.us-step-indicator`, in each step's `<legend>`,
and anywhere a page describes the process.

| Step | Name | What it establishes |
|---|---|---|
| **1** | **Filing basics** | Which tax years, what the person actually needs (full return, calculation only, amendment, catch-up, review, consultation), expected filing status, state residency, living abroad, whether an entity or a retirement account is involved, whether another preparer handles the rest of the return |
| **2** | **Where your activity happened** | How many centralized exchanges, which ones by name, any non-US venue, how many self-custody wallets, how many networks and which, bridging, DeFi use, any platform that failed or froze, whether access to every wallet still exists |
| **3** | **What kind of activity** | The checklist of everything done in the year (sold, swapped, spent, gas fees, staking, mining, airdrops, forks, NFTs, liquidity, lending, wrapping, margin, futures, wages, contractor income, gifts, donations, own-wallet transfers, validator, ICO, referral bonuses), who paid in crypto, gifts above the annual exclusion, donation size band, appraisal, worthless/stolen/lost claims, tokenized securities, foreign accounts |
| **4** | **Records and prior filings** | Transaction count band, taxable disposal count band, gross proceeds band, year-end portfolio band, Form 1099-DA received and whether it showed basis, crypto tax software in use, what records can be provided, whether acquisition dates and cost are known, undocumented holdings |
| **5** | **How to reach you** | Prior-year accounting method, the Rev. Proc. 2024-28 wallet-by-wallet allocation and when it was recorded, prior-year crypto reporting, how the digital asset question was answered, any IRS notice received, current examination status, estimated-tax planning, anything else, preferred reply channel, name, email, optional phone |

**Wizard build rules**

- Steps 1–4 collect scope. Step 5 ends with the contact fields — name, email,
  optional phone. Nothing sensitive, ever (see §2.7).
- Each step is a `<fieldset>` with a `<legend>` carrying the step name.
- The `.us-step-indicator` shows all five segments on every step:
  completed segments get `--complete`, the current one gets `--current`,
  and the header reads "Step N of 5 — <name>".
- Conditional fields: the appraisal question shows only when the donation band
  is $5,000 or more; the allocation-date question shows only when a Rev. Proc.
  2024-28 allocation was made; the basis question shows only when a Form
  1099-DA was received. If conditional logic is not implemented, show the
  field with a "if this applies to you" hint rather than hiding it.
- Bands, not exact figures, wherever a band is enough to scope the work.
- Every input has a real `<label for>`. Required fields carry a visible
  `<span class="us-required">*</span>` plus `required` on the input, and the
  form explains the marker once, above step 1.
- Errors use `.us-form-group--error` + `.us-input--error` +
  `.us-error-message`, with `aria-describedby` pointing at the message.
- On submit, show the `.us-modal` confirmation. Do not redirect to a page that
  claims anything about turnaround time we have not been told.

---

## 5. What the site may claim about tax substance

Only what is in `FACTS.md`. Every statement there is sourced to the IRS,
FinCEN, or the Federal Register. If a sentence you want to write is not
supported by a line in `FACTS.md`, either cut it or write it as a question the
intake form asks.

`FACTS.md` also carries a **do not publish** list. Those are the things crypto
tax pages say all the time that could not be verified from a primary source.
Do not write them, do not imply them, and do not answer them in the FAQ with a
softened version.

Nothing on this site is presented as advice for a specific person. Do not
write "you should", "you must", "you need to" about a reader's own tax
position. Write "the IRS requires…" and "we ask about this because…".

---

## 6. Pre-ship checklist for every page

1. Exactly one `<h1>`, inside `<main>`.
2. `[HEAD]`, `[HEADER]`, `[FOOTER]` pasted verbatim; `{{TITLE}}`,
   `{{DESC}}`, `{{CANONICAL}}` filled; `aria-current="page"` on one nav link.
3. Both footer disclosures present, unedited, and visible.
4. Every internal `href`/`src` relative, no leading `/`. Grep for `href="/`
   and `src="/` — must return nothing.
5. No external request of any kind. Grep for `http://`, `https://` in `src`
   and `href` — only the canonical link and the JSON-LD `@id`/`url` values
   may be absolute, and those make no request.
6. Grep the page for every term in §2. Zero hits.
7. No price, no date claim, no turnaround promise, no credential.
8. Every form control has a `<label for>`; the form has no banned field.
9. Nothing overflows horizontally at 360px; tables sit inside
   `.us-table-wrap`.
10. Zero console errors.

> **Reconciled 2026-08-01.** The five step names and their order are fixed and were
> built as specified. The field-to-step mapping as built is recorded in FACTS.md §8
> under "AS BUILT" and that list, not the earlier draft, is authoritative.
