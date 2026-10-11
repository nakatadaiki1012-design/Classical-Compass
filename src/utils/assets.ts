/**
 * Utility to resolve static asset paths for Vite dev server, production builds, and GitHub Pages.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!cleanBase || cleanBase === '.') {
    return `.${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
}
