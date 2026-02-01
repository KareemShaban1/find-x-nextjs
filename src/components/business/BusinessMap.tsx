import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessMapProps {
  address: string;
  lat: number;
  lng: number;
  businessName: string;
}

const BusinessMap = ({ address, lat, lng, businessName }: BusinessMapProps) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${businessName} ${address}`
  )}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Using OpenStreetMap static image (no API key needed)
  const mapImageUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=800&height=400&center=lonlat:${lng},${lat}&zoom=15&marker=lonlat:${lng},${lat};type:awesome;color:%230d9488;size:large&apiKey=demo`;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Location</h2>

      <div className="overflow-hidden rounded-2xl border border-border/50">
        {/* Map placeholder with styled background */}
        <div className="relative h-64 bg-muted">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+0d9488(${lng},${lat})/${lng},${lat},14,0/800x400?access_token=pk.placeholder')`,
              backgroundColor: 'hsl(var(--muted))',
            }}
          />
          {/* Fallback map visualization */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <MapPin className="h-8 w-8" />
              </div>
              <div className="max-w-xs">
                <p className="font-semibold text-foreground">{businessName}</p>
                <p className="text-sm text-muted-foreground">{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address and actions */}
        <div className="bg-card p-4">
          <div className="mb-4 flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-foreground">{address}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open(directionsUrl, "_blank")}
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => window.open(googleMapsUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              View on Google Maps
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMap;
