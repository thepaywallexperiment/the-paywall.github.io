# THE PAYWALL

A 30-day internet experiment. One video is live. Anyone can purchase the next slot. Each successful purchase doubles the price.

This site is static HTML, CSS, and JavaScript. Configure it with `state.json`. Do not put secret keys in the frontend.

## Pricing

```
slotPrice(n) = €1 × 2^(n - 1)
```

There are **21 slots**.

| Slot | Price |
| ---: | ----: |
| 1 | €1 |
| 2 | €2 |
| 3 | €4 |
| … | … |
| 20 | €524,288 |
| 21 | €1,048,576 |

If all 21 slots sell, theoretical gross raised = **€2,097,151**.

The displayed price is always computed from `currentSlot`. Do not hardcode a parallel price that can drift.

## How to operate

1. Edit `state.json`:
   - `currentSlot` — the slot currently for sale
   - `currentVideoUrl` — CDN or hosted MP4 URL
   - `paymentLinks.card` / `paymentLinks.crypto` — public payment URLs only
   - `uploadUrl` — dedicated upload-only destination (not a public Drive folder)
   - `experimentStart` — official launch timestamp
   - `experimentDays` — 30
   - `maxSlots` — 21
2. Point Stripe (or similar) success redirects to `success.html`.
3. Treat the **payment provider webhook** as the source of truth.
4. After verified payment: mark the slot sold, increment `currentSlot`, publish the approved video, update `currentVideoUrl`.

The landing page does not confirm payment by itself. A success-page visit is not enough.

## 30-day experiment

Purchases stop when `experimentStart + 30 days` is reached, or when slot 21 is sold.

At the end:

- No new purchases
- Final amount raised is calculated
- 10% community allocation is calculated
- Community poll results are finalized

## Community 10%

10% of the amount raised is allocated to a community-selected outcome via polls associated with published videos. This is not a lottery or gambling product. Voting rules live in `terms.html`.

## Local preview

Serve the folder over HTTP so `state.json` can load:

```
python -m http.server 8080
```

Then open `http://localhost:8080`.
