import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { businessApi } from "@/lib/api";
import { useEffect, useState } from "react";

export interface Filters {
  category: string;
  minRating: number;
  maxDistance: number;
  openNow: boolean;
  priceRange: number[];
}

interface SearchFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount: number;
}

const SearchFilters = ({ filters, onFilterChange, onReset, resultCount }: SearchFiltersProps) => {
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const priceLabels = ["$", "$$", "$$$", "$$$$"];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await businessApi.getCategories();
        setCategories(["All Categories", ...cats.map(c => c.name)]);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Fallback to default categories
        setCategories(["All Categories", "Restaurants", "Automotive", "Beauty & Spa", "Home Services", "Fitness"]);
      }
    };
    fetchCategories();
  }, []);

  const hasActiveFilters =
    filters.category !== "All Categories" ||
    filters.minRating > 0 ||
    filters.maxDistance < 10 ||
    filters.openNow ||
    filters.priceRange[0] > 1 ||
    filters.priceRange[1] < 4;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 text-muted-foreground">
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">Category</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onFilterChange({ ...filters, category })}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                filters.category === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">
          Minimum Rating: {filters.minRating > 0 ? `${filters.minRating}+` : "Any"}
        </Label>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => onFilterChange({ ...filters, minRating: rating })}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors ${
                filters.minRating === rating
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {rating === 0 ? (
                "Any"
              ) : (
                <>
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {rating}+
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Distance Filter */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">
          Max Distance: {filters.maxDistance === 10 ? "Any" : `${filters.maxDistance} mi`}
        </Label>
        <Slider
          value={[filters.maxDistance]}
          onValueChange={(value) => onFilterChange({ ...filters, maxDistance: value[0] })}
          max={10}
          min={0.5}
          step={0.5}
          className="py-2"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>0.5 mi</span>
          <span>10 mi</span>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm font-medium">
          Price Range: {priceLabels[filters.priceRange[0] - 1]} - {priceLabels[filters.priceRange[1] - 1]}
        </Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => onFilterChange({ ...filters, priceRange: value })}
          max={4}
          min={1}
          step={1}
          className="py-2"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          {priceLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {/* Open Now Toggle */}
      <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
        <Label htmlFor="open-now" className="cursor-pointer text-sm font-medium">
          Open Now Only
        </Label>
        <Switch
          id="open-now"
          checked={filters.openNow}
          onCheckedChange={(checked) => onFilterChange({ ...filters, openNow: checked })}
        />
      </div>

      {/* Results Count */}
      <div className="mt-6 rounded-xl bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{resultCount}</span> businesses found
        </p>
      </div>
    </div>
  );
};

export default SearchFilters;
