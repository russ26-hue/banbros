import { cookies } from "next/headers";
import AddAdminForm from "@/components/AddAdminForm";
import AdminUserRow from "@/components/AdminUserRow";

async function getUsers() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: { Authorization: `Bearer ${token?.value || ""}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch users (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.users;
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Admin Management</h1>

      <div className="mb-8">
        <AddAdminForm />
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Name</th>
              <th className="px-4 py-3 font-semibold text-navy">Email</th>
              <th className="px-4 py-3 font-semibold text-navy">Role</th>
              <th className="px-4 py-3 font-semibold text-navy">Active</th>
              <th className="px-4 py-3 font-semibold text-navy text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <AdminUserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
