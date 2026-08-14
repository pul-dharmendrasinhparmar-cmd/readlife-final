import type { SocialLinks } from "./types";

export type SocialPlatform = keyof SocialLinks;

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "tiktok",
  "youtube",
  "goodreads",
];

export function cleanSocialHandle(raw: string): string {
  return raw.trim().replace(/^@+/, "").replace(/\/+$/, "");
}

/** Build a profile URL from a username or pasted full link. */
export function socialProfileUrl(
  platform: SocialPlatform,
  raw: string,
): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const handle = cleanSocialHandle(value);
  if (!handle) return null;

  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
    case "tiktok":
      return `https://www.tiktok.com/@${encodeURIComponent(handle)}`;
    case "youtube":
      return handle.startsWith("UC")
        ? `https://www.youtube.com/channel/${encodeURIComponent(handle)}`
        : `https://www.youtube.com/@${encodeURIComponent(handle)}`;
    case "goodreads":
      return `https://www.goodreads.com/${encodeURIComponent(handle)}`;
    default:
      return null;
  }
}

export function activeSocialLinks(
  links: SocialLinks | undefined | null,
): { platform: SocialPlatform; href: string }[] {
  if (!links) return [];
  const out: { platform: SocialPlatform; href: string }[] = [];
  for (const platform of SOCIAL_PLATFORMS) {
    const raw = links[platform];
    if (!raw?.trim()) continue;
    const href = socialProfileUrl(platform, raw);
    if (href) out.push({ platform, href });
  }
  return out;
}

export function SocialPlatformIcon({
  platform,
  className = "h-3.5 w-3.5",
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className,
    "aria-hidden": true as const,
  };

  switch (platform) {
    case "instagram":
      return (
        <svg {...common}>
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.75A3.75 3.75 0 0 0 3.75 7.5v9A3.75 3.75 0 0 0 7.5 20.25h9A3.75 3.75 0 0 0 20.25 16.5v-9A3.75 3.75 0 0 0 16.5 3.75h-9Z" />
          <path d="M12 7.25A4.75 4.75 0 1 1 7.25 12 4.75 4.75 0 0 1 12 7.25Zm0 1.75A3 3 0 1 0 15 12a3 3 0 0 0-3-3Z" />
          <circle cx="17.35" cy="6.65" r="1.1" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14.2 3h2.1c.2 1.7 1.2 3.2 2.7 4.1v2.2a6.7 6.7 0 0 1-2.7-.7v6.3A5.9 5.9 0 1 1 9 9.1v2.3a3.6 3.6 0 1 0 2.7 3.5V3Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18.1 5 12 5 12 5s-6.1 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C5.9 19 12 19 12 19s6.1 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
        </svg>
      );
    case "goodreads":
      return (
        <svg {...common}>
          {/* Classic Goodreads-style lowercase g */}
          <path d="M12.15 3c-4.05 0-6.65 2.55-6.65 6.45 0 3.7 2.25 6.05 5.85 6.05 1.25 0 2.35-.3 3.2-.85v1.15c0 2.55-1.25 3.9-3.65 3.9-1.55 0-2.85-.35-4-.85v2.25c1.25.5 2.65.75 4.2.75 3.9 0 6.05-2.1 6.05-5.7V4.45h-2.2c-.15.85-.35 1.7-.4 2.55C14.7 3.8 13.3 3 12.15 3Zm.35 2.2c2.3 0 3.75 1.7 3.75 4.3 0 2.7-1.45 4.4-3.75 4.4-2.25 0-3.7-1.7-3.7-4.3 0-2.7 1.45-4.4 3.7-4.4Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function SocialLinkIcons({
  links,
  className = "",
}: {
  links: SocialLinks | undefined | null;
  className?: string;
}) {
  const active = activeSocialLinks(links);
  if (!active.length) return null;

  const labels: Record<SocialPlatform, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    goodreads: "Goodreads",
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {active.map(({ platform, href }) => (
        <a
          key={platform}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${labels[platform]} profile`}
          title={labels[platform]}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink/75 transition hover:bg-forest/25 hover:text-ink"
          onClick={(e) => e.stopPropagation()}
        >
          <SocialPlatformIcon platform={platform} />
        </a>
      ))}
    </span>
  );
}
