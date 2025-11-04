import { Check } from "lucide-react";
import { Button } from "@heroui/button";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { POLAR_CONFIG } from "@/config/api";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isCurrent: boolean;
  buttonText: string;
  buttonVariant: "flat" | "solid" | "bordered" | "light" | "ghost" | "shadow";
  buttonColor:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  isPopular?: boolean;
  monthlyPrice?: number;
  originalPrice?: number;
  polarProductId?: string; // Polar.sh product ID
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    description: "Perfect for learning and small demos",
    features: [
      "Unlimited projects",
      "Basic mock data generation",
      "Up to 10 resources per project",
      "Community support",
      "Standard REST API access",
    ],
    isCurrent: true,
    buttonText: "Current Plan",
    buttonVariant: "flat",
    buttonColor: "default",
  },
  {
    name: "Pro Monthly",
    price: "$2.99",
    period: "per month",
    description: "For real portfolio projects and side projects",
    monthlyPrice: 2.99,
    polarProductId: import.meta.env.VITE_POLAR_PRODUCT_MONTHLY || "",
    features: [
      "Everything in Free",
      "Unlimited resources",
      "Advanced mock data generation",
      "API keys for external access",
      "Priority support",
      "Export to Supabase",
      "Higher rate limits",
    ],
    isCurrent: false,
    buttonText: "Coming Soon",
    buttonVariant: "solid",
    buttonColor: "primary",
  },
  {
    name: "Pro Yearly",
    price: "$11.99",
    period: "per year",
    description: "Save 75% with annual billing",
    monthlyPrice: 2.99,
    originalPrice: 11.99,
    polarProductId: import.meta.env.VITE_POLAR_PRODUCT_YEARLY || "",
    features: [
      "Everything in Pro Monthly",
      "Save $10.89 per year",
      "All Pro features included",
      "Priority support",
      "Best value for long-term use",
    ],
    isCurrent: false,
    buttonText: "Coming Soon",
    buttonVariant: "solid",
    buttonColor: "secondary",
    isPopular: true,
  },
];

export default function PricingPage() {
  const handleCheckout = (plan: PricingPlan) => {
    if (!plan.polarProductId || !POLAR_CONFIG.organization) {
      // Fallback: redirect to contact or show message
      window.location.href = "mailto:support@devmock.io?subject=Upgrade to Pro";

      return;
    }

    // Build Polar.sh checkout URL
    // Format: https://polar.sh/{organization}/checkout/{product_id}
    const checkoutUrl = `${POLAR_CONFIG.baseURL}/${POLAR_CONFIG.organization}/checkout/${plan.polarProductId}`;

    // Open checkout in new window
    window.open(checkoutUrl, "_blank");
  };

  return (
    <DefaultLayout>
      <div className="background-grid flex-grow">
        <BackgroundRippleEffect cellSize={50}/>
        <div className="container relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={title({ size: "lg" })}>
              Simple, Transparent Pricing
            </h1>
            <p className="text-default-600 mt-4 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core
              features for building mock APIs.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative group transition-all duration-300 flex ${
                  plan.isPopular ? "md:-mt-4 md:mb-4" : ""
                }`}
              >
                <div
                  className={`relative w-full flex flex-col bg-content1 rounded-3xl p-8 transition-all duration-300 ${
                    plan.isPopular
                      ? "border-2 border-primary shadow-2xl shadow-primary/20 md:scale-105"
                      : "border border-default-200 hover:border-primary/50 hover:shadow-xl"
                  } ${plan.isCurrent ? "ring-2 ring-gray-100/30 !hover:!border-gray-100/30 hover:!shadow-none bg-content1" : ""}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {plan.isCurrent && (
                    <div className="absolute -top-4 right-4 z-10">
                      <span className="bg-success text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        Current
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{plan.price}</span>
                        {plan.period && (
                          <span className="text-default-500 text-base">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      {plan.monthlyPrice && (
                        <span className="text-sm text-default-500 font-medium">
                          ${plan.monthlyPrice.toFixed(2)}/month
                        </span>
                      )}
                      {plan.originalPrice && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-default-400 line-through">
                            ${plan.originalPrice}/year
                          </span>
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-semibold">
                            Save $
                            {(
                              plan.originalPrice -
                              parseFloat(plan.price.replace("$", ""))
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-default-600 text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-default-200 mb-6" />

                  {/* Features */}
                  <div className="flex-1 mb-6 min-h-0">
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="rounded-full bg-success/20 p-1 flex-shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-success" size={16} />
                          </div>
                          <span className="text-default-700 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Button */}
                  <div className="mt-auto">
                    <Button
                      className="w-full font-semibold"
                      color={plan.buttonColor}
                      isDisabled={
                        plan.isCurrent || plan.buttonText === "Coming Soon"
                      }
                      size="lg"
                      variant={plan.buttonVariant}
                      onPress={() => {
                        if (
                          !plan.isCurrent &&
                          plan.buttonText !== "Coming Soon"
                        ) {
                          handleCheckout(plan);
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-default-600 text-sm">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
            <p className="text-default-500 text-xs mt-2">
              Questions? Contact us at{" "}
              <a
                className="text-primary hover:underline"
                href="mailto:support@devmock.io"
              >
                support@devmock.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
