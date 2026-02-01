import { ArrowRight, Building2, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

const CTASection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden py-20">
      <div className="hero-gradient absolute inset-0" />

      <div className="container relative z-10 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
            {t("cta.subtitle")}
          </p>

          <div className="mb-12 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-foreground">50K+</div>
                <div className="text-sm text-primary-foreground/60">{t("cta.businessesListed")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-foreground">2M+</div>
                <div className="text-sm text-primary-foreground/60">{t("cta.monthlyUsers")}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary-foreground">35%</div>
                <div className="text-sm text-primary-foreground/60">{t("cta.avgGrowth")}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/register">
                {t("cta.listYourBusinessFree")}
                <ArrowRight className="ms-2 h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl">
              {t("cta.learnMore")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
