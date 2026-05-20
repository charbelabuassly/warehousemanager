"use client"

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { ProductDTO } from "../types";
import { ProductCard } from "./ProductCard";

const COLLAPSED_COUNT = 3;
const PAGE_SIZE = 6;

interface ProductSectionProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  products: ProductDTO[];
  badgeMode?: "stock" | "new" | "none" | "discount";
  onAddToCart: (product: ProductDTO) => void;
}

export function ProductSection({
  title,
  icon,
  accentColor,
  products,
  badgeMode = "none",
  onAddToCart,
}: ProductSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);

  // Reset page when products change (category/search filter)
  useEffect(() => {
    setPage(1);
  }, [products]);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const displayedProducts = expanded
    ? products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : products.slice(0, COLLAPSED_COUNT);

  const handleShowMore = () => {
    setExpanded(true);
    setPage(1);
  };

  const handleShowLess = () => {
    setExpanded(false);
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    // Scroll section into view smoothly
    window.scrollBy({ top: -80, behavior: "smooth" });
  };

  // Generate page number range with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "…", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "…", page - 1, page, page + 1, "…", totalPages);
    }
    return pages;
  };

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${accentColor}`}>{icon}</div>
          <h2 className="text-gray-900">{title}</h2>
          <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {products.length}
          </span>
        </div>

        {!expanded && products.length > COLLAPSED_COUNT && (
          <button
            onClick={handleShowMore}
            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Show more
            <ChevronDown size={16} />
          </button>
        )}
        {expanded && (
          <button
            onClick={handleShowLess}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Show less
          </button>
        )}
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400 text-sm">
          No products found in this section
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              badgeMode={"new"}
            />
          ))}
        </div>
      )}

      {/* Pagination — only visible when expanded and there are multiple pages */}
      {expanded && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>

          {getPageNumbers().map((p, idx) =>
            p === "…" ? (
              <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p as number)}
                className={`w-9 h-9 rounded-xl text-sm transition-colors ${
                  page === p
                    ? "bg-green-600 text-white shadow-sm shadow-green-200"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                style={{ fontWeight: page === p ? 600 : 400 }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      )}
    </section>
  );
}
