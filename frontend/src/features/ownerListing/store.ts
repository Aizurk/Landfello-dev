import type {
  FeedbackIssue,
  Offer,
  OwnerListingDraft,
  SellerType,
  TransactionStage,
} from "./types";
import { createEmptyDraft } from "./types";

const STORAGE_KEY = "landfello_owner_listings";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): OwnerListingDraft[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OwnerListingDraft[]) : [];
  } catch {
    return [];
  }
}

function writeAll(listings: OwnerListingDraft[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

export function listListings(): OwnerListingDraft[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getListing(id: string): OwnerListingDraft | null {
  return readAll().find((listing) => listing.id === id) ?? null;
}

export function saveListing(draft: OwnerListingDraft): OwnerListingDraft {
  const updated: OwnerListingDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  const listings = readAll();
  const index = listings.findIndex((listing) => listing.id === updated.id);
  if (index >= 0) {
    listings[index] = updated;
  } else {
    listings.push(updated);
  }
  writeAll(listings);
  return updated;
}

export function createListing(): OwnerListingDraft {
  const draft = createEmptyDraft();
  return saveListing(draft);
}

export function deleteListing(id: string): void {
  writeAll(readAll().filter((listing) => listing.id !== id));
}

export function getActiveDraft(): OwnerListingDraft | null {
  const drafts = readAll()
    .filter((listing) => listing.status === "draft")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return drafts[0] ?? null;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makeDoc(
  id: string,
  name: string,
  reviewStatus: "pending" | "approved" | "rejected" | "needs_info" = "pending",
): OwnerListingDraft["documents"][number] {
  return {
    id,
    name,
    type: "application/pdf",
    uploadedAt: daysAgo(5),
    reviewStatus,
    privacy: "verified_buyers",
    size: 240_000,
  };
}

function buildDraftAccra(): OwnerListingDraft {
  const base = createEmptyDraft();
  return {
    ...base,
    id: "listing_dummy_accra_draft",
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
    currentStep: 5,
    status: "draft",
    sellerType: "owner",
    ownerName: "Kwame Mensah",
    identity: {
      ...base.identity,
      fullName: "Kwame Mensah",
      dob: "1988-04-16",
      citizenship: "Ghana",
      residence: "Ghana",
      address: "12 Liberation Road, Accra",
      phone: "+233244567890",
      email: "kwame.mensah@example.com",
      idType: "national_id",
      phoneVerified: true,
      emailVerified: true,
      identityStatus: "verified",
      identityConfirmed: true,
    },
    ownership: {
      ...base.ownership,
      method: "freehold",
      nameOnRecord: "Kwame Mensah",
      acquisitionDate: "2019-08-20",
      registrationDate: "2019-11-05",
      registrationNumber: "GAR/ACC/2019/88421",
      parcelNumber: "ACC-EA-4481",
      plotNumber: "Plot 14",
      titleNumber: "GT/ACC/2019/3321",
      surveyNumber: "SVG/EA/2018/0912",
      registryOffice: "Lands Commission — Accra",
      nameMatches: "yes",
      multipleOwners: "no",
      spouseConsent: "yes",
      customary: "no",
      authorityApproval: "yes",
      coOwners: [],
    },
    location: {
      ...base.location,
      country: "Ghana",
      region: "Greater Accra",
      county: "Accra Metropolitan",
      city: "Accra",
      village: "",
      neighborhood: "East Airport",
      street: "Off Spintex Road",
      landmark: "Near Shoprite Accra Mall",
      postalCode: "GA-184-8392",
      lat: 5.6402,
      lng: -0.1521,
      hideExactLocation: true,
      boundaryPoints: [
        { lat: 5.6405, lng: -0.1524 },
        { lat: 5.6405, lng: -0.1518 },
        { lat: 5.6399, lng: -0.1518 },
        { lat: 5.6399, lng: -0.1524 },
      ],
    },
    land: {
      ...base.land,
      title: "Residential plot — East Airport, Accra",
      propertyType: "residential",
      size: 0.25,
      unit: "acres",
      currentUse: "Vacant residential plot",
      intendedUse: "Single-family home or duplex",
      zoning: "Residential",
      developmentStatus: "Undeveloped, cleared",
      conditions: {
        cleared: "yes",
        fenced: "no",
        level: "yes",
        flood_prone: "no",
        structures: "no",
        demolition_needed: "no",
      },
      infrastructure: {
        road_access: true,
        electricity: true,
        water: true,
        drainage: true,
        internet: true,
        security: false,
        public_transport: true,
        schools: true,
        markets: true,
      },
      environmental: {
        wetlands: "no",
        water_bodies: "no",
        protected_area: "no",
        mining: "no",
        waste: "no",
        erosion: "no",
      },
      description:
        "Quarter-acre residential plot in East Airport with motorable access off Spintex Road. Ideal for a family home; utilities available at the roadside.",
    },
    boundaries: {
      ...base.boundaries,
      surveyed: "yes",
      surveyDate: "2018-06-14",
      surveyor: "Adu Survey Associates",
      markersVisible: "yes",
      disputes: "no",
      sizeMatches: "yes",
      north: "Plot 13 — Owusu family",
      south: "Access road",
      east: "Plot 15 — vacant",
      west: "Drain reserve",
      surveyUploads: [],
    },
    documents: [
      makeDoc("doc_accra_title", "Land Title Certificate.pdf", "pending"),
      makeDoc("doc_accra_survey", "Site Plan SVG-EA-2018.pdf", "pending"),
    ],
    media: {
      photos: [],
      photoConfirmation: false,
    },
    pricing: {
      ...base.pricing,
      askingPrice: 450_000,
      currency: "GHS",
      pricePerUnit: 1_800_000,
      negotiable: true,
      minOffer: 400_000,
      hideMinOffer: true,
      acceptOffersInApp: true,
      closingTimeline: "60_days",
      paymentOptions: ["full_cash", "bank_financing"],
      escrowChoice: "landfello_escrow",
    },
    verificationBadges: [],
    metrics: { views: 0, saves: 0, inquiries: 0, offers: 0 },
  };
}

function buildActionRequiredLagos(): OwnerListingDraft {
  const base = createEmptyDraft();
  const feedbackIssues: FeedbackIssue[] = [
    {
      id: "issue_lagos_1",
      summary: "Survey plan name mismatch",
      documentName: "Survey Plan SP-Lekki-441.pdf",
      reviewerNote:
        "The survey plan lists 'Adebayo Holdings Ltd' but the seller identity is an individual. Please upload a deed of assignment or company resolution.",
      status: "open",
    },
    {
      id: "issue_lagos_2",
      summary: "Governor's Consent missing",
      documentName: undefined,
      reviewerNote:
        "For this Lekki allocation, please upload evidence of Governor's Consent or an explanation of the current stage of consent.",
      status: "open",
    },
  ];

  return {
    ...base,
    id: "listing_dummy_lagos_action",
    createdAt: daysAgo(28),
    updatedAt: daysAgo(2),
    currentStep: 10,
    status: "action_required",
    sellerType: "company",
    companyName: "Adebayo Holdings Ltd",
    companyRegistrationNumber: "RC-982341",
    companyRole: "Director",
    identity: {
      ...base.identity,
      fullName: "Chioma Adebayo",
      dob: "1982-11-03",
      citizenship: "Nigeria",
      residence: "Nigeria",
      address: "15 Admiralty Way, Lekki Phase 1, Lagos",
      phone: "+2348034567890",
      email: "chioma@adebayoholdings.example",
      idType: "national_id",
      phoneVerified: true,
      emailVerified: true,
      identityStatus: "additional_info_required",
      identityConfirmed: true,
    },
    ownership: {
      ...base.ownership,
      method: "certificate_of_occupancy",
      nameOnRecord: "Adebayo Holdings Ltd",
      acquisitionDate: "2016-03-12",
      registrationDate: "2017-01-20",
      registrationNumber: "LAG/LKI/2017/22091",
      parcelNumber: "LK-P1-2091",
      plotNumber: "Block C, Plot 8",
      titleNumber: "C of O LAG/2017/4412",
      surveyNumber: "SP-LEKKI-441",
      registryOffice: "Lagos State Land Registry",
      nameMatches: "unsure",
      multipleOwners: "no",
      spouseConsent: "unknown",
      customary: "no",
      authorityApproval: "yes",
      coOwners: [],
    },
    location: {
      ...base.location,
      country: "Nigeria",
      region: "South West",
      county: "Eti-Osa",
      city: "Lagos",
      village: "",
      neighborhood: "Lekki Phase 1",
      street: "Admiralty Way",
      landmark: "Near Lekki Conservation Centre road",
      postalCode: "106104",
      lat: 6.4474,
      lng: 3.4722,
      hideExactLocation: false,
    },
    land: {
      ...base.land,
      title: "Commercial corner plot — Lekki Phase 1",
      propertyType: "commercial",
      size: 650,
      unit: "sqm",
      currentUse: "Vacant commercial corner",
      intendedUse: "Retail / mixed-use building",
      zoning: "Commercial",
      developmentStatus: "Cleared, not built",
      conditions: {
        cleared: "yes",
        fenced: "yes",
        level: "yes",
        flood_prone: "unsure",
        structures: "no",
        demolition_needed: "no",
      },
      infrastructure: {
        road_access: true,
        electricity: true,
        water: true,
        drainage: true,
        internet: true,
        security: true,
        public_transport: true,
        schools: false,
        markets: true,
      },
      environmental: {
        wetlands: "no",
        water_bodies: "no",
        protected_area: "no",
        mining: "no",
        waste: "no",
        erosion: "no",
      },
      description:
        "650 sqm corner commercial plot in Lekki Phase 1. High visibility location suitable for retail or mixed-use development.",
    },
    boundaries: {
      ...base.boundaries,
      surveyed: "yes",
      surveyDate: "2016-09-01",
      surveyor: "Lagos Licensed Surveyors Co.",
      markersVisible: "yes",
      disputes: "no",
      sizeMatches: "yes",
      north: "Service road",
      south: "Private residence",
      east: "Commercial plot",
      west: "Admiralty Way",
      surveyUploads: [makeDoc("doc_lagos_survey", "Survey Plan SP-Lekki-441.pdf", "needs_info")],
    },
    documents: [
      makeDoc("doc_lagos_coo", "Certificate of Occupancy.pdf", "approved"),
      makeDoc("doc_lagos_survey", "Survey Plan SP-Lekki-441.pdf", "needs_info"),
      makeDoc("doc_lagos_tax", "Land Use Charge Receipt.pdf", "pending"),
    ],
    media: {
      photos: [
        {
          id: "photo_lagos_1",
          caption: "Street view from Admiralty Way",
          isCover: true,
          order: 0,
        },
        {
          id: "photo_lagos_2",
          caption: "Corner frontage",
          isCover: false,
          order: 1,
        },
      ],
      photoConfirmation: true,
    },
    pricing: {
      ...base.pricing,
      askingPrice: 280_000_000,
      currency: "NGN",
      pricePerUnit: 430_769,
      negotiable: true,
      minOffer: 250_000_000,
      hideMinOffer: false,
      acceptOffersInApp: true,
      closingTimeline: "90_days",
      paymentOptions: ["full_cash", "bank_financing", "installments"],
      installmentsAllowed: true,
      installmentMonths: 12,
      installmentDownPaymentPercent: 40,
      costResponsibility: {
        transfer_tax: "buyer",
        legal_fees: "split",
        survey_fees: "seller",
        agent_fees: "seller",
        escrow_fees: "split",
      },
      escrowChoice: "bank_escrow",
    },
    disclosures: {
      answers: {
        encumbrances: "no",
        boundary_disputes: "no",
        family_claims: "no",
        litigation: "no",
        easements: "yes",
        environmental_hazards: "no",
        government_acquisition: "no",
        tenants_occupants: "no",
        unpaid_rates: "no",
        restrictions: "no",
      },
      explanations: {
        easements: "Utility corridor along the west boundary for power lines.",
      },
      accurateInfoDeclared: true,
      authorityDeclared: true,
      noHiddenLiensDeclared: true,
      termsAccepted: true,
      signatureName: "Chioma Adebayo",
      signatureData: "signed",
      signedAt: daysAgo(10),
    },
    verificationBadges: ["company_registered"],
    metrics: { views: 42, saves: 6, inquiries: 3, offers: 0 },
    feedbackIssues,
  };
}

function buildPublishedNairobi(): OwnerListingDraft {
  const base = createEmptyDraft();

  const offers: Offer[] = [
    {
      id: "offer_nairobi_1",
      buyerName: "James Otieno",
      amount: 18_500_000,
      currency: "KES",
      message: "Cash offer with 30-day closing. Happy to use Landfello escrow.",
      status: "accepted",
      createdAt: daysAgo(16),
      expiresAt: daysAgo(2),
    },
  ];

  const stages: TransactionStage[] = [
    {
      key: "offer_accepted",
      label: "Offer accepted",
      completed: true,
      completedAt: daysAgo(14),
    },
    {
      key: "due_diligence",
      label: "Buyer due diligence",
      completed: true,
      completedAt: daysAgo(7),
      note: "Title search clear at Nairobi Lands Registry.",
    },
    {
      key: "escrow_funded",
      label: "Escrow funded",
      completed: false,
    },
    {
      key: "title_transfer",
      label: "Title / deed transfer",
      completed: false,
    },
    {
      key: "closing",
      label: "Closing & handover",
      completed: false,
    },
    {
      key: "completed",
      label: "Transaction completed",
      completed: false,
    },
  ];

  return {
    ...base,
    id: "listing_dummy_nairobi_published",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(0),
    currentStep: 10,
    status: "published",
    sellerType: "owner",
    ownerName: "Wanjiku Kamau",
    identity: {
      ...base.identity,
      fullName: "Wanjiku Kamau",
      dob: "1979-07-22",
      citizenship: "Kenya",
      residence: "Kenya",
      address: "Riara Road, Kilimani, Nairobi",
      phone: "+254712345678",
      email: "wanjiku.kamau@example.com",
      idType: "national_id",
      phoneVerified: true,
      emailVerified: true,
      identityStatus: "verified",
      identityConfirmed: true,
    },
    ownership: {
      ...base.ownership,
      method: "freehold",
      nameOnRecord: "Wanjiku Kamau",
      acquisitionDate: "2014-05-09",
      registrationDate: "2014-08-18",
      registrationNumber: "NRB/KIL/2014/11882",
      parcelNumber: "LR 209/8871",
      plotNumber: "Plot 3",
      titleNumber: "IR 98221",
      surveyNumber: "FR 441/92",
      registryOffice: "Nairobi Lands Registry",
      nameMatches: "yes",
      multipleOwners: "yes",
      spouseConsent: "yes",
      customary: "no",
      authorityApproval: "yes",
      coOwners: [
        {
          id: "co_nairobi_1",
          fullName: "Peter Kamau",
          relationship: "Spouse",
          phone: "+254722987654",
          email: "peter.kamau@example.com",
          consentGiven: true,
          sharePercent: 50,
        },
      ],
    },
    location: {
      ...base.location,
      country: "Kenya",
      region: "Nairobi County",
      county: "Nairobi",
      city: "Nairobi",
      village: "",
      neighborhood: "Karen",
      street: "Bogani East Road",
      landmark: "Near Karen Country Club",
      postalCode: "00502",
      lat: -1.3192,
      lng: 36.7073,
      hideExactLocation: true,
    },
    land: {
      ...base.land,
      title: "Half-acre garden plot — Karen, Nairobi",
      propertyType: "residential",
      size: 0.5,
      unit: "acres",
      currentUse: "Garden / vacant residential",
      intendedUse: "Family home with garden",
      zoning: "Residential",
      developmentStatus: "Vacant, lightly landscaped",
      conditions: {
        cleared: "yes",
        fenced: "yes",
        level: "yes",
        flood_prone: "no",
        structures: "no",
        demolition_needed: "no",
      },
      infrastructure: {
        road_access: true,
        electricity: true,
        water: true,
        drainage: true,
        internet: true,
        security: true,
        public_transport: false,
        schools: true,
        markets: true,
      },
      environmental: {
        wetlands: "no",
        water_bodies: "no",
        protected_area: "no",
        mining: "no",
        waste: "no",
        erosion: "no",
      },
      description:
        "Quiet half-acre plot in Karen with mature trees, perimeter fencing, and ready access to utilities. Strong residential neighbourhood near schools and shopping.",
    },
    boundaries: {
      ...base.boundaries,
      surveyed: "yes",
      surveyDate: "2013-11-20",
      surveyor: "Rift Valley Surveyors Ltd",
      markersVisible: "yes",
      disputes: "no",
      sizeMatches: "yes",
      north: "Residential home",
      south: "Access lane",
      east: "Vacant plot",
      west: "Bogani East Road",
      surveyUploads: [makeDoc("doc_nairobi_survey", "Mutation Form FR-441-92.pdf", "approved")],
    },
    documents: [
      makeDoc("doc_nairobi_title", "Title Deed IR 98221.pdf", "approved"),
      makeDoc("doc_nairobi_rates", "Nairobi County Rates Clearance.pdf", "approved"),
      makeDoc("doc_nairobi_survey", "Mutation Form FR-441-92.pdf", "approved"),
      makeDoc("doc_nairobi_consent", "Spousal Consent Affidavit.pdf", "approved"),
    ],
    media: {
      photos: [
        {
          id: "photo_nairobi_1",
          caption: "Entrance from Bogani East",
          isCover: true,
          order: 0,
        },
        {
          id: "photo_nairobi_2",
          caption: "Interior garden view",
          isCover: false,
          order: 1,
        },
        {
          id: "photo_nairobi_3",
          caption: "Perimeter fence line",
          isCover: false,
          order: 2,
        },
      ],
      videoUrl: "",
      photoConfirmation: true,
    },
    pricing: {
      ...base.pricing,
      askingPrice: 20_000_000,
      currency: "KES",
      pricePerUnit: 40_000_000,
      negotiable: true,
      minOffer: 18_000_000,
      hideMinOffer: true,
      acceptOffersInApp: true,
      closingTimeline: "60_days",
      paymentOptions: ["full_cash", "bank_financing"],
      costResponsibility: {
        transfer_tax: "buyer",
        legal_fees: "split",
        survey_fees: "seller",
        agent_fees: "seller",
        escrow_fees: "split",
      },
      escrowChoice: "landfello_escrow",
    },
    disclosures: {
      answers: {
        encumbrances: "no",
        boundary_disputes: "no",
        family_claims: "no",
        litigation: "no",
        easements: "no",
        environmental_hazards: "no",
        government_acquisition: "no",
        tenants_occupants: "no",
        unpaid_rates: "no",
        restrictions: "no",
      },
      explanations: {},
      accurateInfoDeclared: true,
      authorityDeclared: true,
      noHiddenLiensDeclared: true,
      termsAccepted: true,
      signatureName: "Wanjiku Kamau",
      signatureData: "signed",
      signedAt: daysAgo(40),
    },
    verificationBadges: [
      "identity_verified",
      "title_verified",
      "survey_verified",
      "rates_cleared",
    ],
    metrics: { views: 186, saves: 24, inquiries: 11, offers: 1 },
    offers,
    transaction: {
      stages,
      escrowStatus: "pending_setup",
      escrowProvider: "Landfello Escrow",
      acceptedOfferId: "offer_nairobi_1",
      notes: "Offer accepted. Buyer arranging escrow funding.",
    },
  };
}

export function seedDummyDataIfEmpty(): void {
  if (readAll().length > 0) return;
  const seeded = [buildDraftAccra(), buildActionRequiredLagos(), buildPublishedNairobi()];
  writeAll(seeded);
}

/**
 * Country-aware required document checklist.
 * Ownership method and seller type refine the list further.
 */
export function documentChecklistFor(
  country: string,
  ownershipMethod: string,
  sellerType: SellerType | "",
): string[] {
  const normalizedCountry = country.trim().toLowerCase();
  const method = ownershipMethod.trim().toLowerCase();
  const docs: string[] = [];

  const pushUnique = (name: string) => {
    if (!docs.includes(name)) docs.push(name);
  };

  // Base identity / authority
  pushUnique("Government-issued photo ID");
  if (sellerType === "representative") {
    pushUnique("Power of Attorney / letter of authority");
    pushUnique("Owner's photo ID (copy)");
  }
  if (sellerType === "company") {
    pushUnique("Company registration certificate");
    pushUnique("Board resolution authorizing sale");
    pushUnique("Director / signatory photo ID");
  }
  if (sellerType === "estate") {
    pushUnique("Grant of probate / letters of administration");
    pushUnique("Death certificate");
    pushUnique("Executor / administrator photo ID");
  }

  // Country-specific title stack
  if (normalizedCountry.includes("ghana")) {
    pushUnique("Land Title Certificate or Indenture");
    pushUnique("Site plan / cadastral plan");
    pushUnique("Lands Commission search report");
    if (method === "customary") {
      pushUnique("Stool / family allocation letter");
      pushUnique("Customary land secretariat consent");
    }
    if (method === "leasehold") {
      pushUnique("Lease agreement / ground rent receipts");
    }
  } else if (normalizedCountry.includes("nigeria")) {
    pushUnique("Certificate of Occupancy (C of O) or Deemed Grant");
    pushUnique("Survey plan (with beacon numbers)");
    pushUnique("Governor's Consent (or status letter)");
    pushUnique("Land Use Charge / tax clearance");
    if (method === "deed_of_assignment") {
      pushUnique("Deed of Assignment");
      pushUnique("Previous root of title documents");
    }
    if (method === "allocation") {
      pushUnique("Allocation letter / offer letter");
    }
  } else if (normalizedCountry.includes("kenya")) {
    pushUnique("Title deed (or lease certificate)");
    pushUnique("Mutation / survey plan (FR)");
    pushUnique("County rates clearance certificate");
    pushUnique("Land Control Board consent (if agricultural)");
    if (method === "leasehold") {
      pushUnique("Lease document & rent receipts");
    }
    if (method === "customary") {
      pushUnique("Adjudication records / community land documents");
    }
  } else if (normalizedCountry.includes("south africa") || normalizedCountry === "za") {
    pushUnique("Title deed");
    pushUnique("SG diagram / general plan");
    pushUnique("Municipal rates clearance");
    pushUnique("Zoning certificate");
  } else {
    // Generic African marketplace fallback
    pushUnique("Title / ownership document");
    pushUnique("Survey / site plan");
    pushUnique("Official land search / registry extract");
    pushUnique("Tax / rates clearance (if applicable)");
  }

  // Method overlays common across countries
  if (method === "customary") {
    pushUnique("Evidence of customary / family consent");
  }
  if (method === "certificate_of_occupancy") {
    pushUnique("Certificate of Occupancy");
  }

  pushUnique("Recent passport-style photo of seller");
  return docs;
}

/** Convenience: ensure seed then return listings (useful at app boot). */
export function ensureListings(): OwnerListingDraft[] {
  seedDummyDataIfEmpty();
  return listListings();
}
