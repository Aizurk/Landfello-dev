import { AccountType, getStoredUser } from "@/lib/session";

/** Where a signed-in user should land after auth, by role. */
export function homePathForRole(accountType?: AccountType | null): string {
  if (accountType === "agent") return "/sell";
  return "/buy";
}

export function homePathFromSession(): string {
  const stored = getStoredUser();
  return homePathForRole(stored?.profile?.accountType);
}

/** True if this role should access buyer marketplace routes. */
export function canAccessBuy(accountType?: AccountType | null): boolean {
  return accountType !== "agent";
}

/** True if this role should access seller/agent routes. */
export function canAccessSell(accountType?: AccountType | null): boolean {
  return accountType === "agent";
}
