import { Search, MapPin, Star, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();
  const steps = [
    { icon: Search, titleKey: "search", descKey: "searchDesc", color: "bg-primary/10 text-primary" },
    { icon: MapPin, titleKey: "discover", descKey: "discoverDesc", color: "bg-accent/10 text-accent" },
    { icon: Star, titleKey: "compare", descKey: "compareDesc", color: "bg-success/10 text-success" },
    { icon: MessageSquare, titleKey: "connect", descKey: "connectDesc", color: "bg-warning/10 text-warning" },
  ];
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("howItWorks.title")} <span className="gradient-text">{t("howItWorks.titleBrand")}</span> {t("howItWorks.titleSuffix")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-16 hidden h-0.5 w-3/4 -translate-x-1/2 bg-gradient-to-r from-primary via-accent to-success lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.titleKey}
                className="animate-fade-in relative text-center opacity-0"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="absolute -top-3 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>

                <div
                  className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl ${step.color}`}
                >
                  <step.icon className="h-10 w-10" />
                </div>

                <h3 className="mb-3 text-xl font-semibold">{t(`howItWorks.${step.titleKey}`)}</h3>
                <p className="text-muted-foreground">{t(`howItWorks.${step.descKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
