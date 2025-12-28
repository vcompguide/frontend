import { NextRequest, NextResponse } from "next/server";
import { Sdk } from "@/src/backend/RESTful/BackendRESTfulSDK";

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		
		if (!authHeader) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const api = new Sdk({
			baseURL: process.env.SERVER_URL,
			securityWorker: async () => ({
				headers: {
					Authorization: authHeader,
				},
			}),
		});

		const response = await api.user.usersControllerGetMe();
		return NextResponse.json(response.data);
	} catch (error) {
		console.error("Get user profile error:", error);
		return NextResponse.json({ message: "Internal server error" }, { status: 500 });
	}
}
