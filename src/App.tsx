import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { RTL_LOCALES, type Locale } from "./i18n";
import Index from "./pages/Index";
import BusinessDetail from "./pages/BusinessDetail";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterCustomer from "./pages/RegisterCustomer";
import Favorites from "./pages/Favorites";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const lang = i18n.language as Locale;
    const dir = RTL_LOCALES.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [i18n.language]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<Search />} />
      <Route path="/business/:id" element={<BusinessDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/customer" element={<RegisterCustomer />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
