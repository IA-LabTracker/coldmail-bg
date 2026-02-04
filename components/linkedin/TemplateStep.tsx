"use client";

import { LinkedInLead } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface TemplateStepProps {
  template: string;
  onTemplateChange: (template: string) => void;
  firstLead: LinkedInLead | null;
}

const variables = ["firstName", "lastName", "company", "position"];

export function TemplateStep({ template, onTemplateChange, firstLead }: TemplateStepProps) {
  const insertVariable = (variable: string) => {
    onTemplateChange(template + `{{${variable}}}`);
  };

  const getPreview = (): string => {
    if (!firstLead) return template;

    let preview = template;
    preview = preview.replace(/\{\{firstName\}\}/g, firstLead.firstName);
    preview = preview.replace(/\{\{lastName\}\}/g, firstLead.lastName);
    preview = preview.replace(/\{\{company\}\}/g, firstLead.company);
    preview = preview.replace(/\{\{position\}\}/g, firstLead.position);
    return preview;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Step 3: Message Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700">
            Message Template
          </label>
          <Textarea
            id="template"
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
            placeholder="Hi {{firstName}},&#10;&#10;I came across your profile and I think we could work together..."
            className="min-h-32 resize-none"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {variables.map((variable) => (
              <Button
                key={variable}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable(variable)}
              >
                {`{{${variable}}}`}
              </Button>
            ))}
          </div>
        </div>

        {firstLead && (
          <div>
            <p className="text-sm font-medium text-gray-700">Preview</p>
            <div className="mt-2 rounded-lg bg-gray-100 p-4">
              <div className="space-y-2 rounded-lg bg-white p-3">
                <p className="whitespace-pre-wrap text-sm text-gray-900">{getPreview()}</p>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Preview with {firstLead.firstName} {firstLead.lastName}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
