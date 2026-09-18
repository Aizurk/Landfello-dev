import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Search,
  FileCheck,
  CreditCard,
  MapPin,
  PiggyBank,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/BrandLogo";

function StepCard({
  number,
  icon,
  title,
  description,
  details,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}) {
  return (
    <Card className="rounded-[24px] border-emerald-900/10 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-900/10 flex items-center justify-center text-emerald-900">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="rounded-full bg-emerald-900/10 text-emerald-950 ring-1 ring-emerald-900/10">
                Step {number}
              </Badge>
              <h3 className="text-lg font-semibold text-emerald-950">{title}</h3>
            </div>
            <p className="text-sm text-emerald-950/70 mb-3">{description}</p>
            <ul className="space-y-2">
              {details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-emerald-950/65">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-900 mt-0.5 flex-shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SavingsFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 ring-1 ring-black/5 p-5">
      <div className="text-emerald-900 mb-3">{icon}</div>
      <h4 className="text-sm font-semibold text-emerald-950 mb-2">{title}</h4>
      <p className="text-xs text-emerald-950/65">{description}</p>
    </div>
  );
}

export default function HowItWorks() {
  const navigate = useNavigate();
  
  // Debug: Check if component is loading
  React.useEffect(() => {
    console.log('HowItWorks component loaded');
  }, []);

  const purchaseSteps = [
    {
      number: 1,
      icon: <Search className="h-6 w-6" />,
      title: "Browse & Select",
      description: "Explore verified listings across Africa with transparent pricing and clear documentation.",
      details: [
        "Search by country, city, or property type",
        "View detailed property information and photos",
        "Check verification status and legal documentation",
        "Compare prices and locations",
      ],
    },
    {
      number: 2,
      icon: <FileCheck className="h-6 w-6" />,
      title: "Due Diligence & Verification",
      description: "We coordinate comprehensive checks through trusted local partners to ensure secure ownership.",
      details: [
        "Title verification and ownership history",
        "Property survey and boundary confirmation",
        "Legal review by local experts",
        "Risk assessment and documentation review",
      ],
    },
    {
      number: 3,
      icon: <CreditCard className="h-6 w-6" />,
      title: "Secure Purchase",
      description: "Complete your purchase with guided support and secure payment processing.",
      details: [
        "Finalize purchase terms and pricing",
        "Secure payment through escrow service",
        "Legal documentation and transfer process",
        "Receive ownership confirmation",
      ],
    },
    {
      number: 4,
      icon: <MapPin className="h-6 w-6" />,
      title: "Ownership & Next Steps",
      description: "Get your ownership documents and guidance on property management or development.",
      details: [
        "Receive official ownership documents",
        "Property registration confirmation",
        "Access to property management resources",
        "Ongoing support and guidance",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <BrandLogo showTagline />
          <Button variant="ghost" onClick={() => navigate('/')} className="rounded-2xl px-3 py-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="rounded-full bg-emerald-900/5 text-emerald-950 hover:bg-emerald-900/5 ring-1 ring-emerald-900/10 mb-4">
            <ShieldCheck className="h-4 w-4 mr-2" /> Trust-first process
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-emerald-950 mt-4">
            How it works
            <span className="block text-emerald-900/70">Your path to land ownership in Africa</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-emerald-950/70">
            Whether you're ready to purchase now or want to save up gradually, we've built a clear, secure process
            designed for both locals and the diaspora.
          </p>
        </div>
      </section>

      {/* Purchase Process Section */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-emerald-900" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-emerald-950">Purchasing Land</h2>
              <p className="text-sm text-emerald-950/60">A step-by-step guide to buying verified property</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {purchaseSteps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>

        <div className="mt-8 rounded-[28px] bg-emerald-950 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
          <div className="relative p-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Why verification matters</h3>
                <p className="text-white/80 text-sm mb-4">
                  Every listing goes through our verification process to reduce ownership risk. We work with local
                  legal partners to check titles, confirm boundaries, and ensure clear documentation before you
                  purchase.
                </p>
                <Button
                  className="rounded-2xl bg-amber-400 text-emerald-950 hover:bg-amber-300"
                  onClick={() => navigate('/')}
                >
                  Browse verified listings <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Program Section */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-emerald-950" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-emerald-950">Landfello Partner Program</h2>
              <p className="text-sm text-emerald-950/60">Save gradually toward your land purchase goal</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="rounded-[28px] bg-white/70 ring-1 ring-black/5 p-6 mb-6">
              <h3 className="text-xl font-semibold text-emerald-950 mb-4">How the Landfello Partner Program works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-900">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-950 mb-1">Set your goal</h4>
                    <p className="text-xs text-emerald-950/65">
                      Choose a target amount and timeline. You can save toward a specific property or a general
                      budget goal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-900">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-950 mb-1">Save regularly</h4>
                    <p className="text-xs text-emerald-950/65">
                      Make deposits on your schedule—weekly, monthly, or whenever you can. Your savings are held
                      securely in escrow.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-900">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-950 mb-1">Track progress</h4>
                    <p className="text-xs text-emerald-950/65">
                      Monitor your savings growth with clear dashboards. See how close you are to your goal and adjust
                      your timeline as needed.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-emerald-900">4</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-950 mb-1">Purchase when ready</h4>
                    <p className="text-xs text-emerald-950/65">
                      Once you reach your goal, use your saved funds to purchase any verified listing. Your savings
                      transfer directly to the purchase.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <SavingsFeature
                icon={<Target className="h-5 w-5" />}
                title="Flexible goals"
                description="Set any target amount and timeline that works for you"
              />
              <SavingsFeature
                icon={<TrendingUp className="h-5 w-5" />}
                title="Track growth"
                description="Visual dashboards show your progress toward ownership"
              />
              <SavingsFeature
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Secure escrow"
                description="Your savings are held safely until you're ready to purchase"
              />
              <SavingsFeature
                icon={<Clock className="h-5 w-5" />}
                title="No pressure"
                description="Save at your own pace with no deadlines or penalties"
              />
            </div>
          </div>

          <div>
            <Card className="rounded-[28px] border-emerald-900/10 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-50" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-950" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">Example savings plan</h3>
                    <p className="text-xs text-emerald-950/60">Reach your goal in manageable steps</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-emerald-900/5 ring-1 ring-emerald-900/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-emerald-950/70">Target amount</span>
                      <span className="text-sm font-semibold text-emerald-950">$50,000</span>
                    </div>
                    <div className="h-2 rounded-full bg-emerald-900/10 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: "60%" }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-emerald-950/60">
                      <span>Saved: $30,000</span>
                      <span>60% complete</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-emerald-950/70">
                      <span>Monthly savings</span>
                      <span className="font-medium text-emerald-950">$1,000/month</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-950/70">
                      <span>Timeline</span>
                      <span className="font-medium text-emerald-950">20 months</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-950/70">
                      <span>Remaining</span>
                      <span className="font-medium text-emerald-950">$20,000 (8 months)</span>
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-2xl bg-amber-400 text-emerald-950 hover:bg-amber-300"
                    onClick={() => navigate('/create-account')}
                  >
                    Start saving <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-[28px] bg-emerald-950 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
          <div className="relative p-8 sm:p-10 text-center">
            <h3 className="text-2xl font-semibold mb-3">Ready to get started?</h3>
            <p className="text-white/75 max-w-xl mx-auto mb-6">
              Whether you're ready to purchase now or want to start saving, create your account to browse verified
              listings and set up your savings goal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="rounded-2xl bg-amber-400 text-emerald-950 hover:bg-amber-300 px-5 py-2.5 font-semibold"
                onClick={() => navigate('/create-account')}
              >
                Create account
              </Button>
              <Button
                variant="secondary"
                className="rounded-2xl bg-white/10 text-white hover:bg-white/15"
                onClick={() => navigate('/')}
              >
                Browse listings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-900/10 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-emerald-950/60">
          © {new Date().getFullYear()} Landfello. This is a UI concept preview.
        </div>
      </footer>
    </div>
  );
}

