import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/contact/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
