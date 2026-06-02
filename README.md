# 📈 Stock Report — Viewer

Password-protected daily stock report viewer.

**Report URL:** `https://YOUR_USERNAME.github.io/stock-report-viewer/`

Access is restricted. Contact the repository owner for credentials.

---

> This repo is updated automatically by `stock-report-private` every weekday morning.
> Do not edit `docs/` manually — files are overwritten on every CI run.
> The password is controlled exclusively via the `PAGES_PASSWORD` secret in `stock-report-private`.

---

## 🔎 Signal Explorer (`docs/explorer/`)

A multi-page, static explorer for the underlying signals — added alongside the
daily report. It lives in its own folder so the weekday CI (which overwrites
the top-level `report.html` / `index.html`) leaves it untouched.

**URL:** `https://YOUR_USERNAME.github.io/stock-report-viewer/explorer/`

- **Same password gate** as the main report. `docs/explorer/index.html` reuses
  the identical dual-hash scheme and the `sr_auth_v1` session key, so unlocking
  either the report or the explorer unlocks both for the browser session. The
  `REPORT_HASH` / `MASTER_HASH` placeholders should be injected by the same CI
  step that fills `docs/index.html`.
- **Pages:** Home, Stocks (full InvScore), ETFs + Crypto (transparent
  price-based metrics — *not* the equity score), Macro, a cross-asset Screener,
  Compare/Watchlist (saved in `localStorage`), per-ticker detail, and an About /
  methodology page.
- **Data:** embedded in `docs/explorer/data.js` (113 stocks + 29 ETFs +
  10 crypto), generated from the clean historical signal log. Regenerate with
  `scripts/build_site_data.py` + `scripts/build_site.py` in the generator repo.

> **Honesty note:** the equity **InvScore is descriptive, not predictive** —
> backtest IC ≈ −0.05 and the score is *inversely calibrated* at the top end
> (highest-scoring buckets had negative forward returns). The explorer surfaces
> this rather than hiding it; treat scores as health/quality coloring, not buy
> calls.

---

## ✅ Tests & fixes behind this data

The generator repo PR (`fix/core-fixes-on-main` on `stock-report-generator`)
that produced trustworthy data for this explorer carries five verified fixes:

| Area | Fix | Verification |
|------|-----|--------------|
| **Backtest hang** | Disk-cache the bootstrap-heavy `compute_extended_metrics` (Hansen MCS, Romano–Wolf, White's Reality Check, Hansen SPA) keyed on signal-log size+mtime. Was ~tens of seconds every run with no output → looked like a hang. | Cold pays once; warm reads in ms, **byte-identical** results (verified cold-vs-warm). |
| **Render crash** | `:+d` format applied to a float score delta raised `ValueError` and aborted HTML. Round before formatting. | Pipeline renders end-to-end (exit 0). |
| **`--tickers` no-op** | A symbol not in the watchlist silently produced "Fetching all 0 tickers". Now warns + fetches ad-hoc; de-dupes preserving order. | Edge cases checked: watchlist/ad-hoc/mixed/dupe/sector. |
| **O(n²) IC** | Per-layer rank-IC used `[sorted(xs).index(x) …]` (O(n² log n), tie-ignoring → biased). Replaced with canonical tie-aware `spearman_ic`. | Matches `scipy.stats.spearmanr` exactly on tied data. |
| **Score saturation guard** | At `regime_mult = 1.0` (strong bull regime) the score mapping has no headroom, so high-confluence tickers peg at 100 and cluster. Cap the effective multiplier at 0.95. | `tests/test_regime_mult_cap.py` (5 tests) pins the mapping invariant. **Honest caveat:** the original incident could not be reproduced once its triggering fetch-state was gone, so this is a sound *safeguard*, not a repro-verified fix. |

**Test totals:** the new `test_regime_mult_cap.py` (5 tests) plus **517 related
tests** (backtest summary, scoring, IC stats, main-phases, render helpers) all
pass with no regressions. The data embedded here was built from the clean
historical signal log with saturated rows excluded.
