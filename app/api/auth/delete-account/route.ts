import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch("http://localhost:9000/api/auth/delete-account", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { "Authorization": authHeader }),
      },
    });

    if (response.status === 204 || response.status === 200) {
      return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Delete account proxy error:", error);
    return NextResponse.json(
      { message: "Failed to connect to authentication server." },
      { status: 503 }
    );
  }
}
