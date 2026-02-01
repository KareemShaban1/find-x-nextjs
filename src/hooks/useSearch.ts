import { useEffect, useState, useCallback } from "react";
import { businessApi, Business } from "@/lib/api";
import { geocode } from "@/lib/geocode";
import { Filters } from "@/components/search/SearchFilters";
import { SortOption } from "@/components/search/SearchSort";

export interface UserCoords {
  latitude: number;
  longitude: number;
}

export const defaultFilters: Filters = {
  category: "All Categories",
  minRating: 0,
  maxDistance: 10,
  openNow: false,
  priceRange: [1, 4],
};

export const useSearch = (initialQuery: string = "", initialLocation: string = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        per_page: 50,
      };

      const locationText = location.trim();
      const searchText = query.trim();
      let searchTermToSend: string | null = searchText || null;

      // Only send non-default filters
      if (filters.category && filters.category !== "All Categories") {
        params.category = filters.category;
      }
      if (filters.minRating > 0) {
        params.min_rating = filters.minRating;
      }
      if (
        filters.priceRange[0] !== 1 ||
        filters.priceRange[1] !== 4
      ) {
        params.price_range = `${filters.priceRange[0]},${filters.priceRange[1]}`;
      }
      if (filters.openNow) {
        params.is_open = true;
      }
      if (sortBy !== "relevance") {
        params.sort_by = sortBy;
      }

      // Coords: browser location (Near me) or geocoded from location field or search field (city/address)
      let coords = userCoords;
      let fromGeocode = false;
      let geocodedFromSearch = false;
      if (!coords && locationText) {
        const geo = await geocode(locationText);
        if (geo) {
          coords = { latitude: geo.latitude, longitude: geo.longitude };
          fromGeocode = true;
        }
      }
      if (!coords && searchText && !locationText) {
        const geo = await geocode(searchText);
        if (geo) {
          coords = { latitude: geo.latitude, longitude: geo.longitude };
          fromGeocode = true;
          geocodedFromSearch = true;
        }
      }
      // When search term was used as a place (geocoded), don't filter by business name so we get all businesses sorted by distance
      if (searchTermToSend != null && !geocodedFromSearch) {
        params.search = searchTermToSend;
      }
      if (coords) {
        params.latitude = coords.latitude;
        params.longitude = coords.longitude;
        // Send city/address string when we geocoded from location or search field
        if (fromGeocode) {
          const cityOrAddress = locationText || (geocodedFromSearch ? searchText : "");
          if (cityOrAddress) {
            params.location = cityOrAddress;
          }
          const radiusKm = filters.maxDistance >= 10 ? 50 : filters.maxDistance * 1.60934;
          params.radius_km = Math.round(radiusKm * 10) / 10;
        } else {
          const radiusMiles = filters.maxDistance >= 10 ? 15 : filters.maxDistance;
          params.radius_km = Math.round(radiusMiles * 1.60934 * 10) / 10;
        }
      }

      const response = await businessApi.getBusinesses(params);
      setResults(response.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch businesses");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, sortBy, userCoords, location]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  /** Clear everything: search query, location, Near me, filters, and sort. */
  const clearAll = useCallback(() => {
    setQuery("");
    setLocation("");
    setUserCoords(null);
    setFilters(defaultFilters);
    setSortBy("relevance");
  }, []);

  return {
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
    refetch: fetchBusinesses,
  };
};
