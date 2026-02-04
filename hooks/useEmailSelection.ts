import { useState, useCallback, useEffect, useMemo } from "react";
import { Email } from "@/types";

export function useEmailSelection(emails: Email[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const emailIds = new Set(emails.map((e) => e.id));
    setSelectedIds((prev) => {
      const hasStale = Array.from(prev).some((id) => !emailIds.has(id));
      if (!hasStale) return prev;
      const filtered = new Set(Array.from(prev).filter((id) => emailIds.has(id)));
      return filtered;
    });
  }, [emails]);

  const toggleEmailSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAllVisible = useCallback(
    (visibleEmails: Email[]) => {
      const allVisible = visibleEmails.every((e) => selectedIds.has(e.id));

      if (allVisible) {
        const newSet = new Set(selectedIds);
        visibleEmails.forEach((e) => newSet.delete(e.id));
        setSelectedIds(newSet);
      } else {
        const newSet = new Set(selectedIds);
        visibleEmails.forEach((e) => newSet.add(e.id));
        setSelectedIds(newSet);
      }
    },
    [selectedIds],
  );

  const isAllSelected = useCallback(
    (visibleEmails: Email[]) => {
      return visibleEmails.length > 0 && visibleEmails.every((e) => selectedIds.has(e.id));
    },
    [selectedIds],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedEmails = useMemo(
    () => emails.filter((e) => selectedIds.has(e.id)),
    [emails, selectedIds],
  );

  return {
    selectedIds,
    selectedEmails,
    toggleEmailSelection,
    toggleSelectAllVisible,
    isAllSelected,
    clearSelection,
  };
}
