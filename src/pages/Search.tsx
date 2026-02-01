import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { Search as SearchIcon, MapPin, SlidersHorizontal, X, ChevronDown, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import SearchSort, { ViewMode } from "@/components/search/SearchSort";
import SearchResultCard from "@/components/search/SearchResultCard";
import SearchResultGrid from "@/components/search/SearchResultGrid";
import SearchMapView from "@/components/search/SearchMapView";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All Categories";
  const initialLocation = searchParams.get("location") || "";
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getLocation, loading: geoLoading } = useGeolocation();
  const {
    query,
    setQuery,
    location,
    setLocation,
    userCoords,
    setUserCoords,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    results,
    loading,
    error,
    resetFilters,
    clearAll,
  } = useSearch(initialQuery, initialLocation);

  const handleUseMyLocation = useCallback(async () => {
    const { coords: c, error: locationError } = await getLocation();
    if (c) {
      setUserCoords(c);
      setLocation(t("search.usingYourLocation"));
      toast.success(t("search.locationFound"));
    } else {
      const isHttpsRequired =
        typeof window !== "undefined" && !window.isSecureContext;
      toast.error(
        isHttpsRequired ? t("search.locationRequiresHttps") : (locationError || t("search.locationDenied")),
        {
          description: isHttpsRequired
            ? t("search.locationRequiresHttpsHint")
            : t("search.locationDeniedHint"),
          duration: 10000,
        }
      );
    }
  }, [getLocation, setUserCoords, setLocation, t]);

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    favoritesApi
      .list()
      .then((list) => {
        if (!cancelled) setFavoriteIds(new Set(list.map((f) => f.id)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const handleFavoriteToggle = useCallback(async (businessId: number) => {
    if (!user) {
      toast.info("Sign in to add businesses to favorites");
      return;
    }
    const isFav = favoriteIds.has(businessId);
    try {
      if (isFav) {
        await favoritesApi.remove(businessId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(businessId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        await favoritesApi.add(businessId);
        setFavoriteIds((prev) => new Set(prev).add(businessId));
        toast.success("Added to favorites");
      }
    } catch {
      toast.error("Could not update favorites");
    }
  }, [user, favoriteIds]);

  // Set category from URL params
  useEffect(() => {
    if (initialCategory !== "All Categories") {
      setFilters((prev) => ({ ...prev, category: initialCategory }));
    }
  }, [initialCategory, setFilters]);

  // Auto-request location when coming from "Near Me" link (e.g. footer)
  const nearMeRequested = useRef(false);
  useEffect(() => {
    if (searchParams.get("nearme") === "1" && !nearMeRequested.current) {
      nearMeRequested.current = true;
      handleUseMyLocation();
    }
  }, [searchParams, handleUseMyLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileSearchExpanded(false);
  };

  // Count active filters (including search, location, Near me)
  const hasSearchOrLocation = !!(query.trim() || location.trim() || userCoords);
  const activeFilterCount = [
    filters.category !== "All Categories",
    filters.minRating > 0,
    filters.maxDistance < 10,
    filters.openNow,
    filters.priceRange[0] > 1 || filters.priceRange[1] < 4,
  ].filter(Boolean).length;
  const hasActiveSearchOrFilters = hasSearchOrLocation || activeFilterCount > 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      {/* Mobile Sticky Search Bar - only below md; from md up the bar below is shown */}
      <div className="sticky top-16 z-40 border-b border-border bg-card/95 backdrop-blur-sm md:hidden">
        <div className="container px-4 py-3">
          {/* Collapsed state - shows summary */}
          {!mobileSearchExpanded && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSearchExpanded(true)}
                className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/50"
              >
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 truncate">
                  <span className="text-foreground">
                    {query || "Search businesses..."}
                  </span>
                  {location && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      in {location}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Filter button with badge */}
              <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon" className="relative h-12 w-12 shrink-0">
                    <SlidersHorizontal className="h-5 w-5" />
                    {activeFilterCount > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <DrawerHeader className="text-left">
                    <DrawerTitle className="flex items-center justify-between">
                      <span>Filters</span>
                      {hasActiveSearchOrFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { clearAll(); setMobileFiltersOpen(false); }}
                          className="text-muted-foreground"
                        >
                          {t("search.clearAll")}
                        </Button>
                      )}
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-y-auto px-4 pb-4">
                    <SearchFilters
                      filters={filters}
                      onFilterChange={setFilters}
                      onReset={clearAll}
                      resultCount={results.length}
                    />
                  </div>
                  <DrawerFooter className="border-t border-border">
                    <DrawerClose asChild>
                      <Button className="w-full">
                        Show {results.length} results
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          )}

          {/* Expanded state - full search form */}
          {mobileSearchExpanded && (
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-primary bg-background px-3 py-2.5">
                  <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search businesses, services..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery("")} className="shrink-0 touch-manipulation">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setMobileSearchExpanded(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-accent" />
                <input
                  type="text"
                  placeholder={t("search.locationPlaceholder")}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
                {location && (
                  <button type="button" onClick={() => { setLocation(""); setUserCoords(null); }} className="shrink-0 touch-manipulation">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={handleUseMyLocation}
                  disabled={geoLoading}
                >
                  <LocateFixed className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{geoLoading ? t("search.gettingLocation") : t("search.nearMe")}</span>
                </Button>
              </div>

              <Button type="submit" className="w-full gap-2">
                <SearchIcon className="h-4 w-4" />
                {t("common.search")}
              </Button>
            </form>
          )}
        </div>

        {/* Active filter chips - only show when collapsed */}
        {!mobileSearchExpanded && (activeFilterCount > 0 || userCoords) && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
            {userCoords && (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 whitespace-nowrap"
                onClick={() => { setUserCoords(null); setLocation(""); }}
              >
                {t("search.usingYourLocation")}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.category !== "All Categories" && (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 whitespace-nowrap"
                onClick={() => setFilters({ ...filters, category: "All Categories" })}
              >
                {filters.category}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 whitespace-nowrap"
                onClick={() => setFilters({ ...filters, minRating: 0 })}
              >
                {filters.minRating}+ stars
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.maxDistance < 10 && (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 whitespace-nowrap"
                onClick={() => setFilters({ ...filters, maxDistance: 10 })}
              >
                Within {filters.maxDistance}mi
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.openNow && (
              <Badge
                variant="secondary"
                className="shrink-0 gap-1 whitespace-nowrap"
                onClick={() => setFilters({ ...filters, openNow: false })}
              >
                Open now
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Desktop / Tablet Search Header - responsive from md up */}
      <div className="hidden border-b border-border bg-card/50 md:block">
        <div className="container max-w-full px-3 py-4 sm:px-4 sm:py-6">
          <form
            onSubmit={handleSearch}
            className="flex max-w-full flex-wrap items-stretch gap-3 lg:flex-nowrap lg:flex-row lg:items-center"
          >
            <div className="flex min-w-0 flex-1 basis-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 lg:basis-auto lg:gap-3 lg:px-4 lg:py-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search businesses, services..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="shrink-0 touch-manipulation">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex min-w-0 flex-1 basis-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 lg:basis-auto lg:max-w-[280px] lg:px-4 lg:py-3 xl:max-w-xs">
              <MapPin className="h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder={t("search.locationPlaceholder")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1 px-2 text-xs sm:h-auto sm:px-3 sm:text-sm"
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                title={t("search.nearMe")}
              >
                <LocateFixed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">{t("search.nearMe")}</span>
              </Button>
            </div>

            <Button type="submit" className="h-10 w-full shrink-0 gap-2 lg:w-auto" size="sm">
              <SearchIcon className="h-4 w-4" />
              {t("common.search")}
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-80 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <SearchFilters
                filters={filters}
                onFilterChange={setFilters}
                onReset={clearAll}
                resultCount={results.length}
              />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <SearchSort
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultCount={results.length}
            />

            {loading ? (
              <div className="col-span-full flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="text-lg text-muted-foreground">Loading businesses...</div>
                </div>
              </div>
            ) : error ? (
              <div className="col-span-full flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="text-lg text-destructive mb-2">{error}</div>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Retry
                  </Button>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-muted p-6">
                  <SearchIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No results found</h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button onClick={clearAll} variant="outline">
                  {t("search.clearAll")}
                </Button>
              </div>
            ) : viewMode === "map" ? (
              <div className="h-[calc(100vh-280px)] min-h-[400px] lg:min-h-[500px]">
                <SearchMapView businesses={results} />
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                {results.map((business) => (
                  <SearchResultCard
                    key={business.id}
                    business={business}
                    isFavorite={favoriteIds.has(business.id)}
                    onFavoriteToggle={() => handleFavoriteToggle(business.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {results.map((business) => (
                  <SearchResultGrid
                    key={business.id}
                    business={business}
                    isFavorite={favoriteIds.has(business.id)}
                    onFavoriteToggle={() => handleFavoriteToggle(business.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
