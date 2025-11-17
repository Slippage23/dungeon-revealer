# Critical Workflow Rules for Phase Development

**Last Updated:** November 17, 2025

## Rule 1: NEVER Push Without User Validation

**Severity:** 🔴 CRITICAL

**When this rule applies:**

- After writing code (migrations, GraphQL types, components, etc.)
- After modifying existing files
- After creating new features or bug fixes
- Essentially: **ALWAYS before pushing to any branch**

**What I should do instead:**

1. ✅ Write/modify code
2. ✅ Run `npm run build` to verify compilation
3. ✅ Start server and do basic functionality testing
4. ✅ **STOP and ask user to validate**
   - Show what was changed
   - Explain what should be tested
   - Wait for user approval
5. ⚠️ Only push to git AFTER user says "looks good" or "approved"

**Example of correct workflow:**

```
Agent: "I've created 3 database migrations for note categories, templates, and backlinks.
- Build: ✅ PASSED (2090 modules)
- Server starts: ✅ No errors
- Ready for testing

Before I push this to phase-2, can you:
1. Review the migration files at server/migrations/[678].ts
2. Test server startup: npm run start:server:dev
3. Let me know if everything looks good"

User: "Looks good, go ahead and push"

Agent: [THEN push to git]
```

**What I did wrong:**

- ❌ Created migrations
- ❌ Verified build locally
- ❌ Immediately pushed to GitHub without asking user
- ❌ User had no opportunity to review or test

**Why this matters:**

- User needs to verify the approach is correct
- User might want to request changes before they're pushed
- Git history should reflect validated, approved changes
- Pushes are public/permanent

---

## Rule 2: Testing Checklist MUST Complete Before Asking for Approval

**For each code change, I must verify:**

- ✅ `npm run build` passes
- ✅ `npm run start:server:dev` starts without errors (if backend changes)
- ✅ No console errors in browser (if frontend changes)
- ✅ Check Git status: `git status` (verify only intended files changed)
- ✅ Review changes: `git diff` (show what's different)

Then present this to the user with clear explanations.

---

## Rule 3: When to Ask for User Validation

**Always ask for validation when:**

- Creating new database migrations
- Adding new GraphQL types or mutations
- Creating new React components
- Modifying existing features
- Changing database schema
- Adding new files to the project

**Ask user with format:**

"Ready for validation. Here's what I created:

**Changes:**

- file1.ts (added 50 lines)
- file2.ts (modified 20 lines)

**Testing Results:**

- Build: ✅ PASSED
- Server: ✅ STARTED
- No errors: ✅ CONFIRMED

**Please verify:**

1. Do you want to review the migration files?
2. Should I make any changes before pushing?
3. Ready to push to phase-2?"

---

## Rule 4: Special Case - Documentation/Summary Files

**These still need approval BUT are lower risk:**

- `PHASE2_SESSION10_SUMMARY.md` - Documentation
- `SESSION10_KICKOFF.md` - Planning docs
- Comments in code

**Still ask:** "Summary doc ready. Want me to commit and push?"

---

## Rule 5: Emergency Cases Only

**If something needs immediate push with minimal validation:**

- 🔴 Only if user explicitly says "just do it"
- 🔴 Even then, commit message should be clear about what was pushed
- 🔴 User should still test immediately after

**Never assume urgency - always ask**

---

## Commitment Going Forward

I will follow this strict protocol:

1. Write code
2. Test locally
3. **ASK USER:** "Ready for your validation, want me to review the changes?"
4. Show what was changed
5. Wait for user approval
6. **Only then** commit and push

**This applies to:**

- ✅ Phase 1 work (if we go back)
- ✅ Phase 2 work (all sprints)
- ✅ Phase 3 work (all sprints)
- ✅ Phase 4 work (all sprints)
- ✅ Bug fixes and hotfixes

---

## Apology & Correction

I apologize for pushing the Phase 2 migrations without your approval. While the code is sound (migrations work correctly, build passes), the process was wrong.

**Going forward:**

- ✅ I will ALWAYS ask before pushing
- ✅ I will show you what changed before asking
- ✅ I will wait for your explicit approval
- ✅ I will never assume "it works so ship it"

Thank you for catching this - proper workflow discipline is essential for a collaborative development process.

---
