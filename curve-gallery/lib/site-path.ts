// Both the development server and production build mount the atlas at /curves/.
export const atlasBasePath = (import.meta.env.VITE_CURVE_ATLAS_BASE_PATH ?? "/curves").replace(
  /\/$/,
  "",
);
export function atlasHref(href: string): string {
  if (!atlasBasePath || !href.startsWith("/") || href.startsWith("//")) return href;
  return `${atlasBasePath}${href}`;
}
