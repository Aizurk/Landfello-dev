import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileUp, RotateCcw } from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/ownerListing/components";
import { getListing, saveListing } from "@/features/ownerListing/store";
import type { OwnerListingDraft, UploadedFile } from "@/features/ownerListing/types";
import { listingTitle } from "./helpers";

export default function VerificationFeedback() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OwnerListingDraft | null>(null);
  const [explanation, setExplanation] = useState("");
  const [replacementName, setReplacementName] = useState<string | null>(null);

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
        Loading feedback…
      </div>
    );
  }

  const issues = draft.feedbackIssues ?? [];

  const uploadReplacement = () => {
    const name = `Replacement_${Date.now()}.pdf`;
    setReplacementName(name);
    const file: UploadedFile = {
      id: `doc_replacement_${crypto.randomUUID()}`,
      name,
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
      reviewStatus: "pending",
      privacy: "verified_buyers",
      size: 180_000,
    };
    const next = saveListing({
      ...draft,
      documents: [...draft.documents, file],
    });
    setDraft(next);
  };

  const resubmit = () => {
    const resolvedIssues = (draft.feedbackIssues ?? []).map((issue) => ({
      ...issue,
      status: "resolved" as const,
      reviewerNote: explanation
        ? `${issue.reviewerNote}\n\nSeller response: ${explanation}`
        : issue.reviewerNote,
    }));
    const next = saveListing({
      ...draft,
      status: "under_review",
      feedbackIssues: resolvedIssues,
    });
    setDraft(next);
    navigate(`/sell/owner/listing/${next.id}/success`);
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

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-emerald-950">Verification feedback</h1>
          <StatusBadge status="action_required" />
        </div>
        <p className="mt-1 text-sm text-emerald-950/65">{listingTitle(draft)}</p>

        <div className="mt-6 space-y-3">
          {issues.length === 0 ? (
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-5 text-sm text-emerald-950/65">
              No open feedback issues for this listing.
            </div>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4"
              >
                <div className="text-sm font-semibold text-orange-950">{issue.summary}</div>
                {issue.documentName ? (
                  <div className="mt-1 text-xs font-medium text-orange-900/70">
                    Document: {issue.documentName}
                  </div>
                ) : null}
                <p className="mt-2 text-sm text-orange-950/80">{issue.reviewerNote}</p>
                <div className="mt-2 text-xs uppercase tracking-wide text-orange-800/60">
                  {issue.status}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-emerald-950">Upload replacement</div>
          <p className="mt-1 text-xs text-emerald-950/55">
            Attach a corrected document (demo upload — stored locally).
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 rounded-xl"
            onClick={uploadReplacement}
          >
            <FileUp className="mr-2 h-4 w-4" />
            {replacementName ? `Added ${replacementName}` : "Upload replacement document"}
          </Button>

          <label className="mt-5 block text-sm font-semibold text-emerald-950">
            Explanation for reviewers
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
              placeholder="Describe what you corrected or why a document differs…"
              className="mt-2 w-full rounded-2xl border border-emerald-950/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none ring-emerald-900/20 focus:ring-2"
            />
          </label>

          <Button
            type="button"
            onClick={resubmit}
            className="mt-4 rounded-2xl bg-emerald-900 text-white hover:bg-emerald-900/90"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Resubmit
          </Button>
        </div>
      </main>
    </div>
  );
}
