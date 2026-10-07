# Security Specification for Dumboo Expense Tracker

## 1. Data Invariants
1. A transaction cannot be created, modified, or read by anyone other than the authenticated owner (`request.auth.uid == userId`).
2. Transaction amounts must be non-negative real numbers (`amount >= 0`).
3. Transaction type must strictly be either `'income'` or `'expense'`.
4. Transaction title must be non-empty and limited to 120 characters to prevent buffer and Denial of Wallet exploits.
5. Path variable `{userId}` must match `request.auth.uid` on every single operation.
6. The `userId` field inside the transaction payload must match the path `{userId}` and `request.auth.uid`.
7. Once created, a transaction's `id` and `userId` cannot be modified (immutable identity fields).
8. Only authenticated users can access their own subcollection `/users/{userId}/*`. No unauthenticated reads or cross-user writes are permitted.
9. Budgets and Categories must also strictly belong to `request.auth.uid`.
10. Default deny applies to all other routes.

## 2. The Dirty Dozen Malicious Payloads

1. **Dirty 01 (Identity Spoofing on Create)**: Trying to write a transaction into another user's path with `userId: "attacker"`.
   ```json
   { "id": "t1", "userId": "victim_uid", "type": "expense", "amount": 100, "category": "food", "date": "2026-10-06", "title": "Sneak" }
   ```
2. **Dirty 02 (Cross-User List Scraping)**: Attempting to list all transactions across `/users/victim_uid/transactions`.
3. **Dirty 03 (Unauthenticated Read)**: Querying transactions without signing in (`request.auth == null`).
4. **Dirty 04 (Ghost Field / Shadow Property)**: Adding an unauthorized field like `"isAdmin": true` or `"role": "superadmin"` into a transaction payload.
5. **Dirty 05 (Negative / Non-Numeric Amount)**: Submitting `amount: -5000` or `amount: "infinite"`.
6. **Dirty 06 (Invalid Transaction Type)**: Submitting `type: "transfer"` or `type: "hack"`.
7. **Dirty 07 (Resource Exhaustion / 1MB Title Attack)**: Submitting a title containing 100,000 characters.
8. **Dirty 08 (ID Path Poisoning)**: Passing a 500-byte illegal character path like `../illegal/admin/path`.
9. **Dirty 09 (Immutable Field Tampering)**: Attempting to update a transaction by changing its original `userId` to someone else.
10. **Dirty 10 (Direct Modification of Arbitrary System Fields)**: Attempting to set arbitrary system fields or overwrite other user's category.
11. **Dirty 11 (Malformed Date Injection)**: Injecting script tags or bloated payload into the `date` field.
12. **Dirty 12 (Budget Target Negativity)**: Setting a negative monthly budget like `targetBudget: -999999`.

## 3. Security Assertions & Fortress Rule Design
All 12 attacks will be mathematically rejected by Attribute-Based Access Control and schema validation in `firestore.rules`.
