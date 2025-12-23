# 📱 Mobile Poster Editor - Sync Status

## Features to Add from Desktop Version

### ✅ Already Implemented (Desktop Only)
1. **Footer Photo Position Controls** - X/Y position with arrow buttons
2. **Footer Photo Flip** - Horizontal flip toggle
3. **Footer Photo Background Removal** - Free BG removal service
4. **Updated STF Templates** - Bold, Rounded, Tabbed (user image above frame, left-aligned content)
5. **Removed Templates** - STF Minimal and STF Special

### 📋 What Needs to be Synced to Mobile

#### 1. State Variables (app/poster-editor.tsx)
```typescript
const [footerPhotoPosition, setFooterPhotoPosition] = useState({ x: 1, y: -180 });
const [isPhotoFlipped, setIsPhotoFlipped] = useState(false);
const [isRemovingFooterPhotoBg, setIsRemovingFooterPhotoBg] = useState(false);
```

#### 2. Functions (app/poster-editor.tsx)
- `pickFooterUserPhoto()` - Photo picker for footer
- `handleRemoveFooterPhotoBg()` - Background removal

#### 3. UI Components (app/poster-editor.tsx)
- User Photo Section in side panel with:
  - Photo preview
  - Upload/Change photo button  
  - Remove background button
  - Position controls (X/Y with arrows)
  - Flip button

#### 4. Template Updates (components/posteredit/MobileBottomBarTemplates.tsx)
- Remove STF Minimal and STF Special from TEMPLATES array
- Remove CurvedTechFrame component
- Remove StfMinimalFrame component
- Update StfBoldFrame, StfRoundedFrame, StfTabbedFrame to:
  - Accept photoPosition and isPhotoFlipped props
  - Position user image above frame (zIndex: 16)
  - Move content to left with 25% margin
  - Match desktop layout exactly

## 🚧 Complexity

This is a LARGE update involving:
- ~150 lines of new state/functions in mobile editor
- ~200 lines of UI code for photo controls
- ~300 lines of template updates
- Total: ~650 lines of changes

## ⚠️ Recommendation

Due to the size of this update, I recommend:

**Option A:** Incremental approach
1. First: Add state and photo upload function
2. Second: Add UI controls
3. Third: Add background removal
4. Fourth: Update templates
5. Fifth: Test thoroughly

**Option B:** Direct sync
- Copy relevant sections from desktop
- Adapt for mobile layout differences
- Test each feature

Would you like me to proceed with Option A (safer, step-by-step) or Option B (faster, more risky)?
