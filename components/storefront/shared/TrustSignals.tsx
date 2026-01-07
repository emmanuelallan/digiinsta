"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  SecurityCheckIcon,
  Download01Icon,
  RefreshIcon,
  CreditCardIcon,
  LockIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface TrustBadge {
  icon: IconSvgElement;
  title: string;
  description: string;
}

const TRUST_BADGES: Record<string, TrustBadge[]> = {
  product: [
    {
      icon: Download01Icon,
      title: "Instant Download",
      description: "Get your files immediately after purchase",
    },
    {
      icon: SecurityCheckIcon,
      title: "Secure Checkout",
      description: "Your payment info is protected",
    },
    {
      icon: RefreshIcon,
      title: "30-Day Guarantee",
      description: "Full refund if you're not satisfied",
    },
  ],
  checkout: [
    {
      icon: LockIcon,
      title: "Secure Payment",
      description: "256-bit SSL encryption",
    },
    {
      icon: Download01Icon,
      title: "Instant Access",
      description: "Download immediately after payment",
    },
    {
      icon: RefreshIcon,
      title: "Money-Back Guarantee",
      description: "30-day no questions asked",
    },
  ],
  footer: [
    {
      icon: SecurityCheckIcon,
      title: "Secure Checkout",
      description: "Protected by SSL",
    },
    {
      icon: Download01Icon,
      title: "Instant Download",
      description: "Immediate access",
    },
    {
      icon: RefreshIcon,
      title: "30-Day Guarantee",
      description: "Risk-free purchase",
    },
    {
      icon: CheckmarkCircle01Icon,
      title: "Quality Assured",
      description: "Human-designed products",
    },
  ],
};

interface TrustSignalsProps {
  variant: "product" | "checkout" | "footer";
  showPaymentMethods?: boolean;
  className?: string;
}

export function TrustSignals({
  variant,
  showPaymentMethods = false,
  className,
}: TrustSignalsProps) {
  const badges = TRUST_BADGES[variant] ?? [];

  if (variant === "footer") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {badges.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full">
                <HugeiconsIcon icon={badge.icon} size={20} className="text-primary" />
              </div>
              <span className="text-foreground text-sm font-medium">{badge.title}</span>
              <span className="text-muted-foreground text-xs">{badge.description}</span>
            </div>
          ))}
        </div>
        {showPaymentMethods && (
          <div className="flex items-center justify-center gap-3 border-t pt-4">
            <span className="text-muted-foreground text-xs">We accept:</span>
            <div className="flex items-center gap-2">
              {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((payment) => (
                <div
                  key={payment}
                  className="bg-background flex h-8 w-12 items-center justify-center rounded border"
                  title={payment}
                >
                  <HugeiconsIcon
                    icon={CreditCardIcon}
                    size={20}
                    className="text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "checkout") {
    return (
      <div className={cn("bg-muted/30 space-y-3 rounded-lg border p-4", className)}>
        <div className="text-foreground flex items-center gap-2 text-sm font-medium">
          <HugeiconsIcon icon={SecurityCheckIcon} size={18} className="text-green-600" />
          <span>Secure Checkout</span>
        </div>
        <div className="space-y-2">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                <HugeiconsIcon icon={badge.icon} size={16} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground text-sm font-medium">{badge.title}</p>
                <p className="text-muted-foreground text-xs">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
        {showPaymentMethods && (
          <div className="flex items-center gap-2 border-t pt-2">
            <span className="text-muted-foreground text-xs">Accepted:</span>
            <div className="flex items-center gap-1">
              {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((payment) => (
                <div
                  key={payment}
                  className="bg-background flex h-6 w-10 items-center justify-center rounded border"
                  title={payment}
                >
                  <HugeiconsIcon
                    icon={CreditCardIcon}
                    size={14}
                    className="text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Product variant (default)
  return (
    <div className={cn("bg-muted/30 rounded-lg border p-4", className)}>
      <div className="grid gap-4">
        {badges.map((badge) => (
          <div key={badge.title} className="flex items-start gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <HugeiconsIcon icon={badge.icon} size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium">{badge.title}</p>
              <p className="text-muted-foreground text-xs">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
