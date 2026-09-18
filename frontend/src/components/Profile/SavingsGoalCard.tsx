import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export type Goal = {
  id: string;
  name: string;
  targetUSD: number;
  savedUSD: number;
  country: string;
  city: string;
  cadence: "Weekly" | "Biweekly" | "Monthly";
  nextDepositDate: string;
};

function formatUSD(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function SavingsGoalCard({ g }: { g: Goal }) {
  const pct = Math.min(100, Math.round((g.savedUSD / g.targetUSD) * 100));
  return (
    <Card className="rounded-3xl border-black/5 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-emerald-950">{g.name}</CardTitle>
            <div className="text-sm text-emerald-950/60 mt-1">
              {g.city}, {g.country}
            </div>
          </div>
          <Badge className="rounded-full bg-emerald-900/5 text-emerald-950 border border-emerald-900/10">
            {g.cadence}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-emerald-950/60">Saved</div>
            <div className="text-lg font-semibold text-emerald-950">{formatUSD(g.savedUSD)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-emerald-950/60">Goal</div>
            <div className="text-sm font-semibold text-emerald-950">{formatUSD(g.targetUSD)}</div>
          </div>
        </div>

        <div className="mt-3">
          <Progress value={pct} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-950/60">
            <span>{pct}%</span>
            <span>Next deposit: {g.nextDepositDate}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="rounded-2xl border-emerald-900/15">
            Add funds
          </Button>
          <Button type="button" className="rounded-2xl bg-emerald-950 text-white hover:bg-emerald-950/90">
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

