# Installments: Replace Existing (Avoid Duplicates)

## Problem
When the user changes the **start date** (or frequency/number) and clicks "Generate" again, the backend was **adding** new installments instead of replacing the old schedule. This caused duplicate installments for the same property (e.g. شقة زايد).

## Frontend behavior (done)
- Before calling `POST /installments/generate`, the frontend checks if the transaction already has installments.
- If **yes**, it shows a warning and a checkbox: **"Replace existing installments (update schedule)"**.
- If the user submits **without** checking the box, the frontend shows an error and does not call the API.
- When the user checks the box and submits, the frontend sends **`replaceExisting: true`** in the request body.

## Backend requirement

**Endpoint:** `POST /api/v1/installments/generate`

**Request body (existing):**
- `transactionId` (string, required)
- `startDate` (string, ISO date, required)
- `numberOfInstallments` (number, required)
- `frequency` (string: `monthly` | `quarterly` | `semi_annual` | `yearly`)

**New optional field:**
- `replaceExisting` (boolean, optional, default `false`)

**Behavior:**
- If **`replaceExisting === true`**:
  1. **Delete** all existing installments for the given `transactionId` (or at least those that are still `due` / not yet paid, depending on business rule; safest is delete all for this transaction and recreate).
  2. Then **create** the new installments from `startDate`, `numberOfInstallments`, and `frequency` as you already do.
- If **`replaceExisting === false`** (or omitted):
  - **Option A (recommended):** If the transaction already has any installments, return **409 Conflict** or **400** with a message like "Transaction already has installments. Send replaceExisting: true to replace." so the frontend can show a clear error.
  - **Option B:** Keep current behavior (append), but then the frontend will block submit when there are existing installments unless the user checks "Replace existing", so in practice the frontend will only send `replaceExisting: true` when there are existing installments.

Implementing **replaceExisting: true** as "delete all for this transaction then generate new" avoids duplicate installments when the user only wants to change the start date or schedule.
