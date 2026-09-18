import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Languages,
  Briefcase,
  Phone,
  Mail,
  Globe,
  BadgeCheck,
  Users,
  ArrowRight,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { TopNav } from "@/components/Profile/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAllProperties, Property } from "@/services/propertyService";
import { PropertyDetailsDialog } from "@/components/PropertyDetailsDialog";

// Pill component for tags
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-950/10 bg-white/70 px-2.5 py-1 text-xs font-medium text-emerald-950 backdrop-blur">
      {children}
    </span>
  );
}

// Rating stars component
function RatingStars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = !filled && half && i === full;
        return (
          <span key={i} className="inline-flex">
            <Star
              className={`h-4 w-4 ${filled ? "text-amber-500" : "text-emerald-950/20"}`}
              fill={filled ? "currentColor" : "none"}
            />
            {isHalf ? (
              <span className="-ml-4 inline-flex h-4 w-2 overflow-hidden">
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
              </span>
            ) : null}
          </span>
        );
      })}
      <span className="ml-1 text-xs text-emerald-950/60">{value.toFixed(1)}</span>
    </div>
  );
}

type Agent = {
  id: string;
  name: string;
  avatarUrl?: string;
  location: { country: string; city: string; neighborhood?: string };
  specialties: string[];
  languages: string[];
  yearsExp: number;
  dealsClosed: number;
  rating: number;
  verified: boolean;
  phone: string;
  email: string;
  website?: string;
  bio: string;
  responseTime: string;
  serviceAreas: string[];
};

const MOCK_AGENTS: Agent[] = [
  {
    id: "a1",
    name: "Amaka Nwosu",
    location: { country: "Nigeria", city: "Lagos", neighborhood: "Lekki" },
    specialties: ["Residential", "Land", "First-time buyers"],
    languages: ["English", "Yoruba"],
    yearsExp: 8,
    dealsClosed: 164,
    rating: 4.8,
    verified: true,
    phone: "+234 80 0000 0000",
    email: "amaka@landfello.com",
    website: "https://landfello.com",
    bio: "I help buyers find legitimate land and homes in Lagos with due diligence, title verification, and negotiation support.",
    responseTime: "Usually responds in under 2 hours",
    serviceAreas: ["Lekki", "Ajah", "Victoria Island", "Ikoyi"],
  },
  {
    id: "a2",
    name: "Kofi Mensah",
    location: { country: "Ghana", city: "Accra", neighborhood: "East Legon" },
    specialties: ["Luxury", "Commercial", "Investment"],
    languages: ["English", "Twi"],
    yearsExp: 11,
    dealsClosed: 210,
    rating: 4.6,
    verified: true,
    phone: "+233 20 000 0000",
    email: "kofi@landfello.com",
    website: "https://landfello.com",
    bio: "Investor-focused agent helping diaspora clients evaluate yield, risks, and documentation for Ghana real estate.",
    responseTime: "Usually responds same day",
    serviceAreas: ["East Legon", "Airport Residential", "Cantonments"],
  },
  {
    id: "a3",
    name: "Aisha Abdullahi",
    location: { country: "Nigeria", city: "Abuja", neighborhood: "Gwarinpa" },
    specialties: ["Land", "New builds"],
    languages: ["English", "Hausa"],
    yearsExp: 6,
    dealsClosed: 98,
    rating: 4.5,
    verified: false,
    phone: "+234 81 0000 0000",
    email: "aisha@landfello.com",
    website: "https://landfello.com",
    bio: "I guide clients through safe land purchases in Abuja with clear documentation steps and transparent timelines.",
    responseTime: "Usually responds in 4–6 hours",
    serviceAreas: ["Gwarinpa", "Maitama", "Wuse 2"],
  },
  {
    id: "a4",
    name: "Thabo Dlamini",
    location: { country: "South Africa", city: "Cape Town", neighborhood: "Sea Point" },
    specialties: ["Residential", "Vacation homes"],
    languages: ["English", "Zulu"],
    yearsExp: 9,
    dealsClosed: 140,
    rating: 4.7,
    verified: true,
    phone: "+27 71 000 0000",
    email: "thabo@landfello.com",
    website: "https://landfello.com",
    bio: "Helping buyers and investors find coastal properties with strong rental potential and smooth closing.",
    responseTime: "Usually responds in under 3 hours",
    serviceAreas: ["Sea Point", "Green Point", "Camps Bay"],
  },
];

function AgentCard({ agent, onSelect }: { agent: Agent; onSelect: () => void }) {
  return (
    <div className="group rounded-2xl border border-emerald-950/10 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-emerald-950/10">
          {agent.avatarUrl ? (
            <img src={agent.avatarUrl} alt={agent.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-emerald-950/70">
              {agent.name
                .split(" ")
                .slice(0, 2)
                .map((s) => s[0])
                .join("")}
            </div>
          )}
          {agent.verified ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
              <BadgeCheck className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-emerald-950">{agent.name}</h3>
                {agent.verified ? (
                  <Pill>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  </Pill>
                ) : (
                  <Pill>Not verified</Pill>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-emerald-950/70">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {agent.location.city}, {agent.location.country}
                </span>
                {agent.location.neighborhood ? (
                  <>
                    <span className="text-emerald-950/35">•</span>
                    <span>{agent.location.neighborhood}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="shrink-0">
              <RatingStars value={agent.rating} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {agent.specialties.slice(0, 3).map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
            {agent.specialties.length > 3 ? <Pill>+{agent.specialties.length - 3} more</Pill> : null}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-emerald-950/70">
            <div className="rounded-xl border border-emerald-950/10 bg-white p-2">
              <div className="font-semibold text-emerald-950">{agent.yearsExp} yrs</div>
              <div className="text-emerald-950/60">Experience</div>
            </div>
            <div className="rounded-xl border border-emerald-950/10 bg-white p-2">
              <div className="font-semibold text-emerald-950">{agent.dealsClosed}</div>
              <div className="text-emerald-950/60">Deals closed</div>
            </div>
            <div className="rounded-xl border border-emerald-950/10 bg-white p-2">
              <div className="font-semibold text-emerald-950">{agent.responseTime}</div>
              <div className="text-emerald-950/60">Response</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-950/70">
              <span className="inline-flex items-center gap-1">
                <Languages className="h-4 w-4" />
                {agent.languages.slice(0, 2).join(", ")}
                {agent.languages.length > 2 ? ", …" : ""}
              </span>
              <span className="text-emerald-950/35">•</span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {agent.serviceAreas.slice(0, 2).join(", ")}
                {agent.serviceAreas.length > 2 ? ", …" : ""}
              </span>
            </div>

            <Button
              onClick={onSelect}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              View profile <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Drawer({ 
  open, 
  onClose, 
  agent,
  onPropertyClick,
}: { 
  open: boolean; 
  onClose: () => void; 
  agent: Agent | null;
  onPropertyClick: (property: Property) => void;
}) {
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  useEffect(() => {
    if (open && agent) {
      // Fetch properties for this agent by matching contactEmail
      const fetchAgentProperties = async () => {
        setLoadingProperties(true);
        setPropertiesError(null);
        try {
          const allProperties = await getAllProperties();
          // Filter properties where contactEmail matches agent email
          const filtered = allProperties.filter(
            (p) => p.contactEmail?.toLowerCase() === agent.email.toLowerCase()
          );
          setAgentProperties(filtered);
        } catch (error: any) {
          console.error("Error fetching agent properties:", error);
          setPropertiesError(error.message || "Failed to load properties");
        } finally {
          setLoadingProperties(false);
        }
      };

      fetchAgentProperties();
    } else {
      setAgentProperties([]);
    }
  }, [open, agent]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!agent) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "rgba(10, 30, 25, 0.45)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-3xl max-h-[90dvh] flex-col rounded-t-3xl border border-emerald-950/10 bg-white shadow-[0_24px_80px_rgba(10,30,25,0.35),0_8px_24px_rgba(10,30,25,0.18)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-emerald-950/5 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-emerald-950">{agent.name}</h2>
              {agent.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="h-4 w-4" /> Verified agent
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <ShieldCheck className="h-4 w-4" /> Not verified
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-emerald-950/70">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />{" "}
                {agent.location.neighborhood ? `${agent.location.neighborhood}, ` : ""}
                {agent.location.city}, {agent.location.country}
              </span>
              <span className="text-emerald-950/35">•</span>
              <RatingStars value={agent.rating} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-950/10 bg-white text-emerald-950/70 hover:bg-emerald-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-emerald-950/10 bg-emerald-50/40 p-4">
              <div className="text-sm font-semibold text-emerald-950">About</div>
              <p className="mt-1 text-sm leading-relaxed text-emerald-950/75">{agent.bio}</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
                  <Users className="h-4 w-4" /> Experience
                </div>
                <div className="mt-2 text-sm text-emerald-950/75">
                  {agent.yearsExp} years • {agent.dealsClosed} deals closed
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
                  <SlidersHorizontal className="h-4 w-4" /> Service areas
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {agent.serviceAreas.map((a) => (
                    <Pill key={a}>{a}</Pill>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Specialties</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {agent.specialties.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </div>

              <div className="mt-3 text-sm font-semibold text-emerald-950">Languages</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {agent.languages.map((l) => (
                  <Pill key={l}>{l}</Pill>
                ))}
              </div>
            </div>

            {/* Agent's Listed Properties */}
            <div className="mt-4 rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950 mb-3">
                Listed Properties ({agentProperties.length})
              </div>
              
              {loadingProperties ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : propertiesError ? (
                <div className="text-sm text-red-600 py-4">{propertiesError}</div>
              ) : agentProperties.length === 0 ? (
                <div className="text-sm text-emerald-950/60 py-4 text-center">
                  No properties listed yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                  {agentProperties.map((property) => (
                    <Card
                      key={property.propertyID}
                      className="cursor-pointer hover:shadow-md transition-all border-emerald-950/10 hover:border-emerald-600/30"
                      onClick={() => onPropertyClick(property)}
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-emerald-950/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-6 w-6 text-emerald-950/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-emerald-950 truncate">
                              {property.title}
                            </h4>
                            <p className="text-xs text-emerald-950/70 mt-1">
                              {property.city}, {property.country}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {property.listingType === "sale" && property.price ? (
                                <span className="text-sm font-semibold text-emerald-900">
                                  ${property.price.toLocaleString()}
                                </span>
                              ) : property.listingType === "rent" && property.monthlyRent ? (
                                <span className="text-sm font-semibold text-emerald-900">
                                  ${property.monthlyRent.toLocaleString()}/mo
                                </span>
                              ) : null}
                              <span className="text-xs text-emerald-950/60">
                                • {property.areaAcres} acres
                              </span>
                              {property.propertyType && (
                                <Badge className="text-xs bg-emerald-50 text-emerald-900 border-emerald-200">
                                  {property.propertyType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-4">
              <div className="text-sm font-semibold text-emerald-950">Contact</div>

              <div className="mt-3 grid gap-2 text-sm">
                <a
                  href={`tel:${agent.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-emerald-950/80 hover:bg-emerald-50"
                >
                  <Phone className="h-4 w-4" /> {agent.phone}
                </a>
                <a
                  href={`mailto:${agent.email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-emerald-950/80 hover:bg-emerald-50"
                >
                  <Mail className="h-4 w-4" /> {agent.email}
                </a>
                {agent.website ? (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-emerald-950/80 hover:bg-emerald-50"
                  >
                    <Globe className="h-4 w-4" /> Website
                  </a>
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-950/10 bg-emerald-50/40 p-3">
                <div className="text-xs font-semibold text-emerald-950">Safety tip</div>
                <p className="mt-1 text-xs text-emerald-950/70">
                  Landfello recommends verifying titles and using documented payment milestones. Don't send funds to personal
                  accounts.
                </p>
              </div>

              <Button
                onClick={() => alert("Request sent (demo)")}
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Request this agent
              </Button>

              <div className="mt-2 text-center text-xs text-emerald-950/60">{agent.responseTime}</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default function FindAgentPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [specialty, setSpecialty] = useState<string>("");
  const [selected, setSelected] = useState<Agent | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

  const countries = useMemo(() => {
    const set = new Set(MOCK_AGENTS.map((a) => a.location.country));
    return ["", ...Array.from(set).sort()];
  }, []);

  const cities = useMemo(() => {
    const set = new Set(
      MOCK_AGENTS.filter((a) => (!country ? true : a.location.country === country)).map((a) => a.location.city)
    );
    return ["", ...Array.from(set).sort()];
  }, [country]);

  const specialties = useMemo(() => {
    const set = new Set(MOCK_AGENTS.flatMap((a) => a.specialties));
    return ["", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_AGENTS.filter((a) => {
      if (verifiedOnly && !a.verified) return false;
      if (country && a.location.country !== country) return false;
      if (city && a.location.city !== city) return false;
      if (specialty && !a.specialties.includes(specialty)) return false;

      if (!q) return true;
      const haystack = [
        a.name,
        a.location.country,
        a.location.city,
        a.location.neighborhood || "",
        a.specialties.join(" "),
        a.languages.join(" "),
        a.serviceAreas.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, country, city, verifiedOnly, specialty]);

  const featured = useMemo(() => {
    return [...MOCK_AGENTS]
      .filter((a) => a.verified)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />
      
      {/* Header */}
      <div className="relative overflow-hidden border-b border-emerald-950/10 bg-white">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-emerald-950 md:text-4xl">
                Find an agent to help you buy property in Africa
              </h1>
              <p className="mt-2 text-sm text-emerald-950/70 md:text-base">
                Search by country, city, specialty, and verification status. Review experience and contact an agent when you're
                ready.
              </p>
            </div>

            <div className="grid w-full gap-3 md:w-[520px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, area, specialty, language…"
                  className="w-full rounded-2xl border border-emerald-950/10 bg-white px-10 py-3 text-sm text-emerald-950 shadow-sm placeholder:text-emerald-950/40 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity("");
                  }}
                  className="w-full rounded-2xl border border-emerald-950/10 bg-white px-3 py-3 text-sm text-emerald-950 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {countries.map((c) => (
                    <option key={c || "all"} value={c}>
                      {c ? c : "All countries"}
                    </option>
                  ))}
                </select>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-950/10 bg-white px-3 py-3 text-sm text-emerald-950 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {cities.map((c) => (
                    <option key={c || "all"} value={c}>
                      {c ? c : "All cities"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-950/10 bg-white px-3 py-3 text-sm text-emerald-950 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {specialties.map((s) => (
                    <option key={s || "all"} value={s}>
                      {s ? s : "All specialties"}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setVerifiedOnly((v) => !v)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold shadow-sm transition ${
                    verifiedOnly
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-emerald-950/10 bg-white text-emerald-950 hover:bg-emerald-50"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {verifiedOnly ? "Verified only" : "Any verification"}
                </button>
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-emerald-950">Top rated verified agents</div>
              <div className="text-xs text-emerald-950/60">Updated weekly (demo)</div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {featured.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="rounded-2xl border border-emerald-950/10 bg-white/80 p-4 text-left shadow-sm backdrop-blur transition hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-emerald-950">{a.name}</div>
                      <div className="mt-1 text-xs text-emerald-950/70">
                        {a.location.city}, {a.location.country}
                      </div>
                    </div>
                    <RatingStars value={a.rating} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.specialties.slice(0, 2).map((s) => (
                      <Pill key={s}>{s}</Pill>
                    ))}
                    <Pill>+{Math.max(0, a.specialties.length - 2)} more</Pill>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" /> Verified
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold text-emerald-950">Results</div>
            <div className="text-sm text-emerald-950/60">
              {filtered.length} agent{filtered.length === 1 ? "" : "s"} found
            </div>
          </div>
          <Button
            onClick={() => {
              setQuery("");
              setCountry("");
              setCity("");
              setVerifiedOnly(false);
              setSpecialty("");
            }}
            variant="outline"
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-3 py-2 text-sm font-semibold text-emerald-950 shadow-sm hover:bg-emerald-50"
          >
            Reset filters <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {filtered.map((agent) => (
            <div key={agent.id} className="transition-opacity">
              <AgentCard agent={agent} onSelect={() => setSelected(agent)} />
            </div>
          ))}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-emerald-950/10 bg-white p-8 text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Search className="h-6 w-6" />
              </div>
              <div className="mt-3 text-base font-semibold text-emerald-950">No agents found</div>
              <div className="mt-1 text-sm text-emerald-950/60">
                Try clearing filters or searching for a city like "Lagos" or "Accra".
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-10 rounded-3xl border border-emerald-950/10 bg-gradient-to-r from-emerald-50 to-amber-50 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-base font-semibold text-emerald-950">Are you a licensed agent?</div>
              <div className="mt-1 text-sm text-emerald-950/70">
                Join Landfello and get discovered by buyers searching in your area.
              </div>
            </div>
            <Button
              onClick={() => alert("Apply flow (demo)")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Apply as an agent <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Drawer 
        open={!!selected} 
        agent={selected} 
        onClose={() => setSelected(null)}
        onPropertyClick={(property) => {
          setSelectedProperty(property);
          setPropertyDialogOpen(true);
        }}
      />

      <PropertyDetailsDialog
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
        property={selectedProperty}
      />

      <footer className="border-t border-emerald-950/10 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-emerald-950/60">
          © {new Date().getFullYear()} Landfello • Built for safe property discovery
        </div>
      </footer>
    </div>
  );
}

