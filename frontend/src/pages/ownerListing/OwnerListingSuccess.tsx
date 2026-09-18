import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, LayoutDashboard, MessageCircle, Pencil } from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { VERIFICATION_TRACKER_STEPS } from "@/features/ownerListing/constants";
import { getListing } from "@/features/ownerListing/store";
import type { OwnerListingDraft } from "@/features/ownerListing/types";
import { listingTitle } from "./helpers";

export default function OwnerListingSuccess() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40">
      <TopNav />

      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-[28px] border border-emerald-950/10 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
            Your listing has been submitted.
          </h1>
          <p className="mt-2 text-sm text-emerald-950/65">
            {listingTitle(draft)} is now in verification. We’ll notify you when reviewers need
            anything or when it’s ready to publish.
          </p>

          <div className="mt-8 rounded-2xl border border-emerald-950/10 bg-emerald-50/40 p-5 text-left">
            <div className="text-sm font-semibold text-emerald-950">Verification tracker</div>
            <ol className="mt-4 space-y-3">
              {VERIFICATION_TRACKER_STEPS.map((step, index) => {
                const active = index === 0;
                return (
                  <li key={step.value} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        active
                          ? "bg-emerald-900 text-white"
                          : "bg-white text-emerald-950/40 ring-1 ring-emerald-950/10"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div
                        className={`font-medium ${
                          active ? "text-emerald-950" : "text-emerald-950/55"
                        }`}
                      >
                        {step.label}
                      </div>
                      {active ? (
                        <div className="text-xs text-emerald-700">In progress</div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => navigate("/sell/owner/dashboard")}
              className="rounded-2xl bg-emerald-900 text-white hover:bg-emerald-900/90"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              View status
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/sell/owner/listing/${draft.id}?step=1`)}
              className="rounded-2xl"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit listing
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => alert("Support chat coming soon (demo).")}
              className="rounded-2xl sm:col-span-2"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact support
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/sell/owner/dashboard")}
            className="mt-5 text-sm font-semibold text-emerald-800 underline-offset-2 hover:underline"
          >
            Back to dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
