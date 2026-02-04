"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LinkedInLead, Settings } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { ConnectionStep } from "@/components/linkedin/ConnectionStep";
import { UploadStep } from "@/components/linkedin/UploadStep";
import { TemplateStep } from "@/components/linkedin/TemplateStep";
import { CampaignSettingsStep } from "@/components/linkedin/CampaignSettingsStep";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import axios from "axios";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function LinkedInPage() {
  const { user } = useAuth();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [leads, setLeads] = useState<LinkedInLead[]>([]);
  const [template, setTemplate] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(90);
  const [maxLeads, setMaxLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      setLoading(true);

      try {
        const { data } = await supabase
          .from("settings")
          .select("linkedin_account_id, linkedin_webhook_url")
          .eq("user_id", user.id)
          .maybeSingle();

        setAccountId(data?.linkedin_account_id || null);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      params.delete("connected");
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchSettings();
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !accountId || leads.length === 0 || !template || !campaignName) {
      setSubmitMessage("Please complete all steps first");
      return;
    }

    setSubmitStatus("submitting");
    setSubmitMessage("");

    try {
      const { data: settings } = await supabase
        .from("settings")
        .select("linkedin_webhook_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!settings?.linkedin_webhook_url) {
        throw new Error("LinkedIn webhook URL not configured in Settings");
      }

      await axios.post(settings.linkedin_webhook_url, {
        userId: user.id,
        linkedinAccountId: accountId,
        leads,
        messageTemplate: template,
        delaySeconds,
        campaignName,
      });

      setSubmitStatus("success");
      setSubmitMessage("Campaign submitted successfully!");

      setTimeout(() => {
        setLeads([]);
        setTemplate("");
        setCampaignName("");
        setDelaySeconds(90);
        setMaxLeads(0);
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Failed to submit campaign"
      );
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
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LinkedIn Campaign</h1>
            <p className="mt-2 text-gray-600">Create and manage LinkedIn outreach campaigns</p>
          </div>

          {submitMessage && (
            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                submitStatus === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              {submitStatus === "error" && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              {submitStatus === "success" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <p
                className={
                  submitStatus === "error" ? "text-red-800" : "text-green-800"
                }
              >
                {submitMessage}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <ConnectionStep
              accountId={accountId}
              onAccountIdChange={setAccountId}
            />

            {accountId && (
              <>
                <UploadStep leads={leads} onLeadsChange={setLeads} />

                {leads.length > 0 && (
                  <>
                    <TemplateStep
                      template={template}
                      onTemplateChange={setTemplate}
                      firstLead={leads[0]}
                    />

                    <CampaignSettingsStep
                      campaignName={campaignName}
                      onCampaignNameChange={setCampaignName}
                      delaySeconds={delaySeconds}
                      onDelayChange={setDelaySeconds}
                      maxLeads={maxLeads}
                      onMaxLeadsChange={setMaxLeads}
                      totalLeads={leads.length}
                    />

                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-6">
                        <Button
                          onClick={handleSubmit}
                          disabled={submitStatus === "submitting"}
                          className="w-full gap-2"
                        >
                          {submitStatus === "submitting" ? (
                            <LoadingSpinner />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          {submitStatus === "submitting"
                            ? "Submitting..."
                            : "Submit Campaign"}
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
