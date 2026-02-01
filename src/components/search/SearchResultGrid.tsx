import { MapPin, Star, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Business } from "@/lib/api";

interface SearchResultGridProps {
  business: Business;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

const SearchResultGrid = ({ business, isFavorite = false, onFavoriteToggle }: SearchResultGridProps) => {
  const priceSymbol = "$".repeat(business.priceRange);

  return (
    <Link
      to={`/business/${business.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={business.image}
          alt={business.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {business.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Featured
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle?.();
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-accent text-accent" : "text-muted-foreground"
            }`}
          />
        </button>
        <span
          className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
            business.isOpen
              ? "bg-success/20 text-success"
              : "bg-muted/80 text-muted-foreground"
          }`}
        >
          <Clock className="h-3 w-3" />
          {business.isOpen ? "Open Now" : "Closed"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="font-medium text-primary">{business.category}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{business.distanceText}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{priceSymbol}</span>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {business.name}
        </h3>

        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-rating text-rating" />
            <span className="font-semibold text-foreground">{business.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({business.reviews})</span>
        </div>

        <div className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="line-clamp-1">{business.address}</span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {business.tags.slice(0, 2).map((tag) => (
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
  );
};

export default SearchResultGrid;
