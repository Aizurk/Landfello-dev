import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShieldCheck, ChevronRight, ArrowUpRight } from "lucide-react";

export type Listing = {
  id: string;
  title: string;
  country: string;
  city: string;
  priceUSD: number;
  areaAcres: number;
  landType: "Residential" | "Agricultural" | "Commercial" | "Mixed Use";
  tenure: "Freehold" | "Leasehold";
  verified: boolean;
  imageUrl: string;
};

function formatUSD(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function ListingCard({
  l,
  onSave,
  saved,
}: {
  l: Listing;
  onSave: (id: string) => void;
  saved: boolean;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-black/5 bg-white">
      <div className="relative aspect-[16/10]">
        <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {l.verified ? (
            <Badge className="rounded-full bg-emerald-950/80 text-white border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge className="rounded-full bg-white/10 text-white border border-white/15">
              Unverified
            </Badge>
          )}
          <Badge className="rounded-full bg-white/10 text-white border border-white/15">
            {l.tenure}
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => onSave(l.id)}
          className={
            saved
              ? "absolute right-3 top-3 h-10 w-10 rounded-2xl bg-white text-emerald-950 grid place-items-center shadow"
              : "absolute right-3 top-3 h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/15 text-white grid place-items-center"
          }
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Heart className={saved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
        </button>

        <div className="absolute left-3 right-3 bottom-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-white text-sm font-semibold leading-tight">{l.title}</div>
            <div className="text-white/80 text-xs">
              {l.city}, {l.country} • {l.areaAcres} acres • {l.landType}
            </div>
          </div>
          <div className="text-white text-sm font-semibold whitespace-nowrap">{formatUSD(l.priceUSD)}</div>
        </div>
      </div>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-emerald-900/15"
          >
            View details
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button type="button" className="rounded-2xl bg-emerald-950 text-white hover:bg-emerald-950/90">
            Start saving
            <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

