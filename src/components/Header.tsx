import { MapPin, Menu, Search, User, X, Heart, LayoutDashboard, Languages } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type Locale } from "@/i18n";

const LANG_LABELS: Record<Locale, string> = { en: "English", ar: "العربية" };

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLang = (SUPPORTED_LANGS.includes(i18n.language as Locale) ? i18n.language : "en") as Locale;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Find<span className="text-primary">X</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            {t("header.explore")}
          </a>
          <a href="#" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            {t("header.categories")}
          </a>
          <a href="#" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            {t("header.forBusiness")}
          </a>
          <a href="#" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            {t("header.about")}
          </a>
          <Link to="/contact" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            {t("footer.contactUs")}
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title={LANG_LABELS[currentLang]}>
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGS.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  className={currentLang === lang ? "bg-accent" : ""}
                >
                  {LANG_LABELS[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          {user ? (
            <>
              {(user.role === "customer" || !user.role) && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/favorites">
                    <Heart className="h-4 w-4" />
                    {t("header.favorites")}
                  </Link>
                </Button>
              )}
              {(user.role === "organization_owner" || user.role === "super_admin") && (
                <Button variant="outline" size="sm" asChild>
                  <a href={import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000"}>
                    <LayoutDashboard className="h-4 w-4" />
                    {t("header.dashboard")}
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <User className="h-4 w-4" />
                  {user.name}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  <User className="h-4 w-4" />
                  {t("header.signIn")}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">{t("header.listYourBusiness")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="animate-slide-up border-t border-border/40 bg-background md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            <a href="#" className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              {t("header.explore")}
            </a>
            <a href="#" className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              {t("header.categories")}
            </a>
            <a href="#" className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              {t("header.forBusiness")}
            </a>
            <a href="#" className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              {t("header.about")}
            </a>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              {t("footer.contactUs")}
            </Link>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex gap-2 px-3 py-2">
                {SUPPORTED_LANGS.map((lang) => (
                  <Button
                    key={lang}
                    variant={currentLang === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => { i18n.changeLanguage(lang); setMobileMenuOpen(false); }}
                  >
                    {LANG_LABELS[lang]}
                  </Button>
                ))}
              </div>
              {user ? (
                <>
                  {(user.role === "customer" || !user.role) && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                        <Heart className="h-4 w-4" />
                        {t("header.myFavorites")}
                      </Link>
                    </Button>
                  )}
                  {(user.role === "organization_owner" || user.role === "super_admin") && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000"} onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" />
                        {t("header.dashboard")}
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4" />
                      {user.name}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4" />
                      {t("header.signIn")}
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      {t("header.listYourBusiness")}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
