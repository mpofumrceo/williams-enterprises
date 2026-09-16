"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/Button";

export function DeleteButton({
  onDelete,
  label = "Delete",
  confirmMessage = "This will permanently delete this item. Continue?",
}: {
  onDelete: () => Promise<{ error?: string; success?: boolean }>;
  label?: string;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="danger"
      size="sm"
      loading={pending}
      onClick={() => {
        if (!confirm(confirmMessage)) return;
        startTransition(async () => {
          const res = await onDelete();
          if (res.error) toast.error(res.error);
          else toast.success("Deleted successfully");
        });
      }}
    >
      {label}
    </Button>
  );
}
