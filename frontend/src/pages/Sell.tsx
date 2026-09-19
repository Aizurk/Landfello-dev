import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Home,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { useRoleGate } from "@/hooks/useRoleGate";

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-emerald-950/10 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-emerald-950/70">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          {icon}
        </span>
        <div className="text-xs font-semibold">{label}</div>
      </div>
      <div className="mt-2 text-lg font-semibold text-emerald-950">{value}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-emerald-950/75">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
      <span>{children}</span>
    </div>
  );
}

export default function SellPage() {
  useRoleGate("sell");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />

      <div className="relative overflow-hidden border-b border-emerald-950/10 bg-white">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 md:text-4xl mb-2">
              Sell land on Landfello
            </h1>
            <p className="text-sm text-emerald-950/70 md:text-base">
              List your land with photos and details, reach buyers across Africa, and stay in control of inquiries.
            </p>
          </div>

          <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Home className="h-6 w-6" />
              </span>
              <div>
                <div className="text-lg font-semibold text-emerald-950">List your land</div>
                <div className="text-sm text-emerald-950/70">Guided listing with photos, price, and contact details.</div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <Bullet>Create a listing with photos, details, and your preferred contact method</Bullet>
              <Bullet>Get buyer inquiries directly — you stay in control</Bullet>
              <Bullet>Optional verification badge to build buyer trust</Bullet>
              <Bullet>Reach buyers looking for land across Africa</Bullet>
            </div>
            <Button
              className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-800"
              onClick={() => navigate("/sell/owner")}
            >
              Start owner listing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="mt-3 text-center text-xs text-emerald-950/60">
              Agents can also list land from Add Property after signing up as an agent.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 mb-8">
            <Stat label="Typical time to list" value="10–20 min" icon={<Home className="h-5 w-5" />} />
            <Stat label="Buyer reach" value="Landfello network" icon={<Building2 className="h-5 w-5" />} />
            <Stat label="Support" value="Title-first mindset" icon={<ShieldCheck className="h-5 w-5" />} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-emerald-950/10 bg-white/80 p-6 shadow-sm backdrop-blur mb-10">
          <div className="text-sm font-semibold text-emerald-950 mb-4">Before you sell</div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Verify your documents</div>
              <div className="mt-1 text-sm text-emerald-950/70">
                Have title, survey, and ownership paperwork ready before listing.
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Set a clear price</div>
              <div className="mt-1 text-sm text-emerald-950/70">
                Buyers can purchase listed land through secure checkout once it is published.
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Add strong photos</div>
              <div className="mt-1 text-sm text-emerald-950/70">
                Clear land photos and location details help serious buyers move faster.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
