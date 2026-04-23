---
Task ID: 1
Agent: Super Z (Main)
Task: Fix SuperAdmin - institution creation, password generation, routing

Work Log:
- Cloned latest repo from https://github.com/tabibliaai-cpu/ERP-for-TC
- Thoroughly analyzed all files: SuperAdmin.tsx, Login.tsx, AuthProvider.tsx, App.tsx, firestore.rules, useStore.ts, permissions.ts
- Identified 5 critical bugs causing user-reported issues
- Fixed firestore.rules: Added institutions collection match block (was completely missing)
- Fixed firestore.rules: Added delete permission for users, added isSuperAdmin() to list/get
- Created vercel.json with SPA rewrites (fixes hard refresh 404)
- Fixed SuperAdmin.tsx: institutionId → tenantId in handleProvisionAdmin
- Fixed SuperAdmin.tsx: institutionId → tenantId in loadTenantAdmins query
- Fixed SuperAdmin.tsx: Added adminPassword to newInstitution state (auto-generated)
- Fixed SuperAdmin.tsx: Added password field UI to Add Institution modal
- Fixed SuperAdmin.tsx: Enhanced handleAddInstitution to auto-provision admin account
- Fixed SuperAdmin.tsx: Removed plaintext manualPassword from fallback
- Committed all changes locally (push needs manual auth)

Stage Summary:
- 3 files modified: firestore.rules, src/pages/SuperAdmin.tsx, vercel.json (new)
- Commit a845abc created but push failed due to missing GitHub auth
- User needs to: git push origin main, deploy firestore rules, ensure Email/Password auth is enabled in Firebase Console
