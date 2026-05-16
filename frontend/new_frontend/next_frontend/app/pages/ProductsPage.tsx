import { useMemo } from "react";
import { TrendingUp, Sparkles, AlertTriangle, Cpu, Sofa, Shirt, ShoppingBag, Wrench, Bike, BookOpen, LayoutGrid } from "lucide-react";
import { Category, Product, CartItem } from "../types";
import { products as allProducts } from "../data/products";
import { ProductSection } from "../components/ProductSection";

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: "All Products", label: "All Products", icon: <LayoutGrid size={15} /> },
  { key: "Electronics", label: "Electronics", icon: <Cpu size={15} /> },
  { key: "Furniture", label: "Furniture", icon: <Sofa size={15} /> },
  { key: "Clothing", label: "Clothing", icon: <Shirt size={15} /> },
  { key: "Food & Beverages", label: "Food & Beverages", icon: <ShoppingBag size={15} /> },
  { key: "Tools & Hardware", label: "Tools & Hardware", icon: <Wrench size={15} /> },
  { key: "Sports & Outdoors", label: "Sports & Outdoors", icon: <Bike size={15} /> },
  { key: "Books & Stationery", label: "Books & Stationery", icon: <BookOpen size={15} /> },
];

interface ProductsPageProps {
  searchQuery: string;
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
}

export function ProductsPage({
  searchQuery,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
}: ProductsPageProps) {
  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesCategory =
        selectedCategory === "All Products" || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const mostPopular = useMemo(
    () => [...filtered].sort((a, b) => b.popularity - a.popularity),
    [filtered]
  );

  const newest = useMemo(
    () =>
      [...filtered]
        .filter((p) => p.isNew)
        .sort((a, b) => b.addedDate - a.addedDate),
    [filtered]
  );

  const almostGone = useMemo(
    () =>
      [...filtered]
        .filter((p) => p.stock <= 5)
        .sort((a, b) => a.stock - b.stock),
    [filtered]
  );

  const hasResults = mostPopular.length > 0 || newest.length > 0 || almostGone.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap text-sm transition-all flex-shrink-0 ${
                  selectedCategory === key
                    ? "bg-green-600 text-white shadow-sm shadow-green-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{ fontWeight: selectedCategory === key ? 600 : 400 }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Search feedback */}
        {searchQuery && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">
              Results for{" "}
              <span className="text-gray-900" style={{ fontWeight: 600 }}>
                "{searchQuery}"
              </span>
              {" "}— {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>
        )}

        {!hasResults && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag size={36} className="text-gray-300" />
            </div>
            <h3 className="text-gray-600 mb-1">No products found</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              Try a different search term or browse a different category.
            </p>
          </div>
        )}

        {hasResults && (
          <>
            {/* Most Popular */}
            <ProductSection
              title="Most Popular"
              icon={<TrendingUp size={18} className="text-amber-600" />}
              accentColor="bg-amber-50"
              products={mostPopular}
              badgeMode="none"
              onAddToCart={onAddToCart}
            />

            {/* Newest */}
            <ProductSection
              title="Newest"
              icon={<Sparkles size={18} className="text-blue-600" />}
              accentColor="bg-blue-50"
              products={newest}
              badgeMode="new"
              onAddToCart={onAddToCart}
            />

            {/* Almost Gone */}
            <ProductSection
              title="Almost Gone"
              icon={<AlertTriangle size={18} className="text-orange-600" />}
              accentColor="bg-orange-50"
              products={almostGone}
              badgeMode="stock"
              onAddToCart={onAddToCart}
            />
          </>
        )}
      </div>
    </div>
  );
}
