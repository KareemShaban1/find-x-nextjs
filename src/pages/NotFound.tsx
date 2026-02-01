import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold sm:text-8xl">404</h1>
        <p className="mb-6 text-lg text-muted-foreground sm:text-xl">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
