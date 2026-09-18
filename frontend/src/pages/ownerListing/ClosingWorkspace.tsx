import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  MessageCircle,
  Scale,
} from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { TRANSACTION_CHECKLIST_LABELS } from "@/features/ownerListing/constants";
import { getListing, saveListing } from "@/features/ownerListing/store";
import type { OwnerListingDraft } from "@/features/ownerListing/types";
import {
  escrowLabel,
  formatMoney,
  formatRelativeDate,
  listingTitle,
} from "./helpers";

const DUMMY_MESSAGES = [
  {
    from: "Buyer counsel",
    text: "Title search request lodged with the registry.",
    at: "2 days ago",
  },
  {
    from: "You",
    text: "Shared rates clearance and spousal consent copies.",
    at: "Yesterday",
  },
  {
    from: "Landfello escrow",
    text: "Awaiting funding instructions from the buyer.",
    at: "Today",
  },
];

export default function ClosingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OwnerListingDraft | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(DUMMY_MESSAGES);

  useEffect(() => {
    if (!id) return;
    const listing = getListing(id);
    if (!listing) {
      navigate("/sell/owner/dashboard", { replace: true });
      return;
    }
    setDraft(listing);
  }, [id, navigate]);

  const checklist = useMemo(() => {
    if (draft?.transaction?.stages?.length) {
      return draft.transaction.stages.map((s) => ({
        value: s.key,
        label: s.label,
        completed: s.completed,
        note: s.note,
        completedAt: s.completedAt,
      }));
    }
    return TRANSACTION_CHECKLIST_LABELS.map((item) => ({
      value: item.value,
      label: item.label,
      completed: false,
      note: undefined as string | undefined,
      completedAt: undefined as string | undefined,
    }));
  }, [draft]);

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 text-sm text-emerald-950/70">
        Loading workspace…
      </div>
    );
  }

  const acceptedOffer = draft.offers?.find(
    (o) => o.id === draft.transaction?.acceptedOfferId || o.status === "accepted",
  );

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "You", text: chatInput.trim(), at: "Just now" },
    ]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/sell/owner/dashboard")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-900/70 hover:text-emerald-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-emerald-950">Closing workspace</h1>
            <p className="mt-1 text-sm text-emerald-950/65">{listingTitle(draft)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate(`/sell/owner/listing/${draft.id}/escrow`)}
            >
              Escrow
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate(`/sell/owner/listing/${draft.id}/completed`)}
            >
              Sale completed
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Transaction completion requires professional confirmation (lawyer / escrow /
              registry). Fake “mark complete” actions are disabled in this demo.
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-950">Transaction checklist</h2>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li key={item.value} className="flex items-start gap-3 text-sm">
                  {item.completed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 text-emerald-950/25" />
                  )}
                  <div>
                    <div className="font-medium text-emerald-950">{item.label}</div>
                    {item.completedAt ? (
                      <div className="text-xs text-emerald-950/50">
                        {formatRelativeDate(item.completedAt)}
                      </div>
                    ) : null}
                    {item.note ? (
                      <div className="text-xs text-emerald-950/60">{item.note}</div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              disabled
              className="mt-4 w-full rounded-xl opacity-60"
              title="Requires professional confirmation"
            >
              Mark complete (disabled)
            </Button>
          </section>

          <section className="rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-950">Parties</h2>
            <div className="mt-3 space-y-2 text-sm text-emerald-950/75">
              <div>
                <span className="text-emerald-950/45">Seller:</span>{" "}
                {draft.identity.fullName || draft.ownerName || "—"}
              </div>
              <div>
                <span className="text-emerald-950/45">Buyer:</span>{" "}
                {acceptedOffer?.buyerName || "Pending assignment"}
              </div>
              <div>
                <span className="text-emerald-950/45">Escrow:</span>{" "}
                {draft.transaction?.escrowProvider || "Not assigned"}
              </div>
            </div>

            <h2 className="mt-6 text-sm font-semibold text-emerald-950">Accepted offer</h2>
            {acceptedOffer ? (
              <p className="mt-2 text-sm text-emerald-950/75">
                {acceptedOffer.buyerName} ·{" "}
                {formatMoney(acceptedOffer.amount, acceptedOffer.currency)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-emerald-950/55">No accepted offer yet.</p>
            )}

            <h2 className="mt-6 text-sm font-semibold text-emerald-950">Escrow status</h2>
            <p className="mt-2 capitalize text-sm text-emerald-950/75">
              {escrowLabel(draft.transaction?.escrowStatus ?? "not_started")}
            </p>
          </section>

          <section className="rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-950">Documents</h2>
            <ul className="mt-3 space-y-2">
              {draft.documents.length === 0 ? (
                <li className="text-sm text-emerald-950/55">No documents uploaded.</li>
              ) : (
                draft.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50/50 px-3 py-2 text-sm"
                  >
                    <span className="truncate text-emerald-950">{doc.name}</span>
                    <span className="shrink-0 text-xs capitalize text-emerald-950/50">
                      {doc.reviewStatus.replace(/_/g, " ")}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-emerald-950/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-emerald-950">Messages</h2>
              <MessageCircle className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="mt-3 max-h-56 space-y-3 overflow-y-auto">
              {messages.map((m, idx) => (
                <div key={`${m.from}-${idx}`} className="rounded-2xl bg-emerald-50/60 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-emerald-950/50">
                    <span className="font-semibold text-emerald-900">{m.from}</span>
                    <span>{m.at}</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-950/80">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Write a message…"
                className="flex-1 rounded-xl border border-emerald-950/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-900/20"
              />
              <Button type="button" className="rounded-xl bg-emerald-900 text-white" onClick={sendMessage}>
                Send
              </Button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl text-red-700 hover:bg-red-50"
            onClick={() => {
              const note = window.prompt("Describe the dispute (demo):");
              if (!note || !draft.transaction) return;
              const next = saveListing({
                ...draft,
                transaction: {
                  ...draft.transaction,
                  escrowStatus: "disputed",
                  notes: `${draft.transaction.notes ?? ""}\nDispute: ${note}`.trim(),
                },
              });
              setDraft(next);
              alert("Dispute flagged for review (demo).");
            }}
          >
            <Scale className="mr-2 h-4 w-4" />
            Raise dispute
          </Button>
        </div>
      </main>
    </div>
  );
}
