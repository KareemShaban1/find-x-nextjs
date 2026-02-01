import { MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    navigate(`/search?${params.toString()}`);
  };

  const handlePopularSearch = (search: string) => {
    navigate(`/search?category=${encodeURIComponent(search)}`);
  };

  const popularSearches = ["Restaurants", "Home Services", "Beauty & Spa", "Fitness", "Automotive"];


  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="City with location markers"
          className="h-full w-full object-cover"
        />
        <div className="hero-gradient absolute inset-0" />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex min-h-[600px] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="animate-slide-up opacity-0">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
            <MapPin className="h-4 w-4" />
            {t("hero.badge")}
          </span>
        </div>

        <h1 className="animate-slide-up stagger-1 mb-6 max-w-4xl text-4xl font-bold tracking-tight text-primary-foreground opacity-0 md:text-5xl lg:text-6xl">
          {t("hero.title")}{" "}
          <span className="relative">
            <span className="relative z-10">{t("hero.titleHighlight")}</span>
            <span className="absolute bottom-2 left-0 right-0 h-3 bg-accent/40" />
          </span>
        </h1>

        <p className="animate-slide-up stagger-2 mb-10 max-w-2xl text-lg text-primary-foreground/80 opacity-0">
          {t("hero.subtitle")}
        </p>

        <form onSubmit={handleSearch} className="animate-slide-up stagger-3 w-full max-w-3xl opacity-0">
          <div className="glass-card flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:gap-0">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-background px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("hero.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="hidden h-10 w-px self-center bg-border md:block" />

            <div className="flex flex-1 items-center gap-3 rounded-xl bg-background px-4 py-3 md:rounded-l-none">
              <MapPin className="h-5 w-5 text-accent" />
              <input
                type="text"
                placeholder={t("hero.locationPlaceholder")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="md:ml-3">
              <Search className="h-5 w-5" />
              {t("hero.searchButton")}
            </Button>
          </div>
        </form>

        <div className="animate-slide-up stagger-4 mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0">
          <span className="text-sm text-primary-foreground/60">{t("hero.popular")}</span>
          {popularSearches.map((search) => (
            <button
              key={search}
              type="button"
              onClick={() => handlePopularSearch(search)}
              className="rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/20"
            >
              {search}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="animate-slide-up stagger-5 mt-12 flex flex-wrap items-center justify-center gap-8 opacity-0 md:gap-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-foreground">50K+</div>
            <div className="text-sm text-primary-foreground/60">{t("hero.businesses")}</div>
          </div>
          <div className="h-8 w-px bg-primary-foreground/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-foreground">200K+</div>
            <div className="text-sm text-primary-foreground/60">{t("hero.reviews")}</div>
          </div>
          <div className="h-8 w-px bg-primary-foreground/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-foreground">100+</div>
            <div className="text-sm text-primary-foreground/60">{t("hero.cities")}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
