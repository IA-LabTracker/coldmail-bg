import { Mail, MessageSquare, Flame, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Email } from "@/types";

interface KPICardsProps {
  emails: Email[];
}

export function KPICards({ emails }: KPICardsProps) {
  const totalSent = emails.length;
  const repliesReceived = emails.filter((e) => e.status === "replied").length;
  const hotLeads = emails.filter((e) => e.lead_classification === "hot").length;
  const bounced = emails.filter((e) => e.status === "bounced").length;

  const kpis = [
    {
      label: "Total Sent",
      value: totalSent,
      icon: Mail,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Replies Received",
      value: repliesReceived,
      icon: MessageSquare,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Hot Leads",
      value: hotLeads,
      icon: Flame,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Bounced",
      value: bounced,
      icon: AlertCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
