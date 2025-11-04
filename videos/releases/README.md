# Atlas Logged Release Videos

This directory contains feature overview videos for each major Atlas Logged release.

## Video Specifications

All videos should follow these guidelines:

### Technical Specs
- **Resolution:** 1080p (1920x1080) or 9:16 vertical (1080x1920) for mobile-first
- **Format:** MP4 (H.264 codec)
- **Bitrate:** 3-4 Mbps (target ~30-40MB for 60s video)
- **Audio:** AAC, 128 kbps
- **Duration:** 30-90 seconds recommended
- **Target Size:** < 50MB per video

### Optimization

Use ffmpeg to optimize videos before uploading:

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -maxrate 4M \
  -bufsize 8M \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease" \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  output.mp4
```

The `-movflags +faststart` flag is crucial - it enables progressive download so videos start playing before fully downloaded.

### Thumbnail Generation

Generate thumbnails for loading states:

```bash
# Extract frame at 2 seconds
ffmpeg -i v2.0.0.mp4 -ss 00:00:02 -vframes 1 -q:v 2 v2.0.0-thumb.jpg
```

## Hosting Strategy

**IMPORTANT:** Videos are hosted as **GitHub Release Assets**, NOT served via GitHub Pages.

### Why GitHub Releases?

GitHub Pages does NOT serve Git LFS files correctly - it serves the pointer files instead of actual videos. Therefore:

- ✅ **Upload videos to GitHub Releases** as release assets
- ✅ Get direct download URLs from release assets
- ✅ No bandwidth/size concerns (2GB per file limit)
- ❌ **Do NOT commit videos to this repo** (even with LFS)

Git LFS is configured in this repo for reference, but videos are NOT stored here.

## Naming Convention

- **Release Videos:** `v{version}.mp4` (e.g., `v2.0.0.mp4`)
- **Release Thumbnails:** `v{version}-thumb.jpg` (e.g., `v2.0.0-thumb.jpg`)
- **Welcome Video:** `welcome.mp4` (first-launch demo video)
- **Welcome Thumbnail:** `welcome-thumb.jpg`

## Directory Structure

```
videos/
└── releases/
    ├── welcome.mp4            # First-launch demo video
    ├── welcome-thumb.jpg      # Welcome video thumbnail
    ├── v2.0.0.mp4            # Version update videos
    ├── v2.0.0-thumb.jpg
    ├── v1.2.0.mp4
    ├── v1.2.0-thumb.jpg
    └── README.md (this file)
```

## Usage in App

### Welcome Video (First Launch)

The welcome video is shown on first app launch and is hardcoded in `OnboardingWelcomeVideoView.swift`:

```swift
OnboardingWelcomeVideoView(
    videoURL: URL(string: "https://atlaslogged.com/videos/releases/welcome.mp4"),
    thumbnailURL: URL(string: "https://atlaslogged.com/videos/releases/welcome-thumb.jpg"),
    onContinue: { ... }
)
```

**Hosted on:** GitHub Pages (atlaslogged.com)
**Purpose:** Introduce new users to the app's core features

### Version Update Videos

Videos are referenced in the changelog.json using **GitHub Release asset URLs**:

```json
{
  "version": "2.0.0",
  "video": {
    "url": "https://github.com/shinkansensupportgroup/atlas-logged/releases/download/v2.0.0/v2.0.0.mp4",
    "thumbnail": "https://github.com/shinkansensupportgroup/atlas-logged/releases/download/v2.0.0/v2.0.0-thumb.jpg",
    "duration": 60,
    "size": 35000000
  }
}
```

**URL Pattern:** `https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}`

## Adding New Videos

1. Optimize video using ffmpeg command above
2. Generate thumbnail
3. **Upload as GitHub Release assets** when creating the release (via GitHub UI or `gh release create`)
4. Update changelog.json in app repo with release asset URLs
5. GitHub Actions will create draft release (then manually upload videos and publish)

Example with GitHub CLI:
```bash
gh release create v2.0.0 \
  --title "Atlas Logged v2.0.0" \
  --notes "Release notes here" \
  --draft \
  v2.0.0.mp4 \
  v2.0.0-thumb.jpg
```

## Notes

- Keep videos focused on 3-5 key features
- Show real app interactions, not mockups
- Include captions for accessibility
- Test on slow connections before publishing
