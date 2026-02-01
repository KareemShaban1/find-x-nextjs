import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { Business } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon for businesses
const createCustomIcon = (isOpen: boolean, featured: boolean) => {
  // Use design tokens (HSL CSS variables) instead of hard-coded colors.
  // These are the same semantic colors used in the legend below.
  const color = featured
    ? "hsl(var(--accent))"
    : isOpen
      ? "hsl(var(--primary))"
      : "hsl(var(--muted-foreground))";
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

interface SearchMapViewProps {
  businesses: Business[];
  selectedBusinessId?: number;
  onBusinessSelect?: (id: number) => void;
}

const SearchMapView = ({ businesses, selectedBusinessId, onBusinessSelect }: SearchMapViewProps) => {
  const navigate = useNavigate();

  // San Francisco center as default
  const defaultCenter: [number, number] = [37.7749, -122.4194];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Map<number, L.Marker>>(new Map());

  const tileUrl = useMemo(
    () => "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    []
  );
  const tileAttribution = useMemo(
    () =>
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    []
  );

  // Initialize Leaflet map once (we intentionally avoid react-leaflet here to
  // prevent context-consumer runtime errors observed in this project build).
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer(tileUrl, { attribution: tileAttribution }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    markersLayerRef.current = layer;
    mapRef.current = map;

    return () => {
      markersByIdRef.current.clear();
      markersLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // defaultCenter is a constant tuple; keep it out of deps to avoid re-init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileAttribution, tileUrl]);

  // Update markers + bounds whenever businesses change.
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersByIdRef.current.clear();

    if (businesses.length === 0) {
      map.setView(defaultCenter, 13);
      return;
    }

    const bounds = L.latLngBounds([]);

    for (const business of businesses) {
      const marker = L.marker([business.lat, business.lng], {
        icon: createCustomIcon(business.isOpen, business.featured),
      });

      marker.on("click", () => onBusinessSelect?.(business.id));

      // Popup content: keep it simple HTML so Leaflet can render it outside React.
      // (Data is mock/local; if this becomes user-generated, sanitize it.)
      const popupHtml = `
        <div class="min-w-[200px] p-1">
          <a href="/business/${business.id}" class="block" data-business-link="true">
            <img
              src="${business.image}"
              alt="${business.name.replace(/\"/g, "&quot;")}"
              class="mb-2 h-24 w-full rounded-lg object-cover"
              loading="lazy"
            />
            <h3 class="mb-1 font-semibold text-foreground hover:text-primary">${business.name}</h3>
          </a>

          <div class="mb-2 flex items-center gap-2 text-sm">
            <div class="flex items-center gap-1">
              <span class="font-medium">${business.rating}</span>
            </div>
            <span class="text-muted-foreground">(${business.reviews})</span>
            <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
              business.isOpen
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }">
              ${business.isOpen ? "Open" : "Closed"}
            </span>
          </div>

          <div class="flex items-start gap-1 text-xs text-muted-foreground">
            <span>${business.address}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: true });

      marker.on("popupopen", (e) => {
        const popupEl = (e.popup as L.Popup).getElement();
        const linkEl = popupEl?.querySelector<HTMLAnchorElement>(
          'a[data-business-link="true"]'
        );
        if (!linkEl) return;

        linkEl.addEventListener(
          "click",
          (evt) => {
            evt.preventDefault();
            navigate(`/business/${business.id}`);
          },
          { once: true }
        );
      });

      marker.addTo(layer);
      markersByIdRef.current.set(business.id, marker);
      bounds.extend([business.lat, business.lng]);
    }

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [businesses, defaultCenter, navigate, onBusinessSelect]);

  // If a business is selected, open its popup and pan to it.
  useEffect(() => {
    if (!selectedBusinessId) return;
    const map = mapRef.current;
    const marker = markersByIdRef.current.get(selectedBusinessId);
    if (!map || !marker) return;

    marker.openPopup();
    map.panTo(marker.getLatLng());
  }, [selectedBusinessId]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/50">
      <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: "500px" }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span>Featured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>Open Now</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <span>Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchMapView;
