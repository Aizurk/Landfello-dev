import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  FileUp,
  PauseCircle,
  Plus,
  Trash2,
  CheckCircle2,
  FileWarning,
  CircleDollarSign,
} from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/ownerListing/components";
import {
  createListing,
  deleteListing,
  ensureListings,
  saveListing,
} from "@/features/ownerListing/store";
import type { OwnerListingDraft } from "@/features/ownerListing/types";
import {
  formatLocation,
  formatMoney,
  formatRelativeDate,
  listingTitle,
  toBadgeStatus,
} from "./helpers";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<OwnerListingDraft[]>([]);

  const refresh = () => setListings(ensureListings());

  useEffect(() => {
    refresh();
  }, []);

  const startNew = () => {
    const listing = createListing();
    navigate(`/sell/owner/listing/${listing.id}`);
  };

  const updateListing = (next: OwnerListingDraft) => {
    saveListing(next);
    refresh();
  };

  const onDeleteDraft = (listing: OwnerListingDraft) => {
    if (listing.status !== "draft") return;
    const ok = window.confirm(`Delete draft "${listingTitle(listing)}"? This cannot be undone.`);
    if (!ok) return;
    deleteListing(listing.id);
    refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
              Seller dashboard
            </h1>
            <p className="mt-1 text-sm text-emerald-950/65">
              Track drafts, verification, offers, and closings for your land listings.
            </p>
          </div>
          <Button
            type="button"
            onClick={startNew}
            className="rounded-2xl bg-emerald-900 text-white hover:bg-emerald-900/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Start new listing
          </Button>
        </div>

        <div className="mt-8 space-y-4">
          {listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-emerald-950/15 bg-white p-10 text-center">
              <p className="text-sm text-emerald-950/65">No listings yet.</p>
              <Button
                type="button"
                onClick={() => navigate("/sell/owner")}
                className="mt-4 rounded-2xl bg-emerald-900 text-white hover:bg-emerald-900/90"
              >
                Sell your land
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            listings.map((listing) => {
              const hasOffers = (listing.offers?.length ?? 0) > 0 || listing.metrics.offers > 0;
              const hasTransaction = Boolean(listing.transaction);
              return (
                <div
                  key={listing.id}
                  className="rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-emerald-950">
                          {listingTitle(listing)}
                        </h2>
                        <StatusBadge
                          status={toBadgeStatus(listing.status)}
                          label={listing.status === "sold" ? "Sold" : undefined}
                        />
                      </div>
                      <p className="mt-1 text-sm text-emerald-950/60">
                        {formatLocation(listing)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-emerald-900">
                        {formatMoney(listing.pricing.askingPrice, listing.pricing.currency)}
                      </p>
                    </div>
                    <div className="text-xs text-emerald-950/50">
                      Updated {formatRelativeDate(listing.updatedAt)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Views", listing.metrics.views],
                      ["Saves", listing.metrics.saves],
                      ["Inquiries", listing.metrics.inquiries],
                      ["Offers", listing.metrics.offers],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-2xl bg-emerald-50/60 px-3 py-2 text-center"
                      >
                        <div className="text-lg font-semibold text-emerald-950">{value}</div>
                        <div className="text-[11px] font-medium uppercase tracking-wide text-emerald-950/50">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {listing.status === "action_required" ? (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-3 text-sm text-orange-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Verification needs your attention. Upload corrected documents or respond to
                      feedback.
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {listing.status === "draft" ? (
                      <Button
                        type="button"
                        className="rounded-xl bg-emerald-900 text-white hover:bg-emerald-900/90"
                        onClick={() =>
                          navigate(
                            `/sell/owner/listing/${listing.id}?step=${listing.currentStep}`,
                          )
                        }
                      >
                        Continue
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        navigate(`/sell/owner/listing/${listing.id}?step=1`)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        alert(`Preview for "${listingTitle(listing)}" (demo).`)
                      }
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Preview
                    </Button>

                    {listing.status === "action_required" ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() =>
                            navigate(`/sell/owner/listing/${listing.id}/feedback`)
                          }
                        >
                          <FileWarning className="mr-1.5 h-3.5 w-3.5" />
                          View verification feedback
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() =>
                            alert(
                              "Upload document: open feedback page to attach a replacement (demo).",
                            )
                          }
                        >
                          <FileUp className="mr-1.5 h-3.5 w-3.5" />
                          Upload document
                        </Button>
                      </>
                    ) : null}

                    {hasOffers ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() =>
                          navigate(`/sell/owner/listing/${listing.id}/offers`)
                        }
                      >
                        <CircleDollarSign className="mr-1.5 h-3.5 w-3.5" />
                        Offers
                      </Button>
                    ) : null}

                    {hasTransaction ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() =>
                          navigate(`/sell/owner/listing/${listing.id}/closing`)
                        }
                      >
                        Closing workspace
                      </Button>
                    ) : null}

                    {listing.status === "published" || listing.status === "verified" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() =>
                          updateListing({ ...listing, status: "paused" })
                        }
                      >
                        <PauseCircle className="mr-1.5 h-3.5 w-3.5" />
                        Pause
                      </Button>
                    ) : null}

                    {listing.status === "paused" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() =>
                          updateListing({ ...listing, status: "published" })
                        }
                      >
                        Resume
                      </Button>
                    ) : null}

                    {listing.status !== "sold" && listing.status !== "draft" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() =>
                          updateListing({ ...listing, status: "sold" })
                        }
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Mark sold
                      </Button>
                    ) : null}

                    {listing.status === "draft" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl text-red-700 hover:bg-red-50"
                        onClick={() => onDeleteDraft(listing)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete draft
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
