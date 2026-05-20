"use client";

import { TrendingUp, Sparkles, Percent } from "lucide-react";
import { ProductSection } from "../components/ProductSection";
import { ProductPageResponse } from "../types";
import { useEffect } from "react";
import { LayoutGrid, Cpu, Sofa, Shirt, ShoppingBag, Wrench, Bike, BookOpen, Search } from "lucide-react";
import { Header } from "../components/Header";
import { useState } from "react";

function handleAddToCart(){
  return;
}

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
        cartItems={[]}
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
    </>
    
  );
  } 
