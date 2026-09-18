import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/ownerListing/components";
import { getListing, saveListing } from "@/features/ownerListing/store";
import type { EscrowStatus, OwnerListingDraft } from "@/features/ownerListing/types";
import { escrowLabel, listingTitle } from "./helpers";

const ESCROW_STEPS: { status: EscrowStatus; label: string; detail: string }[] = [
  {
    status: "not_started",
    label: "Not started",
    detail: "Escrow has not been initiated for this transaction.",
  },
  {
    status: "pending_setup",
    label: "Pending setup",
    detail: "Parties confirm escrow provider and funding instructions.",
  },
  {
    status: "funded",
    label: "Funded",
    detail: "Buyer funds are held securely pending conditions.",
  },
  {
    status: "in_progress",
    label: "In progress",
    detail: "Conditions, title work, and transfer steps are underway.",
  },
  {
    status: "released",
    label: "Released",
    detail: "Funds released to the seller after successful closing.",
  },
  {
    status: "refunded",
    label: "Refunded",
    detail: "Funds returned to the buyer per agreement.",
  },
  {
    status: "disputed",
    label: "Disputed",
    detail: "Escrow is paused pending dispute resolution.",
  },
];

const ADVANCE_ORDER: EscrowStatus[] = [
  "not_started",
  "pending_setup",
  "funded",
  "in_progress",
  "released",
];

export default function EscrowFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OwnerListingDraft | null>(null);

  useEffect(() => {
    if (!id) return;
    const listing = getListing(id);
    if (!listing) {
      navigate("/sell/owner/dashboard", { replace: true });
      return;
    }
    setDraft(listing);
  }, [id, navigate]);

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 text-sm text-emerald-950/70">
        Loading escrow…
      </div>
    );
  }

  const current = draft.transaction?.escrowStatus ?? "not_started";

  const simulateAdvance = () => {
    const idx = ADVANCE_ORDER.indexOf(current);
    const nextStatus =
      idx >= 0 && idx < ADVANCE_ORDER.length - 1
        ? ADVANCE_ORDER[idx + 1]
        : current === "disputed" || current === "refunded"
          ? "pending_setup"
          : "released";

    const transaction = draft.transaction ?? {
      stages: [],
      escrowStatus: nextStatus,
      escrowProvider: "Landfello Escrow",
    };

    const next = saveListing({
      ...draft,
      transaction: {
        ...transaction,
        escrowStatus: nextStatus,
        escrowProvider: transaction.escrowProvider || "Landfello Escrow",
      },
    });
    setDraft(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(`/sell/owner/listing/${draft.id}/closing`)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-900/70 hover:text-emerald-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Closing workspace
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-700" />
          <h1 className="text-2xl font-semibold text-emerald-950">Escrow</h1>
          <StatusBadge status="pending" label={escrowLabel(current)} />
        </div>
        <p className="mt-1 text-sm text-emerald-950/65">{listingTitle(draft)}</p>

        <p className="mt-4 text-sm leading-relaxed text-emerald-950/70">
          Escrow holds buyer funds until title transfer and closing conditions are met. Landfello
          coordinates instructions with your chosen escrow provider — never send funds to personal
          accounts.
        </p>

        <ol className="mt-8 space-y-3">
          {ESCROW_STEPS.filter((s) =>
            ["not_started", "pending_setup", "funded", "in_progress", "released"].includes(
              s.status,
            ),
          ).map((step) => {
            const active = step.status === current;
            const passed =
              ADVANCE_ORDER.indexOf(step.status) >= 0 &&
              ADVANCE_ORDER.indexOf(current) > ADVANCE_ORDER.indexOf(step.status);
            return (
              <li
                key={step.status}
                className={`rounded-2xl border px-4 py-3 ${
                  active
                    ? "border-emerald-600/30 bg-emerald-50"
                    : "border-emerald-950/10 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-emerald-950">{step.label}</div>
                  {active ? (
                    <span className="text-xs font-semibold text-emerald-700">Current</span>
                  ) : passed ? (
                    <span className="text-xs text-emerald-950/45">Done</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-emerald-950/60">{step.detail}</p>
              </li>
            );
          })}
        </ol>

        {(current === "disputed" || current === "refunded") && (
          <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-950">
            Current special status: <strong className="capitalize">{escrowLabel(current)}</strong>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="mt-8 rounded-2xl border-dashed"
          onClick={simulateAdvance}
        >
          Simulate escrow update (demo)
        </Button>
      </main>
    </div>
  );
}
