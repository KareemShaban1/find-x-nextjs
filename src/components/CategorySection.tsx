import { Link } from "react-router-dom";
import {
  Utensils,
  Wrench,
  Scissors,
  Car,
  ShoppingBag,
  Dumbbell,
  Home,
  Heart,
  GraduationCap,
  Briefcase,
  PawPrint,
  PartyPopper,
} from "lucide-react";

const categories = [
  { name: "Restaurants", icon: Utensils, count: "12,500+", color: "bg-orange-500/10 text-orange-600" },
  { name: "Home Services", icon: Wrench, count: "8,200+", color: "bg-blue-500/10 text-blue-600" },
  { name: "Beauty & Spa", icon: Scissors, count: "6,800+", color: "bg-pink-500/10 text-pink-600" },
  { name: "Automotive", icon: Car, count: "4,500+", color: "bg-slate-500/10 text-slate-600" },
  { name: "Shopping", icon: ShoppingBag, count: "15,000+", color: "bg-purple-500/10 text-purple-600" },
  { name: "Fitness", icon: Dumbbell, count: "3,200+", color: "bg-green-500/10 text-green-600" },
  { name: "Real Estate", icon: Home, count: "5,600+", color: "bg-teal-500/10 text-teal-600" },
  { name: "Health", icon: Heart, count: "7,400+", color: "bg-red-500/10 text-red-600" },
  { name: "Education", icon: GraduationCap, count: "2,800+", color: "bg-indigo-500/10 text-indigo-600" },
  { name: "Professional", icon: Briefcase, count: "9,100+", color: "bg-amber-500/10 text-amber-600" },
  { name: "Pet Services", icon: PawPrint, count: "1,900+", color: "bg-cyan-500/10 text-cyan-600" },
  { name: "Events", icon: PartyPopper, count: "3,400+", color: "bg-rose-500/10 text-rose-600" },
];

import { useTranslation } from "react-i18next";

const CategorySection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("category.title")} <span className="gradient-text">{t("category.titleHighlight")}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t("category.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category, index) => (
            <Link
              to={`/search?category=${encodeURIComponent(category.name)}`}
              key={category.name}
              className="group animate-fade-in hover-lift flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-6 text-center opacity-0 transition-all hover:border-primary/30 hover:bg-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${category.color} transition-transform group-hover:scale-110`}
              >
                <category.icon className="h-7 w-7" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{category.name}</div>
                <div className="text-xs text-muted-foreground">{category.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
