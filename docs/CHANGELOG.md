# Changelog

All notable changes to Dungeon Revealer are documented here.

## [1.20.4] - January 2025

### Added

- **Notes Tab Enhancements**

  - Sortable columns (click Title or Created headers to sort)
  - Pagination with 25 notes per page
  - Edit button with modal for inline note editing
  - Sort indicator arrows (▲/▼) on column headers

- **Maps Tab Enhancements**

  - A↔Z sorting toggle button for alphabetical ordering
  - Pagination with 24 maps per page (6x4 grid)
  - Page navigation with Previous/Next buttons

- **Tokens Tab Enhancements**

  - A↔Z sorting toggle button for alphabetical ordering
  - Pagination with 24 tokens per page (6x4 grid)
  - Page navigation with Previous/Next buttons

- **Import Fixes**
  - Fixed markdown import "0 imported, 0 errors" bug (FileList clearing issue)
  - Fixed Excel import hanging on "Parsing..." (busboy race condition)
  - Excel import now properly handles monster stat blocks

### Changed

- **Server Limits Increased**: GraphQL query limits raised from 50 to 500 items
  - Notes, Maps, and Token queries now support up to 500 items per request
  - Improves performance for large collections

### Fixed

- Navigation icons (🗺️ for Maps, 📝 for Notes) - were displaying as question marks
- Pagination button readability - text now displays as black on cream background
- Map title update mutation - corrected field name from `title` to `newTitle`

### Technical

- Added xlsx package for Excel parsing (v0.18+)
- Improved busboy file upload handling with proper async/await
- Updated Relay.decodeFirst from (50, 10) to (500, 50) in all GraphQL modules

---

## [1.18.0] - January 2025

### Added

- **Integrated Manager Features** - Bulk upload and management tools from dungeon-revealer-manager

  - Bulk map upload with multi-file support
  - Bulk token image upload
  - XLSX monster import (creates notes from spreadsheet stat blocks)
  - Configurable scan directories for maps and tokens
  - Settings editor on each management tab

- **Visual Redesign** - Medieval fantasy theme

  - Warm tan/cream/brown color palette (#f5ead8, #e8d4b0, #3a2f26)
  - Folkard font for headings, Georgia for body text
  - Improved readability with larger font sizes
  - Consistent button styling with proper contrast

- **Navigation Improvements**
  - Footer links between Player/DM/Admin sections
  - Simplified single Navigation section in sidebar
  - Dashboard stats show Maps and Tokens counts

### Fixed

- Edit button visibility on maps page (now uses dark text)
- Dashboard stats labels (was showing "Local Files"/"Server Maps", now shows "Maps"/"Tokens")
- Font readability issues throughout admin interface

### Technical

- New manager API endpoints (`/api/manager/*`)
- Extended settings entity for manager configuration
- Improved admin layout component architecture

---

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
