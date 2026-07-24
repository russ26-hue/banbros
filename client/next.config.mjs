/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async headers() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
      : "http://localhost:4000";

    const isDev = process.env.NODE_ENV !== "production";

    const csp = [
      `default-src 'self'`,
      // 'unsafe-eval' is required in dev for Next.js Fast Refresh; not included in production.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      // 'unsafe-inline' is needed for Next.js's own injected styles and any inline style={{}} usage.
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: ${apiOrigin}`,
      `font-src 'self' data:`,
      `connect-src 'self' ${apiOrigin}`,
      `object-src 'none'`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
