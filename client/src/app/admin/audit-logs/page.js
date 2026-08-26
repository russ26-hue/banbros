import Link from "next/link";
import { cookies } from "next/headers";
import AuditLogFilterBar from "@/components/AuditLogFilterBar";

async function fetchWithAuth(url) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token?.value || ""}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Request failed (${res.status}): ${errorBody}`);
  }
  return res.json();
}

async function getLogs(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("limit", "50");

  return fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/audit-logs?${params.toString()}`,
  );
}

async function getFilterOptions() {
  try {
    return await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/audit-logs/filters`,
    );
  } catch {
    return { actions: [], resources: [] };
  }
}

// Colour-code the action so security-relevant entries stand out from
// routine content edits.
function actionStyle(action) {
  if (action.startsWith("login_failed") || action.includes("locked")) {
    return "bg-red-50 text-red-700";
  }
  if (action.startsWith("admin_")) {
    return "bg-amber-50 text-amber-700";
  }
  if (action.includes("delete")) {
    return "bg-red-50 text-red-700";
  }
  if (action.includes("create")) {
    return "bg-green-50 text-green-700";
  }
  return "bg-surface text-navy";
}

function humanise(value) {
  return value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

// details is a JSON blob whose shape varies by action, so render whatever
// key/value pairs happen to be there rather than assuming a fixed schema.
function formatDetails(details) {
  if (!details || typeof details !== "object") return null;
  const entries = Object.entries(details);
  if (entries.length === 0) return null;
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(" · ");
}

export default async function AuditLogsPage({ searchParams }) {
  const params = await searchParams;
  const filters = {
    userEmail: params?.userEmail || "",
    action: params?.action || "",
    resource: params?.resource || "",
    dateFrom: params?.dateFrom || "",
    dateTo: params?.dateTo || "",
    page: params?.page || "1",
  };
  const page = parseInt(filters.page, 10);

  const [logsData, filterOptions] = await Promise.all([
    getLogs(filters),
    getFilterOptions(),
  ]);

  const logs = logsData.logs || [];
  const total = logsData.total ?? logs.length;
  const limit = logsData.limit || 50;
  const totalPages = Math.ceil(total / limit);

  function pageHref(pageNum) {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "page") p.set(key, value);
    });
    if (pageNum > 1) p.set("page", String(pageNum));
    return `/admin/audit-logs${p.toString() ? `?${p.toString()}` : ""}`;
  }

  const windowSize = 2;
  const pageNumbers = [];
  for (
    let i = Math.max(1, page - windowSize);
    i <= Math.min(totalPages, page + windowSize);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Activity Log</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {total.toLocaleString()} recorded {total === 1 ? "entry" : "entries"}
        </p>
      </div>

      <AuditLogFilterBar
        actions={filterOptions.actions || []}
        resources={filterOptions.resources || []}
      />

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy whitespace-nowrap">
                When
              </th>
              <th className="px-4 py-3 font-semibold text-navy">User</th>
              <th className="px-4 py-3 font-semibold text-navy">Action</th>
              <th className="px-4 py-3 font-semibold text-navy">Details</th>
              <th className="px-4 py-3 font-semibold text-navy whitespace-nowrap">
                IP address
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border align-top">
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("en-PH", {
                    timeZone: "Asia/Manila",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-navy">{log.user_email || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${actionStyle(
                      log.action,
                    )}`}
                  >
                    {humanise(log.action)}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted max-w-md">
                  {log.resource && (
                    <span className="text-navy">{humanise(log.resource)}</span>
                  )}
                  {log.resource && formatDetails(log.details) && " — "}
                  {formatDetails(log.details)}
                  {!log.resource && !formatDetails(log.details) && "—"}
                </td>
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                  {log.ip_address || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <p className="text-center text-text-muted py-10">
            No activity matches these filters.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
            >
              ‹ Prev
            </Link>
          )}

          {pageNumbers[0] > 1 && (
            <>
              <Link
                href={pageHref(1)}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
              >
                1
              </Link>
              {pageNumbers[0] > 2 && (
                <span className="text-text-muted px-1">…</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <Link
              key={pageNum}
              href={pageHref(pageNum)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pageNum === page
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-navy hover:bg-surface"
              }`}
            >
              {pageNum}
            </Link>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="text-text-muted px-1">…</span>
              )}
              <Link
                href={pageHref(totalPages)}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
              >
                {totalPages}
              </Link>
            </>
          )}

          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
            >
              Next ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
