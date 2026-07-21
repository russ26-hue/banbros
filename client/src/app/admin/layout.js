import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

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

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isSuperAdmin = user.role === "super_admin";

  const navItems = [
    { label: "Products", href: "/admin/products" },
    { label: "Brands", href: "/admin/brands" },
    { label: "News", href: "/admin/news" },
    { label: "Careers", href: "/admin/careers" },
    { label: "CMS Content", href: "/admin/cms" },
    ...(isSuperAdmin
      ? [{ label: "Admin Management", href: "/admin/users" }]
      : []),
  ];

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-64 bg-navy text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="font-bold text-lg">Banbros Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-navy">{user.name}</p>
            <p className="text-xs text-text-muted capitalize">
              {user.role.replace("_", " ")}
            </p>
          </div>
          <AdminLogoutButton />
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
