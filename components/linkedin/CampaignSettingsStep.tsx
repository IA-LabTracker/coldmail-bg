"use client";

import { LinkedInLead } from "@/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

interface CampaignSettingsStepProps {
  campaignName: string;
  onCampaignNameChange: (name: string) => void;
  delaySeconds: number;
  onDelayChange: (delay: number) => void;
  maxLeads: number;
  onMaxLeadsChange: (max: number) => void;
  totalLeads: number;
}

export function CampaignSettingsStep({
  campaignName,
  onCampaignNameChange,
  delaySeconds,
  onDelayChange,
  maxLeads,
  onMaxLeadsChange,
  totalLeads,
}: CampaignSettingsStepProps) {
  const leadsToSend = maxLeads === 0 ? totalLeads : Math.min(maxLeads, totalLeads);
  const estimatedMinutes = Math.ceil((leadsToSend * delaySeconds) / 60);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Step 4: Campaign Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700">
            Campaign Name
          </label>
          <Input
            id="campaign-name"
            type="text"
            value={campaignName}
            onChange={(e) => onCampaignNameChange(e.target.value)}
            placeholder="e.g., Q1 Tech Outreach"
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="delay" className="block text-sm font-medium text-gray-700">
            Delay Between Messages (seconds)
          </label>
          <Input
            id="delay"
            type="number"
            min="30"
            max="300"
            value={delaySeconds}
            onChange={(e) => onDelayChange(parseInt(e.target.value) || 90)}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">Between 30 and 300 seconds</p>
        </div>

        <div>
          <label htmlFor="max-leads" className="block text-sm font-medium text-gray-700">
            Max Leads to Send (0 = all)
          </label>
          <Input
            id="max-leads"
            type="number"
            min="0"
            value={maxLeads}
            onChange={(e) => onMaxLeadsChange(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        <div className="space-y-2 rounded-lg bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">Campaign Summary</p>
          <div className="space-y-1 text-sm text-blue-800">
            <p>Leads to send: {leadsToSend}</p>
            <p>Delay per message: {delaySeconds}s</p>
            <p>Estimated duration: {estimatedMinutes} minutes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
