# Icon Generation Guide for Nexus Genius AI

## Quick Start

### On macOS/Linux:
```bash
bash android/scripts/generate-icons.sh
```

### On Windows:
```bash
android/scripts/generate-icons.bat
```

## What Gets Generated

The script creates **three icon sizes** for optimal display on different devices:

| Size | Resolution | Use Case |
|------|------------|----------|
| 192x192 | mdpi | Medium density (normal phones) |
| 512x512 | xxxhdpi | Extra high density (modern phones) |
| 1024x1024 | xxxhdpi | Play Store listing |

## Icon Design Features

✨ **Design Elements:**
- **Background:** Blue gradient (Dark Blue → Light Blue)
- **Patterns:**
  - Hexagonal grid background
  - Circular tech nodes with connections
  - Geometric accents in corners
- **Text:** "NEXUS" in bold white gradient
- **Effect:** Modern, tech-forward, professional

## Manual Generation

If the script doesn't work, generate manually:

```bash
cd android/scripts
javac NexusIconGenerator.java
java NexusIconGenerator
```

## File Locations

After generation, icons will be at:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher_192.png
├── mipmap-hdpi/
│   └── ic_launcher_192.png
├── mipmap-xhdpi/
│   └── ic_launcher_192.png
├── mipmap-xxhdpi/
│   └── ic_launcher_192.png
└── mipmap-xxxhdpi/
    ├── ic_launcher_512.png
    └── ic_launcher_1024.png
```

## Using in Play Store

For the Play Store listing, use:
- **Primary Icon:** `ic_launcher_512.png` (512x512)
- **Feature Graphic:** 1024x500 PNG
- **Screenshots:** 1440x2960 (9:16 aspect ratio)

## Customization

To modify the icon design, edit `NexusIconGenerator.java`:

### Change Colors:
```java
// Line 27: Gradient colors
new Color(13, 71, 161),      // Dark Blue (#0F47A1) ← Change here
new Color(66, 165, 245)      // Light Blue (#42A5F5) ← Change here
```

### Change Text:
```java
// Line 95: Change "NEXUS" to another word
drawText(g2d, size, "YOUR_TEXT_HERE");
```

### Change Font:
```java
// Line 122: Font configuration
Font font = new Font("Arial", Font.BOLD, fontSize);
// Options: "Arial", "Helvetica", "Courier", "Times New Roman"
```

### Change Pattern Density:
```java
// Line 50: Number of tech nodes
int nodeCount = 8; // Increase/decrease for more/fewer patterns
```

## Verification

After generation, verify the icons:

```bash
# macOS/Linux
file android/app/src/main/res/mipmap-*/ic_launcher_*.png

# Windows
dir /S android\app\src\main\res\mipmap-*\ic_launcher_*.png
```

## Next Steps

1. ✅ Generate icons using the script
2. Update `AndroidManifest.xml` (already done)
3. Create banner and feature graphics for Play Store
4. Create screenshots (see below)

---

## Creating Additional Play Store Graphics

### Feature Graphic (1024x500):
Use the NexusIconGenerator and resize to 1024x500.

### Screenshots (1440x2960):
Show:
1. Home screen / Main interface
2. GitHub integration feature
3. Code analysis capability
4. Learning/memory feature
5. Settings/preferences

---

**Ready to go!** 🚀 Run the icon generator and your app will have a professional icon.
