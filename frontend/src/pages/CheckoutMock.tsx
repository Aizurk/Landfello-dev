import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { verifyPayment } from "@/services/paymentService";

export default function CheckoutMock() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const reference = params.get("reference") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/create-account");
    }
  }, [currentUser, navigate]);

  const completePayment = async () => {
    if (!reference) {
      setError("Missing payment reference");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await verifyPayment(reference);
      if (result.status !== "success") {
        throw new Error(result.message || "Payment failed");
      }
      setDone(true);
      setTimeout(() => {
        navigate(`/checkout/success?reference=${encodeURIComponent(reference)}`);
      }, 800);
    } catch (err: any) {
      setError(err.message || "Could not complete payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <TopNav />
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="rounded-3xl border-emerald-100 shadow-sm">
          <CardContent className="space-y-5 p-8">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">Paystack test checkout (mock)</span>
            </div>
            <h1 className="text-2xl font-semibold text-emerald-950">Complete your land purchase</h1>
            <p className="text-sm text-emerald-800/80">
              No Paystack secret key is configured, so this local mock stands in for Paystack&apos;s
              hosted checkout. Click below to mark the test payment as successful.
            </p>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Reference: <span className="font-mono">{reference || "—"}</span>
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {done ? (
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" /> Payment successful
              </div>
            ) : (
              <Button
                className="w-full bg-emerald-700 hover:bg-emerald-800"
                onClick={completePayment}
                disabled={loading || !reference}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : (
                  "Pay with Paystack (Test)"
                )}
              </Button>
            )}
            <Link to="/buy" className="block text-center text-sm text-emerald-700 hover:underline">
              Cancel and return to marketplace
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
