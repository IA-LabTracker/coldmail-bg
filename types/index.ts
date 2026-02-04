export type EmailStatus = "sent" | "replied" | "bounced";
export type LeadClassification = "hot" | "warm" | "cold";

export interface Email {
  id: string;
  user_id: string;
  company: string;
  email: string;
  region: string;
  industry: string;
  keywords: string[];
  status: EmailStatus;
  response_content: string;
  lead_classification: LeadClassification;
  campaign_name: string;
  notes: string;
  date_sent: string;
  created_at: string;
  updated_at: string;
  lead_name?: string;
  phone?: string;
  city?: string;
  state?: string;
  address?: string;
  google_maps_url?: string;
  lead_category?: string;
  client_tag?: string;
  sender_email?: string;
  prospect_cc_email?: string;
  cc_email_1?: string;
  cc_email_2?: string;
  cc_email_3?: string;
  bcc_email_1?: string;
  reply_we_got?: string;
  our_last_reply?: string;
  time_we_got_reply?: string;
  reply_time?: string;
}

export interface Settings {
  id: string;
  user_id: string;
  webhook_url: string;
  email_template: string;
  linkedin_account_id: string | null;
  linkedin_webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkedInLead {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  linkedinUrl: string;
}
