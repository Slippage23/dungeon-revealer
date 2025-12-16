# Changelog

All notable changes to Dungeon Revealer are documented here.

## [1.17.1] - December 2025

### Added

- **Admin Panel** (`/admin`) - Centralized DM dashboard

  - Dashboard with stats cards (maps, tokens, notes, players)
  - Tabbed interface for Maps, Tokens, Notes management
  - Professional D&D-inspired visual design (burgundy/gold theme)
  - Real-time updates via GraphQL subscriptions

- **Visual Redesign**
  - Burgundy (#8B3A3A) and gold (#B8860B) color scheme
  - Georgia serif typography for fantasy atmosphere
  - Gradient backgrounds and card-based layouts
  - Themed navigation with 4 sections

### Fixed

- Socket.IO authentication for admin routes
- GraphQL query parameter validation (first: 50 max)
- React hook ordering violations
- Relay decode errors on missing fields

### Technical

- Multi-stage Docker build optimization
- Consolidated documentation structure
- Improved error handling in GraphQL resolvers

---

## [1.17.0] - November 2025

### Added

- Initiative Tracker improvements
- Token HP and condition tracking
- Note templates with append functionality
- Enhanced map grid configuration

### Fixed

- Real-time condition toggle synchronization
- Map reset functionality
- Token position persistence

---

## [1.16.0] - October 2025

### Added

- Enhanced token management
- Improved fog of war tools
- Better mobile responsiveness

### Fixed

- Various UI/UX improvements
- Performance optimizations

---

## Previous Versions

See [GitHub Releases](https://github.com/dungeon-revealer/dungeon-revealer/releases) for complete version history.

---

## Upgrade Notes

### Upgrading to 1.17.1

1. **Docker users**: Pull the new image

   ```bash
   docker pull slippage/dungeon-revealer:1.17.1
   ```

2. **From source**:

   ```bash
   git pull origin master
   npm install
   npm run build
   ```

3. **Data migration**: No database changes required. Existing data is preserved.

4. **New features**: Access the Admin Panel at `/admin` after upgrade.
