# Phase 2: Maps Management - Implementation Plan

**Target Duration**: 5-6 days  
**Status**: ⏳ NOT STARTED  
**Priority**: HIGH

## Overview

Phase 2 implements the complete Maps management tab, including file upload, progress tracking, deletion, and editing. This is the foundation for similar functionality in Tokens (Phase 3) and Notes (Phase 4).

## Features to Implement

### 1. Map Upload Functionality

#### 1.1 File Input & Selection

- Create `src/admin-area/components/file-uploader.tsx` (generic component)
- Accept `.jpg`, `.jpeg`, `.png` files (image formats)
- Support drag-and-drop file input
- Show selected file info (name, size, dimensions)
- Validate file size (max 50MB recommended)

#### 1.2 Upload Flow

- Create `src/admin-area/hooks/useMapUpload.ts`
- Implement signed URL request:
  1. Call `mapImageRequestUpload` mutation with file details
  2. Get signed URL from GraphQL response
  3. Upload file to signed URL endpoint
  4. Create map record with `mapCreate` mutation
- Handle errors and retries
- Track upload progress

#### 1.3 Progress Tracking

- Create `src/admin-area/components/upload-progress.tsx`
- Show upload progress bar (0-100%)
- Display uploaded bytes / total bytes
- Show upload speed (MB/s)
- Show estimated time remaining
- Allow cancel operation
- Show success/error state after completion

### 2. Map Display & Search

#### 2.1 Enhance Maps List

- Already have basic list from Phase 1
- Add sorting options:
  - Sort by name (A-Z, Z-A)
  - Sort by creation date (newest, oldest)
  - Sort by file size (largest, smallest)
- Add filtering options:
  - By grid enabled/disabled
  - By visibility status

#### 2.2 Map Preview

- Already showing mapImageUrl thumbnail
- Add hover preview (larger image)
- Show file size on card
- Show grid configuration info
- Show creation date

### 3. Map Deletion

#### 3.1 Delete Functionality

- Hook up "Delete" button to mutation
- Call `mapDelete` mutation with map ID
- Show confirmation dialog before delete:
  - "Are you sure you want to delete [Map Name]?"
  - Warn if map has tokens on it
  - Show confirmation with "Delete" / "Cancel" buttons
- Handle deletion success:
  - Remove from list
  - Show success toast notification
- Handle deletion errors:
  - Show error message
  - Allow retry

#### 3.2 Bulk Operations

- Add checkbox to select multiple maps
- "Delete Selected" button appears when maps selected
- Batch delete with progress
- Clear selection after completion

### 4. Map Editing (if time permits)

#### 4.1 Edit Metadata

- Modal/form for editing map properties:
  - Title
  - Grid configuration (offset, scale)
  - Visibility settings
- Save changes via `mapUpdate` mutation (if exists)
- Or re-upload entire map

### 5. Advanced Features (if time permits)

#### 5.1 Map Organization

- Add tags/categories for maps
- Add description field
- Add campaign association

#### 5.2 Quick Actions

- "Use as Active Map" button
- "Duplicate Map" functionality
- "Download Map" button

## GraphQL Mutations Required

### Must Have (Already Exist)

- ✅ `mapImageRequestUpload` - Get signed URL
- ✅ `mapCreate` - Create map
- ✅ `mapDelete` - Delete map

### Should Have (Need to Verify)

- ⏳ `mapUpdate` - Update map metadata
- ⏳ `shareImage` - Set as active map (if exists)

### Check Backend

```bash
# Check available mutations in server/graphql/modules/maps.ts
grep -n "mutationFields\|mapDelete\|mapCreate\|mapUpdate\|shareImage" server/graphql/modules/maps.ts
```

## Component Structure

```
src/admin-area/
├── tabs/
│   └── maps-tab.tsx (update for upload UI)
├── components/
│   ├── file-uploader.tsx (NEW)
│   │   - Input field or drop zone
│   │   - File validation
│   │   - File info display
│   └── upload-progress.tsx (NEW)
│       - Progress bar
│       - Speed/time info
│       - Cancel button
├── hooks/
│   └── useMapUpload.ts (NEW)
│       - Signed URL request
│       - File upload to S3/endpoint
│       - Map creation
│       - Error handling
│       - Retry logic
└── utils/
    └── upload-helpers.ts (NEW - if needed)
        - File validation
        - Size formatting
        - Error messages
```

## Implementation Timeline

### Day 1-2: File Upload Infrastructure

- [ ] Create file-uploader component
- [ ] Create useMapUpload hook
- [ ] Implement signed URL flow
- [ ] Test file upload to backend

### Day 2-3: Progress & UI

- [ ] Create upload-progress component
- [ ] Wire progress tracking
- [ ] Add upload button to maps-tab
- [ ] Handle success/error states

### Day 3-4: Deletion & Confirmation

- [ ] Wire up delete mutation
- [ ] Create confirmation dialog
- [ ] Update maps list after delete
- [ ] Add error handling

### Day 4-5: Advanced Features (if time)

- [ ] Sorting functionality
- [ ] Bulk operations
- [ ] Enhanced search filters
- [ ] Map editing

### Day 5-6: Testing & Polish

- [ ] Comprehensive testing
- [ ] Error scenarios
- [ ] Performance optimization
- [ ] UI refinement
- [ ] Documentation

## GraphQL Query/Mutation Examples

### Request Upload URL

```graphql
mutation {
  mapImageRequestUpload(input: { sha256: "file-hash", fileName: "map.jpg" }) {
    uploadUrl
    mapImageId
  }
}
```

### Create Map (After Upload)

```graphql
mutation {
  mapCreate(
    input: {
      title: "Dragon's Lair"
      mapImageId: "image-id"
      grid: { offsetX: 0, offsetY: 0, columnWidth: 50, columnHeight: 50 }
    }
  ) {
    ... on MapCreateSuccess {
      map {
        id
        title
        mapImageUrl
      }
    }
    ... on MapCreateError {
      reason
    }
  }
}
```

### Delete Map

```graphql
mutation {
  mapDelete(input: { id: "map-id" }) {
    ... on MapDeleteSuccess {
      id
    }
    ... on MapDeleteError {
      reason
    }
  }
}
```

## Testing Checklist

- [ ] Upload small map (< 5MB)
- [ ] Upload large map (> 20MB)
- [ ] Upload invalid file type (should reject)
- [ ] Cancel upload mid-way
- [ ] Verify progress bar updates
- [ ] Verify map appears in list after upload
- [ ] Delete map from list
- [ ] Confirm deletion dialog appears
- [ ] Cancel deletion dialog
- [ ] Verify map removed after deletion
- [ ] Search for newly uploaded map
- [ ] Handle network errors gracefully
- [ ] Handle server errors gracefully
- [ ] Test with slow connection

## Known Dependencies

- `mapImageRequestUpload` mutation (backend)
- `mapCreate` mutation (backend)
- `mapDelete` mutation (backend)
- Signed URL endpoint (backend)
- File upload storage (backend - `/data/maps/`)

## Success Criteria

1. ✅ User can upload map file via file picker
2. ✅ Upload progress is displayed with speed/ETA
3. ✅ Map appears in list after successful upload
4. ✅ Map can be searched and sorted
5. ✅ Map can be deleted with confirmation
6. ✅ All error states handled gracefully
7. ✅ UI matches burgundy/tan theme
8. ✅ Performance acceptable (< 100ms UI response)
9. ✅ All mutations work end-to-end
10. ✅ Compatible with Phase 1 dashboard

## Notes for Implementation

### File Hashing

- Implement SHA256 hash of file before upload
- Required for `mapImageRequestUpload` mutation
- Use existing `sha256` module if available in codebase
- Check: `src/` or `server/` for hash utilities

### Chunked Upload (if large files)

- For files > 50MB, implement chunked upload
- Upload in 5-10MB chunks
- Combine on backend
- Track progress per chunk

### Optimistic Updates

- Update Relay store immediately on upload button click
- Show optimistic state in list
- Rollback on error
- Confirm from server response

### Caching Strategy

- Cache uploaded maps in Relay
- Invalidate cache after deletion
- Use `@live` directive for real-time updates

---

**Next**: Phase 2 - Maps Implementation  
**Estimated Effort**: 40-50 developer hours  
**Difficulty Level**: Medium
