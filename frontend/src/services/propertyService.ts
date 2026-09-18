// API Base URL - use environment variable or relative URL (for Vite proxy in dev)
// In production, VITE_API_BASE_URL must be set
// In development, if not set, use relative URL which will be proxied by Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// In production, require the env var to be set
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not set in production!");
  throw new Error("VITE_API_BASE_URL environment variable is required in production");
}

export interface Property {
  propertyID?: string; // Unique property identifier (replaces 'id')
  userId: string; // Firebase Auth UID (owner)
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

// Get auth token from Firebase
async function getAuthToken(): Promise<string | null> {
  const { auth } = await import("@/lib/firebase");
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// Helper function to safely parse response (handles non-JSON responses)
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  
  let data: any = null;
  if (contentType.includes("application/json") && raw) {
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      console.error("Raw response:", raw);
    }
  }
  
  if (!response.ok) {
    const msg = data?.error || raw || `Request failed (${response.status})`;
    throw new Error(msg);
  }
  
  return data as T;
}

// Create a new property
export async function createProperty(property: Property): Promise<Property> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("You must be signed in to create a property");
  }

  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(property),
  });

  return parseResponse<Property>(response);
}

// Get all properties for the current user (by userId)
export async function getUserProperties(userId: string): Promise<Property[]> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("You must be signed in to view your properties");
  }
  
  const encodedUserId = encodeURIComponent(userId);
  const response = await fetch(`${API_BASE_URL}/properties/user/${encodedUserId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return parseResponse<Property[]>(response);
}

// Get a single property by ID (using userId)
export async function getPropertyById(propertyId: string, userId: string): Promise<Property> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("You must be signed in to view this property");
  }
  
  const encodedUserId = encodeURIComponent(userId);
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}?userId=${encodedUserId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return parseResponse<Property>(response);
}

// Update a property
// Flow: Use propertyId to identify the property, userId is verified from auth token on backend
export async function updateProperty(
  propertyId: string,
  userId: string, // Used for frontend validation, but backend gets it from token
  updates: Partial<Property>
): Promise<Property> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("You must be signed in to update a property");
  }
  
  // Backend will:
  // 1. Extract propertyId from URL params
  // 2. Extract userId from authenticated token (req.user.uid)
  // 3. Find property by propertyId
  // 4. Verify property.userId matches authenticated userId
  // 5. Update if ownership is verified
  
  // Don't send userId in body - backend gets it from token for security
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // Token contains userId
    },
    body: JSON.stringify(updates), // Only send updates, not userId
  });

  return parseResponse<Property>(response);
}

// Delete a property (using userId)
export async function deleteProperty(propertyId: string, userId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("You must be signed in to delete a property");
  }
  
  const encodedUserId = encodeURIComponent(userId);
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}?userId=${encodedUserId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await parseResponse(response); // This will throw with proper error message
  }
}

// Get all properties (public listings)
export async function getAllProperties(filters?: {
  country?: string;
  propertyType?: string;
  listingType?: "sale" | "rent";
  minPrice?: number;
  maxPrice?: number;
}): Promise<Property[]> {
  const params = new URLSearchParams();
  if (filters?.country) params.append("country", filters.country);
  if (filters?.propertyType) params.append("propertyType", filters.propertyType);
  if (filters?.listingType) params.append("listingType", filters.listingType);
  if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
  if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

  const url = params.toString() 
    ? `${API_BASE_URL}/properties?${params.toString()}`
    : `${API_BASE_URL}/properties`;
    
  const response = await fetch(url);
  return parseResponse<Property[]>(response);
}

