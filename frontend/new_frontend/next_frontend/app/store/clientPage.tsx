"use client";

import { TrendingUp, Sparkles, Percent } from "lucide-react";
import { ProductSection } from "../components/ProductSection";
import { ProductPageResponse, ProductDTO } from "../types";
import { useEffect } from "react";
import { LayoutGrid, Cpu, Sofa, Shirt, ShoppingBag, Wrench, Bike, BookOpen, Search } from "lucide-react";
import { Header } from "../components/Header";
import { useState } from "react";
import api from "../lib/api";
import { ShoppingCart } from "lucide-react";

function setCartOpen(status: boolean){
    return status;
}

const icons = [
  { name: "", icon: <LayoutGrid size={15} /> },
  { name: "Electronics", icon: <Cpu size={15} /> },
  { name: "Furniture", icon: <Sofa size={15} /> },
  { name: "Clothing", icon: <Shirt size={15} /> },
  { name: "Food & Beverages", icon: <ShoppingBag size={15} /> },
  { name: "Tools & Hardware", icon: <Wrench size={15} /> },
  { name: "Sports & Outdoors", icon: <Bike size={15} /> },
  { name: "Books & Stationery", icon: <BookOpen size={15} /> }
];

export default function clientPage(props : any){
    //for header
    const [userName, setUserName] = useState<String>("");
    const [searchQuery, setSearchQuery] = useState("");
    // const [cartItems, setCartItems] = useState<CartItem[]>([]);
    // const [cartOpen, setCartOpen] = useState(false);

    //for products
    const [trending, setTrending] = useState<ProductPageResponse>(props.trending);
    const [newest, setNewest] = useState<ProductPageResponse>(props.newest);
    const [discounted, setDiscounted] = useState<ProductPageResponse>(props.discounted);
    const [searchItems, setSearchItems] = useState<ProductPageResponse>({ items: [], totalCount: 0});
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    //for cart
    const [cart, setCart] = useState<ProductDTO[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState("");
    const [address, setAddress] = useState({
    street: "",
    city: "",
    country: ""
    });

    const getProductId = (p: any) => p?.productsId ?? p?.ProductsId ?? p?.id ?? p?.Id;
    const getProductPrice = (p: any) => p?.price ?? p?.Price ?? 0;

    function handleAddToCart(product: ProductDTO) {
        setCart((prev) => [...prev, product]);
    }

    const cartLines = cart.reduce((acc, p) => {
    const id = getProductId(p);

    if (id == null) return acc;

    const existing = acc.get(id) || { product: p, quantity: 0 };
    existing.quantity += 1;
    acc.set(id, existing);

    return acc;
    }, new Map());

    const cartItems = Array.from(cartLines.values());

    const cartTotal = cartItems.reduce((sum, line) => {
    return sum + Number(getProductPrice(line.product) || 0) * line.quantity;
    }, 0);

    useEffect(() => {

    async function fetchCategories() {
        const res = await fetch("https://localhost:7087/api/Category");
        const data = await res.json();
        setCategories(data);
    }

    async function fetchProfile() {
        const token = localStorage.getItem("token");

        const res = await fetch("https://localhost:7087/api/Profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        setUserName(data.fname);
    }

    fetchProfile();
    fetchCategories();

    }, []);

    async function placeOrder() {
        if (cartItems.length === 0) return;

        if (!address.street.trim() || !address.city.trim() || !address.country.trim()) {
            setOrderError("Please fill in delivery address.");
            return;
        }

        try {
            setOrderError("");
            setPlacingOrder(true);

            const payload = {
                address: {
                    street: address.street.trim(),
                    city: address.city.trim(),
                    country: address.country.trim()
                },
            items: cartItems.map((line: any) => ({
                productId: getProductId(line.product),
                quantity: line.quantity
            }))
            };

            await api.post("/Order", payload);

            setCart([]);
            setCartOpen(false);
        } catch (err: any) {
            setOrderError(
            err?.response?.data?.message ||
            err?.response?.data?.Message ||
            "Failed to place order."
            );
        } finally {
            setPlacingOrder(false);
        }
        }

    useEffect(() => {
    async function fetchSearchResults() {
        const token = localStorage.getItem("token");
        const name = encodeURIComponent(searchQuery);

        const res = await fetch(`https://localhost:7087/api/shop/search?name=${name}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        setSearchItems(data);
    }

    if (searchQuery.trim() !== "") {
        fetchSearchResults();
    } else {
        setTrending(props.trending);
    }
    }, [searchQuery]);

    function CategoryBar({
    selectedCategoryId,
    categories
    }: {
    selectedCategoryId?: string;
    categories: { categoryId: number; name: string }[];
    }) {
    return (
        <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto py-3">
            {icons.map((c) => {

                let label = "All Products";

                let found: { categoryId: number; name: string } | undefined;

                if (c.name !== "") {
                found = categories.find(
                    (cat) => cat.name === c.name
                );

                if (found) {
                    label = found.name;
                }
                }

                return (
                <button
                    key={c.name}
                    onClick={() => handleCategoryClick(found?.categoryId?.toString() || "")}
                    className={`px-3.5 py-2 rounded-xl text-sm whitespace-nowrap ${
                        selectedCategoryId === found?.categoryId?.toString() || (!selectedCategoryId && c.name === "")
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    >
                    {label}
                </button>
                );
            })}
            </div>
        </div>
        </div>
    );
    }

    async function handleCategoryClick(categoryId: string) {
        setSelectedCategoryId(categoryId);

        const query = categoryId ? `&category_id=${categoryId}` : "";

        const trendingRes = await fetch(`https://localhost:7087/api/shop/trending?page=1${query}`);
        const newestRes = await fetch(`https://localhost:7087/api/shop/new?page=1${query}`);
        const discountedRes = await fetch(`https://localhost:7087/api/shop/discount?page=1${query}`);

        setTrending(await trendingRes.json());
        setNewest(await newestRes.json());
        setDiscounted(await discountedRes.json());
    }
    console.log(userName)
    return (
    <>
    <Header
        userName={userName}
        cartItems={cartItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartOpen={() => setCartOpen(true)}
      />
    <CategoryBar selectedCategoryId={selectedCategoryId} categories = {categories}/>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {searchQuery.trim() !== "" && (
          <ProductSection
          title={`Search Results for "${searchQuery}"`}
          icon={<Search size={18} className="text-purple-600" />}
          accentColor="bg-purple-50"
          products={searchItems}
          changeProducts={setSearchItems}
          selectedCategoryId={selectedCategoryId}
          badgeMode="none"
          onAddToCart={handleAddToCart}
        />
        )}
        <ProductSection
          title="Most Popular"
          icon={<TrendingUp size={18} className="text-amber-600" />}
          accentColor="bg-amber-50"
          products={trending}
          changeProducts={setTrending}
          selectedCategoryId={selectedCategoryId}
          badgeMode="none"
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Newest"
          icon={<Sparkles size={18} className="text-blue-600" />}
          accentColor="bg-blue-50"
          products={newest}
          changeProducts={setNewest}
          selectedCategoryId={selectedCategoryId}
          badgeMode="new"
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Discounted"
          icon={<Percent size={18} className="text-orange-600" />}
          accentColor="bg-orange-50"
          products={discounted}
          changeProducts={setDiscounted}
          selectedCategoryId={selectedCategoryId}
          badgeMode="discount"
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
    {cartOpen && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => !placingOrder && setCartOpen(false)}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <p className="text-sm text-gray-500">
            Review your items and delivery address
          </p>
        </div>

        <button
          onClick={() => !placingOrder && setCartOpen(false)}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
        >
          ×
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShoppingCart size={28} className="text-gray-400" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Your cart is empty
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Add some products first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-0">
          <div className="p-6 border-r border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Items</h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((line: any) => (
                <div
                  key={getProductId(line.product)}
                  className="flex items-center justify-between gap-4 bg-gray-50 rounded-2xl p-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {line.product.name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Qty: {line.quantity} × $
                      {Number(getProductPrice(line.product) || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-green-700">
                      $
                      {(
                        Number(getProductPrice(line.product) || 0) *
                        line.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setCart([])}
              disabled={placingOrder}
              className="mt-4 w-full border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">
              Delivery Address
            </h3>

            <div className="space-y-3">
              <input
                placeholder="Street"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                disabled={placingOrder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-300"
              />

              <input
                placeholder="City"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                disabled={placingOrder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-300"
              />

              <input
                placeholder="Country"
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                disabled={placingOrder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            {orderError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {orderError}
              </p>
            )}

            <button
              onClick={placeOrder}
              disabled={placingOrder || cartItems.length === 0}
              className="mt-5 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl shadow-lg shadow-green-200 transition-colors font-semibold"
            >
              {placingOrder ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

            
    </>
  );
  } 
