// Small illustrative fixtures, not excerpts from Strata's implementation.
export const demoCode: Record<
  string,
  { language: 'json' | 'rust' | 'toml'; mime: string; text: string }
> = {
  'colors.json': {
    language: 'json',
    mime: 'application/json',
    text: JSON.stringify(
      {
        name: 'Tokyo Night',
        colors: {
          background: '#1a1b26',
          foreground: '#c0caf5',
          accent: '#7aa2f7',
          green: '#9ece6a',
          purple: '#bb9af7',
        },
        dark: true,
        version: 1,
      },
      null,
      2,
    ),
  },
  'main.rs': {
    language: 'rust',
    mime: 'text/x-rust',
    text: `// A little closer to the metal.
use strata::App;
use strata::theme::Theme;

fn main() {
    let app = App::new();

    app
        .native(true)
        .theme(Theme::TokyoNight)
        .navigate();
}`,
  },
  'theme.rs': {
    language: 'rust',
    mime: 'text/x-rust',
    text: `// A palette for late-night exploring.
pub struct Theme {
    pub background: &'static str,
    pub accent: &'static str,
}

impl Theme {
    pub fn tokyo_night() -> Self {
        Self {
            background: "#1a1b26",
            accent: "#7aa2f7",
        }
    }
}`,
  },
  'browser.rs': {
    language: 'rust',
    mime: 'text/x-rust',
    text: `use std::path::PathBuf;

pub struct Browser {
    location: PathBuf,
}

impl Browser {
    pub fn navigate(&mut self, path: PathBuf) {
        self.location = path;
    }
}`,
  },
  'Cargo.toml': {
    language: 'toml',
    mime: 'application/toml',
    text: `# Illustrative project manifest.
[package]
name = "strata-demo"
version = "1.0.0"
edition = "2024"

[dependencies]
gtk = { package = "gtk4", version = "0.10" }`,
  },
};

export type CodeToken = { text: string; kind?: string };

// Tokenize only the small, single-line constructs used in the fixtures above.
// React renders token text directly: no HTML injection or highlighting runtime.
export function highlightDemoLine(line: string, language: 'json' | 'rust' | 'toml'): CodeToken[] {
  const pattern =
    /"(?:\\.|[^"\\])*"|\/\/.*$|#.*$|'[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|[^\w\s]/g;
  const tokens: CodeToken[] = [];
  let end = 0;
  for (const match of line.matchAll(pattern)) {
    const text = match[0];
    const start = match.index;
    if (start > end) tokens.push({ text: line.slice(end, start) });
    const rest = line.slice(start + text.length);
    let kind: string | undefined;
    if (
      (language === 'rust' && text.startsWith('//')) ||
      (language === 'toml' && text.startsWith('#'))
    )
      kind = 'comment';
    else if (text.startsWith('"'))
      kind = language === 'json' && /^\s*:/.test(rest) ? 'property' : 'string';
    else if (/^(true|false|null)$/.test(text) || /^\d/.test(text)) kind = 'literal';
    else if (language === 'rust' && /^(use|pub|struct|impl|fn|let|mut|self)$/.test(text))
      kind = 'keyword';
    else if (language === 'rust' && (/^[A-Z]/.test(text) || text.startsWith("'"))) kind = 'type';
    else if (language === 'toml' && /^\s*=/.test(rest)) kind = 'property';
    else if (language === 'rust' && /^\s*\(/.test(rest)) kind = 'function';
    tokens.push({ text, kind });
    end = start + text.length;
  }
  if (end < line.length) tokens.push({ text: line.slice(end) });
  return tokens;
}
