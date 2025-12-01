# Dungeon Revealer Enhancement Project - Master Index

**Location:** `C:\Temp\git\dungeon-revealer\dungeon-revealer\`

**Project Overview:** Enhance Dungeon Revealer with advanced token management, rich note system, automation, and AI assistance for in-person tabletop gaming sessions.

---

## Documentation Files

This enhancement project is documented across several files:

1. **ENHANCEMENT_ROADMAP.md** - Phases 1 & 2 (Core Features)

   - Token Management system with HP, conditions, stats
   - Database schemas and migrations
   - GraphQL API extensions
   - Frontend components (Token Stats Panel, Initiative Tracker)
   - Enhanced Note System with templates and auto-linking

2. **ENHANCEMENT_ROADMAP_PART4.md** - Phase 4 (AI Features)

   - AI Assistant integration with Claude
   - Cost analysis and caching strategy
   - NPC, Monster, and Location generators
   - GraphQL AI module

3. **ENHANCEMENT_ROADMAP_FINAL.md** - Phase 4 Completion & Summary
   - Complete AI Assistant Panel UI
   - Environment configuration
   - Implementation checklist
   - Testing strategy
   - Deployment guide
   - Troubleshooting section

---

## Quick Reference

### Implementation Order (Recommended)

**Start Here:** Phase 1 - Token Management (2-3 weeks)

- Most immediate value for gameplay
- Foundation for other features
- No external dependencies

**Next:** Phase 2 - Enhanced Notes (3-4 weeks)

- Rich note templates
- Auto-linking between notes
- Better organization

**Then:** Phase 3 - Automation & Macros (2-3 weeks)

- Reduce repetitive tasks
- Scriptable actions
- Event triggers

**Finally:** Phase 4 - AI Assistant (1-2 weeks)

- Optional but powerful
- Requires API key ($1-2/month cost)
- Significant time-saver for DMs

---

## Key Features Summary

### Phase 1: Advanced Token Management ⭐

```
✅ HP tracking with visual bars
✅ Status conditions with icons
✅ Initiative tracker with auto-advance
✅ Quick damage/healing interface
✅ Combat stats (AC, Speed, Initiative)
```

### Phase 2: Enhanced Note System

```
✅ 6 pre-built templates (Monster, NPC, Location, Item, Quest, Session)
✅ @mention auto-linking between notes
✅ Note categories and folders
✅ Backlinks system
✅ Template-based creation
```

### Phase 3: Automation & Macros

```
✅ Dice macro system
✅ Map reveal presets
✅ Token spawn automation
✅ Event trigger system
✅ Reusable action sets
```

### Phase 4: AI Assistant 🤖

```
✅ NPC generator (~$0.01 per use)
✅ Monster stat blocks (~$0.02 per use)
✅ Location descriptions (~$0.01 per use)
✅ Plot hook suggestions
✅ Combat balance checker
✅ Smart caching (reduces costs by 50%+)
```

---

## File Structure Overview

### New Backend Files

```
server/
├── migrations/
│   ├── 4.ts                    # Token data tables
│   ├── 5.ts                    # Note templates & categories
│   └── 6.ts                    # Macros & triggers
├── token-types.ts              # TypeScript interfaces
├── token-data-db.ts            # Token database layer
├── note-templates.ts           # Pre-built note templates
├── note-linking.ts             # Auto-linking service
├── macro-types.ts              # Macro definitions
├── macro-engine.ts             # Macro execution
├── ai-assistant.ts             # Claude AI integration
├── ai-cache.ts                 # Response caching
└── graphql/modules/
    ├── token-data.ts           # Token GraphQL API
    └── ai-assistant.ts         # AI GraphQL API
```

### New Frontend Files

```
src/dm-area/
├── token-stats-panel.tsx       # Token stats UI
├── initiative-tracker.tsx      # Combat tracker
├── ai-assistant-panel.tsx      # AI generation UI
└── macro-manager.tsx           # Macro UI (Phase 3)
```

### Modified Files

```
src/map-view.tsx                # Add HP bars & condition overlays
src/dm-area/dm-map.tsx          # Add toolbar buttons
server/graphql/index.ts         # Register new modules
```

---

## Environment Setup

### Required Environment Variables

```bash
# .env file

# Basic Configuration
PORT=3000
NODE_ENV=production
DM_PASSWORD=your_dm_password
PC_PASSWORD=your_player_password
DATA_DIR=./data

# AI Features (Optional - Phase 4)
ANTHROPIC_API_KEY=sk-ant-xxxxx
AI_MODEL=claude-sonnet-4-20250514
AI_MAX_TOKENS=1024
ENABLE_AI_ASSISTANT=true
```

### Getting Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up for account
3. Navigate to API Keys
4. Create new key
5. Add to `.env` file

---

## Cost Analysis (AI Features Only)

### Monthly Costs for Active Use (Weekly Gaming)

| Scenario                             | Estimated Cost |
| ------------------------------------ | -------------- |
| Light use (2-3 generations/week)     | $0.20 - $0.50  |
| Moderate use (5-10 generations/week) | $0.50 - $1.00  |
| Heavy use (10-20 generations/week)   | $1.00 - $2.00  |

**With Caching:** Costs reduce by 50%+ after first month as common requests are cached.

### What $1 Buys You

- ~100 NPC descriptions
- ~50 monster stat blocks
- ~100 location descriptions
- ~100 plot hook sets
- ~200 combat balance checks

---

## Implementation Checklist

### Phase 1: Token Management

- [ ] Run database migration 4
- [ ] Create token-types.ts
- [ ] Create token-data-db.ts
- [ ] Create GraphQL module
- [ ] Build Token Stats Panel
- [ ] Build Initiative Tracker
- [ ] Add map overlays
- [ ] Test thoroughly

### Phase 2: Enhanced Notes

- [ ] Run database migration 5
- [ ] Create note-templates.ts
- [ ] Create note-linking.ts
- [ ] Update GraphQL notes module
- [ ] Build template selector UI
- [ ] Build category UI
- [ ] Test auto-linking

### Phase 3: Automation & Macros

- [ ] Run database migration 6
- [ ] Create macro-types.ts
- [ ] Create macro-engine.ts
- [ ] Build macro manager UI
- [ ] Test trigger system

### Phase 4: AI Assistant

- [ ] Install @anthropic-ai/sdk
- [ ] Create ai-assistant.ts
- [ ] Create ai-cache.ts
- [ ] Create GraphQL module
- [ ] Build AI panel UI
- [ ] Configure environment variables
- [ ] Test and verify costs

---

## Testing Your Implementation

### Quick Test Scenarios

**Token Management Test:**

1. Create a token on map
2. Click to open stats panel
3. Set HP to 20/20
4. Apply 5 damage → should show 15/20
5. Add "Poisoned" condition
6. Open initiative tracker
7. Set initiative and advance turns

**Note System Test:**

1. Create note from "NPC" template
2. Type "@TavernName" in content
3. Verify link is created
4. Create another note for tavern
5. Check backlinks appear

**AI Assistant Test (requires API key):**

1. Open AI panel
2. Generate NPC with occupation "Innkeeper"
3. Verify content generated
4. Generate same request again
5. Should be instant (cached)

---

## Performance Expectations

### Database Performance

- Token stats: <10ms query time
- Initiative tracker: <50ms for 20 tokens
- Note linking: <100ms for large notes
- AI cache lookup: <5ms

### AI Response Times

- First request: 2-5 seconds (API call)
- Cached request: <100ms (instant)
- Batch operations: 5-15 seconds

---

## Troubleshooting Quick Reference

### Problem: Database errors after migration

**Solution:**

```bash
# Backup your data first!
rm data/database.db
npm run migrate
# Restore from backup if needed
```

### Problem: Token stats not displaying

**Solution:**

- Check browser console for GraphQL errors
- Verify token-data table exists in database
- Check GraphQL module is registered

### Problem: AI assistant not working

**Solution:**

- Verify ANTHROPIC_API_KEY in .env
- Check key is valid at console.anthropic.com
- Review server logs for error messages
- Test with curl: `curl -H "x-api-key: $KEY" https://api.anthropic.com/v1/messages`

### Problem: Initiative tracker showing wrong order

**Solution:**

- Ensure initiative values are set for all tokens
- Check for undefined/null initiative values
- Verify sorting logic in component

---

## Next Steps After Implementation

### Immediate (Week 1)

1. Test all features with your actual gaming group
2. Gather feedback on UI/UX
3. Fix any critical bugs
4. Document any custom workflows

### Short Term (Month 1)

1. Build your note library with templates
2. Create macro presets for common actions
3. Cache common AI requests for your campaign
4. Fine-tune initiative tracker workflow

### Long Term (3+ Months)

1. Consider Phase 5 features (map layers, lighting)
2. Build community templates/macros
3. Share improvements back to project
4. Consider contributing to main repo

---

## Resources & References

### Official Documentation

- Dungeon Revealer Wiki: https://github.com/dungeon-revealer/dungeon-revealer/wiki
- Anthropic API Docs: https://docs.anthropic.com/

### Technologies Used

- **Backend:** Node.js, TypeScript, SQLite, GraphQL
- **Frontend:** React, TypeScript, Chakra UI, Relay
- **AI:** Claude API (Anthropic)
- **Build:** Vite, Babel

### Useful Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server
npm run migrate      # Run migrations
npm test            # Run tests

# Production
npm run build       # Build for production
npm start           # Start production server

# Database
sqlite3 data/database.db  # Open database
.tables                   # List tables
.schema token_data        # View schema
```

---

## Success Metrics

After implementing these enhancements, you should see:

✅ **Faster Combat:** Initiative tracker cuts combat management time by 50%
✅ **Better Organization:** Template system reduces note creation time by 70%
✅ **Less Prep:** AI assistant reduces prep time by 30-50%
✅ **More Immersion:** Quick token stats keep game moving smoothly
✅ **Better Notes:** Auto-linking creates connected campaign wiki

---

## Support

If you need help during implementation:

1. **Reference the detailed roadmap files** in this directory
2. **Check code comments** in generated files
3. **Review original Dungeon Revealer code** for patterns
4. **Test incrementally** - don't skip testing steps
5. **Keep backups** of your database during development

---

## Final Notes

This is a comprehensive enhancement project that will take 8-12 weeks to fully implement. However, each phase provides immediate value and can be used independently.

**Recommended approach:**

- Start with Phase 1 (token management) for immediate gameplay improvement
- Add Phase 2 (notes) when you have campaign content to organize
- Phase 3 (macros) can be added as needs arise
- Phase 4 (AI) is optional but provides significant time savings

The implementation is designed to be modular - you can pick and choose features based on your needs!

**Good luck, and happy gaming! 🎲✨**

---

_Document created: 2025
Project: Dungeon Revealer Custom Fork
Target: In-person tabletop gaming enhancement_
