export interface OptionItem {
  value: string;
  label: string;
  description?: string;
}

export interface DisclosureQuestion {
  key: string;
  label: string;
}

export const SELLER_TYPE_OPTIONS: OptionItem[] = [
  {
    value: "owner",
    label: "I am the legal owner",
    description: "I personally own the land being listed.",
  },
  {
    value: "representative",
    label: "I am representing the owner",
    description: "I am authorized to sell the land on behalf of another person.",
  },
  {
    value: "company",
    label: "I am selling for a company",
    description: "The property is owned by a registered business or organization.",
  },
  {
    value: "estate",
    label: "I am handling an estate",
    description: "I am an executor, administrator, beneficiary, or authorized estate representative.",
  },
];

export const OWNERSHIP_METHODS: OptionItem[] = [
  { value: "purchased", label: "Purchased" },
  { value: "inherited", label: "Inherited" },
  { value: "gifted", label: "Gifted" },
  { value: "government_allocation", label: "Government allocation" },
  { value: "family_customary", label: "Family or customary ownership" },
  { value: "company_owned", label: "Company-owned" },
  { value: "court_awarded", label: "Court-awarded" },
  { value: "other", label: "Other" },
];

export const ID_TYPES: OptionItem[] = [
  { value: "national_id", label: "National identification card" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's license" },
  { value: "residence_permit", label: "Residence permit" },
  { value: "other", label: "Other government-issued ID" },
];

export const PROPERTY_TYPES: OptionItem[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "agricultural", label: "Agricultural" },
  { value: "industrial", label: "Industrial" },
  { value: "mixed_use", label: "Mixed-use" },
  { value: "recreational", label: "Recreational" },
  { value: "hospitality", label: "Hospitality or tourism" },
  { value: "institutional", label: "Institutional" },
  { value: "other", label: "Other" },
];

export const SIZE_UNITS: OptionItem[] = [
  { value: "sqm", label: "Square meters" },
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
  { value: "sqft", label: "Square feet" },
];

export const PAYMENT_OPTIONS: OptionItem[] = [
  { value: "full_payment", label: "Full payment" },
  { value: "installments", label: "Installment payments" },
  { value: "bank_financing", label: "Bank financing" },
  { value: "cash", label: "Cash purchase" },
  { value: "mortgage", label: "Mortgage financing" },
  { value: "seller_financing", label: "Seller financing" },
  { value: "other", label: "Other" },
];

export const ESCROW_OPTIONS: OptionItem[] = [
  { value: "platform", label: "Use platform-supported escrow" },
  { value: "seller_lawyer", label: "Use my lawyer's escrow service" },
  { value: "buyer_escrow", label: "Use the buyer's approved escrow provider" },
  { value: "decide_later", label: "Decide after accepting an offer" },
];

export const DISCLOSURE_QUESTIONS: DisclosureQuestion[] = [
  {
    key: "encumbrances",
    label: "Are there any mortgages, liens, or charges on this land?",
  },
  {
    key: "boundary_disputes",
    label: "Are there any ongoing boundary disputes with neighbours?",
  },
  {
    key: "family_claims",
    label: "Are there family, stool, or community claims against this land?",
  },
  {
    key: "litigation",
    label: "Is this land involved in any court case or arbitration?",
  },
  {
    key: "easements",
    label: "Are there easements, rights of way, or utility corridors?",
  },
  {
    key: "environmental_hazards",
    label: "Are you aware of flooding, erosion, or contamination risks?",
  },
  {
    key: "government_acquisition",
    label: "Has any part of this land been earmarked for government acquisition?",
  },
  {
    key: "tenants_occupants",
    label: "Are there tenants, caretakers, or informal occupants on the land?",
  },
  {
    key: "unpaid_rates",
    label: "Are there unpaid property rates, ground rent, or taxes?",
  },
  {
    key: "restrictions",
    label: "Are there zoning or planning restrictions that limit development?",
  },
];

export const INFRASTRUCTURE_OPTIONS: OptionItem[] = [
  { value: "road_access", label: "Motorable road access" },
  { value: "electricity", label: "Electricity nearby / on-site" },
  { value: "water", label: "Piped water or borehole" },
  { value: "drainage", label: "Drainage / storm water" },
  { value: "internet", label: "Mobile / internet coverage" },
  { value: "security", label: "Gated / security presence" },
  { value: "public_transport", label: "Near public transport" },
  { value: "schools", label: "Near schools" },
  { value: "markets", label: "Near markets / shops" },
];

export const CONDITION_QUESTIONS: DisclosureQuestion[] = [
  { key: "cleared", label: "Is the land cleared of bush / vegetation?" },
  { key: "fenced", label: "Is the land fenced or walled?" },
  { key: "level", label: "Is the terrain mostly level / buildable?" },
  { key: "flood_prone", label: "Is any part flood-prone in rainy season?" },
  { key: "structures", label: "Are there existing structures on the land?" },
  { key: "demolition_needed", label: "Would a buyer need to demolish anything?" },
];

export const ENVIRONMENTAL_QUESTIONS: DisclosureQuestion[] = [
  { key: "wetlands", label: "Does the land include wetlands or marsh?" },
  { key: "water_bodies", label: "Is there a river, stream, or lagoon on/near the land?" },
  { key: "protected_area", label: "Is it near a forest reserve or protected area?" },
  { key: "mining", label: "Is there mining or quarrying activity nearby?" },
  { key: "waste", label: "Is there dumping or waste nearby?" },
  { key: "erosion", label: "Is there visible soil erosion or landslide risk?" },
];

export const VERIFICATION_TRACKER_STEPS: OptionItem[] = [
  { value: "submitted", label: "Listing submitted" },
  { value: "identity_check", label: "Identity check" },
  { value: "document_review", label: "Document review" },
  { value: "ownership_check", label: "Ownership verification" },
  { value: "location_check", label: "Location & survey check" },
  { value: "final_approval", label: "Final approval" },
  { value: "published", label: "Published to marketplace" },
];

export const TRANSACTION_CHECKLIST_LABELS: OptionItem[] = [
  { value: "offer_accepted", label: "Offer accepted" },
  { value: "due_diligence", label: "Buyer due diligence" },
  { value: "escrow_funded", label: "Escrow funded" },
  { value: "title_transfer", label: "Title / deed transfer" },
  { value: "closing", label: "Closing & handover" },
  { value: "completed", label: "Transaction completed" },
];

export const CURRENCIES: OptionItem[] = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "GHS", label: "GHS — Ghanaian Cedi" },
  { value: "NGN", label: "NGN — Nigerian Naira" },
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "ZAR", label: "ZAR — South African Rand" },
  { value: "TZS", label: "TZS — Tanzanian Shilling" },
  { value: "UGX", label: "UGX — Ugandan Shilling" },
  { value: "XOF", label: "XOF — West African CFA" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
];

export const CLOSING_TIMELINE_OPTIONS: OptionItem[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "30_days", label: "Within 30 days" },
  { value: "60_days", label: "Within 60 days" },
  { value: "90_days", label: "Within 90 days" },
  { value: "flexible", label: "Flexible" },
];

export const COST_RESPONSIBILITY_KEYS: OptionItem[] = [
  { value: "transfer_tax", label: "Transfer tax / stamp duty" },
  { value: "legal_fees", label: "Legal / conveyancing fees" },
  { value: "survey_fees", label: "Survey / beacon fees" },
  { value: "agent_fees", label: "Agent commission" },
  { value: "escrow_fees", label: "Escrow fees" },
];

export const COST_RESPONSIBILITY_VALUES: OptionItem[] = [
  { value: "seller", label: "Seller pays" },
  { value: "buyer", label: "Buyer pays" },
  { value: "split", label: "Split 50/50" },
  { value: "negotiable", label: "Negotiable" },
];
