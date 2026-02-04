import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

interface RequestBody {
  success_redirect_url: string;
  failure_redirect_url: string;
}

function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const appHost = process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : null;
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (parsed.host === "localhost" ||
        parsed.host.startsWith("localhost:") ||
        (appHost !== null && parsed.host === appHost))
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication via Supabase token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RequestBody = await request.json();
    const { success_redirect_url, failure_redirect_url } = body;

    // Validate redirect URLs to prevent open redirect attacks
    if (
      !isAllowedRedirectUrl(success_redirect_url) ||
      !isAllowedRedirectUrl(failure_redirect_url)
    ) {
      return NextResponse.json({ error: "Invalid redirect URL" }, { status: 400 });
    }

    const unipileDsn = process.env.UNIPILE_DSN;
    const unipileApiKey = process.env.UNIPILE_API_KEY;

    if (!unipileDsn || !unipileApiKey) {
      return NextResponse.json({ error: "Unipile credentials not configured" }, { status: 500 });
    }

    // Build the notify_url for Unipile to call after successful connection
    const requestUrl = new URL(request.url);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${requestUrl.protocol}//${requestUrl.host}`;
    const webhookSecret = process.env.UNIPILE_WEBHOOK_SECRET;
    const notifyUrl = webhookSecret
      ? `${appUrl}/api/unipile-callback?secret=${encodeURIComponent(webhookSecret)}`
      : `${appUrl}/api/unipile-callback`;

    const response = await axios.post(
      `https://${unipileDsn}/api/v1/hosted/accounts/link`,
      {
        type: "create",
        api_url: `https://${unipileDsn}`,
        providers: ["LINKEDIN"],
        expiresOn: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        success_redirect_url,
        failure_redirect_url,
        notify_url: notifyUrl,
        name: user.id,
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
    return NextResponse.json({ error: "Failed to create auth link" }, { status: 500 });
  }
}
