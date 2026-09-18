import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export interface Property {
  propertyID?: string;
  userId: string;
  email?: string;
  listingType: "sale" | "rent";
  title: string;
  description: string;
  country: string;
  city: string;
  neighborhood?: string;
  propertyType: "Residential" | "Commercial" | "Agricultural" | "Mixed Use";
  areaAcres: number;
  tenure?: "Freehold" | "Leasehold";
  leaseTerm?: "Short-term" | "Long-term" | "Flexible";
  price?: number;
  monthlyRent?: number;
  tags: string[];
  images: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt?: string;
  updatedAt?: string;
  verified?: boolean;
  daysOnMarket?: number;
}

type PropertyRow = {
  id: string;
  user_id: string;
  email: string | null;
  listing_type: "sale" | "rent";
  title: string;
  description: string;
  country: string;
  city: string;
  neighborhood: string | null;
  property_type: "Residential" | "Commercial" | "Agricultural" | "Mixed Use";
  area_acres: number | string;
  tenure: "Freehold" | "Leasehold" | null;
  lease_term: "Short-term" | "Long-term" | "Flexible" | null;
  price: number | string | null;
  monthly_rent: number | string | null;
  tags: string[] | null;
  images: string[] | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
  verified: boolean;
  days_on_market: number;
};

let supabase: SupabaseClient | null = null;
let initialized = false;

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toOptionalNumber(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function rowToProperty(row: PropertyRow): Property {
  return {
    propertyID: row.id,
    userId: row.user_id,
    email: row.email ?? undefined,
    listingType: row.listing_type,
    title: row.title,
    description: row.description,
    country: row.country,
    city: row.city,
    neighborhood: row.neighborhood ?? undefined,
    propertyType: row.property_type,
    areaAcres: toNumber(row.area_acres, 0),
    tenure: row.tenure ?? undefined,
    leaseTerm: row.lease_term ?? undefined,
    price: toOptionalNumber(row.price),
    monthlyRent: toOptionalNumber(row.monthly_rent),
    tags: row.tags ?? [],
    images: row.images ?? [],
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    verified: row.verified,
    daysOnMarket: row.days_on_market,
  };
}

function propertyToRow(property: Partial<Property>, options?: { includeId?: boolean; id?: string }) {
  const row: Record<string, unknown> = {};

  if (options?.includeId && options.id) {
    row.id = options.id;
  }

  if (property.userId !== undefined) row.user_id = property.userId;
  if (property.email !== undefined) row.email = property.email ?? null;
  if (property.listingType !== undefined) row.listing_type = property.listingType;
  if (property.title !== undefined) row.title = property.title;
  if (property.description !== undefined) row.description = property.description;
  if (property.country !== undefined) row.country = property.country;
  if (property.city !== undefined) row.city = property.city;
  if (property.neighborhood !== undefined) row.neighborhood = property.neighborhood || null;
  if (property.propertyType !== undefined) row.property_type = property.propertyType;
  if (property.areaAcres !== undefined) row.area_acres = property.areaAcres;
  if (property.tenure !== undefined) row.tenure = property.tenure ?? null;
  if (property.leaseTerm !== undefined) row.lease_term = property.leaseTerm ?? null;
  if (property.price !== undefined) row.price = property.price ?? null;
  if (property.monthlyRent !== undefined) row.monthly_rent = property.monthlyRent ?? null;
  if (property.tags !== undefined) row.tags = property.tags ?? [];
  if (property.images !== undefined) {
    row.images = (property.images ?? []).filter((img) => img && !img.startsWith("blob:"));
  }
  if (property.contactName !== undefined) row.contact_name = property.contactName;
  if (property.contactPhone !== undefined) row.contact_phone = property.contactPhone;
  if (property.contactEmail !== undefined) row.contact_email = property.contactEmail;
  if (property.verified !== undefined) row.verified = property.verified;
  if (property.daysOnMarket !== undefined) row.days_on_market = property.daysOnMarket;
  if (property.createdAt !== undefined) row.created_at = property.createdAt;
  if (property.updatedAt !== undefined) row.updated_at = property.updatedAt;

  return row;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
    );
  }
  return supabase;
}

export function isSupabaseInitialized(): boolean {
  return initialized && !!supabase;
}

export async function initializeSupabaseDb(): Promise<SupabaseClient> {
  const url = process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  console.log("🔧 Supabase Configuration:");
  console.log("  URL:", url ? `${url.substring(0, 40)}...` : "❌ MISSING");
  console.log("  Service role key:", serviceRoleKey ? "✅ Set" : "❌ MISSING");

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables"
    );
  }

  supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Connectivity check
  const { error } = await supabase.from("properties").select("id").limit(1);
  if (error) {
    throw new Error(
      `Supabase connection failed: ${error.message}. ` +
        `Make sure you ran supabase/schema.sql in the SQL Editor.`
    );
  }

  initialized = true;
  console.log("✅ Supabase initialized successfully");
  return supabase;
}

/** @deprecated Use initializeSupabaseDb / getSupabase. Kept for temporary compatibility. */
export async function getContainerInfo(): Promise<any> {
  return {
    provider: "supabase",
    table: "properties",
    initialized,
    urlConfigured: !!process.env.SUPABASE_URL,
  };
}

export async function createProperty(property: Property): Promise<Property> {
  const client = getSupabase();

  if (!property.userId) {
    throw new Error("Property userId is required");
  }
  if (!property.title?.trim()) {
    throw new Error("Property title is required");
  }
  if (!property.description?.trim()) {
    throw new Error("Property description is required");
  }
  if (!property.country?.trim()) {
    throw new Error("Property country is required");
  }
  if (!property.city?.trim()) {
    throw new Error("Property city is required");
  }
  if (!property.propertyType) {
    throw new Error("Property type is required");
  }
  if (property.areaAcres === undefined || property.areaAcres === null || Number.isNaN(Number(property.areaAcres))) {
    throw new Error("Area in acres is required");
  }
  if (property.listingType === "sale" && (property.price === undefined || property.price === null)) {
    throw new Error("Price is required for sale listings");
  }
  if (property.listingType === "rent" && (property.monthlyRent === undefined || property.monthlyRent === null)) {
    throw new Error("Monthly rent is required for rental listings");
  }

  // Always generate a unique property ID (UUID) unless one was provided
  const propertyId =
    property.propertyID && property.propertyID.trim()
      ? property.propertyID.trim()
      : randomUUID();

  const now = new Date().toISOString();
  const row = propertyToRow(
    {
      ...property,
      title: property.title.trim(),
      description: property.description.trim(),
      country: property.country.trim(),
      city: property.city.trim(),
      contactName: property.contactName?.trim() || "Listing owner",
      contactPhone: property.contactPhone?.trim() || "N/A",
      contactEmail: property.contactEmail?.trim() || "unknown@landfello.com",
      tags: property.tags ?? [],
      images: property.images ?? [],
      verified: false,
      daysOnMarket: 0,
      createdAt: now,
      updatedAt: now,
    },
    { includeId: true, id: propertyId }
  );

  console.log(`🔄 Creating property ${propertyId} for user ${property.userId}`);

  const { data, error } = await client
    .from("properties")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    console.error("❌ Supabase createProperty error:", error);
    throw new Error(`Failed to save property to database: ${error.message}`);
  }

  const created = rowToProperty(data as PropertyRow);
  console.log(`✅ Property created: ${created.propertyID}`);
  return created;
}

export async function getUserProperties(userId: string): Promise<Property[]> {
  const client = getSupabase();

  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`❌ Error querying properties for user ${userId}:`, error);
    throw new Error(error.message);
  }

  return (data as PropertyRow[]).map(rowToProperty);
}

export async function getPropertyById(
  propertyId: string,
  userId: string
): Promise<Property | null> {
  const client = getSupabase();

  const { data, error } = await client
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(`❌ Error fetching property ${propertyId}:`, error);
    throw new Error(error.message);
  }

  if (!data) return null;
  return rowToProperty(data as PropertyRow);
}

export async function updateProperty(
  propertyId: string,
  userId: string,
  updates: Partial<Property>,
  _userEmail?: string
): Promise<Property> {
  const client = getSupabase();

  const existing = await getPropertyById(propertyId, userId);
  if (!existing) {
    // Distinguish not-found vs wrong owner
    const { data: anyOwner } = await client
      .from("properties")
      .select("id, user_id")
      .eq("id", propertyId)
      .maybeSingle();

    if (!anyOwner) {
      throw new Error("Property not found");
    }
    throw new Error("Property belongs to a different user. Cannot update.");
  }

  const row = propertyToRow({
    ...updates,
    userId, // preserve ownership
    updatedAt: new Date().toISOString(),
  });

  // Never allow identity fields to change via partial updates object leftovers
  delete row.id;

  const { data, error } = await client
    .from("properties")
    .update(row)
    .eq("id", propertyId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    console.error(`❌ Error updating property ${propertyId}:`, error);
    throw new Error(error.message);
  }

  return rowToProperty(data as PropertyRow);
}

export async function deleteProperty(propertyId: string, userId: string): Promise<void> {
  const client = getSupabase();

  const existing = await getPropertyById(propertyId, userId);
  if (!existing) {
    const { data: anyOwner } = await client
      .from("properties")
      .select("id, user_id")
      .eq("id", propertyId)
      .maybeSingle();

    if (!anyOwner) {
      throw new Error("Property not found");
    }
    throw new Error("Property belongs to a different user. Cannot delete.");
  }

  const { error } = await client
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("user_id", userId);

  if (error) {
    console.error(`❌ Error deleting property ${propertyId}:`, error);
    throw new Error(error.message);
  }
}

export async function getAllProperties(filters?: {
  country?: string;
  propertyType?: string;
  listingType?: "sale" | "rent";
  minPrice?: number;
  maxPrice?: number;
}): Promise<Property[]> {
  const client = getSupabase();

  let query = client.from("properties").select("*");

  if (filters?.country) {
    query = query.eq("country", filters.country);
  }
  if (filters?.propertyType) {
    query = query.eq("property_type", filters.propertyType);
  }
  if (filters?.listingType) {
    query = query.eq("listing_type", filters.listingType);
  }
  // Price filters apply to sale `price` OR rent `monthly_rent`
  if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
    query = query.or(
      `and(price.gte.${filters.minPrice},price.lte.${filters.maxPrice}),and(monthly_rent.gte.${filters.minPrice},monthly_rent.lte.${filters.maxPrice})`
    );
  } else if (filters?.minPrice !== undefined) {
    query = query.or(
      `price.gte.${filters.minPrice},monthly_rent.gte.${filters.minPrice}`
    );
  } else if (filters?.maxPrice !== undefined) {
    query = query.or(
      `price.lte.${filters.maxPrice},monthly_rent.lte.${filters.maxPrice}`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getAllProperties error:", error);
    throw new Error(`Failed to query properties: ${error.message}`);
  }

  return (data as PropertyRow[]).map(rowToProperty);
}
