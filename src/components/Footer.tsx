import { MapPin, Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Find<span className="text-primary">X</span>
              </span>
            </div>
            <p className="mb-6 max-w-md text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("footer.quickLinks")}</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.browseCategories")}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.featuredListings")}
                </a>
              </li>
              <li>
                <Link to="/search?nearme=1" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.nearMe")}
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.newBusinesses")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("footer.forBusiness")}</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("header.listYourBusiness")}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.advertising")}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.businessDashboard")}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.pricingPlans")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t("footer.contact")}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("footer.contactUs")}
                </Link>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:support@findx.com" className="hover:text-primary">support@findx.com</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:1-800-FINDX" className="hover:text-primary">1-800-FINDX</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
              {t("footer.privacyPolicy")}
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
              {t("footer.termsOfService")}
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
              {t("footer.cookies")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
