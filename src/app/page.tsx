import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Columns3,
  Cpu,
  Download,
  Eye,
  FileSearch,
  Folder,
  GitBranch,
  Keyboard,
  Layers3,
  Monitor,
  MousePointer2,
  Network,
  Paintbrush,
  PanelsLeftRight,
  Pin,
  Printer,
  ShieldCheck,
  Terminal,
  Type,
} from 'lucide-react';
import { Github } from '@/components/github-icon';
import { Header } from '@/components/header';
import { Logo } from '@/components/logo';
import { ExplorerDemo } from '@/components/explorer-demo';
import { KeyboardDemo } from '@/components/keyboard-demo';
import { PreviewDemo } from '@/components/preview-demo';
import { ThemeGallery } from '@/components/theme-gallery';
import { InstallCommand } from '@/components/install-command';
import { RevealObserver } from '@/components/motion';
import { BenchmarkCard } from '@/components/benchmark-card';
import { FeatureMatrix } from '@/components/feature-matrix';
import { themes } from '@/lib/themes';

const repository = 'https://github.com/lgse/strata';
const features = [
  {
    icon: Columns3,
    title: 'Every angle, covered.',
    description:
      'Spatial Miller columns, a visual thumbnail grid, and a sortable Column view. Switch perspectives, not applications.',
    tag: 'THREE BROWSER MODES',
  },
  {
    icon: PanelsLeftRight,
    title: 'Keep the bigger picture.',
    description:
      'Multiple Miller-column panes keep parent folders and your current location together. Context, without the backtracking.',
    tag: 'MULTI-COLUMN NAVIGATION',
  },
  {
    icon: Eye,
    title: 'A peek, not a detour.',
    description:
      'Hover over a folder to see what’s inside. Commit when you’re ready, or move on without changing your navigation history.',
    tag: 'FOLDER PEEKING',
  },
  {
    icon: MousePointer2,
    title: 'Move things. Naturally.',
    description:
      'Drag and drop. Cut, copy, and paste. Rename inline. Undo your latest move or move to Trash when plans change.',
    tag: 'EVERYDAY FILE OPERATIONS',
  },
  {
    icon: Network,
    title: 'Far away. Right here.',
    description:
      'Browse authenticated SMB and SFTP locations through GIO/GVfs. FTP and WebDAV, too, with the right system backends.',
    tag: 'NATIVE REMOTE CONNECTIONS',
  },
  {
    icon: Printer,
    title: 'From file to paper.',
    description:
      'Print supported documents and images straight from previews or the context menu. One less application to open.',
    tag: 'INTEGRATED PRINTING',
  },
  {
    icon: ArrowDownUp,
    title: 'A place for everything.',
    description:
      'Group files by type, sort your way, toggle hidden files, and filter the current pane without losing your place.',
    tag: 'SORTING & ORGANIZATION',
  },
  {
    icon: Type,
    title: 'Your kind of comfortable.',
    description:
      'Adjust the text size. Go compact for more information, or airy for a little breathing room. Make space work for you.',
    tag: 'TEXT SIZE & DENSITY',
  },
  {
    icon: Pin,
    title: 'The shortest way back.',
    description:
      'Pin the places you use most. Jump through your navigation history. Enter a path directly, or open a terminal right here.',
    tag: 'PINS, HISTORY & TERMINAL',
  },
  {
    icon: ShieldCheck,
    title: 'Updates, on your terms.',
    description:
      'Opt in to automatic checks. Read what changed. Install verified release binaries only when you give the go-ahead.',
    tag: 'CONSENT-BASED UPDATES',
  },
  {
    icon: GitBranch,
    title: 'Pick your pace.',
    description:
      'Stay on Stable, explore Preview, or ride Nightly. Distinct release channels, with a clear way back to Stable.',
    tag: 'THREE RELEASE CHANNELS',
  },
  {
    icon: Paintbrush,
    title: 'Beyond the presets.',
    description:
      'Build a palette with live previews in the app. Save it as a shareable TOML theme. Your desktop deserves your signature.',
    tag: 'CUSTOM THEMES',
  },
];
const faqs = [
  {
    question: 'What do I need to run Strata?',
    answer:
      'A 64-bit, glibc-based Linux desktop with GTK 4.12+ and glibc 2.39+. Arch Linux and Omarchy are the primary supported environments; x86_64 and aarch64 release binaries are available. Other distributions need compatible runtime libraries, or a source build. The installer checks your architecture and dependencies before making changes.',
  },
  {
    question: 'Does it work without Omarchy?',
    answer:
      'Yes. Strata is a native GTK4 application and works on compatible Linux desktops. Omarchy Quattro adds automatic, live theme following, but it is entirely optional. You can always use a bundled palette or your own custom theme.',
  },
  {
    question: 'How are previews sandboxed?',
    answer:
      'Native image, RAW, PDF, thumbnail, and media parsers run in separate Bubblewrap-isolated helpers with no network, no capabilities, read-only input, and resource limits. Media helpers can receive allowlisted GPU render devices for acceleration. If isolation is unavailable, native previews fail closed. Plain text and source code use a separate in-process reader capped at 1 MiB; they do not invoke a native format parser.',
  },
  {
    question: 'Can I connect to a server or network share?',
    answer:
      'Yes. Enter an smb:// or sftp:// URI in the location field. Strata uses GIO/GVfs and prompts for authentication when needed. FTP, FTPS, and WebDAV are supported with the corresponding installed backends. SCP-style user@host:path addresses are not supported in the current source; use an sftp:// URI for SSH-based browsing.',
  },
  {
    question: 'Is it really free and open source?',
    answer:
      'Completely. Strata is free software under GPL-3.0-or-later. There is no paid tier and no feature gate. Browse the code, report an issue, contribute a theme, or help shape what comes next on GitHub.',
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <RevealObserver />
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orb orb-one" aria-hidden="true" />
          <div className="hero-orb orb-two" aria-hidden="true" />
          <div className="floating-folders folders-left" aria-hidden="true">
            <div className="folder-sheet sheet-back" />
            <div className="folder-sheet sheet-middle" />
            <div className="folder-sheet sheet-front">
              <Folder size={24} />
              <span>~/possibilities</span>
              <div />
              <div />
              <div />
            </div>
            <span className="orbit-dot" />
          </div>
          <div className="floating-folders folders-right" aria-hidden="true">
            <div className="folder-sheet sheet-back" />
            <div className="folder-sheet sheet-middle" />
            <div className="folder-sheet sheet-front">
              <FileSearch size={24} />
              <span>find your flow_</span>
              <div />
              <div />
              <div />
            </div>
            <span className="orbit-dot" />
          </div>
          <div className="hero-copy">
            <a href={repository} className="hero-eyebrow" target="_blank" rel="noreferrer">
              <span className="live-dot" /> A FRESH PERSPECTIVE ON YOUR FILES{' '}
              <ArrowUpRight size={12} />
            </a>
            <h1 id="hero-title">
              Navigate
              <br />
              <span>every layer.</span>
            </h1>
            <p>
              Your files, in their element. A fast, keyboard-first file manager
              <br className="desktop-break" /> for Linux. Native by nature. Beautiful by choice.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#download">
                <Download size={17} /> Get Strata for Linux <ArrowRight size={17} />
              </a>
              <a className="button secondary" href={repository} target="_blank" rel="noreferrer">
                <Github size={17} /> Explore the source <ArrowUpRight size={14} />
              </a>
            </div>
            <InstallCommand variant="hero" />
            <div className="hero-footnote">
              <span>Free & open source</span>
              <i />
              <span>Rust + GTK4</span>
              <i />
              <span>Made for your flow</span>
            </div>
          </div>
          <div className="container hero-app">
            <ExplorerDemo />
          </div>
        </section>

        <div className="native-strip container" data-reveal>
          <span>
            LESS OVERHEAD.
            <br />
            <strong>MORE POSSIBILITY.</strong>
          </span>
          <div>
            <Cpu size={21} />
            <span>
              Powered by <strong>Rust</strong>
            </span>
          </div>
          <div>
            <Layers3 size={21} />
            <span>
              Truly native <strong>GTK4 + GIO</strong>
            </span>
          </div>
          <div>
            <Monitor size={21} />
            <span>
              At home on <strong>Linux</strong>
            </span>
          </div>
          <div>
            <Github size={21} />
            <span>
              Yours to explore <strong>Open source</strong>
            </span>
          </div>
        </div>

        <section
          className="section container flow-section"
          id="features"
          aria-labelledby="flow-title"
        >
          <div className="section-heading" data-reveal>
            <span className="eyebrow">
              <span className="section-number">01 /</span> FIND YOUR FLOW
            </span>
            <div className="heading-row">
              <h2 id="flow-title">
                Less friction.
                <br />
                <span>More forward.</span>
              </h2>
              <p>
                For the deep divers. The keyboard people.
                <br />
                The “I know exactly where that is” people.
                <br />
                Finally, a file manager that gets you.
              </p>
            </div>
          </div>
          <div className="story-grid">
            <article className="story-card keyboard-card" data-reveal>
              <div className="card-topline">
                <Keyboard size={21} />
                <span>STAY IN THE ZONE</span>
                <span className="card-index">01</span>
              </div>
              <h3>Thought. Keystroke. There.</h3>
              <p>
                Vim-style movement. Instant fuzzy search. Find files as the tree indexes, and keep
                your hands where your ideas happen.
              </p>
              <KeyboardDemo />
              <div className="key-strip">
                <span>
                  <kbd>h</kbd>
                  <kbd>j</kbd>
                  <kbd>k</kbd>
                  <kbd>l</kbd> navigate
                </span>
                <span>
                  <kbd>space</kbd> preview
                </span>
                <span>
                  <kbd>ctrl L</kbd> go anywhere
                </span>
              </div>
            </article>
            <article className="story-card preview-card" data-reveal>
              <div className="card-topline">
                <ShieldCheck size={21} />
                <span>LOOK CLOSER. STAY SAFE.</span>
                <span className="card-index">02</span>
              </div>
              <h3>Big previews. Small permissions.</h3>
              <p>
                Images, RAW, PDFs, code, audio, and video. Rich previews with isolated native
                parsers, plus GPU acceleration for supported video pipelines.
              </p>
              <PreviewDemo />
              <div className="card-bottom-note">
                <ShieldCheck size={14} /> Untrusted files. A deliberately limited boundary.
              </div>
            </article>
          </div>
          <BenchmarkCard />
          <FeatureMatrix />
        </section>

        <section className="themes-section section" id="themes" aria-labelledby="themes-title">
          <div className="theme-glow" aria-hidden="true" />
          <div className="container">
            <div className="section-heading" data-reveal>
              <span className="eyebrow">
                <span className="section-number">02 /</span> A VERY PERSONAL SPACE
              </span>
              <div className="heading-row">
                <h2 id="themes-title">
                  Same flow.
                  <br />
                  <span>Your atmosphere.</span>
                </h2>
                <div className="theme-heading-description">
                  <span className="theme-count">
                    {themes.length}
                    <span>and counting.</span>
                  </span>
                  <p>
                    Beloved editor palettes. Light or dark. All built in.
                    <br />
                    Ten favorites to try here. The full collection in Strata.
                  </p>
                </div>
              </div>
            </div>
            <div data-reveal>
              <ThemeGallery />
            </div>
            <div className="omarchy-callout" data-reveal>
              <div className="omarchy-symbol">
                <Layers3 size={27} />
                <span className="live-dot" />
              </div>
              <div>
                <h3>Your desktop changes. Strata follows.</h3>
                <p>
                  Automatic, live palette sync with Omarchy Quattro. One switch. Everything in
                  harmony.
                </p>
              </div>
              <a
                href={`${repository}/blob/main/docs/themes.md#omarchy-quattro`}
                target="_blank"
                rel="noreferrer"
              >
                Meet the integration <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className="section container details-section" aria-labelledby="details-title">
          <div className="section-heading" data-reveal>
            <span className="eyebrow">
              <span className="section-number">03 /</span> THE LITTLE THINGS ARE THE BIG THINGS
            </span>
            <div className="heading-row">
              <h2 id="details-title">
                Consider it
                <br />
                <span>taken care of.</span>
              </h2>
              <p>
                The everyday essentials, thoughtfully put together.
                <br />
                Nothing between you and what’s next.
              </p>
            </div>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description, tag }) => (
              <article className="detail-card" key={title} data-reveal>
                <div className="detail-icon">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <span className="detail-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="open-source-note" data-reveal>
            <GitBranch size={16} />
            <span>Built in the open. Getting better, together.</span>
            <a href={`${repository}/issues`} target="_blank" rel="noreferrer">
              Shape what’s next <ArrowUpRight size={13} />
            </a>
          </div>
        </section>

        <section
          className="download-section section"
          id="download"
          aria-labelledby="download-title"
        >
          <div className="download-orbit" aria-hidden="true" />
          <div className="container download-content" data-reveal>
            <Logo className="download-logo" />
            <span className="eyebrow">LESS SEARCHING. MORE FINDING.</span>
            <h2 id="download-title">
              Meet your
              <br />
              <span>new daily driver.</span>
            </h2>
            <p>
              Take the long way through your files.
              <br />
              It’s finally the good part.
            </p>
            <div className="download-actions">
              <a
                className="button primary"
                href={`${repository}/releases/latest`}
                target="_blank"
                rel="noreferrer"
              >
                <Download size={17} /> Download for Linux <ArrowUpRight size={16} />
              </a>
              <a
                className="button secondary"
                href={`${repository}#development-and-documentation`}
                target="_blank"
                rel="noreferrer"
              >
                <Terminal size={16} /> Build from source
              </a>
            </div>
            <div className="platform-note">
              <Monitor size={13} /> x86_64 & aarch64 <span>·</span> Arch & Omarchy first{' '}
              <span>·</span> GPL-3.0-or-later
            </div>
            <InstallCommand />
            <a
              className="review-installer"
              href={`${repository}/blob/main/install.sh`}
              target="_blank"
              rel="noreferrer"
            >
              Your machine. Your call. Review the installer first. <ArrowUpRight size={12} />
            </a>
          </div>
        </section>

        <section className="faq-section container section" aria-labelledby="faq-title">
          <div className="faq-heading" data-reveal>
            <span className="eyebrow">A FEW MORE LAYERS</span>
            <h2 id="faq-title">Good questions.</h2>
            <p>
              Here’s the short version.
              <br />
              The source has the long one.
            </p>
            <a href={repository} target="_blank" rel="noreferrer">
              Read the documentation <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="faq-list" data-reveal>
            {faqs.map(({ question, answer }) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <div className="footer-top">
          <a className="wordmark" href="#">
            <Logo />
            <span>
              strata<span className="wordmark-dot">.</span>
            </span>
          </a>
          <span>Navigate every layer.</span>
          <div>
            <a href={repository} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={12} />
            </a>
            <a href={`${repository}/releases`} target="_blank" rel="noreferrer">
              Releases <ArrowUpRight size={12} />
            </a>
            <a href={`${repository}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
              License <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Made for Linux. Made to be yours.</span>
          <span>
            <span className="live-dot" /> No tracking. Just a better view.
          </span>
          <a href="/licenses/Tinted-Theming-MIT.txt">
            Theme credits <ArrowUpRight size={11} />
          </a>
        </div>
      </footer>
    </>
  );
}
