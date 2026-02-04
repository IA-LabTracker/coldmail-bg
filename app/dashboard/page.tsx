"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Email } from "@/types";
import { Navbar } from "@/components/Navbar";
import { KPICards } from "@/components/dashboard/KPICards";
import { EmailFilters } from "@/components/dashboard/EmailFilters";
import { EmailTable } from "@/components/dashboard/EmailTable";
import { ExpandableRow } from "@/components/dashboard/ExpandableRow";
import { EmailDetailModal } from "@/components/dashboard/EmailDetailModal";
import { BulkActions } from "@/components/dashboard/BulkActions";
import { Pagination } from "@/components/dashboard/Pagination";
import { useEmailSelection } from "@/hooks/useEmailSelection";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDetailEmail, setSelectedDetailEmail] = useState<Email | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const {
    selectedIds,
    selectedEmails,
    isAllSelected,
    toggleEmailSelection,
    toggleSelectAllVisible,
    clearSelection,
  } = useEmailSelection(emails);

  // Fetch emails
  const fetchEmails = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("date_sent", { ascending: false });

      if (fetchError) throw fetchError;
      setEmails(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emails");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, classificationFilter, campaignFilter, searchFilter]);

  // Apply filters
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    if (statusFilter) {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (classificationFilter) {
      filtered = filtered.filter((e) => e.lead_classification === classificationFilter);
    }

    if (campaignFilter) {
      const lowerCampaign = campaignFilter.toLowerCase();
      filtered = filtered.filter((e) =>
        e.campaign_name.toLowerCase().includes(lowerCampaign),
      );
    }

    if (searchFilter) {
      const lowerSearch = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.company.toLowerCase().includes(lowerSearch) ||
          e.email.toLowerCase().includes(lowerSearch),
      );
    }

    return filtered;
  }, [emails, statusFilter, classificationFilter, campaignFilter, searchFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmails.length / ITEMS_PER_PAGE);
  const paginatedEmails = useMemo(
    () =>
      filteredEmails.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [filteredEmails, currentPage],
  );

  const handleViewDetails = useCallback((email: Email) => {
    setSelectedDetailEmail(email);
    setDetailModalOpen(true);
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          {error && <ErrorMessage message={error} />}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <KPICards emails={emails} />

              <div className="rounded-lg bg-white p-4">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters</h2>
                <EmailFilters
                  status={statusFilter}
                  onStatusChange={setStatusFilter}
                  classification={classificationFilter}
                  onClassificationChange={setClassificationFilter}
                  campaign={campaignFilter}
                  onCampaignChange={setCampaignFilter}
                  search={searchFilter}
                  onSearchChange={setSearchFilter}
                />
              </div>

              {selectedEmails.length > 0 && (
                <BulkActions selectedEmails={selectedEmails} onClear={clearSelection} />
              )}

              <div className="rounded-lg border border-gray-200 bg-white">
                <EmailTable
                  emails={paginatedEmails}
                  selectedIds={selectedIds}
                  expandedIds={expandedIds}
                  sortConfig={null}
                  onSelectEmail={toggleEmailSelection}
                  onSelectAll={() => toggleSelectAllVisible(paginatedEmails)}
                  onToggleExpand={handleToggleExpand}
                  onViewDetails={handleViewDetails}
                  isAllSelected={isAllSelected(paginatedEmails)}
                />

                {paginatedEmails.map((email) => {
                  if (!expandedIds.has(email.id)) return null;
                  return (
                    <div key={`expanded-${email.id}`}>
                      <ExpandableRow email={email} />
                    </div>
                  );
                })}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredEmails.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>

              <EmailDetailModal
                email={selectedDetailEmail}
                open={detailModalOpen}
                onOpenChange={setDetailModalOpen}
                onUpdate={fetchEmails}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
