# Library agent: spec

**Status:** designed, not yet running. **Owner:** M. M. Rastegardoost.

## Purpose

The review compares 36 commercial products: 11 robots (Table 2), 17 dispensers (Table 3) and 8 integrated platforms (Table 4). Prices, models and specifications change: products are discontinued, prices move, and new dispensers appear. For example, Tecan ended sales of the Freedom EVO in December 2025 (Table 4). The library agent keeps the wiki's hardware directory current so the SFL agent never designs a cell around a product that no longer exists.

## What it does

1. **Watches** a list of sources per vendor: product pages, release notes, price lists where public, and distributor listings.
2. **Detects** changes against the catalogue: a new model, a discontinued model, a changed price, or a changed accuracy, repeatability or volume range.
3. **Proposes** each change as a pull request against `data/catalog.json` and the matching wiki page. Every changed field carries:
   - `source`: the URL the value came from
   - `retrieved`: the date it was read
   - `grade`: one of `published` (vendor datasheet or price list), `reported` (distributor, paper or quote seen by the authors) or `inferred` (estimated, with the reasoning given)
4. **Waits for a person.** Nothing is merged without review. The agent never edits review text.

## What it does not do

- It does not request quotes or contact vendors.
- It does not scrape pages that forbid automated access. Those vendors are checked by hand.
- It does not change the review manuscript. The review is a snapshot, and the catalogue is the living copy.

## Catalogue record (planned `data/catalog.json`)

```json
{
  "id": "watson-marlow-qdos-20",
  "kind": "dispenser",            // robot | dispenser | platform | retrofit | tool
  "material_class": ["liquid"],   // liquid | semi-solid | powder | object
  "mechanism": "Peristaltic pumping",
  "brand": "Watson-Marlow",
  "model": "Qdos 20",
  "specs": { "accuracy": {"value": "±1% dosing accuracy", "source": "...", "retrieved": "2026-05-01", "grade": "published"} },
  "price": { "lo": 4248, "hi": 4248, "currency": "USD", "quote_only": false, "source": "...", "retrieved": "2026-05-01", "grade": "reported" },
  "status": "available",          // available | discontinued | announced
  "review_ref": 63,
  "history": [ { "date": "2026-05-01", "field": "price", "old": null, "new": 4248, "pr": 1 } ]
}
```

## Run plan

| Phase | Deliverable |
|---|---|
| 1 | `catalog.json` seeded from Tables 2–4 (`review_ref` and `grade: reported` for every value), with a validator script |
| 2 | Source list per vendor, plus a weekly GitHub Actions job that fetches the sources and writes a diff report (no LLM yet) |
| 3 | An LLM step that turns the diff report into proposed record changes with sources, opened as one pull request per vendor |
| 4 | The wiki hardware pages generated from `catalog.json`, so the wiki and the SFL agent read the same data |

## Safeguards

- One pull request per vendor per run, so a reviewer can check each one in a few minutes.
- A change to a price of more than 50%, or a status change to `discontinued`, gets a `needs-human-check` label.
- The agent must quote the sentence it read for every value it proposes.
