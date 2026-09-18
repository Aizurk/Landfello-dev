import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import {
  createListing,
  getActiveDraft,
  seedDummyDataIfEmpty,
} from "@/features/ownerListing/store";

const TRUST_POINTS = [
  "Identity verification",
  "Ownership document review",
  "Secure buyer communication",
  "Escrow-supported transactions",
  "Guided title transfer",
];

const YOU_MAY_NEED = [
  "A valid government-issued ID",
  "Ownership or authorization documents",
  "Survey or parcel information",
  "Property photos",
  "Pricing information",
  "Land location details",
];

export default function OwnerListingEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    seedDummyDataIfEmpty();
  }, []);

  const startListing = () => {
    const listing = createListing();
    navigate(`/sell/owner/listing/${listing.id}`);
  };

  const continueSaved = () => {
    const draft = getActiveDraft();
    if (draft) {
      navigate(`/sell/owner/listing/${draft.id}`);
      return;
    }
    navigate("/sell/owner/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40">
      <TopNav />

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" />
            Owner listing
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">
            Sell Your Land With Confidence
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-950/70 sm:text-base">
            Create a verified land listing, connect with serious buyers, and complete the
            transaction through a secure closing process.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <div
                key={point}
                className="flex items-start gap-2 rounded-2xl border border-emerald-950/10 bg-emerald-50/50 px-3 py-3 text-sm text-emerald-950/80"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-950/10 bg-[#faf8f5] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
              <FileText className="h-4 w-4 text-emerald-700" />
              You may need
            </div>
            <ul className="mt-3 space-y-2">
              {YOU_MAY_NEED.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-emerald-950/75">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={startListing}
              className="rounded-2xl bg-emerald-900 px-5 text-white hover:bg-emerald-900/90"
            >
              Start Owner Listing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={continueSaved}
              className="rounded-2xl border-emerald-950/15"
            >
              Continue Saved Listing
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-emerald-950/65">
            <BadgeCheck className="h-4 w-4 text-emerald-700" />
            <button
              type="button"
              onClick={() => navigate("/sell/owner/dashboard")}
              className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
            >
              Go to seller dashboard
            </button>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-950/50">
              <Lock className="h-3.5 w-3.5" />
              Drafts save on this device
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
