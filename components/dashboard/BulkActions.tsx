"use client";

import { useState } from "react";
import axios from "axios";
import { Email } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Info, Send, Zap } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface BulkActionsProps {
  selectedEmails: Email[];
  onClear: () => void;
}

type MessageType = "success" | "error" | "info";

interface Message {
  type: MessageType;
  text: string;
}

export function BulkActions({ selectedEmails, onClear }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleSendInitialEmail = async () => {
    if (!process.env.NEXT_PUBLIC_WEBHOOK_N8N) {
      setMessage({
        type: "error",
        text: "Webhook URL not configured. Please set it in Settings.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.post(process.env.NEXT_PUBLIC_WEBHOOK_N8N, {
        emails: selectedEmails,
      });

      setMessage({
        type: "success",
        text: `Successfully sent ${selectedEmails.length} email(s)`,
      });

      setTimeout(() => {
        onClear();
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send emails. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWebhookTrigger = () => {
    setMessage({
      type: "info",
      text: "Webhook trigger placeholder - will trigger n8n workflow with selected emails",
    });
  };

  if (selectedEmails.length === 0) {
    return null;
  }

  const messageIcons: Record<MessageType, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  const messageBgs: Record<MessageType, string> = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <Card className="border-gray-200 bg-white p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {selectedEmails.length} email{selectedEmails.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-center gap-3 rounded-lg border p-3 ${messageBgs[message.type]}`}
          >
            {messageIcons[message.type]}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSendInitialEmail} disabled={loading} className="gap-2">
            {loading ? <LoadingSpinner /> : <Send className="h-4 w-4" />}
            Send Initial Email
          </Button>

          <Button
            onClick={handleWebhookTrigger}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Webhook Trigger
          </Button>

          <Button onClick={onClear} disabled={loading} variant="outline">
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}
