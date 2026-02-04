"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Settings } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

type Status = "idle" | "running" | "completed" | "error";

export default function SearchPage() {
  const { user } = useAuth();
  const [region, setRegion] = useState("");
  const [industry, setIndustry] = useState("");
  const [keywords, setKeywords] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [webhookConfigured, setWebhookConfigured] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkWebhook = async () => {
      const { data } = await supabase
        .from("settings")
        .select("webhook_url")
        .eq("user_id", user.id)
        .maybeSingle();

      setWebhookConfigured(!!data?.webhook_url);
    };

    checkWebhook();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("running");
    setMessage("");

    try {
      if (!user) throw new Error("Not authenticated");

      const { data: settings } = await supabase
        .from("settings")
        .select("webhook_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!settings?.webhook_url) {
        throw new Error("Webhook URL not configured. Please configure it in Settings.");
      }

      const keywordsArray = keywords.split(",").map((k) => k.trim());

      await axios.post(settings.webhook_url, {
        region,
        industry,
        keywords: keywordsArray,
        campaign: campaignName,
      });

      setStatus("completed");
      setMessage(`Campaign "${campaignName || "Untitled"}" triggered successfully!`);

      setTimeout(() => {
        setStatus("idle");
        setRegion("");
        setIndustry("");
        setKeywords("");
        setCampaignName("");
        setMessage("");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to trigger campaign");
    }
  };

  const statusConfig = {
    idle: { icon: null, color: "" },
    running: { icon: <Loader className="h-5 w-5 animate-spin" />, color: "text-blue-600" },
    completed: { icon: <CheckCircle className="h-5 w-5" />, color: "text-green-600" },
    error: { icon: <AlertCircle className="h-5 w-5" />, color: "text-red-600" },
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search & Trigger</h1>
            <p className="mt-2 text-gray-600">Trigger n8n webhook to search for leads</p>
          </div>

          {!webhookConfigured && (
            <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Webhook URL not configured. Please{" "}
                <a href="/settings" className="font-medium underline">
                  configure it in Settings
                </a>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                    Region *
                  </label>
                  <Input
                    id="region"
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g., Brazil, USA, Europe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry *
                  </label>
                  <Input
                    id="industry"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Tech, Finance, Healthcare"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                    Keywords (comma-separated) *
                  </label>
                  <Textarea
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., automation, CRM, SaaS"
                    required
                    className="min-h-20"
                  />
                </div>

                <div>
                  <label htmlFor="campaign" className="block text-sm font-medium text-gray-700">
                    Campaign Name
                  </label>
                  <Input
                    id="campaign"
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Give your campaign a name (optional)"
                  />
                </div>
              </CardContent>
            </Card>

            {message && (
              <div
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  status === "error"
                    ? "border-red-200 bg-red-50"
                    : status === "completed"
                      ? "border-green-200 bg-green-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                {status === "running" && <Loader className="h-5 w-5 animate-spin text-blue-600" />}
                {status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {status === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                <p
                  className={
                    status === "error" ? "text-red-800" : status === "completed" ? "text-green-800" : "text-blue-800"
                  }
                >
                  {message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={status === "running" || !webhookConfigured}
              className="w-full"
            >
              {status === "running" ? <LoadingSpinner /> : "Trigger Campaign"}
            </Button>
          </form>

          {/* How it works */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Enter Search Criteria</p>
                    <p className="text-sm text-gray-600">Specify region, industry, and keywords</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Trigger Webhook</p>
                    <p className="text-sm text-gray-600">Send data to your n8n workflow</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Search for Leads</p>
                    <p className="text-sm text-gray-600">n8n finds matching leads automatically</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Receive Results</p>
                    <p className="text-sm text-gray-600">Leads appear in your dashboard</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
