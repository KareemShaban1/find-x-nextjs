import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Star, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { favoritesApi } from "@/lib/api";

interface FavoriteBusiness {
  id: number;
  name: string;
  slug: string;
  category?: string;
  rating: number;
  review_count: number;
  address?: string;
  city?: string;
  image?: string;
}

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    favoritesApi
      .list()
      .then((data) => {
        if (!cancelled) setFavorites(data);
      })
      .catch(() => {
        if (!cancelled) setFavorites([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Sign in to view your favorites.</p>
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="h-7 w-7 fill-accent text-accent" />
          My Favorites
        </h1>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">You haven&apos;t saved any organizations yet.</p>
            <Button asChild variant="outline">
              <Link to="/search">Explore organizations</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((b) => (
              <Link
                key={b.id}
                to={`/business/${b.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={b.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"}
                    alt={b.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-sm text-primary">{b.category}</span>
                  <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary">
                    {b.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-rating text-rating" />
                    <span>{Number(b.rating).toFixed(1)}</span>
                    <span>·</span>
                    <span>{b.review_count} reviews</span>
                  </div>
                  {(b.address || b.city) && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{[b.address, b.city].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
