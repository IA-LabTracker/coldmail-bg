"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Settings } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CheckCircle, AlertCircle } from "lucide-react";

type Message = { type: "success" | "error"; text: string } | null;

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const [webhookUrl, setWebhookUrl] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [linkedinWebhookUrl, setLinkedinWebhookUrl] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(data);
          setWebhookUrl(data.webhook_url);
          setEmailTemplate(data.email_template);
          setLinkedinWebhookUrl(data.linkedin_webhook_url || "");
        } else {
          const { data: newSettings, error: createError } = await supabase
            .from("settings")
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings);
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to load settings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("settings")
        .update({
          webhook_url: webhookUrl,
          email_template: emailTemplate,
          linkedin_webhook_url: linkedinWebhookUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Settings saved successfully",
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">Configure webhooks and email templates</p>
          </div>

          {message && (
            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
              }`}
            >
              {message.type === "success" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {message.type === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
              <p className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <Tabs defaultValue="webhook" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="webhook">n8n Webhook</TabsTrigger>
                <TabsTrigger value="email">Email Template</TabsTrigger>
                <TabsTrigger value="linkedin">LinkedIn Webhook</TabsTrigger>
              </TabsList>

              <TabsContent value="webhook">
                <Card>
                  <CardHeader>
                    <CardTitle>n8n Webhook Configuration</CardTitle>
                    <CardDescription>
                      Configure the webhook URL for n8n lead search integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700">
                        Webhook URL
                      </label>
                      <Input
                        id="webhook-url"
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-n8n-instance.com/webhook/..."
                        className="mt-1"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Get this URL from your n8n workflow webhook node
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Template</CardTitle>
                    <CardDescription>
                      Create a default email template for campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                        Email Template
                      </label>
                      <Textarea
                        id="template"
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        placeholder="Hi {{company}},

I noticed you're in the {{industry}} space. I think our solution could help...

Best regards"
                        className="min-h-48"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Available variables: {"{{company}}"}, {"{{email}}"}, {"{{region}}"}, {"{{industry}}"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="linkedin">
                <Card>
                  <CardHeader>
                    <CardTitle>LinkedIn Campaign Webhook</CardTitle>
                    <CardDescription>
                      Configure the webhook for LinkedIn campaign automation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="linkedin-webhook" className="block text-sm font-medium text-gray-700">
                        LinkedIn Webhook URL
                      </label>
                      <Input
                        id="linkedin-webhook"
                        type="url"
                        value={linkedinWebhookUrl}
                        onChange={(e) => setLinkedinWebhookUrl(e.target.value)}
                        placeholder="https://your-n8n-instance.com/webhook/..."
                        className="mt-1"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Get this URL from your n8n LinkedIn workflow webhook node
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <LoadingSpinner /> : "Save Settings"}
            </Button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
