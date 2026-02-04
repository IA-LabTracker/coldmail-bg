"use client";

import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Email } from "@/types";
import { formatDateOnly } from "@/lib/formatDate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmailTableProps {
  emails: Email[];
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSelectEmail: (id: string) => void;
  onSelectAll: () => void;
  onToggleExpand: (id: string) => void;
  onViewDetails: (email: Email) => void;
  isAllSelected: boolean;
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

export function EmailTable({
  emails,
  selectedIds,
  expandedIds,
  sortConfig,
  onSelectEmail,
  onSelectAll,
  onToggleExpand,
  onViewDetails,
  isAllSelected,
}: EmailTableProps) {
  const getStatusColor = (status: string) =>
    statusColors[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  const getClassificationColor = (classification: string) =>
    classificationColors[classification] || { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50">
            <TableHead className="w-12">
              <Checkbox checked={isAllSelected} onChange={onSelectAll} />
            </TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Lead Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Date Sent</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => (
            <TableRow key={email.id} className="border-b border-gray-200 hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(email.id)}
                  onChange={() => onSelectEmail(email.id)}
                />
              </TableCell>
              <TableCell className="font-medium text-gray-900">{email.company}</TableCell>
              <TableCell className="text-gray-700">{email.lead_name || "-"}</TableCell>
              <TableCell className="text-gray-700">{email.email}</TableCell>
              <TableCell className="text-gray-700">{email.phone || "-"}</TableCell>
              <TableCell className="text-gray-700">{email.region}</TableCell>
              <TableCell className="text-gray-700">{email.industry}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {email.keywords.slice(0, 2).map((kw, idx) => (
                    <Badge key={idx} variant="secondary">
                      {kw}
                    </Badge>
                  ))}
                  {email.keywords.length > 2 && (
                    <Badge variant="secondary">+{email.keywords.length - 2}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(email.status).bg}>
                  <span className={getStatusColor(email.status).text}>{email.status}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getClassificationColor(email.lead_classification).bg}>
                  <span className={getClassificationColor(email.lead_classification).text}>
                    {email.lead_classification}
                  </span>
                </Badge>
              </TableCell>
              <TableCell className="text-gray-700">{email.campaign_name || "-"}</TableCell>
              <TableCell className="text-gray-700">{formatDateOnly(email.date_sent)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {(email.city || email.phone || email.address) && (
                    <Button variant="ghost" size="sm" onClick={() => onToggleExpand(email.id)}>
                      {expandedIds.has(email.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(email)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
