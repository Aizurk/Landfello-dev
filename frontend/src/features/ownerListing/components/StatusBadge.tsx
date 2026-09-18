import { cn } from "@/lib/utils";

export type StatusBadgeStatus =
  | "draft"
  | "under_review"
  | "verified"
  | "published"
  | "rejected"
  | "unsuccessful"
  | "action_required"
  | "paused"
  | "pending";

const STATUS_STYLES: Record<StatusBadgeStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  under_review: "bg-amber-50 text-amber-800 border-amber-200",
  verified: "bg-emerald-50 text-emerald-800 border-emerald-200",
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
  unsuccessful: "bg-red-50 text-red-800 border-red-200",
  action_required: "bg-orange-50 text-orange-800 border-orange-200",
  paused: "bg-slate-100 text-slate-700 border-slate-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
};

const STATUS_LABELS: Record<StatusBadgeStatus, string> = {
  draft: "Draft",
  under_review: "Under review",
  verified: "Verified",
  published: "Published",
  rejected: "Rejected",
  unsuccessful: "Unsuccessful",
  action_required: "Action required",
  paused: "Paused",
  pending: "Pending",
};

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status],
        className
      )}
    >
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}
