"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

type SubmitStatus = "idle" | "running" | "completed" | "error";

const searchSchema = z.object({
  region: z.string().min(1, "Region is required"),
  industry: z.string().min(1, "Industry is required"),
  keywords: z.string().min(1, "Keywords are required"),
  campaignName: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function SearchPage() {
  const { user } = useAuth();
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");
  const [webhookConfigured, setWebhookConfigured] = useState<boolean | null>(null);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { region: "", industry: "", keywords: "", campaignName: "" },
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const checkWebhook = async () => {
      const { data } = await supabase
        .from("settings")
        .select("webhook_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setWebhookConfigured(!!data?.webhook_url);
      }
    };

    checkWebhook();
    return () => { cancelled = true; };
  }, [user]);

  const onSubmit = async (values: SearchFormValues) => {
    setSubmitStatus("running");
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

      const keywordsArray = values.keywords.split(",").map((k) => k.trim());

      await axios.post(settings.webhook_url, {
        region: values.region,
        industry: values.industry,
        keywords: keywordsArray,
        campaign: values.campaignName,
      });

      setSubmitStatus("completed");
      setMessage(`Campaign "${values.campaignName || "Untitled"}" triggered successfully!`);

      setTimeout(() => {
        setSubmitStatus("idle");
        setMessage("");
        form.reset();
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to trigger campaign");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search & Trigger</h1>
            <p className="mt-2 text-gray-600">Trigger n8n webhook to search for leads</p>
          </div>

          {webhookConfigured === false && (
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Brazil, USA, Europe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Tech, Finance, Healthcare" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., automation, CRM, SaaS"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="campaignName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Give your campaign a name (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {message && (
                <div
                  className={`flex items-center gap-3 rounded-lg border p-4 ${
                    submitStatus === "error"
                      ? "border-red-200 bg-red-50"
                      : submitStatus === "completed"
                        ? "border-green-200 bg-green-50"
                        : "border-blue-200 bg-blue-50"
                  }`}
                >
                  {submitStatus === "running" && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                  {submitStatus === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {submitStatus === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <p
                    className={
                      submitStatus === "error"
                        ? "text-red-800"
                        : submitStatus === "completed"
                          ? "text-green-800"
                          : "text-blue-800"
                    }
                  >
                    {message}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitStatus === "running" || webhookConfigured !== true}
                className="w-full"
              >
                {submitStatus === "running" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Trigger Campaign"
                )}
              </Button>
            </form>
          </Form>

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
    </>
  );
}
