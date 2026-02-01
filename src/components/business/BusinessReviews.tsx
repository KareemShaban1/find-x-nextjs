import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
  images?: string[];
}

interface BusinessReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const BusinessReviews = ({ reviews, averageRating, totalReviews }: BusinessReviewsProps) => {
  const { t } = useTranslation();
  const [helpfulClicked, setHelpfulClicked] = useState<number[]>([]);

  // Calculate rating distribution from actual reviews
  const calculateRatingDistribution = () => {
    if (!reviews || reviews.length === 0) {
      return [
        { stars: 5, percentage: 0 },
        { stars: 4, percentage: 0 },
        { stars: 3, percentage: 0 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 },
      ];
    }
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    
    const total = reviews.length;
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percentage: total > 0 ? Math.round((distribution[stars as keyof typeof distribution] / total) * 100) : 0,
    }));
  };

  const ratingDistribution = calculateRatingDistribution();

  const handleHelpful = (reviewId: number) => {
    setHelpfulClicked((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start">
        {/* Rating Summary */}
        <div className="flex-shrink-0 rounded-2xl border border-border/50 bg-card p-4 text-center sm:p-6 md:w-64">
          <div className="mb-2 text-4xl font-bold text-foreground sm:text-5xl">{averageRating}</div>
          <div className="mb-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-rating text-rating"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-3">
          {ratingDistribution.map(({ stars, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="w-16 text-sm text-muted-foreground">{stars} stars</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-rating transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm text-muted-foreground">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-semibold sm:text-xl">{t("reviews.recentReviews")}</h3>
        
        {reviews && reviews.length > 0 ? reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
                />
                <div>
                  <h4 className="text-sm font-semibold text-foreground sm:text-base">{review.author}</h4>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-rating text-rating"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="mb-4 text-muted-foreground">{review.content}</p>

            {review.images && review.images.length > 0 && (
              <div className="mb-4 flex gap-2">
                {review.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Review image ${i + 1}`}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHelpful(review.id)}
              className={`gap-2 ${helpfulClicked.includes(review.id) ? "text-primary" : ""}`}
            >
              <ThumbsUp className="h-4 w-4" />
              {t("common.helpful")} ({review.helpful + (helpfulClicked.includes(review.id) ? 1 : 0)})
            </Button>
          </div>
        )) : (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-center">
            <p className="text-muted-foreground">{t("reviews.noReviews")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessReviews;
