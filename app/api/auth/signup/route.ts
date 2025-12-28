import { NextRequest, NextResponse } from "next/server";
import { Sdk } from "@/src/backend/RESTful/BackendRESTfulSDK";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const api = new Sdk({
      baseURL: process.env.SERVER_URL,
      securityWorker: async () => ({
        headers: {
          Authorization: `Bearer ${process.env.LOCAL_AUTHENTICATION_KEY}`,
        },
      }),
    });

    const response = await api.authentication.authControllerSignup(body);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Signup proxy error:", error);
    return NextResponse.json(
      { message: "Failed to connect to authentication server. Please ensure the backend is running." },
      { status: 503 }
    );
  }
}
