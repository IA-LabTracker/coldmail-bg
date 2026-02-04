"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailStatus, LeadClassification } from "@/types";

interface EmailFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
  classification: string;
  onClassificationChange: (value: string) => void;
  campaign: string;
  onCampaignChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function EmailFilters({
  status,
  onStatusChange,
  classification,
  onClassificationChange,
  campaign,
  onCampaignChange,
  search,
  onSearchChange,
}: EmailFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <Select value={status || "all"} onValueChange={(v) => onStatusChange(v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Classification</label>
        <Select value={classification || "all"} onValueChange={(v) => onClassificationChange(v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="campaign" className="block text-sm font-medium text-gray-700">
          Campaign
        </label>
        <Input
          id="campaign"
          type="text"
          placeholder="Filter by campaign..."
          value={campaign}
          onChange={(e) => onCampaignChange(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <Input
          id="search"
          type="text"
          placeholder="Company or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
