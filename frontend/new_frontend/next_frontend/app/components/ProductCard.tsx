import { ShoppingCart, Star, Heart } from "lucide-react";
import { ProductDTO } from "../types";

interface ProductCardProps {
  product: ProductDTO;
  onAddToCart: (product: ProductDTO) => void;
  badgeMode?: "stock" | "new" | "none";
}

export function ProductCard({ product, onAddToCart, badgeMode = "none" }: ProductCardProps) {
  const discount = product.discount

  // console.log(product)

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group flex flex-col border border-gray-100">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={product.imageURL || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {/* {badgeMode === "stock" && product.stock <= 5 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
              Only {product.stock} left!
            </span>
          )}
          {badgeMode === "new" && product.isNew && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
              New
            </span>
          )} */}
          {discount && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        {/* <button className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
          <Heart size={14} className="text-gray-500" />
        </button> */}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <span className="text-xs text-green-600" style={{ fontWeight: 600 }}>{product.categoryId}</span>

        <h4 className="text-gray-900 leading-snug line-clamp-2 text-sm">{product.name}</h4>

        {/* Stars */}
        {/* <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={11}
                className={
                  i <= Math.floor(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : i - 0.5 <= product.rating
                    ? "text-amber-400 fill-amber-200"
                    : "text-gray-200 fill-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
        </div> */}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-0.5">
          {product.discount > 0 ? (
            <>
              <span className="text-gray-900" style={{ fontWeight: 700 }}>
                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
              </span>

              <span className="text-xs text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-gray-900" style={{ fontWeight: 700 }}>
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => onAddToCart(product)}
          className="mt-auto w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
          style={{ fontWeight: 500 }}
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
