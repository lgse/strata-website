# Product-claim audit

Audited against the adjacent `../strata` checkout at commit:

`e5b2669dcf1eeaa6f1a1ee7b2ff3e9a5430b08aa`

The repository README lags some newer implementation details (it still mentions six bundled themes). The website favors implementation and focused documentation over stale summary text. It does not modify the Strata checkout.

## Brief → implementation → website

| Requested capability             | Evidence / qualification                                                                                           | Website treatment                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Miller-style columns             | `src/ui/browser_modes.rs`, `src/ui/browser.rs`                                                                     | Interactive columns demo and dedicated feature                                                                 |
| Grid explorer                    | `src/ui/browser_modes.rs`                                                                                          | Interactive thumbnail grid                                                                                     |
| Column / list explorer           | `BrowserMode::Explorer`                                                                                            | Sortable Column-mode demo                                                                                      |
| Tree mode                        | Only Columns, Grid, and Explorer found in `BrowserMode`                                                            | **Needs confirmation/newer source**; not advertised as shipped                                                 |
| Multi-pane view                  | Miller columns maintain multiple directory panes; no independent split-view implementation found                   | Advertised as multi-column navigation, not independent split panels                                            |
| Fully customizable keys          | `keybindings_page()` is a shortcut reference; `docs/todo.md` leaves configurable keys/conflict detection unchecked | Keyboard-first and Vim-style navigation advertised; remapping **needs confirmation**                           |
| 100+ bundled themes              | `data/themes/catalog.toml` contains **95** themes; `docs/themes.md` confirms 95                                    | Dynamic actual count, all 95 imported; re-sync as the catalog grows                                            |
| Omarchy synchronization          | `docs/themes.md`, `src/ui/theme.rs`                                                                                | Live Omarchy **Quattro** sync; not legacy layouts and not a browser-to-system integration                      |
| Folder peeking                   | `src/app/peek.rs`, `src/app/browser.rs`                                                                            | Hover-peek illustration and feature copy                                                                       |
| Sandboxed previews               | `docs/preview-sandbox.md`, `src/sandbox.rs`                                                                        | Native parser helpers isolated with Bubblewrap, no network, bounded resources, fail closed                     |
| Text/code previews in sandbox    | README explicitly distinguishes bounded in-process text reads (1 MiB)                                              | Exception stated in FAQs and Code preview; never claim every preview uses a separate process                   |
| “Anything” previewable           | Supported image, RAW, PDF, text, source, audio, video paths documented                                             | Supported families listed; not a universal file-format promise                                                 |
| 200,000 files scroll smoothly    | Public deterministic fixtures/baseline document up to **100,000** entries; benchmark is machine-specific           | Uses documented 100k fixture and <4 ms UI insertion sample, clearly qualified; no unsupported 200k/60fps claim |
| Rust, GTK4, GIO, small footprint | `Cargo.toml`, README, architecture docs                                                                            | Native architecture, background I/O, virtualization, no Electron. No unverified MB/binary-size claims          |
| Print from context menu/previews | `src/ui/preview.rs` and print layout tests                                                                         | Supported document/image printing feature                                                                      |
| GPU video previews               | README and sandbox docs: media-only VA-API/Vulkan attempts, software fallback                                      | Supported GPU pipeline qualification; not guaranteed hardware acceleration on every host                       |
| Consent-based updates            | Update services, release-channel docs                                                                              | Opt-in checks, release notes, verified binary installation                                                     |
| Drag/drop, cut/copy/paste, undo  | Browser operations and README                                                                                      | Undo latest move or move to Trash, **not** universal reversal of every operation                               |
| SMB/SFTP/SCP                     | GIO/GVfs backends; `src/app/browser.rs` explicitly rejects SCP-style `user@host:path`                              | SMB/SFTP first, FTP/FTPS/WebDAV with backends; FAQ directs SSH browsing to `sftp://`                           |
| Text size                        | `src/ui/theme.rs`, text size tests                                                                                 | Appearance feature                                                                                             |
| Compact / airy                   | Theme preferences                                                                                                  | Appearance feature                                                                                             |
| Group by type                    | Browser modes and `docs/screenshots/type-grouping-*`                                                               | Feature and functional demo control                                                                            |

## Additional confirmed features included

- Recursive fuzzy filename/path search with progressive background indexing (not content search).
- Pane filtering and hidden-file toggles.
- Pins, navigation history, direct location entry, and opening a terminal.
- Camera RAW preview support.
- Custom, shareable TOML palettes and live theme editing in the native app.
- Separate Stable, Preview, and Nightly release channels; explicit return to Stable.
- Verified release downloads, published checksums, and GitHub provenance verification in the installer.
- x86_64 and aarch64 Linux release builds.
- Free software under GPL-3.0-or-later.

## To resolve before expanding marketing claims

1. Supply the implementation/branch for tree mode, independent split panes, key remapping, and any SCP support newer than this checkout.
2. Re-sync the catalog once it reaches 100+; the page count updates automatically.
3. Supply a reproducible 200k-file scrolling capture/benchmark with build, hardware, GTK version, and cache conditions. Existing baseline timings are engineering samples, not universal guarantees.
4. Provide supported-format additions rather than a blanket “anything” claim.

## Illustrations vs. app behavior

The website's interactive browser is a small React demonstration with an in-memory fixture, not an emulator or WASM port. Sorting, filtering, folder peeking, and keyboard movement demonstrate the concepts. The search playground demonstrates subsequence matching, not Strata's complete fuzzy-ranking/indexing engine. Media-format cards illustrate capabilities; no PDF parsing, sandbox, audio decoder, GPU transcoder, or native app is running in the browser.
