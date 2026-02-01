import { Clock, Phone, Globe, Mail, DollarSign, Check, X } from "lucide-react";

interface BusinessHours {
  day: string;
  open: string | null;
  close: string | null;
  isClosed?: boolean;
}

interface BusinessInfoProps {
  phone: string;
  email: string;
  website: string;
  priceRange: string;
  hours: BusinessHours[];
  amenities: string[];
  /** Show Business Hours section (based on business type). Default true. */
  showHours?: boolean;
  /** Show Amenities section (based on business type). Default true. */
  showAmenities?: boolean;
}

const BusinessInfo = ({ phone, email, website, priceRange, hours, amenities, showHours = true, showAmenities = true }: BusinessInfoProps) => {
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  
  const isCurrentlyOpen = () => {
    if (!hours || hours.length === 0) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayHours = hours.find((h) => h.day === currentDay);
    
    if (!todayHours || todayHours.isClosed || !todayHours.open || !todayHours.close) return false;
    
    const [openHour, openMin] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMin] = todayHours.close.split(":").map(Number);
    const currentTime = currentHour * 60 + currentMinute;
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime < closeTime;
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contact Info */}
      <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6">
        <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Contact Information</h3>
        
        <div className="space-y-3 sm:space-y-4">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">{phone}</span>
            </a>
          )}
          
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">{email}</span>
            </a>
          )}
          
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base"
            >
              <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">{website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
          
          {priceRange && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground sm:text-base">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{priceRange}</span>
            </div>
          )}
        </div>
      </div>

      {/* Business Hours (shown based on business type) */}
      {showHours && (
        <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
            <h3 className="text-base font-semibold sm:text-lg">Business Hours</h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:px-3 ${
                isCurrentlyOpen()
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <Clock className="h-3 w-3" />
              {isCurrentlyOpen() ? "Open Now" : "Closed"}
            </span>
          </div>

          <div className="space-y-1 sm:space-y-2">
            {hours && hours.length > 0 ? hours.map((hour) => (
              <div
                key={hour.day}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${
                  hour.day === currentDay ? "bg-primary/5 font-medium" : ""
                }`}
              >
                <span className={hour.day === currentDay ? "text-primary" : "text-muted-foreground"}>
                  {hour.day.slice(0, 3)}
                  <span className="hidden sm:inline">{hour.day.slice(3)}</span>
                </span>
                <span className={hour.isClosed ? "text-muted-foreground" : ""}>
                  {hour.isClosed ? "Closed" : `${formatTime(hour.open)} - ${formatTime(hour.close)}`}
                </span>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">Hours not available</div>
            )}
          </div>
        </div>
      )}

      {/* Amenities (shown based on business type) */}
      {showAmenities && (
        <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6">
          <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Amenities & Features</h3>
          
          <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:gap-3">
            {amenities && amenities.length > 0 ? amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 text-xs sm:text-sm">
                <Check className="h-3.5 w-3.5 text-success sm:h-4 sm:w-4" />
                <span className="text-muted-foreground">{amenity}</span>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">No amenities listed</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessInfo;
