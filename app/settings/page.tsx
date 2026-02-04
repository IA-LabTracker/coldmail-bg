"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Settings } from "@/types";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type FeedbackMessage = { type: "success" | "error"; text: string } | null;

const settingsSchema = z.object({
  webhookUrl: z.string().url("Enter a valid URL").or(z.literal("")),
  emailTemplate: z.string().optional(),
  linkedinWebhookUrl: z.string().url("Enter a valid URL").or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackMessage>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { webhookUrl: "", emailTemplate: "", linkedinWebhookUrl: "" },
  });

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
          form.reset({
            webhookUrl: data.webhook_url || "",
            emailTemplate: data.email_template || "",
            linkedinWebhookUrl: data.linkedin_webhook_url || "",
          });
        } else {
          const { data: newSettings, error: createError } = await supabase
            .from("settings")
            .upsert({ user_id: user.id }, { onConflict: "user_id" })
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings);
        }
      } catch (error) {
        setFeedback({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to load settings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const onSubmit = async (values: SettingsFormValues) => {
    if (!user || !settings) return;

    setFeedback(null);

    try {
      const { error } = await supabase
        .from("settings")
        .update({
          webhook_url: values.webhookUrl,
          email_template: values.emailTemplate,
          linkedin_webhook_url: values.linkedinWebhookUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setFeedback({ type: "success", text: "Settings saved successfully" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save settings",
      });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">Configure webhooks and email templates</p>
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                feedback.type === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              {feedback.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
              {feedback.type === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
              <p className={feedback.type === "error" ? "text-red-800" : "text-green-800"}>
                {feedback.text}
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="webhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook URL</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://your-n8n-instance.com/webhook/..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Get this URL from your n8n workflow webhook node
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="emailTemplate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Template</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={`Hi {{company}},\n\nI noticed you're in the {{industry}} space. I think our solution could help...\n\nBest regards`}
                                className="min-h-48"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Available variables: {"{{company}}"}, {"{{email}}"}, {"{{region}}"},{" "}
                              {"{{industry}}"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="linkedinWebhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn Webhook URL</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://your-n8n-instance.com/webhook/..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Get this URL from your n8n LinkedIn workflow webhook node
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Settings"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
