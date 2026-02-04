"use client";

import { useState } from "react";
import { Email } from "@/types";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

interface EmailDetailModalProps {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  sent: { bg: "bg-blue-100", text: "text-blue-800" },
  replied: { bg: "bg-green-100", text: "text-green-800" },
  bounced: { bg: "bg-red-100", text: "text-red-800" },
};

const classificationColors: Record<string, { bg: string; text: string }> = {
  hot: { bg: "bg-red-100", text: "text-red-800" },
  warm: { bg: "bg-yellow-100", text: "text-yellow-800" },
  cold: { bg: "bg-blue-100", text: "text-blue-800" },
};

export function EmailDetailModal({
  email,
  open,
  onOpenChange,
  onUpdate,
}: EmailDetailModalProps) {
  const [classification, setClassification] = useState<string>(
    email?.lead_classification || "cold",
  );
  const [notes, setNotes] = useState(email?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!email) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("emails")
        .update({
          lead_classification: classification as any,
          notes,
        })
        .eq("id", email.id);

      if (updateError) throw updateError;

      onUpdate();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{email.company}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && <ErrorMessage message={error} />}

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{email.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Region</p>
                <p className="font-medium text-gray-900">{email.region}</p>
              </div>
              <div>
                <p className="text-gray-500">Industry</p>
                <p className="font-medium text-gray-900">{email.industry}</p>
              </div>
              <div>
                <p className="text-gray-500">Date Sent</p>
                <p className="font-medium text-gray-900">{formatDate(email.date_sent)}</p>
              </div>
              {email.campaign_name && (
                <div>
                  <p className="text-gray-500">Campaign</p>
                  <p className="font-medium text-gray-900">{email.campaign_name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Status</p>
                <Badge className={statusColors[email.status]?.bg || "bg-gray-100"}>
                  <span className={statusColors[email.status]?.text || "text-gray-800"}>
                    {email.status}
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Location */}
          {(email.lead_name || email.phone || email.city || email.state || email.address) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact & Location</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                {email.lead_name && (
                  <div>
                    <p className="text-gray-500">Lead Name</p>
                    <p className="font-medium text-gray-900">{email.lead_name}</p>
                  </div>
                )}
                {email.phone && (
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{email.phone}</p>
                  </div>
                )}
                {email.city && (
                  <div>
                    <p className="text-gray-500">City</p>
                    <p className="font-medium text-gray-900">{email.city}</p>
                  </div>
                )}
                {email.state && (
                  <div>
                    <p className="text-gray-500">State</p>
                    <p className="font-medium text-gray-900">{email.state}</p>
                  </div>
                )}
                {email.address && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{email.address}</p>
                  </div>
                )}
                {email.google_maps_url && (
                  <div className="col-span-2">
                    <a
                      href={email.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Maps
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {(email.lead_category || email.client_tag) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                {email.lead_category && (
                  <Badge className="bg-purple-100 text-purple-800">{email.lead_category}</Badge>
                )}
                {email.client_tag && (
                  <Badge className="bg-indigo-100 text-indigo-800">{email.client_tag}</Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Email Configuration */}
          {(email.sender_email || email.prospect_cc_email || email.cc_email_1 || email.bcc_email_1) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                {email.sender_email && (
                  <div>
                    <p className="text-gray-500">Sender Email</p>
                    <p className="font-medium text-gray-900">{email.sender_email}</p>
                  </div>
                )}
                {email.prospect_cc_email && (
                  <div>
                    <p className="text-gray-500">Prospect CC</p>
                    <p className="font-medium text-gray-900">{email.prospect_cc_email}</p>
                  </div>
                )}
                {email.cc_email_1 && (
                  <div>
                    <p className="text-gray-500">CC Email 1</p>
                    <p className="font-medium text-gray-900">{email.cc_email_1}</p>
                  </div>
                )}
                {email.cc_email_2 && (
                  <div>
                    <p className="text-gray-500">CC Email 2</p>
                    <p className="font-medium text-gray-900">{email.cc_email_2}</p>
                  </div>
                )}
                {email.cc_email_3 && (
                  <div>
                    <p className="text-gray-500">CC Email 3</p>
                    <p className="font-medium text-gray-900">{email.cc_email_3}</p>
                  </div>
                )}
                {email.bcc_email_1 && (
                  <div>
                    <p className="text-gray-500">BCC Email</p>
                    <p className="font-medium text-gray-900">{email.bcc_email_1}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reply Data */}
          {(email.reply_we_got || email.our_last_reply || email.time_we_got_reply) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reply Data</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                {email.time_we_got_reply && (
                  <div>
                    <p className="text-gray-500">Time We Got Reply</p>
                    <p className="font-medium text-gray-900">{email.time_we_got_reply}</p>
                  </div>
                )}
                {email.reply_time && (
                  <div>
                    <p className="text-gray-500">Reply Time</p>
                    <p className="font-medium text-gray-900">{email.reply_time}</p>
                  </div>
                )}
                {email.reply_we_got && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Reply We Got</p>
                    <p className="font-medium text-gray-900">{email.reply_we_got}</p>
                  </div>
                )}
                {email.our_last_reply && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Our Last Reply</p>
                    <p className="font-medium text-gray-900">{email.our_last_reply}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Response Content */}
          {email.response_content && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900">{email.response_content}</p>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {email.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {email.keywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editable Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lead Classification
                </label>
                <Select value={classification} onValueChange={setClassification}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? <LoadingSpinner /> : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
