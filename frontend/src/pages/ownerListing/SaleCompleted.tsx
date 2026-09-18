import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, PartyPopper } from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { getListing } from "@/features/ownerListing/store";
import type { OwnerListingDraft } from "@/features/ownerListing/types";
import {
  formatLocation,
  formatMoney,
  formatRelativeDate,
  listingTitle,
} from "./helpers";

export default function SaleCompleted() {
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
        Loading…
      </div>
    );
  }

  const acceptedOffer = draft.offers?.find(
    (o) => o.id === draft.transaction?.acceptedOfferId || o.status === "accepted",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40">
      <TopNav />

      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/sell/owner/dashboard")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-900/70 hover:text-emerald-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <div className="rounded-[28px] border border-emerald-950/10 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <PartyPopper className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
            Sale completed
          </h1>
          <p className="mt-2 text-sm text-emerald-950/65">
            Congratulations — {listingTitle(draft)} has reached the completed stage in this demo
            workspace.
          </p>

          <div className="mt-8 rounded-2xl border border-emerald-950/10 bg-emerald-50/40 p-5 text-left text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-emerald-950/50">Property</div>
                <div className="font-semibold text-emerald-950">{listingTitle(draft)}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-950/50">Location</div>
                <div className="font-semibold text-emerald-950">{formatLocation(draft)}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-950/50">Sale price</div>
                <div className="font-semibold text-emerald-950">
                  {acceptedOffer
                    ? formatMoney(acceptedOffer.amount, acceptedOffer.currency)
                    : formatMoney(draft.pricing.askingPrice, draft.pricing.currency)}
                </div>
              </div>
              <div>
                <div className="text-xs text-emerald-950/50">Buyer</div>
                <div className="font-semibold text-emerald-950">
                  {acceptedOffer?.buyerName || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-emerald-950/50">Closing date</div>
                <div className="font-semibold text-emerald-950">
                  {draft.transaction?.closingDate
                    ? formatRelativeDate(draft.transaction.closingDate)
                    : formatRelativeDate(draft.updatedAt)}
                </div>
              </div>
              <div>
                <div className="text-xs text-emerald-950/50">Escrow</div>
                <div className="font-semibold capitalize text-emerald-950">
                  {(draft.transaction?.escrowStatus ?? "not_started").replace(/_/g, " ")}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => alert("Download closing statement (demo).")}
            >
              <Download className="mr-2 h-4 w-4" />
              Closing statement
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => alert("Download transfer confirmation (demo).")}
            >
              <Download className="mr-2 h-4 w-4" />
              Transfer confirmation
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/sell/owner/dashboard")}
            className="mt-6 w-full rounded-2xl bg-emerald-900 text-white hover:bg-emerald-900/90"
          >
            Back to dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
