import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Ruler,
  FileText,
  ShieldCheck,
  Sparkles,
  Home,
  X,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/services/propertyService";
import { initializePayment } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";

// ScrollArea component - using div with overflow for now
const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-y-auto ${className || ""}`}>{children}</div>
);

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onSave?: (propertyId: string) => void;
  saved?: boolean;
}

function formatUSD(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function PropertyDetailsDialog({
  open,
  onOpenChange,
  property,
  onSave,
  saved = false,
}: PropertyDetailsDialogProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  useEffect(() => {
    if (open && property) {
      setActiveImageIndex(0);
      setBuyError("");
    }
  }, [open, property]);

  if (!property) return null;

  const canBuy =
    property.listingType === "sale" &&
    property.status !== "sold" &&
    !!property.price &&
    property.price > 0;

  const handleBuyLand = async () => {
    if (!property.propertyID) return;
    if (!currentUser) {
      onOpenChange(false);
      navigate("/create-account");
      return;
    }
    setBuying(true);
    setBuyError("");
    try {
      const payment = await initializePayment(property.propertyID);
      onOpenChange(false);
      window.location.href = payment.authorizationUrl;
    } catch (err: any) {
      setBuyError(err.message || "Could not start checkout");
    } finally {
      setBuying(false);
    }
  };

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80"];

  const address = `${property.neighborhood ? `${property.neighborhood}, ` : ""}${property.city}, ${property.country}`;
  const listingType = property.listingType === "sale" ? "For sale" : "For rent";
  const price = property.listingType === "sale" ? property.price : property.monthlyRent;
  const priceLabel = property.listingType === "sale" ? "Price" : "Monthly Rent";

  // Calculate estimated monthly payment (rough estimate: 30% of price for rent, or mortgage estimate for sale)
  const estMonthly = property.listingType === "sale" && property.price
    ? Math.round(property.price * 0.005) // Rough mortgage estimate
    : property.monthlyRent || 0;

  const facts = [
    { label: "Property type", value: property.propertyType },
    { label: "Area", value: `${property.areaAcres} Acres` },
    { label: "Tenure", value: property.tenure || "Freehold" },
    { label: "Country", value: property.country },
    { label: "City", value: property.city },
    ...(property.neighborhood ? [{ label: "Neighborhood", value: property.neighborhood }] : []),
  ];

  if (property.listingType === "rent" && property.leaseTerm) {
    facts.push({ label: "Lease term", value: property.leaseTerm });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-w-6xl overflow-hidden rounded-2xl p-0 max-h-[85vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-emerald-100 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Back"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-sm text-emerald-700">Back to search</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="gap-2 rounded-full"
              onClick={() => onSave && property.propertyID && onSave(property.propertyID)}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-red-600 text-red-600" : ""}`} /> Save
            </Button>
            <Button variant="ghost" className="gap-2 rounded-full">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT: Image gallery and details */}
          <div className="lg:col-span-8 bg-white overflow-y-auto max-h-[calc(85vh-60px)]">
            <div className="relative p-4">
              {/* Image Mosaic - Compact size */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl" style={{ height: '280px' }}>
                  {/* Main large image */}
                  <div className="relative col-span-2 row-span-2">
                    <img
                      src={images[activeImageIndex] || images[0]}
                      alt="Main property view"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-3 top-3">
                      <Badge className="rounded-full bg-emerald-900/90 text-emerald-50">
                        {listingType}
                      </Badge>
                    </div>
                    {images.length > 1 && (
                      <div className="absolute bottom-2 right-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-lg bg-white/90 hover:bg-white text-xs h-7 px-2"
                          onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                        >
                          {images.length} photos
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Thumbnail images */}
                  {images.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Property view ${idx + 2}`}
                      className="h-full w-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setActiveImageIndex(idx + 1)}
                    />
                  ))}
                </div>
              )}

              {/* Image navigation - Compact */}
              {images.length > 1 && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <MapPin className="h-3.5 w-3.5" /> {address}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border-emerald-200"
                      onClick={() =>
                        setActiveImageIndex((n) => (n - 1 + images.length) % images.length)
                      }
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-emerald-700 min-w-[3rem] text-center">
                      {activeImageIndex + 1} / {images.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border-emerald-200"
                      onClick={() => setActiveImageIndex((n) => (n + 1) % images.length)}
                      aria-label="Next"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Content below images - Compact layout */}
            <div className="px-4 pb-4">
              {/* Price and Address - More compact */}
              <div className="mt-2">
                <div className="text-3xl font-bold tracking-tight text-emerald-950">
                  {price ? formatUSD(price) : "Price on request"}
                </div>
                <div className="mt-1 text-sm text-emerald-700">{address}</div>
                {property.listingType === "sale" && estMonthly > 0 && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                    <span className="font-semibold">Est.:</span> {formatUSD(estMonthly)}/mo
                  </div>
                )}
              </div>

              {/* Stats - Horizontal compact layout */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <BigStat value={property.areaAcres.toFixed(2)} label="acres" />
                <BigStat value={property.propertyType} label="type" />
                <BigStat value={property.tenure || "Freehold"} label="tenure" />
              </div>

              {/* Description - Compact */}
              <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-emerald-950">About this property</div>
                  {property.verified && (
                    <Badge className="rounded-full bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                  {property.description || "No description available."}
                </p>

                {/* Tags/Features */}
                {property.tags && property.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {property.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full border-emerald-200 text-emerald-800"
                      >
                        <Sparkles className="mr-1 h-3.5 w-3.5" /> {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Action panel */}
          <div className="lg:col-span-4 border-l border-emerald-100 bg-emerald-50 overflow-y-auto max-h-[calc(85vh-60px)]">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {/* Buy / Contact Card */}
                <Card className="rounded-2xl">
                  <CardContent className="space-y-3 p-4">
                    {property.status === "sold" ? (
                      <Button className="w-full" disabled>
                        Sold
                      </Button>
                    ) : canBuy ? (
                      <Button
                        className="w-full bg-emerald-700 hover:bg-emerald-800"
                        onClick={handleBuyLand}
                        disabled={buying}
                      >
                        {buying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting checkout…
                          </>
                        ) : (
                          `Buy land · ${formatUSD(property.price || 0)}`
                        )}
                      </Button>
                    ) : null}
                    {buyError ? <div className="text-xs text-red-600">{buyError}</div> : null}
                    <Button variant="outline" className="w-full border-emerald-200">
                      Contact agent
                    </Button>
                    <div className="text-xs text-emerald-700">
                      Secure checkout via Paystack test mode. Landfello marketplace for African land.
                    </div>
                  </CardContent>
                </Card>

                {/* Verified Details */}
                <Card className="rounded-2xl border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
                      <ShieldCheck className="h-4 w-4" /> Verified details
                    </div>
                    <div className="mt-3 space-y-2">
                      {facts.map((f) => (
                        <div
                          key={f.label}
                          className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                        >
                          <span className="text-emerald-700">{f.label}</span>
                          <span className="font-medium text-emerald-950">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                {(property.contactName || property.contactEmail || property.contactPhone) && (
                  <Card className="rounded-2xl border-emerald-200">
                    <CardContent className="p-4">
                      <div className="text-sm font-semibold text-emerald-950">Contact Information</div>
                      <div className="mt-3 space-y-2 text-sm">
                        {property.contactName && (
                          <div className="text-emerald-800">
                            <strong>Name:</strong> {property.contactName}
                          </div>
                        )}
                        {property.contactEmail && (
                          <div className="text-emerald-800">
                            <strong>Email:</strong>{" "}
                            <a
                              href={`mailto:${property.contactEmail}`}
                              className="text-emerald-600 hover:underline"
                            >
                              {property.contactEmail}
                            </a>
                          </div>
                        )}
                        {property.contactPhone && (
                          <div className="text-emerald-800">
                            <strong>Phone:</strong>{" "}
                            <a
                              href={`tel:${property.contactPhone}`}
                              className="text-emerald-600 hover:underline"
                            >
                              {property.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Documents */}
                <Card className="rounded-2xl border-emerald-200">
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold text-emerald-950">Documents</div>
                    <div className="mt-2 text-sm text-emerald-800">
                      Title docs, survey/boundary, and tenure paperwork can be attached here.
                    </div>
                    <Button variant="outline" className="mt-3 w-full border-emerald-200">
                      View documents
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-white p-2 text-center">
      <div className="text-base font-bold text-emerald-950 truncate">{value}</div>
      <div className="text-xs text-emerald-700">{label}</div>
    </div>
  );
}

function FactPill({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <div className="rounded-xl bg-white p-2 text-emerald-800">{icon}</div>
      <div className="text-sm font-medium text-emerald-950 truncate">{title}</div>
    </div>
  );
}

