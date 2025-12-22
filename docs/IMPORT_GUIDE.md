# Import Guide

This guide covers the various import methods available in Dungeon Revealer's Admin Panel.

## Notes Import

### Markdown Import

Import notes from individual `.md` files with YAML frontmatter.

**Format:**

```markdown
---
id: unique-note-id
title: Note Title
is_entry_point: false
---

# Note Content

Your markdown content here...
```

**Frontmatter Fields:**

- `id` (required): Unique identifier for the note
- `title` (required): Display title
- `is_entry_point` (optional): Set to `true` if this is a main navigation note

**How to Import:**

1. Go to Admin Panel → Notes tab
2. Click "Import Notes"
3. Select one or more `.md` files
4. Click "Import Selected Files"

### Excel/XLSX Import (Monster Stat Blocks)

Import monsters from Excel spreadsheets. Each row becomes a separate note with formatted stats.

**Required Columns:**
| Column | Description |
|--------|-------------|
| Name | Monster name (becomes note title) |
| Size | Small, Medium, Large, etc. |
| Type | Humanoid, Beast, Undead, etc. |
| Alignment | Lawful Good, Chaotic Evil, etc. |
| AC | Armor Class (number) |
| HP | Hit Points (e.g., "45 (6d8+18)") |
| Speed | Movement speed (e.g., "30 ft., fly 60 ft.") |
| STR | Strength score |
| DEX | Dexterity score |
| CON | Constitution score |
| INT | Intelligence score |
| WIS | Wisdom score |
| CHA | Charisma score |
| CR | Challenge Rating (e.g., "1/4", "5") |

**Optional Columns:**
| Column | Description |
|--------|-------------|
| Skills | Comma-separated skills (e.g., "Stealth +6, Perception +4") |
| Senses | Sensory abilities (e.g., "Darkvision 60 ft.") |
| Languages | Known languages |
| Abilities | Special abilities text |
| Actions | Action descriptions |

**How to Import:**

1. Go to Admin Panel → Notes tab
2. Click "Import Monster Notes" (📝 icon)
3. Select your `.xlsx` file
4. Preview imported monsters in the list
5. Monsters are auto-imported as notes

**Sample Excel Layout:**

```
| Name   | Size  | Type     | AC | HP  | STR | DEX | CON | INT | WIS | CHA | CR  |
|--------|-------|----------|----|----|-----|-----|-----|-----|-----|-----|-----|
| Goblin | Small | Humanoid | 15 | 7  | 8   | 14  | 10  | 10  | 8   | 8   | 1/4 |
| Orc    | Med   | Humanoid | 13 | 15 | 16  | 12  | 16  | 7   | 11  | 10  | 1/2 |
```

## Maps Import

### Single Upload

1. Go to Admin Panel → Maps tab
2. Click "Upload Maps"
3. Select image files (PNG, JPG, WEBP)
4. Maps are uploaded and ready to use

### Bulk Upload

1. Configure scan directory in Settings
2. Go to Admin Panel → Maps tab
3. Click "Scan Maps" to detect new files
4. Select maps to import
5. Click "Import Selected"

**Supported Formats:** PNG, JPG, JPEG, WEBP, GIF

## Tokens Import

### Single Upload

1. Go to Admin Panel → Tokens tab
2. Click "Upload Tokens"
3. Select image files
4. Tokens are added to your library

### Bulk Upload

1. Configure scan directory in Settings
2. Go to Admin Panel → Tokens tab
3. Click "Scan Tokens" to detect new files
4. Select tokens to import
5. Click "Import Selected"

**Best Practices:**

- Use transparent PNG for tokens
- Keep token images square (e.g., 256x256)
- Name files descriptively (e.g., "goblin-archer.png")

## Troubleshooting

### "0 imported, 0 errors" on Markdown import

- Ensure files have `.md` extension
- Check YAML frontmatter is valid (use `---` delimiters)
- Verify `id` and `title` fields are present

### Excel import stuck on "Parsing..."

- Ensure file has `.xlsx` extension (not `.xls`)
- Check that Excel file isn't open in another program
- Verify column headers match expected names (case-insensitive)

### Maps not showing after upload

- Refresh the page
- Check browser console for errors
- Verify file format is supported

### Large imports timing out

- Server supports up to 500 items per query
- For very large imports, split into batches
- Consider increasing server timeout settings
