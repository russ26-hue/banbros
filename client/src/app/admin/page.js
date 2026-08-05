import { cookies, headers } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  // Trust the proxy's forwarded protocol when present (Render and most hosts
  // set this), and fall back to http. Deriving this from NODE_ENV instead
  // breaks when running a production build locally, where there is no SSL.
  const protocol = headersList.get("x-forwarded-proto") || "http";

  const res = await fetch(`${protocol}://${host}/api/me`, {
    headers: {
      Cookie: `token=${cookieStore.get("token")?.value || ""}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export default async function AdminHomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-2">
        Welcome, {user?.name || "Admin"}
      </h1>
      <p className="text-text-muted">
        Use the sidebar to manage Products, News, and CMS content.
      </p>
    </div>
  );
}
