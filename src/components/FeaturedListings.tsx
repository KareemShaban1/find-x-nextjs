import { MapPin, Star, Clock, Heart, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesApi, businessApi, type Business } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function formatPriceRange(priceRange: number): string {
  return "$".repeat(Math.min(4, Math.max(1, priceRange)));
}

const FeaturedListings = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [listings, setListings] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    businessApi
      .getBusinesses({ featured: true, per_page: 6, sort_by: "relevance" })
      .then((res) => {
        if (!cancelled) setListings(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }
    let cancelled = false;
    favoritesApi
      .list()
      .then((list) => {
        if (!cancelled) setFavoriteIds(list.map((f) => f.id));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info(t("toast.signInToFavorites"));
      return;
    }
    const isFav = favoriteIds.includes(id);
    setTogglingId(id);
    try {
      if (isFav) {
        await favoritesApi.remove(id);
        setFavoriteIds((prev) => prev.filter((fId) => fId !== id));
        toast.success(t("toast.removedFromFavorites"));
      } else {
        await favoritesApi.add(id);
        setFavoriteIds((prev) => [...prev, id]);
        toast.success(t("toast.addedToFavorites"));
      }
    } catch {
      toast.error(t("toast.couldNotUpdateFavorites"));
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <section className="bg-muted/30 py-20">
        <div className="container px-4">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
                {t("featured.title")} <span className="gradient-text">{t("featured.titleHighlight")}</span>
              </h2>
              <p className="text-muted-foreground">{t("featured.subtitle")}</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section className="bg-muted/30 py-20">
        <div className="container px-4">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
                {t("featured.title")} <span className="gradient-text">{t("featured.titleHighlight")}</span>
              </h2>
              <p className="text-muted-foreground">{t("featured.subtitle")}</p>
            </div>
          </div>
          <p className="text-center text-muted-foreground py-12">No featured businesses at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/30 py-20">
      <div className="container px-4">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              {t("featured.title")} <span className="gradient-text">{t("featured.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground">{t("featured.subtitle")}</p>
          </div>
          <Button variant="outline" className="group" asChild>
            <Link to="/search">
              {t("featured.viewAllListings")}
              <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, index) => (
            <Link
              to={`/business/${listing.id}`}
              key={listing.id}
              className="group animate-fade-in hover-lift overflow-hidden rounded-2xl border border-border/50 bg-card opacity-0 block"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  {listing.featured && (
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      {t("common.featured")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(e, listing.id)}
                  disabled={togglingId === listing.id}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background disabled:opacity-60"
                  title={favoriteIds.includes(listing.id) ? t("businessDetail.removeFromFavorites") : t("businessDetail.addToFavorites")}
                  aria-label={favoriteIds.includes(listing.id) ? t("businessDetail.removeFromFavorites") : t("businessDetail.addToFavorites")}
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      favoriteIds.includes(listing.id)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    } ${togglingId === listing.id ? "animate-pulse" : ""}`}
                  />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                      listing.isOpen
                        ? "bg-success/20 text-success"
                        : "bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {listing.isOpen ? t("common.openNow") : t("common.closed")}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">{listing.category}</span>
                  {listing.distanceText && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{listing.distanceText}</span>
                    </>
                  )}
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {listing.name}
                </h3>

                <div className="mb-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-rating text-rating" />
                    <span className="font-semibold text-foreground">{listing.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({(listing.reviews ?? 0)} {t("common.reviews")})
                  </span>
                </div>

                <div className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {listing.address}
                    {listing.city && `, ${listing.city}`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(listing.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
