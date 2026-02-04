/*
 # Create emails and settings tables
 
 1. New Tables
 - `emails` - Store B2B cold email campaign data with comprehensive fields for leads, tracking, and responses
 - Core fields: id, user_id, company, email, region, industry, keywords, status
 - Lead info: lead_name, phone, city, state, address, google_maps_url
 - Campaign tracking: campaign_name, lead_classification, notes, date_sent
 - Email configuration: sender_email, prospect_cc_email, cc_email_1/2/3, bcc_email_1
 - Response tracking: response_content, reply_we_got, our_last_reply, time_we_got_reply, reply_time
 - Tagging: lead_category, client_tag
 
 - `settings` - Store user configuration for webhooks and email templates
 - webhook_url: n8n webhook endpoint
 - email_template: Default email template with variables
 - linkedin_account_id: Connected LinkedIn account ID
 - linkedin_webhook_url: LinkedIn campaign webhook endpoint
 
 2. Indexes
 - Composite indexes on user_id for all queries
 - Indexes on status, lead_classification, campaign_name for filtering
 - Index on date_sent DESC for chronological sorting
 
 3. Security
 - Enable RLS on both tables
 - Add policies for authenticated users to access only their own data
 - All operations (SELECT, INSERT, UPDATE, DELETE) restricted by auth.uid() = user_id
 
 4. Triggers
 - Create trigger function to automatically update updated_at timestamp
 - Apply trigger to both emails and settings tables on UPDATE
 */
-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  region text NOT NULL,
  industry text NOT NULL,
  keywords text [] DEFAULT '{}',
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'replied', 'bounced')),
  response_content text DEFAULT '',
  lead_classification text DEFAULT 'cold' CHECK (lead_classification IN ('hot', 'warm', 'cold')),
  campaign_name text DEFAULT '',
  notes text DEFAULT '',
  date_sent timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  lead_name text DEFAULT '',
  phone text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  address text DEFAULT '',
  google_maps_url text DEFAULT '',
  lead_category text DEFAULT '',
  client_tag text DEFAULT '',
  sender_email text DEFAULT '',
  prospect_cc_email text DEFAULT '',
  cc_email_1 text DEFAULT '',
  cc_email_2 text DEFAULT '',
  cc_email_3 text DEFAULT '',
  bcc_email_1 text DEFAULT '',
  reply_we_got text DEFAULT '',
  our_last_reply text DEFAULT '',
  time_we_got_reply text DEFAULT '',
  reply_time text DEFAULT ''
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  webhook_url text DEFAULT '',
  email_template text DEFAULT '',
  linkedin_account_id text,
  linkedin_webhook_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for emails table
CREATE INDEX IF NOT EXISTS emails_user_id_idx ON emails(user_id);

CREATE INDEX IF NOT EXISTS emails_status_idx ON emails(status);

CREATE INDEX IF NOT EXISTS emails_lead_classification_idx ON emails(lead_classification);

CREATE INDEX IF NOT EXISTS emails_campaign_name_idx ON emails(campaign_name);

CREATE INDEX IF NOT EXISTS emails_date_sent_idx ON emails(date_sent DESC);

-- Create index for settings table
CREATE INDEX IF NOT EXISTS settings_user_id_idx ON settings(user_id);

-- Enable Row Level Security
ALTER TABLE
  emails ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for emails table
CREATE POLICY "Users can read own emails" ON emails FOR
SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emails" ON emails FOR
INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emails" ON emails FOR
UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own emails" ON emails FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create RLS policies for settings table
CREATE POLICY "Users can read own settings" ON settings FOR
SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON settings FOR
INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON settings FOR
UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS emails_update_updated_at ON emails;

CREATE TRIGGER emails_update_updated_at BEFORE
UPDATE
  ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS settings_update_updated_at ON settings;

CREATE TRIGGER settings_update_updated_at BEFORE
UPDATE
  ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();