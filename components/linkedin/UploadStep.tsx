"use client";

import { ChangeEvent, useState } from "react";
import { LinkedInLead } from "@/types";
import { parseCSV } from "@/lib/csvParser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Upload, X } from "lucide-react";

interface UploadStepProps {
  leads: LinkedInLead[];
  onLeadsChange: (leads: LinkedInLead[]) => void;
}

export function UploadStep({ leads, onLeadsChange }: UploadStepProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseCSV(text);

        if (result.errors.length > 0) {
          setErrors(result.errors);
        } else {
          setErrors([]);
          onLeadsChange(result.leads);
        }
      } catch (error) {
        setErrors(["Failed to parse CSV file"]);
      }
    };

    reader.readAsText(file);
  };

  const handleRemove = () => {
    onLeadsChange([]);
    setErrors([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Step 2: Upload Leads CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ))}
          </div>
        )}

        {leads.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a CSV file with the following columns: firstName, lastName, company, position,
              linkedinUrl
            </p>

            <Input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {leads.length} lead{leads.length !== 1 ? "s" : ""} uploaded
              </p>
              <Button onClick={handleRemove} variant="outline" size="sm" className="gap-1">
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>LinkedIn URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.slice(0, 5).map((lead, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{lead.firstName}</TableCell>
                      <TableCell>{lead.lastName}</TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>{lead.position}</TableCell>
                      <TableCell>
                        <a
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {leads.length > 5 && (
              <p className="text-xs text-gray-500">Showing first 5 of {leads.length} leads</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
