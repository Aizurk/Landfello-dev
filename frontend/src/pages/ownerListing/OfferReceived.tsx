import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  FileSearch,
  HelpCircle,
  MessageSquare,
  X,
} from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/ownerListing/components";
import { getListing, saveListing } from "@/features/ownerListing/store";
import type { Offer, OfferStatus, OwnerListingDraft } from "@/features/ownerListing/types";
import { formatMoney, formatRelativeDate, listingTitle } from "./helpers";

function dummyOffers(): Offer[] {
  const now = new Date().toISOString();
  return [
    {
      id: "offer_demo_1",
      buyerName: "Ama Boateng",
      amount: 420_000,
      currency: "GHS",
      message: "Serious cash buyer. Happy to use platform escrow.",
      status: "pending",
      createdAt: now,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    {
      id: "offer_demo_2",
      buyerName: "Daniel Okoro",
      amount: 390_000,
      currency: "GHS",
      message: "Can close in 45 days with bank financing.",
      status: "pending",
      createdAt: now,
    },
  ];
}

function offerBadgeStatus(status: OfferStatus): "pending" | "verified" | "rejected" | "paused" {
  if (status === "accepted") return "verified";
  if (status === "rejected" || status === "withdrawn" || status === "expired") return "rejected";
  if (status === "countered") return "paused";
  return "pending";
}

export default function OfferReceived() {
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
    const offers = listing.offers?.length ? listing.offers : dummyOffers();
    const next = listing.offers?.length
      ? listing
      : saveListing({
          ...listing,
          offers,
          metrics: { ...listing.metrics, offers: offers.length },
        });
    setDraft(next);
  }, [id, navigate]);

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 text-sm text-emerald-950/70">
        Loading offers…
      </div>
    );
  }

  const updateOffer = (offerId: string, patch: Partial<Offer>) => {
    const offers = (draft.offers ?? []).map((o) =>
      o.id === offerId ? { ...o, ...patch } : o,
    );
    const next = saveListing({ ...draft, offers });
    setDraft(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/sell/owner/dashboard")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-900/70 hover:text-emerald-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <h1 className="text-2xl font-semibold text-emerald-950">Offers received</h1>
        <p className="mt-1 text-sm text-emerald-950/65">{listingTitle(draft)}</p>

        <div className="mt-6 space-y-4">
          {(draft.offers ?? []).map((offer) => (
            <div
              key={offer.id}
              className="rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-emerald-950">
                    {offer.buyerName}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-emerald-900">
                    {formatMoney(offer.amount, offer.currency)}
                  </div>
                  <div className="mt-1 text-xs text-emerald-950/50">
                    Received {formatRelativeDate(offer.createdAt)}
                    {offer.expiresAt
                      ? ` · Expires ${formatRelativeDate(offer.expiresAt)}`
                      : ""}
                  </div>
                </div>
                <StatusBadge
                  status={offerBadgeStatus(offer.status)}
                  label={offer.status.replace(/_/g, " ")}
                />
              </div>

              {offer.message ? (
                <p className="mt-3 rounded-2xl bg-emerald-50/70 px-3 py-2 text-sm text-emerald-950/75">
                  {offer.message}
                </p>
              ) : null}

              {offer.counterAmount != null ? (
                <p className="mt-2 text-sm text-emerald-900">
                  Counter: {formatMoney(offer.counterAmount, offer.currency)}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="rounded-xl bg-emerald-900 text-white hover:bg-emerald-900/90"
                  onClick={() => updateOffer(offer.id, { status: "accepted" })}
                  disabled={offer.status === "accepted"}
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    const raw = window.prompt(
                      "Counter amount",
                      String(Math.round(offer.amount * 0.95)),
                    );
                    if (!raw) return;
                    const amount = Number(raw);
                    if (Number.isNaN(amount)) {
                      alert("Enter a valid number.");
                      return;
                    }
                    updateOffer(offer.id, {
                      status: "countered",
                      counterAmount: amount,
                    });
                  }}
                >
                  Counter
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl text-red-700 hover:bg-red-50"
                  onClick={() => updateOffer(offer.id, { status: "rejected" })}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Decline
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    alert(`Message sent to ${offer.buyerName} (demo).`)
                  }
                >
                  <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
                  Ask question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    alert(`Proof of funds requested from ${offer.buyerName} (demo).`)
                  }
                >
                  <FileSearch className="mr-1.5 h-3.5 w-3.5" />
                  Request proof of funds
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() =>
                    navigate(`/sell/owner/listing/${draft.id}/closing`)
                  }
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  Closing
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
