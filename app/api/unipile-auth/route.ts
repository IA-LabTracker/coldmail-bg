import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface RequestBody {
  success_redirect_url: string;
  failure_redirect_url: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { success_redirect_url, failure_redirect_url } = body;

    const unipileDsn = process.env.UNIPILE_DSN;
    const unipileApiKey = process.env.UNIPILE_API_KEY;

    if (!unipileDsn || !unipileApiKey) {
      return NextResponse.json(
        { error: "Unipile credentials not configured" },
        { status: 500 },
      );
    }

    const response = await axios.post(
      `https://${unipileDsn}/api/v1/hosted/accounts/link`,
      {
        type: "create",
        api_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        providers: ["LINKEDIN"],
        expiresOn: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        success_redirect_url,
        failure_redirect_url,
      },
      {
        headers: {
          "X-API-KEY": unipileApiKey,
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json({ url: response.data.url });
  } catch (error) {
    console.error("Unipile auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create auth link" },
      { status: 500 },
    );
  }
}
