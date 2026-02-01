import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight } from "lucide-react";
import { offersApi, type Offer } from "@/lib/api";
import { useTranslation } from "react-i18next";

function formatDiscount(offer: Offer): string {
  if (offer.discountType === "percentage") return `${offer.discountValue}% off`;
  return `${offer.discountValue} off`;
}

const OffersSection = () => {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    offersApi
      .list({ limit: 12 })
      .then((data) => {
        if (cancelled) return;
        setOffers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setOffers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t("home.offers", "Current Offers")}
          </h2>
          <div className="text-muted-foreground">Loading offers...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t("home.offers", "Current Offers")}
        </h2>
        {offers.length === 0 ? (
          <p className="text-muted-foreground">
            {t("home.noOffers", "No current offers. Approved offers within their start and end dates will appear here.")}
          </p>
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              to={offer.business ? `/business/${offer.business.id}` : "#"}
              className="group block rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/50 hover:shadow-md"
            >
              {offer.imageUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Tag className="h-10 w-10 text-primary" />
                </div>
              )}
              <p className="font-semibold text-primary">{formatDiscount(offer)}</p>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition">
                {offer.title}
              </h3>
              {offer.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{offer.description}</p>
              )}
              {offer.business && (
                <p className="text-sm text-muted-foreground mt-2">{offer.business.name}</p>
              )}
              {(offer.startDate || offer.endDate) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Valid {offer.startDate ? new Date(offer.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"} – {offer.endDate ? new Date(offer.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-sm text-primary mt-2 font-medium">
                {t("common.viewDetails", "View details")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </span>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default OffersSection;
