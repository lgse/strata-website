import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { defaultTheme, themeBootScript, themes, themeVariables } from '@/lib/themes';
import './globals.css';

const geist = localFont({
  src: '../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
});
const mono = localFont({
  src: '../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-jetbrains',
  weight: '100 800',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'http://localhost:3000'),
  ),
  title: 'Strata: Navigate every layer.',
  description: `Meet your new flow. Strata is a fast, keyboard-first Linux file manager built with Rust and GTK4. Miller columns, rich sandboxed previews, and ${themes.length} beautiful themes.`,
  applicationName: 'Strata',
  icons: { icon: '/brand/strata.svg', apple: '/brand/strata.svg' },
  openGraph: {
    title: 'Strata: Navigate every layer.',
    description:
      'A file manager that moves like you think. Native Linux. Rust + GTK4. Entirely yours.',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strata: Navigate every layer.',
    description: 'A file manager that moves like you think.',
    images: ['/opengraph-image'],
  },
};
export const viewport: Viewport = { themeColor: '#16161e', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="tokyo-night"
      style={themeVariables(defaultTheme)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${geist.variable} ${mono.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
