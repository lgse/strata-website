import catalog from './themes.json';

export type Theme = (typeof catalog)[number];
export const themes: Theme[] = catalog;
// A curated shortlist, not a claim of measured popularity rankings.
// Keep the full app catalog for product counts and existing saved preferences.
export const siteThemeIds = [
  'tokyo-night',
  'catppuccin',
  'dracula',
  'nord',
  'gruvbox-dark-hard',
  'rose-pine',
  'everforest',
  'monokai',
  'solarized-dark',
  'solarized-light',
] as const;
export const siteThemes = siteThemeIds.map((id) => {
  const theme = themes.find((theme) => theme.id === id);
  if (!theme) throw new Error(`Missing curated theme: ${id}`);
  return theme;
});
export const defaultTheme = themes.find((theme) => theme.id === 'tokyo-night')!;
export const themeStorageKey = 'strata-site-theme';

export function isLight(theme: Theme) {
  const rgb = theme.background.match(/[a-f\d]{2}/gi)!.map((hex) => parseInt(hex, 16) / 255);
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 0.55;
}

export function accentForeground(hex: string) {
  const rgb = hex.match(/[a-f\d]{2}/gi)!.map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179 ? '#000000' : '#ffffff';
}

export function themeVariables(theme: Theme): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries(theme)
        .filter(([key]) => !['id', 'name'].includes(key))
        .map(([key, value]) => [`--${key.replaceAll('_', '-')}`, value]),
    ),
    '--contrast': isLight(theme) ? '#10121b' : '#ffffff',
    '--shade': isLight(theme) ? '#ffffff' : '#080911',
    '--faint-weight': isLight(theme) ? '82%' : '68%',
    '--soft-weight': isLight(theme) ? '88%' : '76%',
    '--on-accent': accentForeground(theme.accent),
    'color-scheme': isLight(theme) ? 'light' : 'dark',
  };
}

export function applyTheme(theme: Theme) {
  for (const [key, value] of Object.entries(themeVariables(theme)))
    document.documentElement.style.setProperty(key, value);
  document.documentElement.dataset.theme = theme.id;
  document.documentElement.style.colorScheme = isLight(theme) ? 'light' : 'dark';
}

// Runs before the first paint. User values only select a trusted bundled palette.
const bootPalettes = JSON.stringify(
  Object.fromEntries(themes.map((theme) => [theme.id, themeVariables(theme)])),
).replaceAll('<', '\\u003c');
export const themeBootScript = `(()=>{try{const palettes=${bootPalettes};const id=localStorage.getItem('${themeStorageKey}');if(!Object.hasOwn(palettes,id))return;for(const[k,v]of Object.entries(palettes[id]))document.documentElement.style.setProperty(k,v);document.documentElement.dataset.theme=id}catch{}})();`;
