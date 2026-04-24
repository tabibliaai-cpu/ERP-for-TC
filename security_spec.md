# Security Specification: Institutional ERP v2.0 (Zero-Trust)

This specification defines the rigorous security invariants and adversarial test payloads for the Theological Institution ERP.

## 1. Data Invariants
1. **Tenant Isolation**: No user can read or write data belonging to another `tenantId`.
2. **Identity Integrity**: User profiles MUST have an email matching their auth token.
3. **Write Path Hardening**: Document IDs MUST be valid alphanumeric strings ≤ 128 chars.
4. **Immutability**: `createdAt` and `tenantId` fields MUST NOT change after creation.
5. **Role-Based Access**:
   - `admin`: Full write access within their tenant.
   - `faculty`: Can manage subjects they are assigned to.
   - `student`: Read-only access to their own data and public institutional data.

## 2. The "Dirty Dozen" Payloads (Adversarial)

### T1: Tenant Escape (Spoofing)
**Target**: `students/victim-student`
**Payload**: `{ "name": "Hack", "tenantId": "attacker-tenant-123" }`
**Expected**: `PERMISSION_DENIED` (Cannot write to another tenant's namespace).

### T2: Identity Theft (User Spoof)
**Target**: `users/attacker-uid`
**Payload**: `{ "email": "victim@covenant.edu", "role": "super_admin" }`
**Expected**: `PERMISSION_DENIED` (Email mismatch with auth token).

### T3: Resource Poisoning (Giant Field)
**Target**: `subjects/test-subject`
**Payload**: `{ "title": "A".repeat(1000000), "tenantId": "valid-tenant" }`
**Expected**: `PERMISSION_DENIED` (String size exceeds 200 character limit).

### T4: ID Injection (Path Poisoning)
**Target**: `students/../../../global_config`
**Payload**: `{ "maintenance": true }`
**Expected**: `PERMISSION_DENIED` (Invalid ID format).

### T5: Orphaned Record (Null Reference)
**Target**: `subjects/new-subject`
**Payload**: `{ "title": "Orphan", "courseId": "non-existent-id", "tenantId": "valid-tenant" }`
**Expected**: `PERMISSION_DENIED` (Relational exists() check fails).

### T6: Privilege Escalation (Self-Promote)
**Target**: `users/student-uid`
**Action**: Update
**Payload**: `{ "role": "super_admin" }`
**Expected**: `PERMISSION_DENIED` (Role field is immutable for non-super-admins).

### T7: State Shortcutting (Grade Forge)
**Target**: `grades/test-grade`
**Payload**: `{ "score": 100, "studentId": "my-id", "tenantId": "my-tenant" }`
**Expected**: `PERMISSION_DENIED` (Only faculty/admin can write grades).

### T8: Shadow Field Injection
**Target**: `records/encrypted-record`
**Payload**: `{ "ciphertext": "...", "isAdmin": true, "iv": "..." }`
**Expected**: `PERMISSION_DENIED` (Strict key count validation fails).

### T9: Ghost Assignment
**Target**: `subjects/test-subject`
**Action**: Update
**Payload**: `{ "teacherId": "attacker-uid" }`
**Expected**: `PERMISSION_DENIED` (Teacher identification is immutable/admin-only).

### T10: Backdoor Access (Internal Scrape)
**Target**: `_internal_/secrets`
**Action**: Read
**Expected**: `PERMISSION_DENIED` (Default-deny safety net).

### T11: Denial of Wallet (Recursive Read)
**Request**: List all `tenants`
**Expected**: `PERMISSION_DENIED` (Listing tenants is restricted to Super Admins).

### T12: PII Leak (User Scrape)
**Request**: Get `users/random-id`
**Expected**: `PERMISSION_DENIED` (Tenant isolation enforced on individual document reads).

## 3. Test Runner (Audit Script)
The `firestore.rules.test.ts` will verify these payloads against the final rule set.
