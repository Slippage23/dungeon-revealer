# Initiative Tracker - Quick Start Guide

**Status**: ✅ Production Ready  
**Last Updated**: November 24, 2025

---

## ⚡ Quick Reference

### For Dungeon Masters

```
1. Open map in DM area
2. Click "Initiative" button 🎲
3. Set initiative for each token:
   - Enter number (e.g., 15)
   - Click "Set" button
4. Click "Start Combat" (Green button)
5. Click "Next Turn" to advance
6. Watch round increment
7. Click "End Combat" when done
```

### For Players

```
1. Open player area
2. Click "Initiative" button 🎲
3. Watch real-time combat status
4. See who's currently active (highlighted)
5. See current round number
```

---

## 🎮 Features at a Glance

| Feature               | DM  | Player | Notes                   |
| --------------------- | --- | ------ | ----------------------- |
| View Initiative List  | ✅  | ✅     | Both see turn order     |
| Set Initiative Values | ✅  | ❌     | DM only                 |
| Start Combat          | ✅  | ❌     | Activates first token   |
| Advance Turn          | ✅  | ❌     | Moves to next combatant |
| End Combat            | ✅  | ❌     | Clears state            |
| Remove Token          | ✅  | ❌     | Mid-combat removal      |
| Real-time Updates     | ✅  | ✅     | Instant sync            |
| Round Display         | ✅  | ✅     | Current round shown     |
| Active Indicator      | ✅  | ✅     | Highlighted token       |

---

## 🧪 Test It Now

### Scenario: 3-Token Combat

**Setup** (DM):

1. Create map with 3 tokens: "Goblin", "Orc", "Bugbear"
2. Set initiatives: Goblin=12, Orc=18, Bugbear=15
3. Click "Start Combat"

**Expected**:

- Orc highlighted (highest initiative)
- Player sees "Initiative" viewer
- Round shows "1"

**Advance** (DM):

1. Click "Next Turn"
2. Bugbear now highlighted

**Expected**:

- Bugbear highlighted
- Player sees update instantly

**Continue**:

1. Click "Next Turn" again
2. Goblin highlighted

**Loop**:

1. Click "Next Turn" again
2. Orc highlighted again
3. **Round increments to 2**

---

## 🔌 Technical Details

### Component Files

- `src/dm-area/initiative-tracker.tsx` - DM interface (522 lines)
- `src/dm-area/initiative-tracker-view.tsx` - Player view (400 lines)

### GraphQL Mutations

- `setInitiative(input)` - Set token initiative
- `startCombat(mapId)` - Start combat
- `advanceInitiative(mapId)` - Next turn
- `endCombat(mapId)` - End combat
- `removeFromInitiative(mapId, tokenId)` - Remove token

### Real-time Sync

- Uses `@live` directive on queries
- WebSocket via Socket.IO
- Relay fragment invalidation
- Broadcast to all connected clients

---

## ❓ FAQ

**Q: How do I open the Initiative Tracker?**  
A: Click the "Initiative" button (🎲 icon) in the toolbar

**Q: Can players modify combat?**  
A: No, players have read-only access. Only DMs can manage combat.

**Q: Do changes sync in real-time?**  
A: Yes! All changes broadcast instantly via WebSocket

**Q: What happens if I disconnect?**  
A: Combat state is saved in database. Reconnect to resume.

**Q: Can I remove a token mid-combat?**  
A: Yes, click the remove (X) button next to the token

**Q: How do rounds advance?**  
A: Automatically when you loop back to the first token

**Q: Can I edit initiative after combat starts?**  
A: Yes, you can still set/change initiative values anytime

**Q: What's the maximum number of combatants?**  
A: No limit (database-bound only)

---

## 🐛 Troubleshooting

### Initiative Tracker not appearing?

- Ensure map is loaded
- Check toolbar for 🎲 "Initiative" button
- Refresh browser if needed

### Turn not advancing?

- Ensure at least 2 tokens in initiative
- Check backend server running on port 3000
- Look for errors in browser console

### Player not seeing updates?

- Verify WebSocket connected (Network tab)
- Check @live directive active
- Ensure @live queries in browser DevTools

### Combat state not saving?

- Verify database exists: `data/db.sqlite`
- Check write permissions on data directory
- Restart backend server

---

## 📖 Learn More

For detailed information, see:

1. **INITIATIVE_TRACKER_INTEGRATION_GUIDE.md**

   - Complete implementation guide
   - 6 test scenarios with detailed steps
   - Data flow diagrams
   - Troubleshooting guide

2. **INITIATIVE_TRACKER_STATUS.md**

   - Implementation status
   - Backend/frontend breakdown
   - Integration checklist

3. **Code Files**
   - `src/dm-area/initiative-tracker.tsx` - Full documentation in code
   - `src/dm-area/initiative-tracker-view.tsx` - Player view

---

## 🚀 Next Steps

### Try Now

1. Start dev servers: `npm run start:server:dev` & `npm run start:frontend:dev`
2. Open browser: DM (`/dm`) and Player (default)
3. Create map with tokens
4. Click Initiative button
5. Test combat flow

### Provide Feedback

Have suggestions? Found a bug? Let us know in GitHub issues!

---

## ✅ Status

| Component       | Status              |
| --------------- | ------------------- |
| Backend         | ✅ Production Ready |
| Frontend DM     | ✅ Production Ready |
| Frontend Player | ✅ Production Ready |
| Database        | ✅ Production Ready |
| Real-time Sync  | ✅ Working          |
| Build           | ✅ Clean            |
| Tests           | ✅ All Pass         |

**Overall**: 🎉 **READY FOR USE**
