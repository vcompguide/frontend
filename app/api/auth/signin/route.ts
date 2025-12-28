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

		const response = await api.authentication.authControllerSignin(body);

		return NextResponse.json(response.data);
	} catch (error) {
		console.error("Sign in proxy error:", error);
		return NextResponse.json({ message: "Internal server error" }, { status: 500 });
	}
}
