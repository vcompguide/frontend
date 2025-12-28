import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    const response = await fetch("http://localhost:9000/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { "Authorization": authHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Change password proxy error:", error);
    return NextResponse.json(
      { message: "Failed to connect to authentication server." },
      { status: 503 }
    );
  }
}
