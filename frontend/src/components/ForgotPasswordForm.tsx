import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSubmit: (method: "email" | "phone", value: string) => void;
}

export function ForgotPasswordForm({ onBack, onSubmit }: ForgotPasswordFormProps) {
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState("");
  const [forgotMethod, setForgotMethod] = useState<"email" | "phone">("email");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(forgotMethod, forgotEmailOrPhone);
    setForgotEmailOrPhone("");
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="rounded-full p-1 hover:bg-emerald-900/5 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-emerald-950" />
        </button>
        <h2 className="text-2xl font-semibold text-emerald-950">Reset password</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <p className="text-sm text-emerald-950/70 mb-4">
            Enter your email or phone number and we'll send you a link to reset your password.
          </p>
          
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setForgotMethod("email")}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                forgotMethod === "email"
                  ? "bg-emerald-900 text-white"
                  : "bg-emerald-900/5 text-emerald-950 hover:bg-emerald-900/10"
              }`}
            >
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setForgotMethod("phone")}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                forgotMethod === "phone"
                  ? "bg-emerald-900 text-white"
                  : "bg-emerald-900/5 text-emerald-950 hover:bg-emerald-900/10"
              }`}
            >
              <Phone className="h-4 w-4 inline mr-2" />
              Phone
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950 mb-2">
              {forgotMethod === "email" ? "Email address" : "Phone number"}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-950/45">
                {forgotMethod === "email" ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
              </div>
              <Input
                type={forgotMethod === "email" ? "email" : "tel"}
                value={forgotEmailOrPhone}
                onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                placeholder={forgotMethod === "email" ? "Enter your email" : "Enter your phone number"}
                className="w-full rounded-2xl pl-9"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            type="submit"
            className="w-full rounded-2xl bg-emerald-900 text-white hover:bg-emerald-900/90"
          >
            Send reset link
          </Button>
        </div>

        <div className="text-center text-sm text-emerald-950/70 pt-2">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onBack}
            className="text-emerald-900 hover:text-emerald-950 font-semibold"
          >
            Sign in
          </button>
        </div>
      </form>
    </>
  );
}

