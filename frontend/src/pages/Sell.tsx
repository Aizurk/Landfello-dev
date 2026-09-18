import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Home,
  ShieldCheck,
  Sparkles,
  Search,
  Users,
  CheckCircle2,
} from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";

/**
 * Landfello Sell Page (Investor) — Options First
 * - Above-the-fold: two big choices with clear CTAs
 * - Secondary sections below: trust, stats, and prep checklist
 */

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

function OptionCard({
  title,
  subtitle,
  bullets,
  cta,
  onClick,
  icon,
  accent,
  badge,
}: {
  title: string;
  subtitle: string;
  bullets: string[];
  cta: string;
  onClick: () => void;
  icon: React.ReactNode;
  accent: "blue" | "emerald";
  badge?: string;
}) {
  const isBlue = accent === "blue";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 ${
        isBlue ? "border-blue-600/20" : "border-emerald-600/20"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${
          isBlue ? "bg-blue-200/50" : "bg-emerald-200/50"
        }`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isBlue ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {icon}
              </div>
              {badge ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    isBlue
                      ? "bg-blue-50 text-blue-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <BadgeCheck className="h-4 w-4" /> {badge}
                </span>
              ) : null}
            </div>

            <h2 className="mt-3 text-xl font-semibold text-emerald-950">{title}</h2>
            <p className="mt-1 text-sm text-emerald-950/70">{subtitle}</p>
          </div>

          <div className="hidden sm:block">
            <span className="inline-flex items-center rounded-2xl border border-emerald-950/10 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-emerald-950/80 shadow-sm transition-all hover:bg-white/90">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Safer selling
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {bullets.map((b, index) => (
            <Bullet key={index}>{b}</Bullet>
          ))}
        </div>

        <button
          type="button"
          onClick={onClick}
          className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${
            isBlue ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mt-3 text-center text-xs text-emerald-950/60">
          You can switch paths anytime.
        </div>
      </div>
    </div>
  );
}

export default function SellPage() {
  const navigate = useNavigate();

  const goSellByOwner = () => {
    navigate("/sell/owner");
  };

  const goFindAgent = () => {
    navigate("/find-agent");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />
      
      {/* Hero with Options First */}
      <div className="relative overflow-hidden border-b border-emerald-950/10 bg-white">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 md:text-4xl mb-2">
              Choose how you want to sell
            </h1>
            <p className="text-sm text-emerald-950/70 md:text-base max-w-2xl mx-auto">
              Pick the route that fits your timeline. List it yourself with guided steps, or connect with an agent who can handle pricing, negotiations, and documentation.
            </p>
          </div>

          {/* Two Options - Above the Fold */}
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            <OptionCard
              title="Sell it yourself"
              badge="Owner listing"
              subtitle="List your home directly with guided steps and seller tools."
              bullets={[
                "Create a listing with photos, details, and your preferred contact method",
                "Get buyer inquiries directly — you stay in control",
                "Optional verification badge to build buyer trust",
                "Track views and save leads (coming soon)",
              ]}
              cta="Start owner listing"
              onClick={goSellByOwner}
              icon={<Home className="h-6 w-6" />}
              accent="blue"
            />

            <OptionCard
              title="Get an agent instead"
              badge="Guided support"
              subtitle="Work with an agent to handle pricing, showings, negotiations, and closing steps."
              bullets={[
                "Get matched by country/city and property type",
                "Agent can help verify documents and reduce risk",
                "Help negotiating and structuring payment milestones",
                "Best if you're abroad or want hands-off selling",
              ]}
              cta="Find an agent"
              onClick={goFindAgent}
              icon={<Search className="h-6 w-6" />}
              accent="emerald"
            />
          </div>

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3 mb-8">
            <Stat label="Typical time to list" value="10–20 min" icon={<Home className="h-5 w-5" />} />
            <Stat label="Buyer reach" value="Landfello network" icon={<Building2 className="h-5 w-5" />} />
            <Stat label="Support" value="Title-first mindset" icon={<ShieldCheck className="h-5 w-5" />} />
          </div>
        </div>
      </div>

      {/* Before You Sell Section */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-emerald-950/10 bg-white/80 p-6 shadow-sm backdrop-blur mb-10">
          <div className="text-sm font-semibold text-emerald-950 mb-4">Before you sell</div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Verify your documents</div>
              <div className="mt-1 text-sm text-emerald-950/70">Title / allocation / survey plans—buyers move faster with clarity.</div>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Use transparent pricing</div>
              <div className="mt-1 text-sm text-emerald-950/70">We'll help you set a price range using comps and key features.</div>
            </div>
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Avoid risky payments</div>
              <div className="mt-1 text-sm text-emerald-950/70">Use documented milestones. Don't accept payment to personal accounts.</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-950/60">
            Note: This page is investor-facing. Agents have a separate flow for listing.
          </div>
        </div>

        {/* Trust / safety */}
        <div className="rounded-3xl border border-emerald-950/10 bg-gradient-to-r from-emerald-50 to-blue-50 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-emerald-950">
                <Users className="h-5 w-5" /> Safer transactions, clearer timelines
              </div>
              <div className="mt-1 text-sm text-emerald-950/70">
                Landfello encourages documentation-first selling and transparent buyer communication.
              </div>
            </div>
            <Button
              onClick={() => alert("Open selling safety tips (demo)")}
              variant="outline"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-4 py-3 text-sm font-semibold text-emerald-950 shadow-sm hover:bg-emerald-50"
            >
              View selling tips <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <footer className="border-t border-emerald-950/10 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-emerald-950/60">
          © {new Date().getFullYear()} Landfello • Sell your way
        </div>
      </footer>
    </div>
  );
}
