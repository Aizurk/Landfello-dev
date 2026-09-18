import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bell, LogOut, Settings, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";

export function TopNav({ userName }: { userName?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, userProfile } = useAuth();
  
  // Use currentUser if available, otherwise fall back to userName prop
  const displayName = currentUser?.displayName || currentUser?.email?.split("@")[0] || userName || "Guest";
  const userEmail = currentUser?.email || "";
  
  // Show "Active Listings" button only for agents on buy-land page
  const isAgent = userProfile?.accountType === "agent";
  const isBuyLandPage = location.pathname === "/buy-land";
  const isMyPropertiesPage = location.pathname === "/my-properties";
  
  // Don't show button on my-properties page or if already navigated there
  const showActiveListingsButton = isAgent && isBuyLandPage && !isMyPropertiesPage;
  
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <BrandLogo size="sm" />

        {/* Navigation - positioned closer to logo */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-emerald-900/80 ml-8">
          <button
            type="button"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/buy-land");
            }}
            className="relative hover:text-emerald-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-700 after:transition-all hover:after:w-full"
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/sell");
            }}
            className="relative hover:text-emerald-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-700 after:transition-all hover:after:w-full"
          >
            Sell
          </button>
          <button
            type="button"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/rent");
            }}
            className="relative hover:text-emerald-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-700 after:transition-all hover:after:w-full"
          >
            Rent
          </button>
          <button
            type="button"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/find-agent");
            }}
            className="relative hover:text-emerald-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-700 after:transition-all hover:after:w-full"
          >
            Find an agent
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 ml-auto">
            {currentUser ? (
              <>
                <div className="hidden sm:inline-flex items-center text-emerald-950">
                  Savings:
                  <span className="ml-2 font-semibold text-emerald-900">$100</span>
                </div>
                <Button type="button" variant="ghost" className="rounded-2xl">
                  <Bell className="h-5 w-5 text-emerald-950/70" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" className="rounded-2xl px-2">
                      <Avatar className="h-9 w-9">
                        {currentUser?.photoURL && (
                          <AvatarImage src={currentUser.photoURL} alt={displayName} />
                        )}
                        <AvatarFallback className="bg-emerald-900/10 text-emerald-950 font-semibold">
                          {initials || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                    <DropdownMenuLabel>
                      <div>
                        <div className="font-semibold">{displayName}</div>
                        {userEmail && <div className="text-xs text-gray-500 font-normal">{userEmail}</div>}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Active Listings button - only for agents on buy-land page, positioned after profile icon */}
                {showActiveListingsButton && (
                  <Button
                    type="button"
                    onClick={() => navigate("/my-properties")}
                    className="rounded-lg bg-emerald-900 text-white hover:bg-emerald-900/90 px-4 py-1.5 text-sm font-medium"
                  >
                    Active Listings
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  className="hidden sm:inline-flex text-sm font-medium text-emerald-900 hover:text-emerald-700 px-0"
                  onClick={() => navigate("/")}
                >
                  Sign in
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-amber-400 text-emerald-950 hover:bg-amber-300 px-5 py-2 text-sm font-semibold"
                  onClick={() => navigate("/create-account")}
                >
                  Get started
                </Button>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

