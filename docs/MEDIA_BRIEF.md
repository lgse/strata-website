# Media brief for the next pass

The first iteration is self-contained: it uses the real Strata logo, real palette data, an original SVG landscape, and functional web illustrations. No extra assets are needed to run it.

Fresh, intentional app captures would make the next version more authentic. Existing README screenshots were reviewed, but the supplied ones use an older appearance and mostly empty directories; they are not presented as current Tokyo Night marketing screenshots.

## Most valuable captures

1. **Hero: Miller columns + image preview.** Tokyo Night, compact density, a populated three-column path, one attractive landscape selected. App window only, no desktop chrome. Ideally 1920×1080 or 2400×1500, PNG.
2. **A 10–15 second flow recording.** Navigate columns with `h/j/k/l`, hover-peek a folder, hit Space for preview, then fuzzy-search with Ctrl+K. Smooth cursor movement, no audio required.
3. **Grid + type grouping.** A mixed directory containing images, PDFs, code, and folders. Show useful, fully loaded thumbnails.
4. **GPU video preview.** A 6–10 second loop of a video playing within the real preview pane, with the app still visible. Confirm the capture uses a supported accelerated path if it is labeled GPU-accelerated.
5. **Omarchy theme sync.** Change Tokyo Night → Catppuccin or Rosé Pine and show Strata updating live. Useful as a short split-screen or before/after sequence.
6. **Large-directory scrolling.** A 200k-entry fixture if that claim is to be published. Include the app build, hardware, GTK version, cache state, and a real sustained scrolling run. Do not turn one machine's result into a universal frame-rate promise.
7. **Newer features.** Tree mode, independently split panes, and keybinding customization, together with the source branch/release that implements them.

## Capture guidelines

- Prefer app-only captures with consistent dimensions, text size, and theme.
- Use a deliberate demo folder tree. No private home paths, credentials, customer data, network addresses, or personal thumbnails.
- Use media you own or have permission to publish.
- Preserve original PNG/video masters. We can derive responsive WebP/AVIF images and muted WebM/MP4 loops.
- Videos should have a poster image, playback controls/pause support, and a still-image path for reduced-motion visitors.
- Real screenshots retain the palette they were captured in. Do not recolor screenshots and imply they faithfully show other app themes. Keep the theme-aware React illustration alongside them, or capture actual variants.

## Placement

- `ExplorerDemo` in `src/components/explorer-demo.tsx`: hero app capture / optional demo-versus-recording toggle.
- `PreviewDemo` in `src/components/preview-demo.tsx`: preview recordings and stills.
- Omarchy callout in `src/app/page.tsx`: short theme-sync recording.
- Performance card in `src/app/page.tsx`: real benchmark evidence, if available.
