const fallbackHost = "katalog-delvian.vercel.app";

export function getSiteUrl() {
  const configured = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!configured) return new URL(`https://${fallbackHost}`);

  const value = configured.includes("://") ? configured : `https://${configured}`;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) return url;
  } catch {
    // Use the stable production domain when a deployment variable is malformed.
  }
  return new URL(`https://${fallbackHost}`);
}
