import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { homePathForRole } from "@/lib/roles";

/**
 * Keeps buyers on buy routes and agents on sell routes.
 * Guests may browse buy; sell pages require an agent account.
 */
export function useRoleGate(mode: "buy" | "sell") {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (mode === "buy") {
      if (userProfile?.accountType === "agent") {
        navigate(homePathForRole("agent"), { replace: true });
      }
      return;
    }

    // sell
    if (!currentUser) {
      navigate("/create-account", { replace: true });
      return;
    }
    if (userProfile?.accountType !== "agent") {
      navigate(homePathForRole("investor"), { replace: true });
    }
  }, [mode, currentUser, userProfile, loading, navigate]);
}
