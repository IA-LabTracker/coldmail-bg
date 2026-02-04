import { Mail, MapPin, Tag } from "lucide-react";
import { Email } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";

interface ExpandableRowProps {
  email: Email;
}

export function ExpandableRow({ email }: ExpandableRowProps) {
  return (
    <TableRow className="bg-gray-50">
      <TableCell colSpan={13}>
        <div className="space-y-4 p-4">
          {/* Contact & Location */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
              <MapPin className="h-4 w-4" />
              Contact & Location
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <p className="text-gray-500">Location</p>
                  <a
                    href={email.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View on Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Email Configuration */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
              <Mail className="h-4 w-4" />
              Email Configuration
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
              {(email.cc_email_1 || email.cc_email_2 || email.cc_email_3) && (
                <div className="col-span-2">
                  <p className="mb-1 text-gray-500">CC Emails</p>
                  <div className="space-y-1">
                    {email.cc_email_1 && (
                      <p className="font-medium text-gray-900">{email.cc_email_1}</p>
                    )}
                    {email.cc_email_2 && (
                      <p className="font-medium text-gray-900">{email.cc_email_2}</p>
                    )}
                    {email.cc_email_3 && (
                      <p className="font-medium text-gray-900">{email.cc_email_3}</p>
                    )}
                  </div>
                </div>
              )}
              {email.bcc_email_1 && (
                <div>
                  <p className="text-gray-500">BCC Email</p>
                  <p className="font-medium text-gray-900">{email.bcc_email_1}</p>
                </div>
              )}
            </div>
          </div>

          {/* Replies & Tags */}
          {(email.lead_category ||
            email.client_tag ||
            email.reply_we_got ||
            email.our_last_reply) && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                <Tag className="h-4 w-4" />
                Replies & Tags
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {email.lead_category && (
                  <div>
                    <p className="mb-1 text-gray-500">Lead Category</p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {email.lead_category}
                    </Badge>
                  </div>
                )}
                {email.client_tag && (
                  <div>
                    <p className="mb-1 text-gray-500">Client Tag</p>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                      {email.client_tag}
                    </Badge>
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
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
