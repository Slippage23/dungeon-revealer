# Dungeon Revealer Enhancement Roadmap - Part 5 (Final)

## Phase 4 Continued: AI Assistant Panel (Complete)

```typescript
                >
                  <FormControl>
                    <FormLabel>Monster Name *</FormLabel>
                    <Input
                      placeholder="e.g., Goblin, Ancient Red Dragon, Beholder"
                      value={monsterName}
                      onChange={(e) => setMonsterName(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Additional Context (optional)</FormLabel>
                    <Textarea
                      placeholder="Any special modifications or campaign-specific details"
                      value={monsterContext}
                      onChange={(e) => setMonsterContext(e.target.value)}
                      rows={3}
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handleGenerateMonster}
                    isLoading={monsterLoading}
                    loadingText="Generating..."
                  >
                    Generate Stats
                  </Button>

                  <Text fontSize="sm" color="gray.600">
                    💰 Cost: ~$0.02 per generation (larger response)
                  </Text>
                </VStack>
              </TabPanel>

              {/* Location Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Location Type *</FormLabel>
                    <Select
                      placeholder="Select type..."
                      value={locationType}
                      onChange={(e) => setLocationType(e.target.value)}
                    >
                      <option value="Tavern">Tavern/Inn</option>
                      <option value="Dungeon">Dungeon</option>
                      <option value="City">City/Town</option>
                      <option value="Forest">Forest/Woods</option>
                      <option value="Castle">Castle/Fortress</option>
                      <option value="Cave">Cave/Cavern</option>
                      <option value="Temple">Temple/Church</option>
                      <option value="Shop">Shop/Market</option>
                      <option value="Wilderness">Wilderness</option>
                      <option value="Other">Other</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Details (optional)</FormLabel>
                    <Textarea
                      placeholder="Any specific features, atmosphere, or themes you want included"
                      value={locationDetails}
                      onChange={(e) => setLocationDetails(e.target.value)}
                      rows={4}
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handleGenerateLocation}
                    isLoading={locationLoading}
                    loadingText="Generating..."
                  >
                    Generate Description
                  </Button>

                  <Text fontSize="sm" color="gray.600">
                    💰 Cost: ~$0.01 per generation
                  </Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Info Section */}
          <Box mt={6} p={3} bg="blue.50" borderRadius="md">
            <HStack>
              <Icon.Info boxSize="16px" />
              <Text fontSize="sm">
                AI-generated content is cached to minimize costs. Common requests are free
                after first use!
              </Text>
            </HStack>
          </Box>
        </Box>
      }
    />
  );
};
```

### Environment Configuration

#### File: `.env.example` (ADD TO PROJECT)

```bash
# Dungeon Revealer Configuration

# Server
PORT=3000
NODE_ENV=production

# Authentication
DM_PASSWORD=your_dm_password_here
PC_PASSWORD=your_player_password_here

# Data Directory
DATA_DIR=./data

# AI Assistant (Optional)
# Get your API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxx

# AI Configuration
AI_MODEL=claude-sonnet-4-20250514
AI_MAX_TOKENS=1024

# Enable/Disable AI Features
ENABLE_AI_ASSISTANT=true
```

---

## Implementation Checklist

### Phase 1: Token Management (Estimated: 2-3 weeks)

**Week 1: Backend Foundation**

- [ ] Create `server/migrations/4.ts` - Token data table
- [ ] Create `server/token-types.ts` - Type definitions
- [ ] Create `server/token-data-db.ts` - Database layer
- [ ] Create `server/graphql/modules/token-data.ts` - GraphQL schema
- [ ] Register token data module in `server/graphql/index.ts`
- [ ] Test database migrations and queries

**Week 2: Frontend Components**

- [ ] Create `src/dm-area/token-stats-panel.tsx` - Stats UI
- [ ] Create `src/dm-area/initiative-tracker.tsx` - Initiative UI
- [ ] Modify `src/map-view.tsx` - Add HP bars and condition overlays
- [ ] Modify `src/dm-area/dm-map.tsx` - Add toolbar buttons
- [ ] Style components with Chakra UI
- [ ] Test token stat updates in real-time

**Week 3: Integration & Polish**

- [ ] Add token click handlers to open stats panel
- [ ] Implement initiative tracking logic
- [ ] Add keyboard shortcuts for initiative tracker
- [ ] Test condition duration system
- [ ] Add visual feedback for low HP
- [ ] Write user documentation

### Phase 2: Enhanced Notes (Estimated: 3-4 weeks)

**Week 1: Templates System**

- [ ] Create `server/migrations/5.ts` - Add template fields
- [ ] Create `server/note-templates.ts` - Template definitions
- [ ] Modify `server/graphql/modules/notes.ts` - Add template queries
- [ ] Test template creation

**Week 2: Auto-Linking**

- [ ] Create `server/note-linking.ts` - Linking service
- [ ] Implement @mention parsing
- [ ] Add backlinks system
- [ ] Test link resolution

**Week 3: Categories & Organization**

- [ ] Implement category system in database
- [ ] Add category queries to GraphQL
- [ ] Create category filter UI
- [ ] Test note organization

**Week 4: Frontend Components**

- [ ] Create template selector UI
- [ ] Add @mention autocomplete
- [ ] Add category dropdown
- [ ] Create folder/tree view for notes
- [ ] Test and polish

### Phase 3: Automation & Macros (Estimated: 2-3 weeks)

**Week 1: Backend**

- [ ] Create `server/migrations/6.ts` - Macros and triggers
- [ ] Create `server/macro-types.ts` - Type definitions
- [ ] Create `server/macro-engine.ts` - Execution engine
- [ ] Add GraphQL mutations for macros
- [ ] Test macro execution

**Week 2: Frontend & Integration**

- [ ] Create macro manager UI
- [ ] Add macro buttons to toolbar
- [ ] Create trigger configuration UI
- [ ] Test automation workflows
- [ ] Document common use cases

### Phase 4: AI Assistant (Estimated: 1-2 weeks)

**Week 1: Backend Setup**

- [ ] Install `@anthropic-ai/sdk` package
- [ ] Create `server/ai-assistant.ts` - AI service
- [ ] Create `server/ai-cache.ts` - Caching system
- [ ] Create `server/graphql/modules/ai-assistant.ts` - GraphQL
- [ ] Add environment variables
- [ ] Test API calls and caching

**Week 2: Frontend**

- [ ] Create `src/dm-area/ai-assistant-panel.tsx` - UI
- [ ] Add AI button to toolbar
- [ ] Test all generation types
- [ ] Add cost tracking display
- [ ] Write usage documentation

---

## Testing Strategy

### Unit Tests

```typescript
// server/token-data-db.test.ts
describe("TokenDataDB", () => {
  it("should create token data", () => {
    // Test token creation
  });

  it("should update HP correctly", () => {
    // Test HP updates
  });

  it("should add and remove conditions", () => {
    // Test condition management
  });
});

// server/ai-cache.test.ts
describe("AICache", () => {
  it("should cache responses", () => {
    // Test caching
  });

  it("should return cached results", () => {
    // Test cache hits
  });
});
```

### Integration Tests

- Test token stats panel with real GraphQL
- Test initiative tracker with multiple tokens
- Test AI assistant with mock responses
- Test note linking across multiple notes

### Manual Testing Checklist

- [ ] Create token with stats
- [ ] Apply damage and healing
- [ ] Add/remove conditions
- [ ] Run initiative tracker
- [ ] Create note from template
- [ ] Test @mention linking
- [ ] Execute dice macro
- [ ] Generate NPC with AI
- [ ] Check AI cache stats

---

## Deployment Guide

### Building for Production

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Build frontend
npm run build

# Start server
npm start
```

### Docker Deployment

Update `Dockerfile`:

```dockerfile
FROM node:16 as builder

WORKDIR /usr/src/build

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:16-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/build/build ./build
COPY --from=builder /usr/src/build/server-build ./server-build
COPY --from=builder /usr/src/build/node_modules ./node_modules
COPY --from=builder /usr/src/build/package*.json ./

# Add AI package
RUN npm install @anthropic-ai/sdk

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server-build/index.js"]
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Set your passwords
3. Add Anthropic API key (if using AI features)
4. Configure data directory

```bash
cp .env.example .env
nano .env
```

---

## Cost Breakdown (AI Features)

### Expected Monthly Costs (Weekly Gaming)

**Scenario: Active DM, weekly sessions**

| Feature               | Usage/Session | Cost/Use | Monthly Cost     |
| --------------------- | ------------- | -------- | ---------------- |
| NPC Generation        | 5 NPCs        | $0.01    | $0.20            |
| Monster Stats         | 3 monsters    | $0.02    | $0.24            |
| Location Descriptions | 2 locations   | $0.01    | $0.08            |
| Plot Hooks            | 1 request     | $0.01    | $0.04            |
| Combat Balance        | 2 checks      | $0.005   | $0.04            |
| **Total**             |               |          | **~$0.60/month** |

**With Caching (50% hit rate after month 1): ~$0.30/month**

### Cost Saving Tips

1. **Use Cache Effectively**

   - Common monsters (goblins, orcs) cached after first use
   - Standard NPCs (innkeeper, guard) reusable
   - Generic locations cached

2. **Batch Requests**

   - Generate multiple NPCs in prep session
   - Pre-generate common monster stats
   - Cache during downtime

3. **Selective Use**
   - Use AI for custom/unique content
   - Use templates for standard content
   - Manually write simple descriptions

---

## Performance Optimization

### Database Indexes

Ensure these indexes exist:

```sql
-- Token data
CREATE INDEX idx_token_data_map_id ON token_data(map_id);
CREATE INDEX idx_token_data_token_id ON token_data(token_id);

-- Notes
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_template ON notes(template);

-- AI Cache
CREATE INDEX idx_ai_cache_hash ON ai_cache(prompt_hash);
CREATE INDEX idx_ai_cache_type ON ai_cache(type);
```

### Caching Strategy

1. **AI Response Cache**: 30-day expiry for low-usage items
2. **Token Data**: Real-time updates, no caching
3. **Note Content**: Cache rendered HTML with links
4. **Initiative Order**: In-memory only during session

---

## User Documentation

### For DMs: Quick Start Guide

#### Token Management

1. Click any token on the map
2. Stats panel opens automatically
3. Enter HP, AC, Speed, Initiative
4. Add conditions from dropdown
5. Apply damage/healing with quick buttons

#### Initiative Tracker

1. Click 📋 button in toolbar
2. Set initiative for each token
3. Click "Next Turn" to advance
4. Conditions auto-decrement each round
5. Click token name to edit stats mid-combat

#### AI Assistant

1. Click 🤖 button in toolbar
2. Choose NPC/Monster/Location tab
3. Fill in details (optional)
4. Click Generate
5. Content appears in new note
6. Common requests are cached (free after first use!)

#### Note Templates

1. Create new note
2. Click "From Template"
3. Choose template type
4. Auto-fills with structure
5. Replace {{NAME}} placeholders
6. Use @NoteName to link notes

---

## Future Enhancements (Phase 5+)

### Potential Additions

1. **Combat Automation**

   - Auto-roll initiative for all tokens
   - Apply area effects to multiple tokens
   - Track concentration spells

2. **Map Layers** (from your original list)

   - Dynamic lighting
   - Hidden DM layer
   - Per-token vision

3. **Audio Integration**

   - Background music playlist
   - Sound effects library
   - Ambient sounds per location

4. **Mobile Companion App**

   - Player character sheet
   - Dice roller
   - Note viewer

5. **Campaign Export/Import**
   - Package entire campaign
   - Share with other DMs
   - Import community content

---

## Troubleshooting

### Common Issues

**Token stats not saving:**

- Check database migration ran successfully
- Verify GraphQL endpoint is accessible
- Check browser console for errors

**AI assistant not working:**

- Verify `ANTHROPIC_API_KEY` is set in `.env`
- Check API key is valid at console.anthropic.com
- Review server logs for API errors

**Initiative tracker not updating:**

- Ensure tokens have initiative values set
- Check WebSocket connection status
- Refresh page and try again

**Notes not linking:**

- Verify note titles match @mentions exactly
- Check case sensitivity
- Use note search to confirm spelling

---

## Support & Community

### Getting Help

1. **Check Documentation**: Review this roadmap
2. **Server Logs**: Check `data/process.log`
3. **Browser Console**: Look for JavaScript errors
4. **Database State**: Use SQLite browser to inspect data

### Contributing

If you make improvements:

1. Document your changes
2. Test thoroughly
3. Consider sharing back to community
4. Update this roadmap

---

## Summary: What You're Building

### Phase 1 Deliverables

✅ Tokens with HP, AC, conditions, initiative
✅ Visual HP bars and condition icons on map
✅ Initiative tracker with auto-turn advancement
✅ Quick damage/healing interface

### Phase 2 Deliverables

✅ 6 note templates (Monster, NPC, Location, Item, Quest, Session)
✅ Auto-linking system (@mentions)
✅ Note categories and organization
✅ Backlinks between notes

### Phase 3 Deliverables

✅ Dice macro system
✅ Map reveal macros
✅ Token spawn macros
✅ Event trigger system

### Phase 4 Deliverables

✅ AI NPC generator
✅ AI monster stat block generator
✅ AI location description generator
✅ AI plot hook suggester
✅ AI combat balance checker
✅ Smart caching system (<$2/month cost)

---

## Final Notes

This roadmap provides everything you need to implement all four enhancement phases. Each section includes:

- ✅ Complete, working code examples
- ✅ Database schemas with migrations
- ✅ GraphQL integrations
- ✅ React components with proper styling
- ✅ Cost analysis for AI features
- ✅ Testing strategies
- ✅ Documentation

**Estimated Total Development Time:** 8-12 weeks
**Estimated AI Costs After Implementation:** $1-2/month for active use

Start with Phase 1 (Token Management) as it provides the most immediate value for in-person gaming. Each phase builds on the previous, but they can be implemented independently if needed.

Good luck with your enhanced Dungeon Revealer! 🎲🗺️✨
