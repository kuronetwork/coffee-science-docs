/**
 * URL helper。
 * 確保所有內部連結在 `useCustomDomain` 切換時都不會破。
 * 不要 hard-code `/foo`，一律用 url('/foo')。
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || '/';
}
