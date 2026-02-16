# 🏗️ Format Converter - Component Architecture

## Component Structure

```
FormatConverter Component
│
├── 📦 Props
│   ├── sourceImage (string) - URL of the image to convert
│   └── sourceImageName (string) - Original filename for download
│
├── 🎯 State Management
│   ├── selectedFormat (string) - Current format: png/jpeg/webp/avif
│   ├── quality (number) - Compression quality: 10-100
│   ├── resizeEnabled (boolean) - Whether resize is active
│   ├── width (string) - Target width in pixels
│   ├── height (string) - Target height in pixels
│   ├── maintainAspectRatio (boolean) - Lock aspect ratio
│   ├── originalDimensions (object) - { width, height }
│   └── isProcessing (boolean) - Conversion in progress
│
├── 🎨 UI Sections
│   │
│   ├── Header Section
│   │   ├── Window controls (3 dots)
│   │   └── Title: "🔄 Format Converter & Resizer"
│   │
│   ├── Format Selection
│   │   ├── Section header (cyan)
│   │   └── 4 format cards (PNG, JPG, WebP, AVIF)
│   │       ├── Emoji icon
│   │       ├── Format name
│   │       └── Description
│   │
│   ├── Quality Control (hidden for PNG)
│   │   ├── Section header (orange)
│   │   ├── Quality slider (10-100%)
│   │   ├── Percentage display
│   │   └── Smart tip box
│   │
│   ├── Resize Options
│   │   ├── Section header with toggle (purple)
│   │   ├── Original dimensions display
│   │   ├── Width/Height inputs
│   │   ├── Aspect ratio lock button
│   │   └── Quick presets grid (7 options)
│   │
│   ├── Convert Button
│   │   ├── Large cyan-blue gradient
│   │   ├── Processing state
│   │   └── Download action
│   │
│   └── Settings Summary
│       ├── Yellow info box
│       └── Current configuration display
│
└── 🔧 Functions
    ├── loadImageDimensions() - Get original size
    ├── handleWidthChange() - Update width + aspect ratio
    ├── handleHeightChange() - Update height + aspect ratio
    ├── applyPreset() - Set preset dimensions
    └── handleConvert() - Process and download
```

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ○ ○ ○  🔄 Format Converter & Resizer                       │ ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📁 OUTPUT FORMAT                                           │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │ 🖼️ PNG │  │ 📸 JPG │  │ 🌐 WebP│  │ ⚡ AVIF│          │ ← Format Cards
│  │Lossless│  │Smaller │  │Modern  │  │Best    │          │
│  └────────┘  └────────┘  └────────┘  └────────┘          │
│                                                             │
│  ⚙️ QUALITY SETTINGS                                        │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Compression Quality              [90%]            │    │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │    │ ← Quality Slider
│  │ Lower Size ←──────────────────────→ Higher Quality│    │
│  │ 💡 Tip: Good balance for web use                  │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  📐 RESIZE IMAGE                              [✓ Enabled]  │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Original Size: [1920 × 1080]                      │    │
│  │                                                    │    │
│  │ Width (px)          Height (px)                   │    │
│  │ [1920        ]      [1080        ]                │    │ ← Dimension Inputs
│  │                                                    │    │
│  │ [🔗 Aspect Ratio Locked]                          │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  ⚡ QUICK PRESETS                                           │
│  [Instagram] [Instagram] [Twitter ] [Facebook]            │
│  [Square   ] [Portrait ] [Post    ] [Cover   ]            │ ← Preset Buttons
│  [YouTube  ] [HD 1080p ] [4K      ]                       │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │    ⬇️  CONVERT & DOWNLOAD PNG                     │    │ ← Convert Button
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │ ℹ️  Current Settings:                              │    │
│  │ • Format: PNG                                     │    │ ← Info Box
│  │ • Dimensions: 1920 × 1080 pixels                  │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Component Mount
    ↓
Load Image Dimensions
    ↓
Set Original Width/Height
    ↓
User Interactions:
    │
    ├─→ Select Format
    │   └─→ Update selectedFormat state
    │
    ├─→ Adjust Quality
    │   └─→ Update quality state
    │
    ├─→ Toggle Resize
    │   └─→ Update resizeEnabled state
    │
    ├─→ Change Width
    │   ├─→ Update width state
    │   └─→ If aspect locked: calculate & update height
    │
    ├─→ Change Height
    │   ├─→ Update height state
    │   └─→ If aspect locked: calculate & update width
    │
    ├─→ Toggle Aspect Lock
    │   └─→ Update maintainAspectRatio state
    │
    ├─→ Click Preset
    │   ├─→ Set width & height
    │   └─→ Enable resize
    │
    └─→ Click Convert
        ↓
    Set isProcessing = true
        ↓
    Create Image Element
        ↓
    Load Source Image
        ↓
    Create Canvas
        ↓
    Set Canvas Dimensions
    (resize if enabled)
        ↓
    Draw Image on Canvas
        ↓
    Convert to Blob
    (format + quality)
        ↓
    Create Download Link
        ↓
    Trigger Download
        ↓
    Cleanup URL
        ↓
    Set isProcessing = false
        ↓
    Success!
```

## Format Conversion Logic

```javascript
// MIME Type Mapping
const mimeTypes = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif"
};

// Quality Handling
const qualityValue = format === "png" 
  ? 1.0                    // PNG always 100%
  : quality / 100;         // Other formats use slider

// Canvas Conversion
canvas.toBlob(
  (blob) => {
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);  // Cleanup
  },
  mimeType,
  qualityValue
);
```

## Aspect Ratio Mathematics

```javascript
// When width changes:
const aspectRatio = originalHeight / originalWidth;
const newHeight = Math.round(newWidth * aspectRatio);

// When height changes:
const aspectRatio = originalWidth / originalHeight;
const newWidth = Math.round(newHeight * aspectRatio);

// Example:
// Original: 1920 × 1080 (16:9 ratio)
// User sets width to 1280
// Calculated height: 1280 × (1080/1920) = 720
// Result: 1280 × 720 (maintains 16:9)
```

## Preset Dimensions

```javascript
const presets = [
  { name: "Instagram Square",    width: 1080, height: 1080 },  // 1:1
  { name: "Instagram Portrait",  width: 1080, height: 1350 },  // 4:5
  { name: "Twitter Post",        width: 1200, height: 675  },  // 16:9
  { name: "Facebook Cover",      width: 820,  height: 312  },  // Custom
  { name: "YouTube Thumbnail",   width: 1280, height: 720  },  // 16:9
  { name: "HD (1080p)",          width: 1920, height: 1080 },  // 16:9
  { name: "4K",                  width: 3840, height: 2160 }   // 16:9
];
```

## State Updates

```javascript
// Format Selection
setSelectedFormat("webp");

// Quality Adjustment
setQuality(85);

// Resize Toggle
setResizeEnabled(true);

// Dimension Changes (with aspect ratio)
handleWidthChange("1280");  // Auto-calculates height if locked

// Aspect Ratio Toggle
setMaintainAspectRatio(!maintainAspectRatio);

// Preset Application
applyPreset({ width: 1080, height: 1080 });
```

## Error Handling

```javascript
try {
  // Load image
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = sourceImage;
  });
  
  // Process and convert
  // ...
  
} catch (error) {
  console.error("Conversion error:", error);
  alert("Error converting image. Please try again.");
  setIsProcessing(false);
}
```

## Performance Optimizations

✅ **Client-Side Processing**
- No server requests needed
- Instant conversion
- Privacy-friendly (images never leave browser)

✅ **Canvas API**
- Hardware-accelerated rendering
- Efficient image manipulation
- Native browser support

✅ **Memory Management**
- URL.revokeObjectURL() after download
- Canvas cleanup
- Blob generation only when needed

✅ **State Optimization**
- Minimal re-renders
- Efficient state updates
- Conditional rendering

## Browser Support

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| PNG    | ✅     | ✅      | ✅     | ✅   |
| JPEG   | ✅     | ✅      | ✅     | ✅   |
| WebP   | ✅     | ✅      | 14+    | ✅   |
| AVIF   | 85+    | 93+     | 16+    | 85+  |

## File Size Comparison

Typical compression results (example):
- **Original PNG**: 2.5 MB
- **PNG (100%)**: 2.5 MB (lossless)
- **JPEG (90%)**: 450 KB
- **JPEG (70%)**: 280 KB
- **WebP (90%)**: 320 KB
- **AVIF (90%)**: 180 KB

*AVIF typically provides the best compression while maintaining quality*

---

**Component File:** `src/components/FormatConverter.jsx`  
**Lines of Code:** 500+  
**Dependencies:** React only (useState, useRef, useEffect)  
**Browser APIs:** Canvas API, Blob API, URL API  
**File Size:** 16 KB
