import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface UnipileCallbackBody {
  status: string;
  account_id: string;
  name: string; // maps to our user_id
}

export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret via query parameter
    const secret = request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.UNIPILE_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UnipileCallbackBody = await request.json();
    const { status, account_id, name: userId } = body;

    if (status !== "CREATION_SUCCESS" && status !== "RECONNECTED") {
      return NextResponse.json({ ok: true });
    }

    if (!account_id || !userId) {
      return NextResponse.json({ error: "Missing account_id or name" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Use service role to bypass RLS (this is a server-to-server call from Unipile)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("settings")
      .upsert({ user_id: userId, linkedin_account_id: account_id }, { onConflict: "user_id" });

    if (error) {
      return NextResponse.json({ error: "Failed to save account" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
