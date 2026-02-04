"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Email } from "@/types";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatDate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, Loader2 } from "lucide-react";

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

const editSchema = z.object({
  classification: z.enum(["hot", "warm", "cold"]),
  notes: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export function EmailDetailModal({ email, open, onOpenChange, onUpdate }: EmailDetailModalProps) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      classification: (email?.lead_classification as "hot" | "warm" | "cold") || "cold",
      notes: email?.notes || "",
    },
  });

  useEffect(() => {
    if (email) {
      form.reset({
        classification: (email.lead_classification as "hot" | "warm" | "cold") || "cold",
        notes: email.notes || "",
      });
    }
  }, [email, form]);

  if (!email) return null;

  const onSubmit = async (values: EditFormValues) => {
    try {
      const { error: updateError } = await supabase
        .from("emails")
        .update({
          lead_classification: values.classification as any,
          notes: values.notes,
        })
        .eq("id", email.id);

      if (updateError) throw updateError;

      onUpdate();
      onOpenChange(false);
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Failed to save changes",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{email.company}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {form.formState.errors.root && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {form.formState.errors.root.message}
            </div>
          )}

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
          {(email.sender_email ||
            email.prospect_cc_email ||
            email.cc_email_1 ||
            email.bcc_email_1) && (
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
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="classification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Classification</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hot">Hot</SelectItem>
                            <SelectItem value="warm">Warm</SelectItem>
                            <SelectItem value="cold">Cold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add notes about this lead..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="flex-1"
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={form.formState.isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
