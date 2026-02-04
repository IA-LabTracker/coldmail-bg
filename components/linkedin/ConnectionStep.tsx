"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CheckCircle, AlertCircle, LinkIcon } from "lucide-react";

interface ConnectionStepProps {
  accountId: string | null;
  onAccountIdChange: (id: string | null) => void;
}

export function ConnectionStep({ accountId, onAccountIdChange }: ConnectionStepProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch("/api/unipile-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({
          success_redirect_url: `${window.location.origin}/linkedin?connected=true`,
          failure_redirect_url: `${window.location.origin}/linkedin?connected=false`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create auth link");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No OAuth URL returned from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect LinkedIn");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      await supabase.from("settings").update({ linkedin_account_id: null }).eq("user_id", user.id);

      onAccountIdChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Step 1: LinkedIn Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {accountId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Connected</p>
                <p className="text-sm text-green-700">Account ID: {accountId}</p>
              </div>
            </div>

            <Button
              onClick={handleDisconnect}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <LoadingSpinner /> : "Disconnect LinkedIn"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect your LinkedIn account via Unipile to start building campaigns
            </p>

            <Button onClick={handleConnect} disabled={loading} className="w-full gap-2">
              {loading ? <LoadingSpinner /> : <LinkIcon className="h-4 w-4" />}
              Connect LinkedIn
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
