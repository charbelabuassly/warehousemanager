"use client"

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { ProductDTO, ProductPageResponse } from "../types";
import { ProductCard } from "./ProductCard";

const COLLAPSED_COUNT = 3;
const PAGE_SIZE = 9;

interface ProductSectionProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  products: ProductPageResponse;
  changeProducts: React.Dispatch<React.SetStateAction<ProductPageResponse>>;
  selectedCategoryId: string;
  badgeMode?: "stock" | "new" | "none" | "discount";
  onAddToCart: (product: ProductDTO) => void;
}

export function ProductSection({
  title,
  icon,
  accentColor,
  products,
  changeProducts,
  selectedCategoryId,
  badgeMode = "none",
  onAddToCart,
}: ProductSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(products.totalCount / PAGE_SIZE);
  const displayedProducts = expanded ? products.items.slice(0, 9) : products.items.slice(0, 3);

  const handleShowMore = () => {
    setExpanded(true);
    setPage(1);
  };

  const handleShowLess = () => {
    setExpanded(false);
    setPage(1);
  };

  const goToPage = async (p: number) => {
    //for page number to color correctly and also to update it for follwing stuff
    setPage(p);
    //querying db
    let url = "";
    if (title === "Most Popular") {
      url = `https://localhost:7087/api/shop/trending?page=${p}&category_id=${selectedCategoryId}`;
    } else if (title === "Newest") {
      url = `https://localhost:7087/api/shop/new?page=${p}&category_id=${selectedCategoryId}`;
    } else if (title === "Discounted") {
      url = `https://localhost:7087/api/shop/discount?page=${p}&category_id=${selectedCategoryId}`;
    }

    const res = await fetch(url);
    const data: ProductPageResponse = await res.json();

    changeProducts(data);
    // Scroll section into view smoothly
    window.scrollBy({ top: -1400, behavior: "smooth" });
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
            {products.totalCount}
          </span>
        </div>

        {!expanded && products.totalCount > COLLAPSED_COUNT && (
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
      {products.totalCount=== 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400 text-sm">
          No products found in this section
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              onAddToCart={onAddToCart}
              badgeMode={badgeMode}
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
