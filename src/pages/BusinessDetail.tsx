import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Heart, Share2, Clock, Phone, ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessGallery from "@/components/business/BusinessGallery";
import BusinessReviews from "@/components/business/BusinessReviews";
import BusinessContactForm from "@/components/business/BusinessContactForm";
import BusinessMap from "@/components/business/BusinessMap";
import BusinessInfo from "@/components/business/BusinessInfo";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { businessApi, favoritesApi, reviewsApi, BusinessDetail as BusinessDetailType, BUSINESS_TYPE_SECTIONS, type BusinessType } from "@/lib/api";

// Note: All data is now fetched dynamically from the API

const BusinessDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [business, setBusiness] = useState<BusinessDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBusiness = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await businessApi.getBusiness(id);
      setBusiness(data);
    } catch (err: any) {
      console.error("Error fetching business:", err);
      setError(err.response?.data?.message || err.message || "Failed to load business");
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  // When user is logged in, check if this business is in favorites
  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;
    favoritesApi
      .list()
      .then((list) => {
        if (!cancelled) setIsFavorite(list.some((f) => String(f.id) === id));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user || !business) return;
    try {
      if (isFavorite) {
        await favoritesApi.remove(business.id);
        setIsFavorite(false);
        toast.success(t("toast.removedFromFavorites"));
      } else {
        await favoritesApi.add(business.id);
        setIsFavorite(true);
        toast.success(t("toast.addedToFavorites"));
      }
    } catch {
      toast.error(t("toast.couldNotUpdateFavorites"));
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !business || !reviewContent.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.create(business.id, { rating: reviewRating, content: reviewContent.trim() });
      toast.success(t("toast.reviewSubmitted"));
      setReviewContent("");
      setReviewRating(5);
      await fetchBusiness();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("toast.reviewFailed"));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">{t("businessDetail.loading")}</div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-destructive mb-2">
            {error || t("businessDetail.notFound")}
          </div>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            {t("businessDetail.goBackHome")}
          </Link>
        </div>
      </div>
    );
  }

  const businessType: BusinessType = (business?.business_type as BusinessType) || "other";
  const sections = BUSINESS_TYPE_SECTIONS[businessType];
  const showAmenities = sections?.includes("amenities") ?? true;
  const showGallery = sections?.includes("gallery") ?? true;
  const showHours = sections?.includes("hours") ?? true;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: business.name,
        text: `Check out ${business.name} on Find X`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={business.images?.[0] || business.image}
          alt={business.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Back button */}
        <Link
          to="/"
          className="absolute left-4 top-20 flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-background"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>
      </div>

      <div className="container px-4">
        {/* Business Header */}
        <div className="relative -mt-12 mb-8 sm:-mt-16">
          <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-lg sm:p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  {business.featured && (
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      {t("common.featured")}
                    </span>
                  )}
                  <span className="text-sm text-primary">{business.category}</span>
                  {business.subcategory && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{business.subcategory}</span>
                    </>
                  )}
                </div>

                <h1 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl">{business.name}</h1>

                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-rating text-rating" />
                      <span className="text-lg font-semibold">{business.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({business.totalReviews || 0} {t("common.reviews")})
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      business.isOpen
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {business.isOpen ? t("common.openNow") : t("common.closed")}
                  </span>

                  <span className="text-muted-foreground">{business.priceRange || '$$'}</span>
                </div>

                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-sm">
                    {business.address}
                    {business.city && `, ${business.city}`}
                    {business.state && `, ${business.state}`}
                    {business.postal_code && ` ${business.postal_code}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {user && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    className={isFavorite ? "text-accent" : ""}
                    title={isFavorite ? t("businessDetail.removeFromFavorites") : t("businessDetail.addToFavorites")}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
                {business.phone && (
                  <Button className="gap-2" asChild>
                    <a href={`tel:${business.phone}`}>
                      <Phone className="h-4 w-4" />
                      {t("common.callNow")}
                    </a>
                  </Button>
                )}
                {business.website && (
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={business.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      {t("common.website")}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 pb-20 lg:grid-cols-3">
          {/* Mobile: Sidebar first for better UX */}
          <div className="space-y-6 lg:hidden">
            <BusinessInfo
              phone={business.phone || ''}
              email={business.email || ''}
              website={business.website || ''}
              priceRange={business.priceRange || '$$'}
              hours={business.hours || []}
              amenities={business.amenities || []}
              showHours={showHours}
              showAmenities={showAmenities}
            />
          </div>

          {/* Left Column - Main Content */}
          <div className="space-y-8 sm:space-y-12 lg:col-span-2">
            {/* About */}
            {business.description && (
              <section>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">About</h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{business.description}</p>
              </section>
            )}

            {/* Products / Menu / Services (based on business type) */}
            {business.products && business.products.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">
                  {businessType === "restaurant"
                    ? t("businessDetail.menu", "Menu")
                    : businessType === "service"
                    ? t("businessDetail.services", "Services")
                    : t("businessDetail.products", "Products")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {business.products.map((product: { id: number; name: string; description?: string | null; price: number; imageUrl?: string | null; productCategory?: string | null }) => (
                    <div key={product.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex gap-4">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-24 w-24 object-cover rounded-lg shrink-0" />
                      ) : (
                        <div className="h-24 w-24 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                          <Tag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {product.productCategory && (
                          <span className="text-xs text-muted-foreground">{product.productCategory}</span>
                        )}
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                        )}
                        <p className="text-primary font-medium mt-1">${Number(product.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Current Offers (approved only, active date range) */}
            {business.offers && business.offers.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">Current Offers</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {business.offers.map((offer: { id: number; title: string; description?: string | null; discountType: string; discountValue: number; startDate: string; endDate: string; imageUrl?: string | null; terms?: string | null }) => (
                    <div
                      key={offer.id}
                      className="rounded-xl border border-border bg-card p-4 shadow-sm"
                    >
                      {offer.imageUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                          <img src={offer.imageUrl} alt={offer.title} className="h-full w-full object-cover" />
                        </div>
                      )}
                      {!offer.imageUrl && (
                        <div className="aspect-video rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                          <Tag className="h-10 w-10 text-primary" />
                        </div>
                      )}
                      <p className="font-semibold text-primary">
                        {offer.discountType === "percentage" ? `${offer.discountValue}% off` : `${offer.discountValue} off`}
                      </p>
                      <h3 className="font-semibold text-foreground">{offer.title}</h3>
                      {offer.description && (
                        <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Valid {new Date(offer.startDate).toLocaleDateString()} – {new Date(offer.endDate).toLocaleDateString()}
                      </p>
                      {offer.terms && (
                        <p className="text-xs text-muted-foreground mt-1">{offer.terms}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery / Menu images (shown based on business type) */}
            {showGallery && (
              <BusinessGallery images={business.images || [business.image]} businessName={business.name} />
            )}

            {/* Map */}
            <BusinessMap
              address={`${business.address}${business.city ? ', ' + business.city : ''}${business.state ? ', ' + business.state : ''}`}
              lat={business.lat}
              lng={business.lng}
              businessName={business.name}
            />

            {/* Write a review (logged-in user) */}
            {user && (
              <section className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6">
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">Write a review</h2>
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReviewRating(r)}
                          className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          title={`${r} star${r > 1 ? "s" : ""}`}
                          aria-label={`Rate ${r} star${r > 1 ? "s" : ""}`}
                        >
                          <Star
                            className={`h-8 w-8 ${r <= reviewRating ? "fill-rating text-rating" : "text-muted-foreground"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Your review</label>
                    <Textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                      className="resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submittingReview || !reviewContent.trim()}>
                    {submittingReview ? "Submitting…" : "Submit review"}
                  </Button>
                </form>
              </section>
            )}

            {/* Reviews */}
            <section>
              <h2 className="mb-6 text-xl font-bold sm:text-2xl">Reviews</h2>
              <BusinessReviews
                reviews={business.reviews || []}
                averageRating={business.rating}
                totalReviews={business.totalReviews || 0}
              />
            </section>
          </div>

          {/* Right Column - Sidebar (desktop only) */}
          <div className="hidden space-y-6 lg:block">
            <BusinessInfo
              phone={business.phone || ''}
              email={business.email || ''}
              website={business.website || ''}
              priceRange={business.priceRange || '$$'}
              hours={business.hours || []}
              amenities={business.amenities || []}
              showHours={showHours}
              showAmenities={showAmenities}
            />

            <BusinessContactForm businessName={business.name} />
          </div>

          {/* Mobile: Contact form at bottom */}
          <div className="lg:hidden">
            <BusinessContactForm businessName={business.name} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BusinessDetail;
