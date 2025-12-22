# Admin Panel Documentation

## Overview

The Admin Panel provides DMs with a centralized dashboard for managing all aspects of their Dungeon Revealer instance. Access it at `/admin` after authenticating with DM credentials.

## Features

### Dashboard Tab

- **Quick Stats**: Active maps, total tokens, notes count, active players
- **System Status**: Server uptime, database health, WebSocket connections
- **Quick Actions**: Create new map, add token, create note

### Maps Tab

- View all uploaded maps with thumbnails
- **Sorting**: A↔Z toggle button for alphabetical ordering (ascending/descending)
- **Pagination**: 24 maps per page with Previous/Next navigation
- Quick access to map settings
- Upload new maps (single or bulk)
- Bulk upload from configured scan directories
- Delete or archive maps

### Tokens Tab

- Browse token library with visual previews
- **Sorting**: A↔Z toggle button for alphabetical ordering (ascending/descending)
- **Pagination**: 24 tokens per page with Previous/Next navigation
- Upload new token images (single or bulk)
- Bulk upload from configured scan directories
- Organize tokens by category
- Delete unused tokens

### Notes Tab

- View all DM notes in a table format
- **Sortable Columns**: Click Title or Created headers to sort (▲/▼ indicators)
- **Pagination**: 25 notes per page with Previous/Next navigation
- **Edit Button**: Inline editing via modal dialog
- Search and filter notes
- Create new notes
- Import from Markdown files or Excel spreadsheets (monster stat blocks)

## Visual Design

### Color Scheme

The admin panel uses a professional D&D-inspired aesthetic:

- **Primary**: Burgundy (#8B3A3A) - Headers, primary buttons
- **Accent**: Gold (#B8860B) - Highlights, borders, icons
- **Background**: Dark parchment (#1a1a2e to #16213e gradient)
- **Text**: Warm white (#F5F5DC) on dark backgrounds

### Typography

- **Headings**: Georgia serif font for fantasy atmosphere
- **Body**: System fonts for readability

### Layout

- **Header**: Full-width burgundy bar with gold accents, app icon, tagline
- **Sidebar**: 4 themed navigation sections with gold dividers
- **Content**: Card-based layout with gradient backgrounds

## Navigation Sections

1. **Overview** - Dashboard home
2. **Content Management** - Maps, Tokens, Notes, Media Library
3. **Game Tools** - Initiative Tracker, Dice Roller, Combat Log
4. **System** - Settings, Users, Backups

## Access Control

- Requires DM authentication (`DM_PASSWORD` environment variable)
- Players cannot access the admin panel
- All admin actions are logged

## Keyboard Shortcuts

| Shortcut | Action      |
| -------- | ----------- |
| `Ctrl+N` | New note    |
| `Ctrl+M` | New map     |
| `Ctrl+T` | New token   |
| `Esc`    | Close modal |

## API Integration

The admin panel uses GraphQL with Relay for real-time updates:

```graphql
query AdminDashboardQuery {
  maps(first: 50) {
    edges {
      node {
        id
        title
        grid { ... }
      }
    }
  }
  tokenImages(first: 50) {
    edges {
      node {
        id
        title
        url
      }
    }
  }
}
```

## Troubleshooting

### Admin panel not loading

1. Ensure you're authenticated as DM
2. Check browser console for errors
3. Verify WebSocket connection is active

### Stats not updating

1. Refresh the page
2. Check network tab for failed GraphQL requests
3. Verify server is running

### Styling issues

1. Clear browser cache
2. Check for CSS conflicts with browser extensions
