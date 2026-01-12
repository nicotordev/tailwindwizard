// next.config.ts
import type { NextConfig } from "next";
import path from "node:path";

type RemotePattern = {
  /**
   * Must be `http` or `https`.
   */
  protocol?: "http" | "https";
  /**
   * Can be literal or wildcard.
   * Single `*` matches a single subdomain.
   * Double `**` matches any number of subdomains.
   */
  hostname: string;
  /**
   * Can be literal port such as `8080` or empty string
   * meaning no port.
   */
  port?: string;
  /**
   * Can be literal or wildcard.
   * Single `*` matches a single path segment.
   * Double `**` matches any number of path segments.
   */
  pathname?: string;
  /**
   * Can be literal query string such as `?v=1` or
   * empty string meaning no query string.
   */
  search?: string;
};

function parseAllowedHosts(csv: string | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function toRemotePatterns(
  hosts: string[],
  protocol: "http" | "https"
): RemotePattern[] {
  return hosts.map((hostname) => ({
    protocol,
    hostname,
    pathname: "/**",
  }));
}

const isProd = process.env.NODE_ENV === "production";

const publicAssetHosts = parseAllowedHosts(
  process.env.NEXT_PUBLIC_IMAGE_HOSTS ??
    process.env.NEXT_PUBLIC_ASSET_HOSTS ??
    process.env.NEXT_PUBLIC_CDN_HOSTS
);

const allowedDevOrigins = parseAllowedHosts(
  process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS
);

const serverActionAllowedOrigins = parseAllowedHosts(
  process.env.NEXT_PUBLIC_SERVER_ACTION_ALLOWED_ORIGINS
);

const securityHeaders: Array<{ key: string; value: string }> = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "battery=()",
      "camera=()",
      "display-capture=()",
      "document-domain=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=()",
      "publickey-credentials-get=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // ✅ Keep Turbopack happy (explicit)
  turbopack: {},

  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,

  // Monorepo-friendly
  outputFileTracingRoot: path.resolve(process.cwd(), "../../"),

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...toRemotePatterns(publicAssetHosts, "https"),
      ...(isProd
        ? []
        : [
            {
              protocol: "http" as const,
              hostname: "localhost",
              port: "3000",
              pathname: "/**",
            },
            {
              protocol: "https" as const,
              hostname: "ui.shadcn.com",
              pathname: "/**",
            },
          ]),
    ],
  },

  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),

  experimental: {
    typedEnv: true,
    serverActions: {
      bodySizeLimit: "2mb",
      ...(serverActionAllowedOrigins.length > 0
        ? { allowedOrigins: serverActionAllowedOrigins }
        : {}),
    },
  },

  logging: {
    incomingRequests: {
      ignore: [
        /^\/_next\/static\//,
        /^\/_next\/image\//,
        /^\/favicon\.ico$/,
        /^\/robots\.txt$/,
        /^\/sitemap\.xml$/,
      ],
    },
    fetches: {
      fullUrl: false,
      hmrRefreshes: false,
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
