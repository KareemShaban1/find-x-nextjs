import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface BusinessGalleryProps {
  images: string[];
  businessName: string;
}

const BusinessGallery = ({ images, businessName }: BusinessGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold sm:text-2xl">Gallery</h2>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <img
              src={image}
              alt={`${businessName} gallery ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/20" />
          </button>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-4xl">
          <div className="relative">
            <button
              onClick={closeLightbox}
              className="absolute -right-2 -top-10 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
            >
              <X className="h-5 w-5" />
            </button>
            
            {selectedIndex !== null && (
              <img
                src={images[selectedIndex]}
                alt={`${businessName} gallery ${selectedIndex + 1}`}
                className="w-full rounded-xl"
              />
            )}

            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-3 backdrop-blur-sm transition-colors hover:bg-background"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-3 backdrop-blur-sm transition-colors hover:bg-background"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-4 py-2 text-sm backdrop-blur-sm">
              {(selectedIndex ?? 0) + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessGallery;
