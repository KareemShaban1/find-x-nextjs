import { MapPin, Star, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Business } from "@/lib/api";

interface SearchResultCardProps {
  business: Business;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

const SearchResultCard = ({ business, isFavorite = false, onFavoriteToggle }: SearchResultCardProps) => {
  const priceSymbol = "$".repeat(business.priceRange);

  return (
    <Link
      to={`/business/${business.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg sm:flex-row"
    >
      {/* Image */}
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32 md:h-40 md:w-40">
        <img
          src={business.image}
          alt={business.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {business.featured && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
            Featured
          </span>
        )}
        {/* Mobile: Favorite button on image */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle?.();
          }}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background sm:hidden"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-accent text-accent" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-primary">{business.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{business.distanceText}</span>
            <span className="hidden text-muted-foreground xs:inline">•</span>
            <span className="hidden text-muted-foreground xs:inline">{priceSymbol}</span>
          </div>

          <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {business.name}
          </h3>

          <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-rating text-rating" />
              <span className="font-semibold text-foreground">{business.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({business.reviews} reviews)</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                business.isOpen
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Clock className="h-3 w-3" />
              {business.isOpen ? "Open" : "Closed"}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{business.address}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {business.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Desktop Favorite Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onFavoriteToggle?.();
        }}
        className="hidden h-9 w-9 flex-shrink-0 items-center justify-center self-start rounded-full bg-muted transition-colors hover:bg-muted/80 sm:flex"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isFavorite ? "fill-accent text-accent" : "text-muted-foreground"
          }`}
        />
      </button>
    </Link>
  );
};

export default SearchResultCard;
