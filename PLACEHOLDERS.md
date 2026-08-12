# Values you must replace before this site goes live

Nothing in this build is invented. There are **no fabricated credentials, no made-up
history, no testimonials, no ratings, no prices and no lorem ipsum** — every factual
statement about tax treatment is sourced, and every statement about the firm is one the
firm can stand behind.

What follows is the short list of values that are **stand-ins because the client has not
supplied the real ones yet**. They are deliberately obvious, they are all in this one
document, and each is a find-and-replace away.

⚠ **The phone number is in the 555-01xx range, which is reserved for fiction and never
connects.** Google Ads requires a real, reachable phone number and address at launch, so
this one is a launch blocker, not a nice-to-have.

---

## 1. Phone number — `(925) 555-0148`

Appears in three formats, all of which have to change together:

- visible text: `(925)&nbsp;555-0148`
- link target: `tel:+19255550148`
- structured data: `"telephone": "+1-925-555-0148"`

| File | Occurrences |
|---|---|
| `404.html` | 8 |
| `about.html` | 8 |
| `accessibility.html` | 8 |
| `contact.html` | 12 |
| `faq.html` | 6 |
| `file.html` | 10 |
| `forms.html` | 6 |
| `how-it-works.html` | 6 |
| `index.html` | 6 |
| `llms.txt` | 1 |
| `privacy.html` | 12 |
| `request.html` | 12 |
| `terms.html` | 8 |
| `thanks.html` | 8 |
| `what-you-need.html` | 8 |
| **Total** | **119** |

## 2. Email address — `hello@aratax-example.com`

Visible text, `mailto:` links, and the `"email"` field in the JSON-LD.
`aratax-example.com` is not a real domain — the `example.com` family is reserved by
RFC 2606 and can never be registered, so this cannot accidentally reach anyone.

| File | Occurrences |
|---|---|
| `404.html` | 8 |
| `about.html` | 8 |
| `accessibility.html` | 8 |
| `contact.html` | 10 |
| `faq.html` | 6 |
| `file.html` | 10 |
| `forms.html` | 6 |
| `how-it-works.html` | 6 |
| `index.html` | 6 |
| `llms.txt` | 1 |
| `privacy.html` | 14 |
| `request.html` | 10 |
| `terms.html` | 8 |
| `thanks.html` | 8 |
| `what-you-need.html` | 6 |
| **Total** | **115** |

## 3. Postal address — `San Ramon, California`

The city and state are correct. **There is no street address**, because none was given.
Google Ads wants a full, verifiable business address at launch.

| File | Occurrences |
|---|---|
| `404.html` | 4 |
| `about.html` | 6 |
| `accessibility.html` | 3 |
| `contact.html` | 5 |
| `faq.html` | 3 |
| `file.html` | 3 |
| `forms.html` | 3 |
| `how-it-works.html` | 3 |
| `index.html` | 5 |
| `llms.txt` | 2 |
| `privacy.html` | 5 |
| `request.html` | 3 |
| `terms.html` | 5 |
| `thanks.html` | 3 |
| `what-you-need.html` | 3 |
| **Total** | **56** |

## 4. Site address — `https://paulblack6522.github.io/ara-crypto-tax/`

The preview URL. It appears in every `<link rel="canonical">`, in the JSON-LD `url`
fields, and in `sitemap.xml`. Replace with the client's own domain.

| File | Occurrences |
|---|---|
| `404.html` | 6 |
| `about.html` | 7 |
| `accessibility.html` | 7 |
| `contact.html` | 7 |
| `faq.html` | 9 |
| `file.html` | 7 |
| `forms.html` | 7 |
| `how-it-works.html` | 7 |
| `index.html` | 7 |
| `llms.txt` | 13 |
| `privacy.html` | 7 |
| `request.html` | 7 |
| `robots.txt` | 1 |
| `sitemap.xml` | 13 |
| `terms.html` | 7 |
| `thanks.html` | 6 |
| `what-you-need.html` | 7 |
| **Total** | **125** |

## 5. `noindex, nofollow`

Every page currently tells search engines to stay away, on purpose: a public preview
carrying the client's real business name should not be indexed or compete with their
real site. On the real domain, change it to `index, follow, max-image-preview:large`.

| File | Occurrences |
|---|---|
| `404.html` | 1 |
| `about.html` | 1 |
| `accessibility.html` | 1 |
| `contact.html` | 1 |
| `faq.html` | 1 |
| `file.html` | 1 |
| `forms.html` | 1 |
| `how-it-works.html` | 1 |
| `index.html` | 1 |
| `privacy.html` | 1 |
| `request.html` | 1 |
| `terms.html` | 1 |
| `thanks.html` | 1 |
| `what-you-need.html` | 1 |
| **Total** | **14** |

---

## 6. Not a placeholder, but unconfirmed — opening hours

`contact.html` says **"Monday to Friday"** and the callback scheduler on `request.html`
is anchored to **Monday to Friday, 09:00-17:00 America/Los_Angeles**. Nobody has
confirmed those are the firm's actual hours. Either publish the real ones, or remove the
Hours card — do not leave a guess on a live site.

## 7. Not a placeholder — the forms

The three forms send nothing today. That is a deliberate state, not an unfinished one,
and it is the subject of `DEV-HANDOVER.md` sections 1 to 3. **Wire the endpoint before
the site is public**: the confirmation messages currently say the details were received,
which is true only once a real endpoint exists.

---

## How to check your work

From the unpacked folder, this should return nothing when you are done:

```
grep -rn "555-0148\|aratax-example.com\|paulblack6522.github.io\|noindex" \
     --include="*.html" --include="*.xml" --include="*.txt" .
```
