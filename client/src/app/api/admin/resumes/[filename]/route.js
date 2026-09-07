import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  const { filename } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/careers/resumes/${encodeURIComponent(filename)}`,
    {
      headers: { Authorization: `Bearer ${token.value}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Resume not found or access denied." },
      { status: res.status },
    );
  }

  // Stream the file straight through, preserving its content type so PDFs
  // still open in the browser rather than downloading as unknown data.
  const blob = await res.blob();
  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type":
        res.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
