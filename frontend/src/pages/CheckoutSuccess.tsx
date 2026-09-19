import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { verifyPayment } from "@/services/paymentService";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const reference = params.get("reference") || "";
  const [message, setMessage] = useState("Confirming your payment…");
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/create-account");
      return;
    }
    if (!reference) {
      setError("Missing payment reference");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await verifyPayment(reference);
        if (cancelled) return;
        if (result.status === "success") {
          setOk(true);
          setMessage(result.message);
        } else {
          setError(result.message || "Payment not completed");
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Verification failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, navigate, reference]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <TopNav />
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="rounded-3xl border-emerald-100 shadow-sm">
          <CardContent className="space-y-5 p-8 text-center">
            {!ok && !error ? (
              <div className="flex flex-col items-center gap-3 text-emerald-800">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{message}</p>
              </div>
            ) : null}
            {ok ? (
              <>
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h1 className="text-2xl font-semibold text-emerald-950">Land purchased</h1>
                <p className="text-sm text-emerald-800/80">{message}</p>
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 font-mono text-xs text-emerald-900">
                  {reference}
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/buy"
                    className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    Back to marketplace
                  </Link>
                  <Link
                    to="/my-properties"
                    className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-50"
                  >
                    View my activity
                  </Link>
                </div>
              </>
            ) : null}
            {error ? (
              <>
                <h1 className="text-2xl font-semibold text-red-700">Payment issue</h1>
                <p className="text-sm text-red-600">{error}</p>
                <Link
                  to="/buy"
                  className="inline-flex items-center justify-center rounded-md border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-50"
                >
                  Return to marketplace
                </Link>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
